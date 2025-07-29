import React, { useState,useEffect, useRef } from 'react';
import { 
  IonContent, IonPage, IonCard, IonCardContent, IonCardHeader, 
  IonCardTitle, IonInput, IonLabel, IonButton, IonHeader, IonCol,IonSelect,IonSelectOption,
  IonToolbar, IonTitle, IonButtons, IonMenuButton, IonIcon, IonBackButton, useIonViewWillLeave, 
  IonAlert
} from '@ionic/react';
import { trash } from 'ionicons/icons'; // Import the trash icon
import './ProfileInfoPage.css';
import axios from 'axios';
import { API_URL_DBT } from '../auth.service';
import { API_URL_Master_Data } from '../auth.service';

const ReelerInfoPage: React.FC = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [data, setData] = useState<any>(null);
  const [farmerOtherData, setFarmerOtherData] = useState<any>({
    mahajarNorthEast: '',
    mahajarNorthWest: '',
    mahajarSouthEast: '',
    mahajarSouthWest: '',
    // ...other fields...
  });
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const [viewAll, setViewAll] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // State to hold selected file
  const [message,setMessage] = useState<string>("");
  const [iserror,setIserror] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [reelerId, setReelerId] = useState<number | null>(null);
  const [tscListData, setTscListData] = useState<any[]>([]);
  const [fetchError, setFetchError] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);

  const inputRef = useRef<HTMLIonInputElement>(null); // Add useRef for input field

  const handleInputChange = (e: CustomEvent) => {
    const value = (e.target as HTMLIonInputElement).value!;
    setSearchText(value);
    if (value.length === 16) {
      inputRef.current?.blur(); // Remove focus from input field
      fetchReelerDetails();
    }
  };

  const fetchReelerDetails = () => {
    clearField();
    axios
      .get(`${API_URL_DBT}farmer-details/getReelerDetailsByFruitsId/${searchText}`, {
        headers: {
          'Content-Type': 'application/json',
          accept: '*/*',
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
        },
      })
      .then(res => {
        // Directly set the first reeler response if available
        setData(res.data[0]);
        setReelerId(res.data[0]?.reelerId);  // Safely handle setting reelerId
        setMessage('');  // Clear message
        setIserror(false);  // Reset error state
      })
      .catch(() => {
        setMessage('Reeler does not exist');  // Handle error message
        setIserror(true);  // Set error state
        setData(null);  // Clear data on error
      });
  };
  
  const fetchTscList = async () => {
    try {
      const response = await axios.get(`${API_URL_Master_Data}tscMaster/get-all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
        },
      });
      if (response.data && response.data.content) {
        setTscListData(response.data.content.tscMaster);
      } else {
        console.error('Unexpected API response format:', response);
        setFetchError(true);
      }
    } catch (error) {
      console.error('Error fetching Tsc list:', error);
      setFetchError(true);
    }
  };

  // const handleTscChange = (value: string) => {
  //   // setTscMasterId(value);
  //   setFarmerOtherData(prev => ({
  //     ...prev,
  //     tscMasterId: value,
  //   }));
  // };

  useEffect(() => {
    fetchTscList();
  }, []);
  const clearField=()=>{
    setViewAll(false);
  };
  
  const handleEdit = () => {
    if (isEditable) {
      const api = axios.create({
        baseURL: API_URL_DBT
      });
      api.post("reeler/edit-reeler-profile", {
        mobileNumber: farmerOtherData.mobileNumber,
        tscMasterId: farmerOtherData.tscMasterId,
        reelerId: reelerId,
        mahajarNorthEast: farmerOtherData.mahajarNorthEast,
        mahajarNorthWest: farmerOtherData.mahajarNorthWest,
        mahajarSouthEast: farmerOtherData.mahajarSouthEast,
        mahajarSouthWest: farmerOtherData.mahajarSouthWest
      }, {
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      })
      .then(res => {
        console.log("Reeler details updated successfully", res.data);
        setMessage("Reeler details updated successfully");
        setIsError(false);
        setShowAlert(true);
        clearFields();
         // Clear fields upon successful insertion
      })
      .catch(error => {
        console.error("Error updating farmer details", error);
        setMessage("Error updating farmer details");
        setIsError(true);
        setShowAlert(true);
      });
    }
    setIsEditable(!isEditable);
  };
  const clearFields = () => {
    setFarmerOtherData({});
    setSearchText('');
    setData(null);
    setSelectedFile(null);
    setReelerId(null);
    setViewAll(false);
  };

 
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setFarmerOtherData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  
  const clearSearch = () => {
    setSearchText('');
    setData(null);
    setIsEditable(false); // Reset editing mode when clearing the search
  };


  const toggleViewAll = (i:number) => {
    setViewAll(!viewAll);
    // API for View All
    const api = axios.create({
      baseURL: API_URL_DBT
    })
    api.get(`reeler/get-by-reeler-id-join/${i}`, {
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
      },
    })
      .then(res => {
        console.log("singleData", res.data.content);
        setFarmerOtherData((prev: any) => ({...prev, ...res.data.content}));
        setReelerId(res.data.content[0].reelerId);
        })
      .catch(error => {
        setMessage("Reeler number does not exist");
        setIserror(true)
      })
  };


  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton /><IonBackButton defaultHref="/" /> 
            
          </IonButtons>
          <IonTitle><b>Reeler Profile Info</b></IonTitle>
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

          <IonButton size="small" onClick={fetchReelerDetails}>Search</IonButton>

          {/* Clear button with trash icon */}
          <IonButton size="small" fill="clear" onClick={clearSearch}>
            <IonIcon color="danger"  icon={trash} />
          </IonButton>
        </div>

        {data && (
          <IonCard className="details-card">
            <IonCardHeader>
              <IonCardTitle>Reeler Profile Details</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div className="details-row">
                <IonLabel>Reeler Name:</IonLabel>
                <IonInput
                  value={data.reelerName}
                  readonly={true} // Set to always be readonly
                  // onIonChange={e => handleChange(e, 'reelername')}
                />
              </div>
              <div className="details-row">
                <IonLabel>Address:</IonLabel>
                <IonInput
                  value={data.address}
                  readonly={true} // Set to always be readonly
                  // onIonChange={e => handleChange(e, 'farmerNameInKannada')}
                />
              </div>
              {!viewAll ? (
                <IonButton expand="full" onClick={() => reelerId !== null && toggleViewAll(reelerId)}>
                  View All
                </IonButton>
              ) : (
                <>
                  <IonButton expand="full" onClick={() => reelerId !== null && toggleViewAll(reelerId)}>
                    Hide
                  </IonButton>
                  <div className="details-row">
                    <IonLabel>Father's/Husband Name:</IonLabel>
                    <IonInput
                      value={farmerOtherData?.fatherName}
                      readonly={true}
                      // onIonChange={e => handleChange(e, 'fathersname')}
                    />
                  </div>
                 
                  <div className="details-row">
                    <IonLabel>Caste:</IonLabel>
                    <IonInput
                      value={farmerOtherData?.title}
                      readonly={true}
                      // onIonChange={e => handleChange(e, 'caste')}
                    />
                  </div>
                  <IonCol size="12">
                    <div className="details-row">
                      <IonLabel>
                        <b>Select Tsc:</b>
                      </IonLabel>
                      {fetchError ? (
                        <p style={{ color: 'red' }}>Failed to fetch Tsc list. Please try again later.</p>
                      ) : (
                        <IonSelect
                        value={farmerOtherData?.tscMasterId}
                        disabled={!isEditable} 
                        placeholder="Select Tsc"
                        onIonChange={(e) => setFarmerOtherData({
                          ...farmerOtherData,
                          tscMasterId: e.detail.value  // Properly update tscMasterId when a new value is selected
                        })}
                      >
                        <IonSelectOption value="">None</IonSelectOption> 
                        {tscListData.map((tsc) => (
                          <IonSelectOption key={tsc.tscMasterId} value={tsc.tscMasterId}>
                            {tsc.name}
                          </IonSelectOption>
                        ))}
                      </IonSelect>
                      
                      )}
                    </div>
                  </IonCol>

                  <div className="details-row">
                    <IonLabel>Mobile Number:</IonLabel>
                    <IonInput
                      value={farmerOtherData?.mobileNumber}
                      readonly={!isEditable}
                      onIonChange={e => handleChange(e, 'mobileNumber')}
                    />
                  </div>
                  <div className="details-row">
                    <IonLabel>North East:</IonLabel>
                    <IonInput
                      value={farmerOtherData?.mahajarNorthEast}
                      readonly={!isEditable}
                      onIonChange={e => handleChange(e, 'mahajarNorthEast')}
                    />
                  </div>
                  <div className="details-row">
                    <IonLabel>North West:</IonLabel>
                    <IonInput
                      value={farmerOtherData?.mahajarNorthWest}
                      readonly={!isEditable}
                      onIonChange={e => handleChange(e, 'mahajarNorthWest')}
                    />
                  </div>
                  <div className="details-row">
                    <IonLabel>South East:</IonLabel>
                    <IonInput
                      value={farmerOtherData?.mahajarSouthEast}
                      readonly={!isEditable}
                      onIonChange={e => handleChange(e, 'mahajarSouthEast')}
                    />
                  </div>
                  <div className="details-row">
                    <IonLabel>South West:</IonLabel>
                    <IonInput
                      value={farmerOtherData?.mahajarSouthWest}
                      readonly={!isEditable}
                      onIonChange={e => handleChange(e, 'mahajarSouthWest')}
                    />
                  </div>
                  
                  {/* File upload input for Farmer Photo */}
                  
                </>
              )}
              <IonButton onClick={handleEdit}>
                {isEditable ? 'Save' : 'Edit'}
              </IonButton>
            </IonCardContent>
          </IonCard>
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
}

export default ReelerInfoPage;
