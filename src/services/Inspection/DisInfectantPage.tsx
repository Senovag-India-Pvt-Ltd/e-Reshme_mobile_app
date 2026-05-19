import React, { useState, useEffect, useRef } from 'react';
import { 
  IonContent, IonPage, IonCard, IonCardContent, IonCardHeader, 
  IonCardTitle, IonInput, IonLabel, IonButton, IonHeader, 
  IonToolbar, IonTitle, IonButtons, IonMenuButton, IonIcon, IonBackButton, 
  IonSelect, IonSelectOption, IonDatetime, IonItem,IonCol,
  IonAlert,
  IonModal,
} from '@ionic/react';
import { trash, searchOutline } from 'ionicons/icons';
import { IonSpinner } from '@ionic/react';
import './ProfileInfoPage.css';
import './AddDlfPage.css';
import axios from "axios";
import { useHistory } from 'react-router-dom';
import { API_URL_DBT,API_URL_ChowkiManagment } from "../auth.service";
import { API_URL_Master_Data } from '../auth.service';

const DisinfectantPage: React.FC = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [data, setData] = useState<any>(null);
  const [viewAll, setViewAll] = useState<boolean>(false);
  const [showInspectionFields, setShowInspectionFields] = useState<boolean>(false); // Show/hide inspection fields
  const [selectedDate, setSelectedDate] = useState<string>(''); // To store selected date
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const [farmerId, setFarmerId] = useState<number | null>(null); 
  const [message, setMessage] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);
  const [chowkiId, setChowkiId] = useState<number | null>(null);
  // const [isEditable, setIsEditable] = useState<boolean>(false);
 
const [showDispatchDatePicker, setShowDispatchDatePicker] =
  useState<boolean>(false);// Date picker visibility
  const [inspectionFields, setInspectionFields] = useState({
    quantitySupplied: '',
    sizeOfRearingHouse: '',
    invoiceNoDate: '',
    suppliedDate: '',
    quantity: '',
    numbersOfDfls: '',
    disinfectantMasterId:'',
    disinfectantName:'',
  });
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [searching, setSearching] = useState<boolean>(false);



  const history = useHistory();
  const fetchFarmerDetails = () => {
    if (searching) return;
    clearField();
    setSearching(true);
    const api = axios.create({
      baseURL: API_URL_DBT,
    });
    api
      .post(
        "farmer-details/getInspectionFarmerDetailsByFruitsId",
        { fruitsId: searchText },
        {
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        }
      )
      .then((res) => {
        console.log(res.data.content[0].farmerResponses[0]);
        setData(res.data.content[0].farmerResponses[0]);
        setFarmerId(res.data.content[0].farmerResponses[0].farmerId);
        setSearching(false);
      })
      .catch((error) => {
        setMessage("Farmer number does not exist");
        setIsError(false);
        setSearching(false);
      });
  };

  // const handleChange = (e: any, field: string) => {
  //   if (inspectionFields) {
  //     setInspectionFields({
  //       ...inspectionFields,
  //       [field]: e.detail.value, // Change here to work with IonSelect
  //     });
  //   }
  // };


  const handleChange = (e: any, field: string) => {
    if (inspectionFields) {
      setInspectionFields({
        ...inspectionFields,
        [field]: e.detail.value,
      });
      console.log(`Updated ${field} to:`, e.detail.value); // Log each update
    }
  };
  

const clearField=()=>{
  setViewAll(false);
}

  const clearSearch = () => {
    setSearchText('');
    setData(null);
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

const toggleViewAll = (i: number) => {
  setViewAll(!viewAll);
  const api = axios.create({
    baseURL: API_URL_ChowkiManagment,
  });
  
  api.get(`chowkimanagement/getInspectioninfoForFarmer/${i}`, {
    headers: {
      "Content-Type": "application/json",
      accept: "*/*",
      Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
    },
  })
  .then(res => {
    const chowkiData = res.data[0];
    setData({
        chowkiId: chowkiData.chowkiId,
        dflsSource: chowkiData.dflsSource,
        numbersOfDfls: chowkiData.numbersOfDfls,
        lotNumberRsp: chowkiData.lotNumberRsp,
        receiptNo: chowkiData.receiptNo || '',
        raceName:chowkiData.raceName,
        price:chowkiData.price,
        lotNumberCrc: chowkiData.lotNumberCrc,
        ratePer100Dfls: chowkiData.ratePer100Dfls, // Handle missing receiptNo
    });
    setChowkiId(chowkiData.chowkiId); // This sets the chowkiId in state
    // setIsReadyToSubmit(true); // This triggers handleEdit after state is updated
  })
  .catch(error => {
    setMessage("Farmer number does not exist");
    setIsError(false);
    // setShowAlert(true);
  });
  setViewAll(!viewAll)
};

// Use useEffect to trigger handleEdit after chowkiId is updated
// Depend on chowkiId and isReadyToSubmit state

const handleEdit = () => {
  console.log("Inspection Fields Data:", inspectionFields); // Log data before sending
  
    const api = axios.create({
      baseURL: API_URL_ChowkiManagment,
    });

    api.post(
      "cropInspection/add-supply-of-disinfectants-info",
      {
        // supplyOfDisinfectantsId:supplyOfDisinfectantsId,
        fruitsId: searchText,
        disinfectantMasterId:inspectionFields.disinfectantMasterId,
        quantitySupplied: inspectionFields.quantitySupplied,
        sizeOfRearingHouse: inspectionFields.sizeOfRearingHouse,
        invoiceNoDate: inspectionFields.invoiceNoDate,
        suppliedDate: inspectionFields.suppliedDate,
        quantity: inspectionFields.quantity,
        numbersOfDfls: inspectionFields.numbersOfDfls,
        disinfectantName:inspectionFields.disinfectantName,
        farmerId: farmerId
      },
      {
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      }
    )
    .then((res) => {
      console.log("Response:", res.data);
      if (res.data.error === 0) {
        setMessage("Data added successfully!");
        setIsError(false);
        setShowAlert(true);
        clearSearch();
      } else {
        setMessage("Failed to add data.");
        setIsError(true);
    setShowAlert(true);
      }
    })
    .catch((error) => {
      console.error("Error updating farmer details", error);
      setMessage("Error updating farmer details");
      setIsError(true);
    setShowAlert(true);
    });
  // } else {
  //   setMessage("Chowki ID is not set. Please fetch the data first.");
  //   setIsError(true);
  //   setShowAlert(true);
  // }
};

// useEffect(() => {
//   if (chowkiId) {
//     handleEdit(); // Call handleEdit only when chowkiId is available
//   }
// }, [chowkiId]); 

  



  const [disInfectantData, setDisInfectantData] = useState<any[]>([]);

  const fetchDisInfectantList = async () => {
    try {
      const response = await axios.get(`${API_URL_Master_Data}disinfectantMaster/get-all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
        },
      });
      if (response.data && response.data.content) {
        setDisInfectantData(response.data.content.disinfectantMaster);
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
    fetchDisInfectantList();
  }, []);


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
            <IonBackButton text="Back" defaultHref="/menu/1" />
          </IonButtons>
          <IonTitle>Supply of Disinfectants</IonTitle>
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
        </div>

        {data && (
          <IonCard className="details-card">
            <IonCardHeader>
              <IonCardTitle>Disinfectant Supply</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
            <div className="details-row">
                <IonLabel>Fruits Id:</IonLabel>
                <IonInput
                  value={data.fruitsId}
                  readonly={true}
                />
              </div>

            <div className="details-row">
                <IonLabel>Farmer Name:</IonLabel>
                <IonInput
                  value={data.fullName}
                  readonly={true}
                />
              </div>
              <div className="details-row">
                <IonLabel>Father Name:</IonLabel>
                <IonInput
                  value={data.fatherName}
                  readonly={true}
                />
              </div>
             
              <div className="details-row">
                <IonLabel>Address:</IonLabel>
                <IonInput
                  value={data.address}
                  readonly={true}
                />
              </div>
              <IonCardHeader>
              <IonCardTitle>Add Details</IonCardTitle>
            </IonCardHeader>
             
                   <IonCol size="12">
                      <div className="details-row">
                        <IonLabel>
                          <b>DisInfectant:</b>
                        </IonLabel>
                        {fetchError ? (
                          <p style={{ color: 'red' }}>Failed to fetch mount list. Please try again later.</p>
                        ) : (
                          <IonSelect
                            value={inspectionFields?.disinfectantMasterId}
                            // disabled={!isEditable} 
                            placeholder="Select DisInfectant"
                            onIonChange={(e) => handleChange(e, 'disinfectantMasterId')}
                          >
                            {disInfectantData?.map((infectant) => (
                              <IonSelectOption key={infectant.disinfectantMasterId} value={infectant.disinfectantMasterId}>
                                {infectant.disinfectantMasterName}
                              </IonSelectOption>
                            ))}
                          </IonSelect>
                        )}
                      </div>
                    </IonCol>
                  <div className="details-row">
                    <IonLabel>Quantity Required:</IonLabel>
                    <IonInput value={inspectionFields.quantitySupplied} 
                    readonly={false} 
                    onIonChange={(e) => handleChange(e, "quantitySupplied")}
                    />
                  </div>
                  <div className="details-row">
                    <IonLabel>Size of Rearing House in Sqft:</IonLabel>
                    <IonInput value={inspectionFields.sizeOfRearingHouse}  readonly={false}
                    onIonChange={(e) => handleChange(e, "sizeOfRearingHouse")}
                    />
                  </div>
                  <div className="details-row">
                    <IonLabel>Invoice No and Date:</IonLabel>
                    <IonInput value={inspectionFields.invoiceNoDate} readonly={false} 
                    onIonChange={(e) => handleChange(e, "invoiceNoDate")}
                    />
                  </div>
                  <div className="details-row">
                            <IonLabel>DisInfectantName:</IonLabel>
                            <IonSelect
                                value={inspectionFields.disinfectantName}
                                placeholder="Select DisInfectantName"
                                //   disabled={!isEditable}
                                onIonChange={(e) => handleChange(e, "disinfectantName")}
                                interfaceOptions={{ cssClass: "custom-select" }} // Add custom class for styling
                            >   <IonSelectOption value="None">None</IonSelectOption>
                                <IonSelectOption value="General">General</IonSelectOption>
                                <IonSelectOption value="Bed">Bed</IonSelectOption>
                                
                            </IonSelect></div>
                            <div className="details-row">
                            <IonLabel>Date Of Supply:</IonLabel>
                            <div
                                onClick={() => setShowDispatchDatePicker(true)
                                    // isEditable && 
                                }
                                className="date-display"
                                style={{ cursor: 'pointer' }}
                            >
                                {inspectionFields.suppliedDate
                                    ? new Date(inspectionFields.suppliedDate).toLocaleDateString()
                                    : "Select Date"}
                            </div>
                            {showDispatchDatePicker && (
                              <IonModal isOpen={showDispatchDatePicker} onDidDismiss={() => setShowDispatchDatePicker(false)}>
                                <IonDatetime
                                    value={inspectionFields.suppliedDate || new Date().toISOString()}
                                    onIonChange={(e) => {
                                        handleChange(e, "suppliedDate");
                                        setShowDispatchDatePicker(false);
                                    }}
                                    onIonCancel={() => setShowDispatchDatePicker(false)}
                                />
                                <IonButton style={{ '--background': '#ffffff', '--color': '#000000', color: '#000000', backgroundColor: '#ffffff' } as any} onClick={() => setShowDispatchDatePicker(false)}>Close</IonButton>
                                </IonModal>
                            )}
                        </div>
                  <div className="details-row">
                    <IonLabel>Quantity Supplied:</IonLabel>
                    <IonInput value={inspectionFields.quantity} readonly={false}
                    onIonChange={(e) => handleChange(e, "quantity")} />
                  </div>
                  <div className="details-row">
                    <IonLabel>Number of DFL's:</IonLabel>
                    <IonInput value={inspectionFields.numbersOfDfls} readonly={false}
                    onIonChange={(e) => handleChange(e, "numbersOfDfls")}
                    />
                  </div>

                  <IonButton style={{ '--background': '#ffffff', '--color': '#000000', color: '#000000', backgroundColor: '#ffffff' } as any} expand="full"  onClick={handleEdit}>Save</IonButton>

                  
            </IonCardContent>
          </IonCard>
        )}  <IonAlert
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
export default DisinfectantPage;
