import React, { useState, useEffect, useRef } from 'react';
import { 
  IonContent, IonCol, IonPage, IonCard, IonCardContent, IonCardHeader, 
  IonCardTitle, IonInput, IonLabel, IonButton, IonHeader, 
  IonToolbar, IonTitle, IonButtons, IonMenuButton, IonIcon, IonSelect, IonSelectOption, IonBackButton, IonAlert 
} from '@ionic/react';
import { trash } from 'ionicons/icons';
import './ProfileInfoPage.css';
import axios from 'axios';
import { API_URL_DBT } from '../auth.service';
import { API_URL_Master_Data } from '../auth.service';

const ProfileInfoPage: React.FC = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [data, setData] = useState<any>(null);
  const [farmerOtherData, setFarmerOtherData] = useState<any>({});
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const [viewAll, setViewAll] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);
  const [farmerId, setFarmerId] = useState<number | null>(null);
  const [tscMasterId, setTscMasterId] = useState<string>(''); 
  const [tscListData, setTscListData] = useState<any[]>([]);
  const [fetchError, setFetchError] = useState<boolean>(false);
  
  const [showAlert, setShowAlert] = useState<boolean>(false); // For alert

  const inputRef = useRef<HTMLIonInputElement>(null); // Add useRef for input field

  const handleInputChange = (e: CustomEvent) => {
    const value = (e.target as HTMLIonInputElement).value!;
    setSearchText(value);
    if (value.length === 16) {
      inputRef.current?.blur(); // Remove focus from input field
      fetchFarmerDetails();
    }
  };

  const fetchFarmerDetails = () => {
    clearField();  // Clear previous data
    const api = axios.create({
      baseURL: API_URL_DBT
    });
  
    api.post("farmer-details/getInspectionFarmerDetailsByFruitsId", { fruitsId: searchText }, {
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
      },
    })
    .then(res => {
      // Directly set the first farmer response if available
      const farmerResponse = res.data?.content?.[0]?.farmerResponses?.[0];
      setData(farmerResponse);  // This will set data to undefined if no response
      setFarmerId(farmerResponse?.farmerId);  // Safely handle setting farmerId
    })
    .catch(error => {
      console.error("Error fetching farmer details:", error);
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

  const handleTscChange = (value: string) => {
    setTscMasterId(value);
    setFarmerOtherData(prev => ({
      ...prev,
      tscMasterId: value,
    }));
  };

  useEffect(() => {
    fetchTscList();
  }, []);

  // const handleEdit = () => {
  //   if (isEditable) {
  //     const api = axios.create({
  //       baseURL: API_URL_DBT
  //     });
  //     api.post("farmer/edit-farmer-profile", {
  //       mobileNumber: farmerOtherData.mobileNumber,
  //       tscMasterId: farmerOtherData.tscMasterId,
  //       farmerId: farmerId
  //     }, {
  //       headers: {
  //         "Content-Type": "application/json",
  //         accept: "*/*",
  //         Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
  //       },
  //     })
  //     .then(res => {
  //       console.log("Farmer details updated successfully", res.data);
  //       setMessage("Farmer details updated successfully");
  //       setIsError(false);
  //       setShowAlert(true);
  //       clearFields(); // Clear fields upon successful insertion
  //     })
  //     .catch(error => {
  //       console.error("Error updating farmer details", error);
  //       setMessage("Error updating farmer details");
  //       setIsError(true);
  //       setShowAlert(true);
  //     });
  //   }
  //   setIsEditable(!isEditable);
  // };

  // const handleEdit = async () => {
  //   if (isEditable) {
  //     try {
  //       // Save the farmer details
  //       const api = axios.create({
  //         baseURL: API_URL_DBT
  //       });
  //       await api.post("farmer/edit-farmer-profile", {
  //         mobileNumber: farmerOtherData.mobileNumber,
  //         tscMasterId: farmerOtherData.tscMasterId,
  //         farmerId: farmerId
  //       }, {
  //         headers: {
  //           "Content-Type": "application/json",
  //           accept: "*/*",
  //           Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
  //         },
  //       });

  //       // If a file is selected, upload it
  //       if (selectedFile) {
  //         const formData = new FormData();
  //         formData.append('file', selectedFile);
  //         formData.append('farmerId', farmerId?.toString() || '');

  //         await api.post('farmer/upload-photo', formData, {
  //           headers: {
  //             'Content-Type': 'multipart/form-data',
  //             Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
  //           },
  //         });

  //         setMessage("Farmer details and photo uploaded successfully");
  //       } else {
  //         setMessage("Farmer details updated successfully");
  //       }

  //       setIsError(false);
  //       setShowAlert(true);
  //       clearFields(); // Clear fields upon successful upload
  //     } catch (error) {
  //       console.error("Error updating farmer details or uploading photo", error);
  //       setMessage("Error updating farmer details or uploading photo");
  //       setIsError(true);
  //       setShowAlert(true);
  //     }
  //   }

  //   setIsEditable(!isEditable);
  // };

  const handleEdit = async () => {
    if (isEditable) {
      try {
        // Save the farmer details
        const api = axios.create({
          baseURL: API_URL_DBT
        });
        await api.post("farmer/edit-farmer-profile", {
          mobileNumber: farmerOtherData.mobileNumber,
          tscMasterId: farmerOtherData.tscMasterId,
          photoPath: farmerOtherData.photoPath,
          farmerId: farmerId
        }, {
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        });
  
        // If a file is selected, upload it
        if (selectedFile) {
          const formData = new FormData();
          formData.append('multipartFile', selectedFile); // Use the correct key
          formData.append('farmerId', farmerId?.toString() || '');
  
          const response = await api.post('farmer/upload-photo', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
            },
          });
  
          // Update the photo path in the state with the new path from the response
          const newPhotoPath = response.data.content.photoPath; // Adjust based on your response structure
          setFarmerOtherData((prevData) => ({
            ...prevData,
            photoPath: newPhotoPath // Set the new photo path
          }));
  
          setMessage("Farmer details and photo uploaded successfully");
        } else {
          setMessage("Farmer details updated successfully");
        }
  
        setIsError(false);
        setShowAlert(true);
        clearFields(); // Clear fields upon successful upload
      } catch (error) {
        console.error("Error updating farmer details or uploading photo", error);
        setMessage("Error updating farmer details or uploading photo");
        setIsError(true);
        setShowAlert(true);
      }
    }
  
    setIsEditable(!isEditable);
  };
  

  const clearFields = () => {
    setFarmerOtherData({});
    setSearchText('');
    setData(null);
    setTscMasterId('');
    setSelectedFile(null);
    setFarmerId(null);
    setViewAll(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setFarmerOtherData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  

  const toggleViewAll = (i: number) => {
    setViewAll(!viewAll);
    const api = axios.create({
      baseURL: API_URL_DBT
    });
    api.get(`farmer/get-by-farmer-id-join/${i}`, {
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
      },
    })
    .then(res => {
      console.log("singleData", res.data.content);
      setFarmerOtherData(prev => ({ ...prev, ...res.data.content }));
      setFarmerId(res.data.content[0].farmerId);
      setTscMasterId(res.data.content.tscName);
    })
    .catch(error => {
      setMessage("Farmer number does not exist");
      setIsError(true);
    });
  };
  // Hide button logic extracted here
  const handleHide = () => {
    if (viewAll) {
      setViewAll(false); // Automatically hide when necessary
    }
  }; 
  const clearSearch = () => {
    setSearchText('');
    setData(null);
    setIsEditable(false);
    setViewAll(false);
  };
  const clearField=()=>{
    setViewAll(false);
  };

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
            
            <IonMenuButton />
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle><b>Farmer Profile Info</b></IonTitle>
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

          <IonButton size="small" onClick={() => { fetchFarmerDetails(); }}>Search</IonButton>
          <IonButton size="small" fill="clear" onClick={clearSearch}>
            <IonIcon color="danger" icon={trash} />
          </IonButton>
        </div>

        {data && (
          <IonCard className="details-card">
            <IonCardHeader>
              <IonCardTitle>Farmer Profile Details</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div className="details-row">
                <IonLabel>FarmerName:</IonLabel>
                <IonInput
                  value={data.fullName}
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

              {!viewAll ? (
                <IonButton expand="full" onClick={() => farmerId !== null && toggleViewAll(farmerId)}>
                  View All
                </IonButton>
              ) : (
                <>
                  <IonButton expand="full" onClick={() => farmerId !== null && toggleViewAll(farmerId)}>
                    Hide
                  </IonButton>
                  <div className="details-row">
                    <IonLabel>Father's/Husband Name:</IonLabel>
                    <IonInput
                      value={farmerOtherData?.fatherName}
                      readonly={true}
                    />
                  </div>
                  <div className="details-row">
                    <IonLabel>Father's/Husband Name in Kannada:</IonLabel>
                    <IonInput
                      value={farmerOtherData?.fatherNameKan}
                      readonly={true}
                    />
                  </div>
                  <div className="details-row">
                    <IonLabel>Caste:</IonLabel>
                    <IonInput
                      value={farmerOtherData?.title}
                      readonly={true}
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
                          onIonChange={(e) => handleTscChange(e.detail.value!)}
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
                    <IonLabel>Farmer Photo:</IonLabel>
                    <label>(MAX:2mb)</label>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*" 
                    />
                    {selectedFile && (
                      <div>
                        <IonLabel>Selected File: {selectedFile.name}</IonLabel>
                        {selectedFile.type.startsWith('image/') && (
                          <img
                            src={URL.createObjectURL(selectedFile)}
                            alt="Preview"
                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
              <IonButton onClick={handleEdit}>
                {isEditable ? 'Save' : 'Edit'}
              </IonButton>
            </IonCardContent>
          </IonCard>
        )}

        {/* Alert for success/error message */}
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

export default ProfileInfoPage;




