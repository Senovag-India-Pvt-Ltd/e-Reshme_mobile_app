import React, { useState, useRef } from 'react'; 
import { 
  IonContent, IonPage, IonCard, IonCardContent, IonCardHeader, 
  IonCardTitle, IonInput, IonLabel, IonButton, IonHeader, 
  IonToolbar, IonTitle, IonButtons, IonMenuButton, IonIcon, IonBackButton,
  IonAlert,
  IonCol,
  IonGrid,
  IonRow, 
} from '@ionic/react';
import { albums, barcode, cash, layers, trash } from 'ionicons/icons'; // Import the trash icon
import './ProfileInfoPage.css';
import './AddDlfPage.css';
import axios from "axios";
import { useHistory } from 'react-router-dom';
import { API_URL_DBT } from "../auth.service";
import { API_URL_ChowkiManagment } from "../auth.service";

const AddDlfPage: React.FC = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [dataList, setDataList] = useState<any[]>([]); // Updated state to handle multiple entries
  const [farmerOtherData, setFarmerOtherData] = useState<any>({});
  const [viewAll, setViewAll] = useState<boolean>(false);
  const [receiptNo, setReceiptNo] = useState<string>(''); 
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);
  const [farmerId, setFarmerId] = useState<number | null>(null);
  const [fruitsId, setFruitsId] = useState<number | null>(null);
  const [saleAndDisposalId, setChowkiId] = useState<number | null>(null);
  const [showAlert, setShowAlert] = useState<boolean>(false);

  const inputRef = useRef<HTMLIonInputElement>(null); // Add useRef for input field

  const history = useHistory();

  const fetchFarmerDetails = () => {
    clearField();  // Clear previous data
    const api = axios.create({
      baseURL: API_URL_DBT,
    });
  
    api.post("farmer-details/getInspectionFarmerDetailsByFruitsId", { fruitsId: searchText }, {
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
      },
    })
    .then(res => { 
      const farmerResponses = res.data?.content?.[0]?.farmerResponses || [];
      // setDataList(farmerResponses); // Set all fetched data entries
      setFarmerId(farmerResponses.length > 0 ? farmerResponses[0].farmerId : null);  // Set farmerId if data is available
      setFruitsId(farmerResponses.length > 0 ? farmerResponses[0].fruitsId : null);
      if(farmerResponses?.length > 0 ){
        getAllChowkiDetails(farmerResponses[0].fruitsId);
      }
    })
    .catch(error => {
      console.error("Error fetching farmer details:", error);
    });
  };

  const clearSearch = () => {
    setSearchText('');
    setDataList([]);
    setIsEditable(false);
    setViewAll(false);
  };

  const clearField = () => {
    setViewAll(false);
  };

  const clearFields = () => {
    setFarmerOtherData({});
    setSearchText('');
    setDataList([]);
    setFarmerId(null);
    setViewAll(false);
  };

  const handleSubmit = () => {
    const api = axios.create({
      baseURL: API_URL_ChowkiManagment
    });
    api.post("chowkimanagement/update-dfl-info", {
      receiptNo: farmerOtherData.receiptNo,
      saleAndDisposalId: saleAndDisposalId,
      fruitsId: searchText
    }, {
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
      },
    })
    .then(res => {
      console.log("Farmer details updated successfully", res.data);
      setMessage("Farmer details updated successfully");
      setIsError(false);
      setShowAlert(true);
      clearFields(); // Clear fields upon successful submission
    })
    .catch(error => {
      console.error("Error updating farmer details", error);
      setMessage("Error updating farmer details");
      setIsError(true);
      setShowAlert(true);
    });
    setIsEditable(!isEditable);
  };

  const getAllChowkiDetails = (i: number) => {
    // setViewAll(!viewAll);
    const api = axios.create({
      baseURL: API_URL_ChowkiManagment
    });
    api.get(`chowkimanagement/get-sale-disposal-by-fruits-id/${i}`, {
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
      },
    })
    .then(res => {
      const chowkiData = res.data[0];
      setFarmerOtherData({
        dflsSource: chowkiData.dflsSource,
        numbersOfDfls: chowkiData.numbersOfDfls,
        // lotNumberRsp: chowkiData.lotNumberRsp,
        receiptNo: chowkiData.receiptNo || '',
        lotNumberCrc: chowkiData.lotNumberCrc,
        ratePer100Dfls: chowkiData.ratePer100Dfls, // Handle missing receiptNo
        expectedHatchingDate: chowkiData.expectedHatchingDate,
        dateOfDisposal: chowkiData.dateOfDisposal, // Handle missing receiptNo
      });
      setDataList(res.data);
      // setData({
      //   lotNumberCrc: chowkiData.lotNumberCrc,
      //   ratePer100Dfls: chowkiData.ratePer100Dfls,
      // });
      setChowkiId(chowkiData.saleAndDisposalId); // Set chowkiId for submission
    })
    .catch(error => {
      setMessage("Farmer number does not exist");
      setIsError(true);
    });
    setViewAll(!viewAll);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setFarmerOtherData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleAddDetailsClick = (fruitsId: number) => {
    history.push(`/add-det/${fruitsId}`);
  };

  const handleInputChange = (e: CustomEvent) => {
    const value = (e.target as HTMLIonInputElement).value!;
    setSearchText(value);
    if (value.length === 16) {
      inputRef.current?.blur(); // Remove focus from input field
      fetchFarmerDetails();
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
             <IonMenuButton /><IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle><b>DFL's Page</b></IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="search-container">
          <IonLabel className="fruits-id-label">Fruits ID</IonLabel>
          <IonInput
            ref={inputRef} // Attach ref to IonInput
            value={searchText}
            placeholder="Enter Fruits ID"
            onIonInput={handleInputChange} // Update to use onIonInput
          /></div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
          <IonButton size="small" onClick={fetchFarmerDetails}>Search</IonButton>
          <IonButton size="small" fill="clear" onClick={clearSearch}>
            <IonIcon color="danger" icon={trash} />
          </IonButton>
        </div>
        <IonButton expand="block" onClick={() => handleAddDetailsClick(fruitsId ?? 0)}>
                Add Details
              </IonButton>

        {dataList.map((data, index) => (
          <IonCard key={index} className="details-card">
            <IonCardHeader>
              
              <IonCardTitle>DFL Details</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div className="details-row">
                <IonLabel>Dfls Source:</IonLabel>
                <IonInput value={data.dflsSource} readonly={true} />
              </div>
              <div className="details-row">
                <IonLabel>Number Of DFLs:</IonLabel>
                <IonInput value={data.numbersOfDfls} readonly={true} />
              </div>
              {/* <div className="details-row">
                <IonLabel>Lot Number Rsp:</IonLabel>
                <IonInput value={data.lotNumberRsp} readonly={true} />
              </div> */}
              <div className="details-row">
                <IonLabel>Lot Number:</IonLabel>
                <IonInput value={data.lotNumberCrc} readonly={true} />
              </div>
              <div className="details-row">
                <IonLabel>Rate Per 100 DFLs:</IonLabel>
                <IonInput value={data.ratePer100Dfls} readonly={true} />
              </div>




              <IonAlert
                isOpen={showAlert}
                onDidDismiss={() => setShowAlert(false)}
                header={isError ? "Error" : "Success"}
                message={message}
                buttons={['OK']}
              />
            </IonCardContent>
          </IonCard>
        ))}

      </IonContent>
    </IonPage>
  );
};

export default AddDlfPage;



