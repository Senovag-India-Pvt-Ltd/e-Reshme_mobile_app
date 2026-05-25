import React, { useState, useEffect, useRef } from "react";
import {
  IonContent,
  IonPage,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonInput,
  IonLabel,
  IonButton,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonIcon,
  IonBackButton,
  IonSelect,
  IonSelectOption,
  IonCol,
  IonAlert,
  IonToast,
} from "@ionic/react";
import { trash, searchOutline, refreshOutline, alertCircleOutline, cloudOfflineOutline, timeOutline, closeCircle, eyeOutline, createOutline, checkmarkCircle } from "ionicons/icons";
import { IonSpinner } from "@ionic/react";
import "./ProfileInfoPage.css";
import axios from "axios";
import { API_URL_DBT } from "../auth.service";
import { API_URL_Master_Data } from '../auth.service';

const LandInfoPage: React.FC = () => {
  const [searchText, setSearchText] = useState<string>("");
  const [data, setData] = useState<any[]>([]);
  const [farmerOtherData, setFarmerOtherData] = useState<any>(null);
  const [editableStates, setEditableStates] = useState<{
    [key: number]: boolean;
  }>({});
  const [viewStates, setViewStates] = useState<{ [key: number]: boolean }>({});
  const [viewAll, setViewAll] = useState<boolean>(false);
  // Dummy dropdown options (can be fetched from an API if needed)
  const sourceOfMulberryOptions = ["Cutting", "Seed", "Sapling"];
  const mulberryVarietyOptions = ["V1", "S36", "V2"];
  const silkwormVarietyOptions = ["CB", "BV", "FC"];
  const roofTypeOptions = ["Ac Sheet", "Tile", "Asbestos"];
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [iserror, setIserror] = useState<boolean>(false);
  const [farmerId, setFarmerId] = useState<number | null>(null);
  const [farmerLandDetailsId, setFarmerLandDetailsId] = useState<number | null>(
    null
  );
  const [showAlert, setShowAlert] = useState<boolean>(false); // For alert
  const [showLandDetails, setShowLandDetails] = useState<boolean>(false);
  const [searching, setSearching] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // New UX state
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('recentFruitsIds_land');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [searchAttempted, setSearchAttempted] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<'notFound' | 'network' | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);

  const FRUITS_ID_LENGTH = 16;

  const inputRef = useRef<HTMLIonInputElement>(null); // Add useRef for input field

  const handleSearchInputChange = (e: CustomEvent) => {
    const raw = (e.target as HTMLIonInputElement).value;
    const value = (typeof raw === 'string' ? raw : raw == null ? '' : String(raw)).toUpperCase();
    setSearchText(value);
    if (searchError) setSearchError(null);
    if (searchAttempted) setSearchAttempted(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLIonInputElement>) => {
    if (e.key === 'Enter' && searchText.trim() && !searching) {
      inputRef.current?.blur();
      fetchDetails();
    }
  };

  const saveRecent = (id: string) => {
    const trimmed = id.trim().toUpperCase();
    if (!trimmed) return;
    setRecentSearches(prev => {
      const next = [trimmed, ...prev.filter(x => x !== trimmed)].slice(0, 5);
      try { localStorage.setItem('recentFruitsIds_land', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const removeRecent = (id: string) => {
    setRecentSearches(prev => {
      const next = prev.filter(x => x !== id);
      try { localStorage.setItem('recentFruitsIds_land', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const handleRecentClick = (id: string) => {
    setSearchText(id);
    setSearchError(null);
    setSearchAttempted(false);
    setTimeout(() => fetchDetails(id), 0);
  };

  const fetchDetails = (overrideId?: string) => {
    if (searching) return;
    const idToSearch = (overrideId ?? searchText).trim().toUpperCase();
    if (!idToSearch) return;
    setShowLandDetails(false);
    setData([]);
    setSearchAttempted(true);
    setSearchError(null);
    setSearching(true);

    const api = axios.create({
      baseURL: API_URL_DBT,
    });

    api
      .post(
        "farmer-details/getInspectionFarmerLandDetailsByFruitsId",
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
        const farmerLandDetailsResponse =
          res.data?.content?.[0]?.farmerLandDetailsResponses?.[0];
        if (farmerLandDetailsResponse) {
          setData(farmerLandDetailsResponse);
          setFarmerId(farmerLandDetailsResponse.farmerId);
          setFarmerLandDetailsId(farmerLandDetailsResponse.farmerLandDetailsId);
          setViewAll(false);
          setShowLandDetails(true);
          saveRecent(idToSearch);
        } else {
          setSearchError('notFound');
        }
        setSearching(false);
      })
      .catch((error) => {
        const isNetwork = !error?.response;
        setSearchError(isNetwork ? 'network' : 'notFound');
        setShowLandDetails(false);
        setSearching(false);
      });
  };


  

  const handleClear = () => {
    setSearchText("");
    setData([]);
    setFarmerOtherData(null);
    setEditableStates({});
    setViewStates({});
    setViewAll(false);
    setIsEditable(false);
    setFarmerId(null);
    setViewAll(false);
    setShowLandDetails(false);
    setSearchAttempted(false);
    setSearchError(null);
  };

  const requestClear = () => {
    if (searchText.trim() || showLandDetails) {
      setShowClearConfirm(true);
    } else {
      handleClear();
    }
  };

  // Auto-focus the Fruits ID input on mount so the keyboard opens immediately
  useEffect(() => {
    const t = setTimeout(() => {
      inputRef.current?.setFocus().catch(() => { /* ignore */ });
    }, 250);
    return () => clearTimeout(t);
  }, []);
  

  const clearSearch = () => {
    setSearchText("");
    setData([]); // Reset data to an empty array
    setEditableStates({}); // Reset editable states
    setViewStates({});
    setViewAll(false); // Reset view states
  };

  const handleEditToggle = (id: number) => {
    setEditableStates((prevState) => ({
      ...prevState,
      [id]: !prevState[id], // Toggle the editable state for the specific record
    }));
  };

  const handleEdit = () => {
    if (isEditable) {
      // Guard against double-clicks — once a save is in flight, ignore further taps
      // until success or failure resolves it. Prevents duplicate records.
      if (submitting) return;
      setSubmitting(true);
      const api = axios.create({
        baseURL: API_URL_DBT
      });
      api.post("farmer-land-details/edit-land-details", {
        farmerId: farmerId,
        farmerLandDetailsId: farmerLandDetailsId,
        mulberryArea: farmerOtherData.mulberryArea,
        mulberrySourceId:farmerOtherData.mulberrySourceId,
        mulberryVarietyId:farmerOtherData.mulberryVarietyId,
        silkWormVarietyId:farmerOtherData.silkWormVarietyId,
        roofTypeId:farmerOtherData.roofTypeId,
        rearingHouseDetails:farmerOtherData.rearingHouseDetails,
        rearingCapacityDlf:farmerOtherData.rearingCapacityDlf,
      }, {
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      })
        .then(res => {
          console.log("Farmer Land details updated successfully", res.data);
          setMessage("Farmer Land details updated successfully");
          setIserror(false);
          setShowSuccessToast(true);
          // Auto-collapse back to the simple view after a successful save
          setIsEditable(false);
          setViewAll(false);
        })
        .catch(error => {
          console.error("Error updating farmer details", error);
          setMessage("Error updating farmer details");
          setIserror(true);
          setShowAlert(true);
          // Keep edit mode open so the user can retry without losing their input
        })
        .finally(() => {
          setSubmitting(false);
        });
    } else {
      setIsEditable(true);
    }
  };
  

  const handleChange = (e: CustomEvent, field: string) => {
    const value = (e.target as HTMLInputElement).value;
    if (farmerOtherData) {
      setFarmerOtherData({
        ...farmerOtherData,
        [field]: value,
      });
    }
  };

  const handleInputChange = (id: number, field: string, value: any) => {
    const updatedData = data.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setData(updatedData);
  };

const [fetchError, setFetchError] = useState<boolean>(false); // Fetch error state


  // State for Tsc selection and data fetching
  const [mulberrySourceId, setMulberrySourceId] = useState<string>(''); // Selected Tsc
  const [mulberrySourceData, setMulberrySourceData] = useState<any[]>([]); // List of Tsc options from API
  // const [fetchError, setFetchError] = useState<boolean>(false); // Fetch error state
  
  // Function to fetch Tsc data from the API
  const fetchMulberrySourceList = async () => {
    try {
      const response = await axios.get(`${API_URL_Master_Data}mulberry-source/get-all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`, // Use token if required
        },
      });
  
      if (response.data && response.data.content) {
        setMulberrySourceData(response.data.content.mulberrySource); // Set the fetched data
      } else {
        console.error('Unexpected API response format:', response);
        setFetchError(true);
      }
    } catch (error) {
      console.error('Error fetching Tsc list:', error);
      setFetchError(true); // Set error state if fetch fails
    }
  };
  
  const handleMulberrySourceChange = (value: string) => {
    setMulberrySourceId(value); // Set the selected Tsc
  };
  
  useEffect(() => {
    fetchMulberrySourceList();
  }, []);

  // State for Tsc selection and data fetching
  const [mulberryVarietyId, setMulberryVarietyId] = useState<string>(''); // Selected Tsc
  const [mulberryVarietyData, setMulberryVarietyData] = useState<any[]>([]); // List of Tsc options from API
  // const [fetchError, setFetchError] = useState<boolean>(false); // Fetch error state
  
  // Function to fetch Tsc data from the API
  const fetchMulberryVarietyList = async () => {
    try {
      const response = await axios.get(`${API_URL_Master_Data}mulberry-variety/get-all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`, // Use token if required
        },
      });
  
      if (response.data && response.data.content) {
        setMulberryVarietyData(response.data.content.mulberryVariety); // Set the fetched data
      } else {
        console.error('Unexpected API response format:', response);
        setFetchError(true);
      }
    } catch (error) {
      console.error('Error fetching Tsc list:', error);
      setFetchError(true); // Set error state if fetch fails
    }
  };
  
  const handleMulberryVarietyChange = (value: string) => {
    setMulberryVarietyId(value); // Set the selected Tsc
  };

  const clearField=()=>{
setViewAll(false);
  };
  const handleHide = () => {
    if (viewAll) {
      setViewAll(false); // Automatically hide when necessary
    }
  }; 
  
  useEffect(() => {
    fetchMulberryVarietyList();
  }, []);

  // State for Tsc selection and data fetching
  const [silkWormVarietyId, setSilkWormVarietyId] = useState<string>(''); // Selected Tsc
  const [silkWormVarietyData, setSilkWormVarietyData] = useState<any[]>([]); // List of Tsc options from API
  // const [fetchError, setFetchError] = useState<boolean>(false); // Fetch error state
  
  // Function to fetch Tsc data from the API
  const fetchSilkWormVarietyList = async () => {
    try {
      const response = await axios.get(`${API_URL_Master_Data}silk-worm-variety/get-all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`, // Use token if required
        },
      });
  
      if (response.data && response.data.content) {
        setSilkWormVarietyData(response.data.content.silkWormVariety); // Set the fetched data
      } else {
        console.error('Unexpected API response format:', response);
        setFetchError(true);
      }
    } catch (error) {
      console.error('Error fetching Tsc list:', error);
      setFetchError(true); // Set error state if fetch fails
    }
  };
 
  const handleSilkWormVarietyChange = (value: string) => {
    setSilkWormVarietyId(value); // Set the selected Tsc
  };
  
  useEffect(() => {
    fetchSilkWormVarietyList();
  }, []);

// State for Tsc selection and data fetching
const [roofTypeId, setRoofTypeId] = useState<string>(''); // Selected Tsc
const [roofTypeData, setRoofTypeData] = useState<any[]>([]); // List of Tsc options from API
// const [fetchError, setFetchError] = useState<boolean>(false); // Fetch error state

// Function to fetch Tsc data from the API
const fetchRoofTypeList = async () => {
  try {
    const response = await axios.get(`${API_URL_Master_Data}roofType/get-all`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`, // Use token if required
      },
    });

    if (response.data && response.data.content) {
      setRoofTypeData(response.data.content.roofType); // Set the fetched data
    } else {
      console.error('Unexpected API response format:', response);
      setFetchError(true);
    }
  } catch (error) {
    console.error('Error fetching Tsc list:', error);
    setFetchError(true); // Set error state if fetch fails
  }
};

const handleRoofTypeChange = (value: string) => {
  setRoofTypeId(value); // Set the selected Tsc
};

useEffect(() => {
  fetchRoofTypeList();
}, []);




const toggleViewAll = () => {
  if (!viewAll && farmerId !== null) {
    const api = axios.create({
      baseURL: API_URL_DBT,
    });

    api
      .get(`farmer-land-details/get-by-farmer-id-join/${farmerId}`, {
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      })
      .then((res) => {
        const landDetails = res.data.content.farmerLandDetails;
        console.log("farmerLandDetails", landDetails);

        if (landDetails && landDetails.length > 0) {
          setFarmerOtherData(landDetails[0]);
        } else {
          setMessage("No land details found");
          setIsError(true);
        }
      })
      .catch((error) => {
        setMessage("Error fetching farmer details");
        setIsError(true);
      });
  }
  setViewAll(!viewAll);
  setIsEditable(!isEditable);
};


  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="page-toolbar">
          <IonButtons slot="start">
            <IonBackButton text="Back" defaultHref="/subsubmenu" />
          </IonButtons>
          <IonTitle>Land Info</IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={handleClear} aria-label="Refresh" disabled={searching}>
              <IonIcon icon={refreshOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="page-content">
        <div className="page-hero-extension" aria-hidden="true"></div>
        <div className="search-section is-sticky">
          <div className="search-input-wrap">
            <span className="search-label">Fruits ID</span>
            <IonInput
              ref={inputRef}
              value={searchText}
              placeholder="e.g. FID2802000042820"
              autocapitalize="characters"
              maxlength={FRUITS_ID_LENGTH}
              onIonInput={handleSearchInputChange}
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
              onClick={() => { if (searchText.trim()) fetchDetails(); }}
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

          {recentSearches.length > 0 && !showLandDetails && !searching && (
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

        {!searching && !showLandDetails && searchAttempted && searchError && (
          <div className={`empty-state-card ${searchError === 'network' ? 'is-network' : 'is-not-found'}`}>
            <div className="empty-state-icon">
              <IonIcon icon={searchError === 'network' ? cloudOfflineOutline : alertCircleOutline} />
            </div>
            <h4 className="empty-state-title">
              {searchError === 'network' ? 'Network error' : 'No land details found'}
            </h4>
            <p className="empty-state-text">
              {searchError === 'network'
                ? 'Could not reach the server. Check your internet connection and try again.'
                : `No land details found for "${searchText.trim().toUpperCase()}". Please check the Fruits ID and try again.`}
            </p>
            <IonButton
              className="btn-primary is-active"
              onClick={() => fetchDetails()}
              disabled={!searchText.trim() || searching}
            >
              <IonIcon icon={refreshOutline} slot="start" /> Retry
            </IonButton>
          </div>
        )}
      

        {showLandDetails && data && (
          <div className="result-card">
            <div className="result-head">
              <div className="result-avatar is-accent-green">L</div>
              <div className="result-head-text">
                <span className="result-eyebrow">Land Details</span>
                <h3 className="result-title">{data.villageName || 'Farmer Land'}</h3>
              </div>
            </div>

            <div className="result-body">
              <div className="info-row">
                <label className="info-label">Survey No</label>
                <IonInput value={data.surveyNumber} readonly={true} />
              </div>
              <div className="info-row">
                <label className="info-label">Village Name</label>
                <IonInput value={data.villageName} readonly={true} />
              </div>

              {viewAll && (
                <>
                  <div className="info-row">
                    <label className="info-label">Mulberry Area</label>
                    <IonInput
                      value={farmerOtherData?.mulberryArea}
                      onIonChange={(e) => handleChange(e, "mulberryArea")}
                    />
                  </div>

                  <div className="info-row">
                    <label className="info-label">Source Of Mulberry</label>
                    {fetchError ? (
                      <p className="info-error">Failed to fetch Mulberry list. Please try again later.</p>
                    ) : (
                      <IonSelect
                        value={farmerOtherData?.mulberrySourceId}
                        disabled={!isEditable}
                        placeholder="Select Mulberry Source"
                        interface="action-sheet"
                        onIonChange={(e) => setFarmerOtherData({ ...farmerOtherData, mulberrySourceId: e.detail.value! })}
                      >
                        <IonSelectOption value="">None</IonSelectOption>
                        {mulberrySourceData.map((source) => (
                          <IonSelectOption key={source.mulberrySourceId} value={source.mulberrySourceId}>
                            {source.mulberrySourceName}
                          </IonSelectOption>
                        ))}
                      </IonSelect>
                    )}
                  </div>

                  <div className="info-row">
                    <label className="info-label">Mulberry Variety</label>
                    {fetchError ? (
                      <p className="info-error">Failed to fetch Mulberry list. Please try again later.</p>
                    ) : (
                      <IonSelect
                        value={farmerOtherData?.mulberryVarietyId}
                        disabled={!isEditable}
                        placeholder="Select Mulberry Variety"
                        interface="action-sheet"
                        onIonChange={(e) => setFarmerOtherData({ ...farmerOtherData, mulberryVarietyId: e.detail.value! })}
                      >
                        <IonSelectOption value="">None</IonSelectOption>
                        {mulberryVarietyData.map((variety) => (
                          <IonSelectOption key={variety.mulberryVarietyId} value={variety.mulberryVarietyId}>
                            {variety.mulberryVarietyName}
                          </IonSelectOption>
                        ))}
                      </IonSelect>
                    )}
                  </div>

                  <div className="info-row">
                    <label className="info-label">Silk Worm Variety</label>
                    {fetchError ? (
                      <p className="info-error">Failed to fetch Mulberry list. Please try again later.</p>
                    ) : (
                      <IonSelect
                        value={farmerOtherData?.silkWormVarietyId}
                        disabled={!isEditable}
                        placeholder="Select Silk Worm Variety"
                        interface="action-sheet"
                        onIonChange={(e) => setFarmerOtherData({ ...farmerOtherData, silkWormVarietyId: e.detail.value! })}
                      >
                        <IonSelectOption value="">None</IonSelectOption>
                        {silkWormVarietyData.map((silk) => (
                          <IonSelectOption key={silk.silkWormVarietyId} value={silk.silkWormVarietyId}>
                            {silk.silkWormVarietyName}
                          </IonSelectOption>
                        ))}
                      </IonSelect>
                    )}
                  </div>

                  <div className="info-row">
                    <label className="info-label">Roof Type</label>
                    {fetchError ? (
                      <p className="info-error">Failed to fetch Mulberry list. Please try again later.</p>
                    ) : (
                      <IonSelect
                        value={farmerOtherData?.roofTypeId}
                        disabled={!isEditable}
                        placeholder="Select Roof Type"
                        interface="action-sheet"
                        onIonChange={(e) => setFarmerOtherData({ ...farmerOtherData, roofTypeId: e.detail.value! })}
                      >
                        <IonSelectOption value="">None</IonSelectOption>
                        {roofTypeData.map((roof) => (
                          <IonSelectOption key={roof.roofTypeId} value={roof.roofTypeId}>
                            {roof.roofTypeName}
                          </IonSelectOption>
                        ))}
                      </IonSelect>
                    )}
                  </div>

                  <div className="info-row">
                    <label className="info-label">Rearing House (in sqft)</label>
                    <IonInput
                      value={farmerOtherData?.rearingHouseDetails}
                      readonly={!isEditable}
                      onIonChange={(e) => handleChange(e, "rearingHouseDetails")}
                    />
                  </div>

                  <div className="info-row">
                    <label className="info-label">Rearing Capacity</label>
                    <IonInput
                      value={farmerOtherData?.rearingCapacityDlf}
                      readonly={!isEditable}
                      onIonChange={(e) => handleChange(e, "rearingCapacityDlf")}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="result-actions">
              {!viewAll ? (
                <IonButton
                  className="btn-result-primary is-active"
                  expand="block"
                  disabled={submitting}
                  onClick={toggleViewAll}
                >
                  <IonIcon icon={eyeOutline} slot="start" />
                  View All Details
                </IonButton>
              ) : (
                <IonButton
                  className={`btn-result-primary ${isEditable ? "is-save-active" : "is-active"} ${submitting && isEditable ? "is-loading" : ""}`}
                  expand="block"
                  disabled={submitting}
                  onClick={handleEdit}
                >
                  {submitting && isEditable ? (
                    <>
                      <IonSpinner name="crescent" className="btn-spinner" />
                      <span style={{ marginLeft: 6 }}>Saving...</span>
                    </>
                  ) : (
                    <>
                      <IonIcon icon={isEditable ? checkmarkCircle : createOutline} slot="start" />
                      {isEditable ? "Save Changes" : "Edit Details"}
                    </>
                  )}
                </IonButton>
              )}
            </div>
          </div>
        )}

<IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={isError ? "Error" : "Success"}
          message={message}
          buttons={['OK']}
        />

        {/* Success toast — non-blocking. Top-positioned so it never sits
            behind the floating bottom home button. */}
        <IonToast
          isOpen={showSuccessToast}
          onDidDismiss={() => setShowSuccessToast(false)}
          message={message || 'Saved successfully'}
          duration={2800}
          position="top"
          color="success"
          cssClass="app-toast app-toast--success"
        />

        {/* Confirm before clearing the form */}
        <IonAlert
          isOpen={showClearConfirm}
          onDidDismiss={() => setShowClearConfirm(false)}
          header="Clear data?"
          message="This will clear the Fruits ID and any unsaved details. Continue?"
          buttons={[
            { text: 'Cancel', role: 'cancel' },
            { text: 'Clear', role: 'destructive', handler: () => handleClear() },
          ]}
          cssClass="app-alert app-alert--warning"
        />
      </IonContent>
    </IonPage>
  );
};

export default LandInfoPage;






