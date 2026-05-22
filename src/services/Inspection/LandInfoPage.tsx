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
} from "@ionic/react";
import { trash, searchOutline, refreshOutline } from "ionicons/icons";
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
  
  const inputRef = useRef<HTMLIonInputElement>(null); // Add useRef for input field

  const handleSearchInputChange = (e: CustomEvent) => {
    const value = (e.target as HTMLIonInputElement).value!;
    setSearchText(value);
    if (value.length === 16) {
      inputRef.current?.blur(); // Remove focus from input field
      fetchDetails();
    }
  };

  const fetchDetails = () => {
    if (searching) return;
    setSearching(true);

    const api = axios.create({
      baseURL: API_URL_DBT,
    });

    api
      .post(
        "farmer-details/getInspectionFarmerLandDetailsByFruitsId",
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
        const farmerLandDetailsResponse =
          res.data.content[0].farmerLandDetailsResponses[0];
        console.log(farmerLandDetailsResponse);

        setData(farmerLandDetailsResponse);
        setFarmerId(farmerLandDetailsResponse.farmerId);
        setFarmerLandDetailsId(farmerLandDetailsResponse.farmerLandDetailsId);
        setViewAll(false);
        setShowLandDetails(true);
        setSearching(false);
      })
      .catch((error) => {
        setMessage("Farmer number does not exist");
        setIserror(false);
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
  };
  

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
      // TODO: Whichever is ID in below need to get that from dropdown which get from master data
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
          setShowAlert(true);
        })
        .catch(error => {
          console.error("Error updating farmer details", error);
          setMessage("Error updating farmer details");
          setIserror(true);
          setShowAlert(true);
        });
    }
    setIsEditable(!isEditable);
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
        <div className="search-section">
          <div className="search-input-wrap">
            <span className="search-label">Fruits ID</span>
            <IonInput
              ref={inputRef}
              value={searchText}
              placeholder="Enter Fruits ID"
              onIonInput={handleSearchInputChange}
            />
          </div>
          <div className="search-action-row">
            <IonButton
              className={`btn-primary ${searching ? "is-loading" : ""}`}
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
              onClick={handleClear}
              aria-label="Clear"
              disabled={searching}
            >
              <IonIcon icon={trash} />
            </IonButton>
          </div>
        </div>
      

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
              <IonButton
                className="btn-result-primary is-active"
                expand="block"
                onClick={toggleViewAll}
              >
                {viewAll ? "Hide Details" : "View All Details"}
              </IonButton>
              <IonButton
                className={`btn-result-secondary ${isEditable ? "is-save-active" : ""}`}
                expand="block"
                onClick={handleEdit}
              >
                {isEditable ? "Save Changes" : "Edit Details"}
              </IonButton>
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
      </IonContent>
    </IonPage>
  );
};

export default LandInfoPage;






