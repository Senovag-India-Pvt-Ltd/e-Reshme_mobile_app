
import React, { useState, useEffect } from 'react';
import { 
  IonContent, IonPage, IonCard, IonCardContent, IonCardHeader, 
  IonCardTitle, IonInput, IonLabel, IonButton, IonHeader, 
  IonToolbar, IonTitle, IonButtons, IonMenuButton, IonIcon, IonBackButton, 
  IonSelect, IonSelectOption, IonDatetime, IonItem,IonCol,
  IonAlert,
} from '@ionic/react';
import { trash } from 'ionicons/icons'; // Import the trash icon
import './ProfileInfoPage.css';
import './AddDlfPage.css';
import axios from "axios";
import { useHistory } from 'react-router-dom';
import { API_URL_DBT,API_URL_ChowkiManagment } from "../auth.service";
import { API_URL_Master_Data } from '../auth.service';

const SubsidyPage: React.FC = () => {
  const [searchText, setSearchText] = useState<string>('');
  // const [data, setData] = useState<any>(null);
  const [dataList, setDataList] = useState<any[]>([]);
  const [viewAll, setViewAll] = useState<boolean>(false);
  const [showInspectionFields, setShowInspectionFields] = useState<boolean>(false); // Show/hide inspection fields
  const [selectedDate, setSelectedDate] = useState<string>(''); // To store selected date
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const [farmerId, setFarmerId] = useState<number | null>(null); 
  const [message, setMessage] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);
  const [chowkiId, setChowkiId] = useState<number | null>(null);
  // const [isEditable, setIsEditable] = useState<boolean>(false);
  const [showHatchingDatePicker, setShowHatchingDatePicker] =
  useState<boolean>(false);
const [showDispatchDatePicker, setShowDispatchDatePicker] =
  useState<boolean>(false);// Date picker visibility
  const [inspectionFields, setInspectionFields] = useState({
    cropInspectionTypeId: '',
    date: '',
    reasonId: '',
    note: '',
    cropStatusId: '',
    mountId: '',
  });
  const [showAlert, setShowAlert] = useState<boolean>(false);


  // State variables for dropdown options
  const [raceOptions, setRaceOptions] = useState<string[]>(['Race A', 'Race B']); 
//   const [tscOptions, setTscOptions] = useState<string[]>(['Tsc 1', 'Tsc 2']); 
  const history = useHistory();
  const fetchFarmerDetails = () => {
    clearField();
    const api = axios.create({
      baseURL: API_URL_ChowkiManagment,
    });
  
    api
      .get(`chowkimanagement/getInspectioninfoForCocoonTrack/${searchText}`, {
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      })
      .then((res) => {
        // Assuming the data is returned as an array of farmer inspection details
        const farmerData = res.data[0]; // Adjust based on the structure of the response
        console.log(farmerData);
  
        setDataList(res.data); // Update the data state with farmer details
        setFarmerId(farmerData.farmerId); // Set farmer ID as needed
      })
      .catch((error) => {
        setMessage("Farmer number does not exist");
        setIsError(true); // This should likely be set to true to indicate an error
      });
  };
  

  const handleChange = (e: any, field: string) => {
    if (inspectionFields) {
      setInspectionFields({
        ...inspectionFields,
        [field]: e.detail.value, // Change here to work with IonSelect
      });
    }
  };
const clearField=()=>{
  setViewAll(false);
}

  const clearSearch = () => {
    setSearchText('');
    setDataList([]);
    setViewAll(false);
    setShowInspectionFields(false);
    setViewAll(false);
  };
  const [fetchError, setFetchError] = useState<boolean>(false);

 

  const [reasonData, setReasonData] = useState<any[]>([]);
  const fetchReasonList = async () => {
    try {
      const response = await axios.get(`${API_URL_Master_Data}reason/get-all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
        },
      });
      if (response.data && response.data.content) {
        setReasonData(response.data.content.reason);
      } else {
        console.error('Unexpected API response format:', response);
        setFetchError(true);
      }
    } catch (error) {
      console.error('Error fetching Tsc list:', error);
      setFetchError(true);
    }
  };

  useEffect(() => {
    fetchReasonList();
  }, []);

  
  
  // Effect to call cropInspection when chowkiId changes



const [isReadyToSubmit, setIsReadyToSubmit] = useState(false); // To control when to call handleEdit



const toggleInspectionFields = () => {
    setShowInspectionFields(!showInspectionFields);
  };

  const handleDateChange = (e: any) => {
    setSelectedDate(e.detail.value.split('T')[0]); // Only save the date (YYYY-MM-DD format)
    setIsDatePickerOpen(false); // Close date picker after selection
  };
  const verify = (fruitsId: number) => {
    history.push(`/ins/${fruitsId}`);
  };
  const add = (chowkiId: number) => {
    history.push(`add-trac/${chowkiId}`);
  };

  const [mountData, setMountData] = useState<any[]>([]);

  const fetchMountList = async () => {
    try {
      const response = await axios.get(`${API_URL_Master_Data}mount/get-all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
        },
      });
      if (response.data && response.data.content) {
        setMountData(response.data.content.mount);
      } else {
        console.error('Unexpected API response format:', response);
        setFetchError(true);
      }
    } catch (error) {
      console.error('Error fetching Inspection Type:', error);
      setFetchError(true);
    }
  };

  useEffect(() => {
    fetchMountList();
  }, []);



 

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton text="Back" slot="start" defaultHref="/" style={{ color: '#000' }} /> {/* Back button added */}
            <IonMenuButton />
          </IonButtons>
          <IonTitle><b>Subsidy Application</b></IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ '--padding-bottom': '130px' } as any}>
        <div className="search-container">
          <IonLabel className="fruits-id-label">Fruits ID</IonLabel>
          <IonInput
            value={searchText}
            placeholder="Enter Fruits ID"
            onIonChange={e => setSearchText(e.detail.value!)}
          />
          <IonButton size="small" onClick={fetchFarmerDetails}>Search</IonButton>

          {/* Clear button with trash icon */}
          <IonButton size="small" fill="clear" onClick={clearSearch}>
            <IonIcon color="danger" icon={trash} />
          </IonButton>
        </div>

        {dataList.map((data,index)=>(
          <IonCard key={index} className="details-card">
            <IonCardHeader>
              <IonCardTitle>Subsidy Details</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
             
                  <div className="details-row">
                    <IonLabel>SL.No:</IonLabel>
                    <IonInput value={data.lotNumberRsp} readonly={true} />
                  </div>
                  <div className="details-row">
                    <IonLabel>Scheme:</IonLabel>
                    <IonInput value={data.lotNumberCrc} readonly={true} />
                  </div>
                  
                  <div className="details-row">
                    <IonLabel>Component:</IonLabel>
                    <IonInput value={data.numbersOfDfls} readonly={true} />
                  </div>

                  <div className="details-row">
                    <IonLabel>Fruits Id:</IonLabel>
                    <IonInput value={data.ratePer100Dfls} readonly={true} />
                  </div>

                  <div className="details-row">
                    <IonLabel>Farmer Name:</IonLabel>
                    <IonInput value={data.dflsSource} readonly={true} />
                  </div>\
                  <div className="details-row">
                    <IonLabel>Status:</IonLabel>
                    <IonInput value={data.dflsSource} readonly={true} />
                  </div>

                 


                  <div className="details-row">
                    <IonLabel>TSC:</IonLabel>
                    <IonInput value={data.raceName} readonly={true} />
                  </div>
                 
            
                  {/* <IonButton expand="block" onClick={verify}>
                Verify
              </IonButton>
              <IonButton expand="block" onClick={() => add(data.chowkiId)}>
                Add
              </IonButton> */}
            </IonCardContent>
          </IonCard>
        ))}  
        <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header={isError ? "Error" : "Success"}
        message={message}
        buttons={['OK']}
      />
      
      </IonContent>
    </IonPage>
  );
};
export default SubsidyPage;