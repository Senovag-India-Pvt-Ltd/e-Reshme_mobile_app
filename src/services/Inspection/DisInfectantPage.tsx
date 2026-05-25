import React, { useState, useEffect, useRef } from 'react';
import {
  IonContent, IonPage, IonCard, IonCardContent, IonCardHeader,
  IonCardTitle, IonInput, IonLabel, IonButton, IonHeader,
  IonToolbar, IonTitle, IonButtons, IonMenuButton, IonIcon, IonBackButton,
  IonSelect, IonSelectOption, IonDatetime, IonItem,IonCol,
  IonAlert,
  IonModal,
  IonToast,
} from '@ionic/react';
import { trash, searchOutline, refreshOutline, alertCircleOutline, cloudOfflineOutline, timeOutline, closeCircle, checkmarkCircleOutline, medkitOutline } from 'ionicons/icons';
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
  // Locks the Save button while the save API is in flight to prevent
  // duplicate records from double-clicks (same as Profile/Land/Mulberry).
  const [submitting, setSubmitting] = useState<boolean>(false);

  // ────────────────────────────────────────────────────────────
  // New search UX state — same pattern as Profile/Land/Mulberry/TrackCocoon
  // ────────────────────────────────────────────────────────────
  const FRUITS_ID_LENGTH = 16;
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('recentFruitsIds_disinfectant');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [searchAttempted, setSearchAttempted] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<'notFound' | 'network' | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);


  const history = useHistory();

  const saveRecent = (id: string) => {
    const trimmed = id.trim().toUpperCase();
    if (!trimmed) return;
    setRecentSearches(prev => {
      const next = [trimmed, ...prev.filter(x => x !== trimmed)].slice(0, 5);
      try { localStorage.setItem('recentFruitsIds_disinfectant', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const removeRecent = (id: string) => {
    setRecentSearches(prev => {
      const next = prev.filter(x => x !== id);
      try { localStorage.setItem('recentFruitsIds_disinfectant', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const handleRecentClick = (id: string) => {
    setSearchText(id);
    setSearchError(null);
    setSearchAttempted(false);
    setTimeout(() => fetchFarmerDetails(id), 0);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLIonInputElement>) => {
    if (e.key === 'Enter' && searchText.trim() && !searching) {
      inputRef.current?.blur();
      fetchFarmerDetails();
    }
  };

  const fetchFarmerDetails = (overrideId?: string) => {
    if (searching) return;
    const idToSearch = (overrideId ?? searchText).trim().toUpperCase();
    if (!idToSearch) return;
    clearField();
    setData(null);
    setSearchAttempted(true);
    setSearchError(null);
    setSearching(true);
    const api = axios.create({
      baseURL: API_URL_DBT,
    });
    api
      .post(
        "farmer-details/getInspectionFarmerDetailsByFruitsId",
        { fruitsId: idToSearch },
        {
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        }
      )
      .then((res) => {
        const farmerResponse = res.data?.content?.[0]?.farmerResponses?.[0];
        if (farmerResponse) {
          setData(farmerResponse);
          setFarmerId(farmerResponse.farmerId);
          saveRecent(idToSearch);
        } else {
          setSearchError('notFound');
        }
        setSearching(false);
      })
      .catch((error) => {
        const isNetwork = !error?.response;
        setSearchError(isNetwork ? 'network' : 'notFound');
        setSearching(false);
      });
  };

  const requestClear = () => {
    if (searchText.trim() || data) {
      setShowClearConfirm(true);
    } else {
      clearSearch();
    }
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
  // Double-click guard — ignore further taps while a save is in flight.
  // Prevents duplicate records.
  if (submitting) return;
  console.log("Inspection Fields Data:", inspectionFields); // Log data before sending

    setSubmitting(true);
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
    })
    .finally(() => {
      // Always release the submit lock so a failed save doesn't leave
      // the button permanently disabled.
      setSubmitting(false);
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
  const raw = (e.target as HTMLIonInputElement).value;
  const value = (typeof raw === 'string' ? raw : raw == null ? '' : String(raw)).toUpperCase();
  setSearchText(value);
  if (searchError) setSearchError(null);
  if (searchAttempted) setSearchAttempted(false);
};

// Auto-focus the Fruits ID input on mount so the keyboard opens immediately
useEffect(() => {
  const t = setTimeout(() => {
    inputRef.current?.setFocus().catch(() => { /* ignore */ });
  }, 250);
  return () => clearTimeout(t);
}, []);


  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="page-toolbar">
          <IonButtons slot="start">
            <IonBackButton text="Back" defaultHref="/menu/1" />
          </IonButtons>
          <IonTitle>Supply of Disinfectants</IonTitle>
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
              placeholder="e.g. FID2802000042820"
              autocapitalize="characters"
              maxlength={FRUITS_ID_LENGTH}
              onIonInput={handleInputChange}
              onKeyDown={handleInputKeyDown}
            />
          </div>
          {searchText.length > 0 && searchText.length < FRUITS_ID_LENGTH && (
            <span className="input-warning">
              <IonIcon icon={alertCircleOutline} />
              Fruits ID must be {FRUITS_ID_LENGTH} characters ({FRUITS_ID_LENGTH - searchText.length} more)
            </span>
          )}
          <div className="search-action-row">
            <IonButton
              className={`btn-primary ${searching ? "is-loading" : (searchText.trim() ? "is-active" : "is-disabled-state")}`}
              disabled={searching || !searchText.trim()}
              onClick={() => { if (searchText.trim()) fetchFarmerDetails(); }}
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
              onClick={requestClear}
              aria-label="Clear"
              disabled={searching}
            >
              <IonIcon icon={trash} />
            </IonButton>
          </div>

          {recentSearches.length > 0 && !data && !searching && (
            <div className="recent-searches">
              <div className="recent-searches-label">
                <IonIcon icon={timeOutline} />
                <span>Recent</span>
              </div>
              <div className="recent-chips">
                {recentSearches.map((id) => (
                  <div key={id} className="recent-chip">
                    <button
                      type="button"
                      className="recent-chip-text"
                      onClick={() => handleRecentClick(id)}
                    >
                      {id}
                    </button>
                    <button
                      type="button"
                      className="recent-chip-remove"
                      aria-label={`Remove ${id} from recents`}
                      onClick={() => removeRecent(id)}
                    >
                      <IonIcon icon={closeCircle} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {!searching && !data && searchAttempted && searchError && (
          <div className={`empty-state-card ${searchError === 'network' ? 'is-network' : 'is-not-found'}`}>
            <div className="empty-state-icon">
              <IonIcon icon={searchError === 'network' ? cloudOfflineOutline : alertCircleOutline} />
            </div>
            <h4 className="empty-state-title">
              {searchError === 'network' ? 'Network error' : 'No farmer found'}
            </h4>
            <p className="empty-state-text">
              {searchError === 'network'
                ? 'Could not reach the server. Check your internet connection and try again.'
                : `No farmer found for "${searchText.trim().toUpperCase()}". Please check the Fruits ID and try again.`}
            </p>
            <IonButton
              className="btn-primary is-active"
              onClick={() => fetchFarmerDetails()}
              disabled={!searchText.trim() || searching}
            >
              <IonIcon icon={refreshOutline} slot="start" /> Retry
            </IonButton>
          </div>
        )}

        {data && (
          <div className="result-card">
            {/* Card header with avatar + farmer name */}
            <div className="result-head">
              <div className="result-avatar is-accent-amber">
                <IonIcon icon={medkitOutline} />
              </div>
              <div className="result-head-text">
                <span className="result-eyebrow">Disinfectant Supply</span>
                <h3 className="result-title">{data.fullName}</h3>
              </div>
            </div>

            {/* Read-only farmer info */}
            <div className="result-body">
              <div className="info-row">
                <label className="info-label">Fruits ID</label>
                <IonInput value={data.fruitsId} readonly={true} />
              </div>
              <div className="info-row">
                <label className="info-label">Farmer Name</label>
                <IonInput value={data.fullName} readonly={true} />
              </div>
              <div className="info-row">
                <label className="info-label">Father's Name</label>
                <IonInput value={data.fatherName} readonly={true} />
              </div>
              <div className="info-row">
                <label className="info-label">Address</label>
                <IonInput value={data.address} readonly={true} />
              </div>

              {/* Add Details — editable form section */}
              <div className="mulberry-form">
                <div className="mulberry-form-divider">
                  <span>Add Details</span>
                </div>

                <div className="details-row">
                  <IonLabel>Disinfectant:</IonLabel>
                  {fetchError ? (
                    <p className="info-error">Failed to fetch disinfectant list. Please try again later.</p>
                  ) : (
                    <IonSelect
                      value={inspectionFields?.disinfectantMasterId}
                      placeholder="Select Disinfectant"
                      interface="action-sheet"
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

                <div className="details-row">
                  <IonLabel>Quantity Required:</IonLabel>
                  <IonInput
                    type="number"
                    placeholder="e.g. 25"
                    value={inspectionFields.quantitySupplied}
                    onIonChange={(e) => handleChange(e, "quantitySupplied")}
                  />
                </div>

                <div className="details-row">
                  <IonLabel>Size of Rearing House (sq ft):</IonLabel>
                  <IonInput
                    type="number"
                    placeholder="e.g. 600"
                    value={inspectionFields.sizeOfRearingHouse}
                    onIonChange={(e) => handleChange(e, "sizeOfRearingHouse")}
                  />
                </div>

                <div className="details-row">
                  <IonLabel>Invoice No. &amp; Date:</IonLabel>
                  <IonInput
                    placeholder="e.g. INV-2024-001"
                    value={inspectionFields.invoiceNoDate}
                    onIonChange={(e) => handleChange(e, "invoiceNoDate")}
                  />
                </div>

                <div className="details-row">
                  <IonLabel>Disinfectant Type:</IonLabel>
                  <IonSelect
                    value={inspectionFields.disinfectantName}
                    placeholder="Select Type"
                    interface="action-sheet"
                    onIonChange={(e) => handleChange(e, "disinfectantName")}
                  >
                    <IonSelectOption value="None">None</IonSelectOption>
                    <IonSelectOption value="General">General</IonSelectOption>
                    <IonSelectOption value="Bed">Bed</IonSelectOption>
                  </IonSelect>
                </div>

                <div className="details-row">
                  <IonLabel>Date of Supply:</IonLabel>
                  <div
                    onClick={() => setShowDispatchDatePicker(true)}
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
                      <IonButton onClick={() => setShowDispatchDatePicker(false)}>Close</IonButton>
                    </IonModal>
                  )}
                </div>

                <div className="details-row">
                  <IonLabel>Quantity Supplied:</IonLabel>
                  <IonInput
                    type="number"
                    placeholder="e.g. 20"
                    value={inspectionFields.quantity}
                    onIonChange={(e) => handleChange(e, "quantity")}
                  />
                </div>

                <div className="details-row">
                  <IonLabel>Number of DFL's:</IonLabel>
                  <IonInput
                    type="number"
                    placeholder="e.g. 100"
                    value={inspectionFields.numbersOfDfls}
                    onIonChange={(e) => handleChange(e, "numbersOfDfls")}
                  />
                </div>
              </div>
            </div>

            {/* Action footer */}
            <div className="result-actions">
              <IonButton
                className={`btn-result-primary ${submitting ? 'is-loading' : 'is-active'}`}
                expand="block"
                disabled={submitting}
                onClick={handleEdit}
              >
                {submitting ? (
                  <>
                    <IonSpinner name="crescent" className="btn-spinner" />
                    <span style={{ marginLeft: 8 }}>Saving...</span>
                  </>
                ) : (
                  <>
                    <IonIcon icon={checkmarkCircleOutline} slot="start" />
                    Save
                  </>
                )}
              </IonButton>
            </div>
          </div>
        )}  <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header={isError ? "Error" : "Success"}
        message={message}
        buttons={['OK']}
      />

      {/* Non-blocking success toast */}
      <IonToast
        isOpen={showSuccessToast}
        onDidDismiss={() => setShowSuccessToast(false)}
        message={message || 'Saved successfully'}
        duration={2800}
        position="top"
        color="success"
        cssClass="app-toast app-toast--success"
      />

      {/* Confirm before clearing — prevents accidental data loss */}
      <IonAlert
        isOpen={showClearConfirm}
        onDidDismiss={() => setShowClearConfirm(false)}
        header="Clear data?"
        message="This will clear the Fruits ID and any results. Continue?"
        buttons={[
          { text: 'Cancel', role: 'cancel' },
          { text: 'Clear', role: 'destructive', handler: () => clearSearch() },
        ]}
        cssClass="app-alert app-alert--warning"
      />
      </IonContent>
    </IonPage>
  );
};
export default DisinfectantPage;
