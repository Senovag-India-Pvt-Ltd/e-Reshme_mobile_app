import React, { useState, useEffect, useRef } from 'react';
import {
  IonContent, IonPage, IonCard, IonCardContent, IonCardHeader,
  IonCardTitle, IonInput, IonLabel, IonButton, IonHeader,
  IonToolbar, IonTitle, IonButtons, IonMenuButton, IonIcon, IonBackButton,
  IonSelect, IonSelectOption, IonDatetime, IonItem, IonCol,
  IonAlert, IonSpinner, IonToast,
} from '@ionic/react';
import { trash, searchOutline, checkmarkCircleOutline, addOutline, refreshOutline, alertCircleOutline, cloudOfflineOutline, timeOutline, closeCircle } from 'ionicons/icons';
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

  // ────────────────────────────────────────────────────────────
  // New search UX state — same pattern as Profile/Land/Mulberry
  // ────────────────────────────────────────────────────────────
  const FRUITS_ID_LENGTH = 16;
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('recentFruitsIds_trackcocoon');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [searchAttempted, setSearchAttempted] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<'notFound' | 'network' | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);


  // State variables for dropdown options
  const [raceOptions, setRaceOptions] = useState<string[]>(['Race A', 'Race B']);
//   const [tscOptions, setTscOptions] = useState<string[]>(['Tsc 1', 'Tsc 2']);
  const history = useHistory();

  const saveRecent = (id: string) => {
    const trimmed = id.trim().toUpperCase();
    if (!trimmed) return;
    setRecentSearches(prev => {
      const next = [trimmed, ...prev.filter(x => x !== trimmed)].slice(0, 5);
      try { localStorage.setItem('recentFruitsIds_trackcocoon', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const removeRecent = (id: string) => {
    setRecentSearches(prev => {
      const next = prev.filter(x => x !== id);
      try { localStorage.setItem('recentFruitsIds_trackcocoon', JSON.stringify(next)); } catch {}
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
    setDataList([]);
    setSearchAttempted(true);
    setSearchError(null);
    setSearching(true);
    const api = axios.create({
      baseURL: API_URL_ChowkiManagment,
    });

    api
      .get(`chowkimanagement/getInspectioninfoForCocoonSaleTrack/${idToSearch}`, {
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      })
      .then((res) => {
        const farmerData = res.data?.[0];
        if (farmerData) {
          setSaleAndDisposal(farmerData.saleAndDisposalId);
          setDataList(res.data);
          setFarmerId(farmerData.farmerId);
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
    if (searchText.trim() || dataList.length > 0) {
      setShowClearConfirm(true);
    } else {
      clearSearch();
    }
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
              placeholder="e.g. FID2802000042820"
              autocapitalize="characters"
              maxlength={FRUITS_ID_LENGTH}
              onIonInput={handleInputChange}
              onKeyDown={handleInputKeyDown}
            />
            {searchText.length > 0 && searchText.length < FRUITS_ID_LENGTH && (
              <span className="input-warning">
                <IonIcon icon={alertCircleOutline} />
                Fruits ID must be {FRUITS_ID_LENGTH} characters ({FRUITS_ID_LENGTH - searchText.length} more)
              </span>
            )}
          </div>
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

          {recentSearches.length > 0 && dataList.length === 0 && !searching && (
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

        {!searching && dataList.length === 0 && searchAttempted && searchError && (
          <div className={`empty-state-card ${searchError === 'network' ? 'is-network' : 'is-not-found'}`}>
            <div className="empty-state-icon">
              <IonIcon icon={searchError === 'network' ? cloudOfflineOutline : alertCircleOutline} />
            </div>
            <h4 className="empty-state-title">
              {searchError === 'network' ? 'Network error' : 'No cocoon sale records found'}
            </h4>
            <p className="empty-state-text">
              {searchError === 'network'
                ? 'Could not reach the server. Check your internet connection and try again.'
                : `No records found for "${searchText.trim().toUpperCase()}". Please check the Fruits ID and try again.`}
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

        {/* Toolbar above records: Verify + Add as compact pills, only when there's data */}
        {dataList.length > 0 && (
          <div className="records-toolbar">
            <div className="records-toolbar-info">
              <span className="records-toolbar-count">{dataList.length}</span>
              <span className="records-toolbar-label">
                {dataList.length === 1 ? 'record' : 'records'} found
              </span>
            </div>
            <div className="records-toolbar-actions">
              {dataList.some(d => !d.auctionDate) && (
                <button
                  type="button"
                  className="records-toolbar-btn records-toolbar-btn--ghost"
                  onClick={() => add(saleAndDisposal)}
                  disabled={searching}
                >
                  <IonIcon icon={addOutline} />
                  <span>Add</span>
                </button>
              )}
              <button
                type="button"
                className="records-toolbar-btn records-toolbar-btn--primary"
                onClick={handleVerify}
                disabled={searching}
              >
                <IonIcon icon={checkmarkCircleOutline} />
                <span>Verify</span>
              </button>
            </div>
          </div>
        )}

        {dataList.map((record, index) => (
          <div key={index} className="result-card track-cocoon-card">
            <div className="result-head">
              <div className={`result-avatar ${record.verified ? 'is-accent-green' : 'is-accent-amber'}`}>
                {record.lotNumberRsp ? String(record.lotNumberRsp).slice(0, 1).toUpperCase() : 'L'}
              </div>
              <div className="result-head-text">
                <span className="result-eyebrow">
                  {record.verified ? '✓ Verified' : 'Cocoon Sale'}
                </span>
                <h3 className="result-title">Lot {record.lotNumberRsp || '—'}</h3>
              </div>
            </div>
            <div className="result-body">
              <div className="mulberry-form" style={{ paddingTop: 0 }}>
                <div className="details-row">
                  <IonLabel>Race Name:</IonLabel>
                  <IonInput value={record.raceName || '—'} readonly={true} />
                </div>
                <div className="details-row">
                  <IonLabel>Number of DFLs:</IonLabel>
                  <IonInput value={record.numbersOfDfls ?? '—'} readonly={true} />
                </div>
                <div className="details-row">
                  <IonLabel>Market Date:</IonLabel>
                  <IonInput
                    value={record.auctionDate ? new Date(record.auctionDate).toLocaleDateString() : '—'}
                    readonly={true}
                  />
                </div>
                <div className="details-row">
                  <IonLabel>Rate per DFL:</IonLabel>
                  <IonInput value={record.ratePerDFls ?? '—'} readonly={true} />
                </div>
                <div className="details-row">
                  <IonLabel>Cocoons Quantity:</IonLabel>
                  <IonInput value={record.cocoonsQuantity ?? '—'} readonly={true} />
                </div>
                <div className="details-row">
                  <IonLabel>Hatching Date:</IonLabel>
                  <IonInput
                    value={record.expectedHatchingDate ? new Date(record.expectedHatchingDate).toLocaleDateString() : '—'}
                    readonly={true}
                  />
                </div>
              </div>
            </div>
          </div>
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
export default TracCocoonPage;
