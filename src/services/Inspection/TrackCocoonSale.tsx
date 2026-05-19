import React, { useState, useEffect, useRef } from 'react';
import {
  IonContent, IonPage, IonCard, IonCardContent, IonCardHeader,
  IonCardTitle, IonInput, IonLabel, IonButton, IonHeader,
  IonToolbar, IonTitle, IonButtons, IonMenuButton, IonIcon, IonBackButton,
  IonSelect, IonSelectOption, IonDatetime, IonItem, IonCol,
  IonAlert, IonSpinner,
} from '@ionic/react';
import { trash, searchOutline, checkmarkCircleOutline, addOutline, refreshOutline } from 'ionicons/icons';
import './ProfileInfoPage.css';
import './AddDlfPage.css';
import axios from "axios";
import { useHistory } from 'react-router-dom';
import { API_URL_DBT,API_URL_ChowkiManagment } from "../auth.service";
import { API_URL_Master_Data } from '../auth.service';

const TracCocoonPage: React.FC = () => {
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
  const [saleAndDisposal,setSaleAndDisposal] = useState<number>(0);
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
  const [searching, setSearching] = useState<boolean>(false);


  // State variables for dropdown options
  const [raceOptions, setRaceOptions] = useState<string[]>(['Race A', 'Race B']); 
//   const [tscOptions, setTscOptions] = useState<string[]>(['Tsc 1', 'Tsc 2']); 
  const history = useHistory();
  const fetchFarmerDetails = () => {
    if (searching) return;
    clearField();
    setSearching(true);
    const api = axios.create({
      baseURL: API_URL_ChowkiManagment,
    });

    api
      .get(`chowkimanagement/getInspectioninfoForCocoonSaleTrack/${searchText}`, {
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      })
      .then((res) => {
        const farmerData = res.data[0];
        console.log(farmerData);
        setSaleAndDisposal(farmerData.saleAndDisposalId);
        setDataList(res.data);
        setFarmerId(farmerData.farmerId);
        setSearching(false);
      })
      .catch((error) => {
        setMessage("Farmer number does not exist");
        setIsError(true);
        setShowAlert(true);
        setSearching(false);
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

// const toggleViewAll = (i: number) => {
//   setViewAll(!viewAll);
//   const api = axios.create({
//     baseURL: API_URL_ChowkiManagment,
//   });
  
//   api.get(`chowkimanagement/getInspectioninfoForFarmer/${i}`, {
//     headers: {
//       "Content-Type": "application/json",
//       accept: "*/*",
//       Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
//     },
//   })
//   .then(res => {
//     const chowkiData = res.data[0];
//     setData({
//         chowkiId: chowkiData.chowkiId,
//         dflsSource: chowkiData.dflsSource,
//         numbersOfDfls: chowkiData.numbersOfDfls,
//         lotNumberRsp: chowkiData.lotNumberRsp,
//         receiptNo: chowkiData.receiptNo || '',
//         raceName:chowkiData.raceName,
//         price:chowkiData.price,
//         lotNumberCrc: chowkiData.lotNumberCrc,
//         ratePer100Dfls: chowkiData.ratePer100Dfls, // Handle missing receiptNo
//     });
//     setChowkiId(chowkiData.chowkiId); // This sets the chowkiId in state
//     // setIsReadyToSubmit(true); // This triggers handleEdit after state is updated
//   })
//   .catch(error => {
//     setMessage("Farmer number does not exist");
//     setIsError(false);
//     // setShowAlert(true);
//   });
//   setViewAll(!viewAll)
// };

// Use useEffect to trigger handleEdit after chowkiId is updated
// Depend on chowkiId and isReadyToSubmit state







// const handleEdit = () => {
//   if (data.chowkiId) {
//     const api = axios.create({
//       baseURL: API_URL_ChowkiManagment,
//     });

//     api.post(
//       "cropInspection/add-crop-inspection-info",
//       {
//         chowkiId:data.chowkiId, // Use chowkiId from state
//         farmerId,
//         cropInspectionTypeId: inspectionFields.cropInspectionTypeId,
//         mountId: inspectionFields.mountId,
//         // reasonId: inspectionFields.reasonId,
//         cropStatusId: inspectionFields.cropStatusId,
//         date: inspectionFields.date,
//         note: inspectionFields.note,
//       },
//       {
//         headers: {
//           "Content-Type": "application/json",
//           accept: "*/*",
//           Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
//         },
//       }
//     )
//     .then((res) => {
//       console.log("Response:", res.data);
//       if (res.data.error === 0) {
//         setMessage("Data added successfully!");
//         setIsError(false);
//         setShowAlert(true);
//         clearSearch();
//       } else {
//         setMessage("Failed to add data.");
//         setIsError(true);
//     setShowAlert(true);
//       }
//     })
//     .catch((error) => {
//       console.error("Error updating farmer details", error);
//       setMessage("Error updating farmer details");
//       setIsError(true);
//     setShowAlert(true);
//     });
//   } else {
//     setMessage("Chowki ID is not set. Please fetch the data first.");
//     setIsError(true);
//     setShowAlert(true);
//   }
// };

// useEffect(() => {
//   if (chowkiId) {
//     handleEdit(); // Call handleEdit only when chowkiId is available
//   }
// }, [chowkiId]); 

  

  const toggleInspectionFields = () => {
    setShowInspectionFields(!showInspectionFields);
  };

  const handleDateChange = (e: any) => {
    setSelectedDate(e.detail.value.split('T')[0]); // Only save the date (YYYY-MM-DD format)
    setIsDatePickerOpen(false); // Close date picker after selection
  };
 
  const add = (saleAndDisposalId: number) => {
    history.push(`add-trac/${saleAndDisposalId}`);
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

  const handleVerify = () => {
    // Update the verified status for all items with a valid Market Date
    setDataList(dataList.map(item => (
      item.auctionDate ? { ...item, verified: true } : item
    )));
  };

  const inputRef = useRef<HTMLIonInputElement>(null); // Add useRef for input field

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
        <IonToolbar className="page-toolbar">
          <IonButtons slot="start">
            <IonBackButton text="Back" defaultHref="/cropsub" />
          </IonButtons>
          <IonTitle>Track Cocoon Sale</IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={clearSearch} aria-label="Refresh" disabled={searching}>
              <IonIcon icon={refreshOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="page-content">
        <div className="page-hero-extension" aria-hidden="true"></div>
        <div className="search-section">
          <div className="search-input-wrap">
            <span className="search-label">Fruits ID</span>
            <IonInput
              ref={inputRef}
              value={searchText}
              placeholder="Enter Fruits ID"
              onIonInput={handleInputChange}
            />
          </div>
          <div className="search-action-row">
            <IonButton
              className={`btn-primary ${searching ? "is-loading" : ""}`}
              disabled={searching}
              onClick={fetchFarmerDetails}
            >
              {searching ? (
                <>
                  <IonSpinner name="crescent" className="btn-spinner" />
                  <span style={{ marginLeft: 8 }}>Searching...</span>
                </>
              ) : (
                <>
                  <IonIcon icon={searchOutline} slot="start" /> Search
                </>
              )}
            </IonButton>
            <IonButton
              className="icon-only-btn danger"
              onClick={clearSearch}
              aria-label="Clear"
              disabled={searching}
            >
              <IonIcon icon={trash} />
            </IonButton>
          </div>

          <IonButton
            className="btn-primary"
            expand="block"
            onClick={handleVerify}
            disabled={searching || dataList.length === 0}
            style={{ maxWidth: 'none', marginTop: 4 }}
          >
            <IonIcon icon={checkmarkCircleOutline} slot="start" /> Verify
          </IonButton>
          {dataList.some(data => !data.auctionDate) && (
            <IonButton
              className="btn-primary"
              expand="block"
              onClick={() => add(saleAndDisposal)}
              disabled={searching}
              style={{ maxWidth: 'none' }}
            >
              <IonIcon icon={addOutline} slot="start" /> Add
            </IonButton>
          )}
        </div>

        {dataList.map((data,index)=>(
          <IonCard key={index} className="details-card">
            <IonCardHeader>
              <IonCardTitle>Track Cocoon</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
             
                  <div className="details-row">
                    <IonLabel>Lot Number of RSP:</IonLabel>
                    <IonInput value={data.lotNumberRsp} readonly={true} />
                  </div>
                  <div className="details-row">
                    <IonLabel>Race Name:</IonLabel>
                    <IonInput value={data.raceName} readonly={true} />
                  </div>
                  
                  <div className="details-row">
                    <IonLabel>Number Of DFLS:</IonLabel>
                    <IonInput value={data.numbersOfDfls} readonly={true} />
                  </div>

                  <div className="details-row">
                    <IonLabel>Market Date:</IonLabel>
                    <IonInput value={data.auctionDate} readonly={true} />
                  </div>

                  <div className="details-row">
                    <IonLabel>Rate Per DFLS:</IonLabel>
                    <IonInput value={data.ratePerDFls} readonly={true} />
                  </div>

                  <div className="details-row">
                    <IonLabel>Cocoons Quantity:</IonLabel>
                    <IonInput value={data.cocoonsQuantity} readonly={true} />
                  </div>
                  <div className="details-row">
                    <IonLabel>Hatching Date:</IonLabel>
                    <IonInput value={data.expectedHatchingDate} readonly={true} />
                  </div>

                  {data.verified && (
                <div className="details-row verified-tag">
                  <IonLabel color="success">Verified</IonLabel>
                </div>
              )}
            
                  
            </IonCardContent>
          </IonCard>
          
        ))}  
 

              {/* "Verify" button to mark items with a Market Date as verified */}
        {/* <IonButton expand="block" onClick={handleVerify}>
          Verify
        </IonButton> */}

 {/* "Add" button is enabled only if "Market Date" is null or empty */}
 {/* {dataList.some(data => !data.auctionDate) && (
      <IonButton expand="block" onClick={() => add(saleAndDisposal)}>
        Add
      </IonButton>
    )} */}

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
export default TracCocoonPage;
