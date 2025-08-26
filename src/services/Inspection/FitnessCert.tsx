import React, { useState, useEffect, useRef } from 'react';
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
  IonDatetime,
  IonCol,
  IonAlert,
  IonImg,
  IonModal,
} from '@ionic/react';
import { trash, informationCircle, camera, eyeSharp, trashSharp } from 'ionicons/icons';
import './ProfileInfoPage.css';
import './AddDlfPage.css';
import axios from "axios";
import { API_URL_DBT,API_URL_ChowkiManagment } from "../auth.service";
import { API_URL_Master_Data } from '../auth.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';


const FitnessPage: React.FC = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
   const [isModalOpen, setIsModalOpen] = useState(false);

   const [dataList, setDataList] = useState<any[]>([]);
  const [data, setData] = useState<any>(null);
  const [viewAll, setViewAll] = useState<boolean>(false);
  const [isFCIssued, setIsFCIssued] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>(''); // State for selected date
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false); // State for date picker visibility
  const [diseaseStatusOptions, setDiseaseStatusOptions] = useState<string[]>(['Healthy', 'Infected', 'Quarantined']); // Dummy data for disease status options
  const [message, setMessage] = useState<string>("");
  const [farmerId, setFarmerId] = useState<number | null>(null); 
  const [isError, setIsError] = useState<boolean>(false);
  const [saleAndDisposalId, setChowkiId] = useState<number | null>(null);
  // const [inspectionData, setInspectionData] = useState<any>(null);
  const [fetchError, setFetchError] = useState<boolean>(false); 
  const [showHatchingDatePicker, setShowHatchingDatePicker] =
    useState<boolean>(false);
  const [showDispatchDatePicker, setShowDispatchDatePicker] =
    useState<boolean>(false);
  const [inspectionData, setInspectionData] = useState({
    expectedCocoon: '',
    lotTestDetails: '',
    diseaseStatusId: '',
    noOfChandies: '',
    spunFromDate: '',
    spunToDate: '',
    fitnessCertificatePath: '',
  });

  const inputRef = useRef<HTMLIonInputElement>(null); // Add this line near other state declarations

  const handleInputChange = (e: CustomEvent) => {
    const value = (e.target as HTMLIonInputElement).value!;
    setSearchText(value);
    if (value.length === 16) {
      inputRef.current?.blur(); // Remove focus from input field, but don't trigger fetch
    }
  };

  const [showSpunDatePicker, setShowSpunDatePicker] = useState(false);

  interface FCData {
    note: string;
    cropDate: string;
    cropStatusName: string;
    mountName: string;
    reasonName: string;
  }
  
  interface DataItem {
    saleAndDisposalId: number;
    raceName: string;
    lotNumberRsp: string;
    lotNumberCrc: string;
    numbersOfDfls: string;
    ratePer100Dfls: string;
    fcData: FCData | null;
    issueFCVisible: boolean;
  }
  



  const [showAlert, setShowAlert] = useState<boolean>(false);
  const fetchFarmerDetails = () => {
    clearField();
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
        setDataList([res.data.content[0].farmerResponses[0]]);
        setFarmerId(res.data.content[0].farmerResponses[0].farmerId);
        toggleViewAll(res.data.content[0].farmerResponses[0].fruitsId);
      })
      .catch((error) => {
        setMessage("Farmer number does not exist");
        setIsError(true);
      });
  };

  useEffect(() => {
    if (dataList.length > 0) {
        console.log("DataList updated: ", dataList);
    }
}, [dataList]);


  const [diseaseListData, setDiseaseListData] = useState<any[]>([]); // List of Tsc options from API
//  const [fetchError, setFetchError] = useState<boolean>(false); // Fetch error state
 
 // Function to fetch Tsc data from the API
 const fetchDiseaseList = async () => {
   try {
     const response = await axios.get(`${API_URL_Master_Data}diseaseStatus/get-all`, {
       headers: {
         Authorization: `Bearer ${localStorage.getItem('jwtToken')}`, // Use token if required
       },
     });
 
     if (response.data && response.data.content) {
      setDiseaseListData(response.data.content.diseaseStatus); // Set the fetched data
     } else {
       console.error('Unexpected API response format:', response);
       setFetchError(true);
     }
   } catch (error) {
     console.error('Error fetching Tsc list:', error);
     setFetchError(true); // Set error state if fetch fails
   }
 };
 

 // Fetch Tsc list when component mounts
 useEffect(() => {
  fetchDiseaseList();
 }, []);

 


const toggleViewAll = (i: number) => {
  // setViewAll(!viewAll);
  const api = axios.create({
    baseURL: API_URL_ChowkiManagment,
  });

  api.get(`chowkimanagement/getInspectioninfoForFarmerFromSaleDisposalOfDFls/${i}`, {
    headers: {
      "Content-Type": "application/json",
      accept: "*/*",
      Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
    },
  })
  .then((res) => {
    if (res.data && res.data.length > 0) {
      const chowkiData = res.data[0];

      // Setting specific fields using setData with the first item for other logic
      setData({
        dflsSource: chowkiData.dflsSource,
        numbersOfDfls: chowkiData.numbersOfDfls,
        lotNumberRsp: chowkiData.lotNumberRsp,
        receiptNo: chowkiData.receiptNo || '',
        raceName: chowkiData.raceName,
        price: chowkiData.price,
        lotNumberCrc: chowkiData.lotNumberCrc,
        ratePer100Dfls: chowkiData.ratePer100Dfls, // Handle missing receiptNo
      });

      setChowkiId(chowkiData.saleAndDisposalId);
      setDataList(res.data); // <-- Update this line to use the entire data array
    } else {
      setMessage("No data found for the given farmer ID");
      setIsError(true);
    }
  })
  .catch((error) => {
    setMessage("Farmer number does not exist");
    setIsError(true);
  });
};



  const handleChange = (e: any, field: string) => {
    if (inspectionData) {
      setInspectionData({
        ...inspectionData,
        [field]: e.detail.value, // Change here to work with IonSelect
      });
    }
  };


  const clearSearch = () => {
    setSearchText('');
    setDataList([]);
    setViewAll(false);
    // setShowInspectionFields(false);
  };

const clearField=()=>{
  setViewAll(false);
}



const handleFCClick = (saleAndDisposalId: number) => {
  const api = axios.create({
    baseURL: API_URL_ChowkiManagment
  });
  api.get(`cropInspection/getInspectionDetailsForSaleAndDisposalDFL/${saleAndDisposalId}`, {
    headers: {
      "Content-Type": "application/json",
      accept: "*/*",
      Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
    },
  })
  .then(res => {
    const chowkiData = res.data[0];
    const updatedDataList = dataList.map(item => {
      if (item.saleAndDisposalId === saleAndDisposalId) {
        return {
          ...item,
          fcData: {
            note: chowkiData.note,
            cropDate: chowkiData.cropDate,
            cropStatusName: chowkiData.cropStatusName,
            mountName: chowkiData.mountName || '',
            reasonName: chowkiData.reasonName,
          },
          issueFCVisible: true
        };
      }
      return item;
    });
    setDataList(updatedDataList);
  })
  .catch(error => {
    setMessage("Failed to fetch FC data");
    setIsError(true);
    setShowAlert(true);
  });
};

  const handleEdit = async (saleAndDisposalIdParam: number) => { 
    const api = axios.create({
      baseURL: API_URL_ChowkiManagment,
    });

    let fitnessCertificateId = null;

    try {
      // Step 1: Add the fitness info and get the generated fitnessCertificateId
      const fitnessResponse = await api.post(
        'cropInspection/add-fitness-info',
        {
          farmerId: farmerId,
          fruitsId: searchText,
          saleAndDisposalId: saleAndDisposalIdParam,
          expectedCocoon: inspectionData.expectedCocoon,
          lotTestDetails: inspectionData.lotTestDetails,
          diseaseStatusId: inspectionData.diseaseStatusId,
          noOfChandies: inspectionData.noOfChandies,
          spunFromDate: inspectionData.spunFromDate,
          spunToDate:inspectionData.spunToDate,
          fitnessCertificatePath: inspectionData.fitnessCertificatePath,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            accept: '*/*',
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
          },
        }
      );

      // Handle response and capture the generated fitnessCertificateId
      if (fitnessResponse.data.error === 0) {
        fitnessCertificateId = fitnessResponse.data.fitnessCertificateId; // Assuming the ID is in the response
        console.log('Fitness Certificate ID:', fitnessCertificateId);
        setMessage('Fitness info added successfully!');
        setIsError(false);
        setShowAlert(true);
      } else {
        // Show the message from the response if error=1
        setMessage(fitnessResponse.data.message || 'Failed to add fitness info.');
        setIsError(true);
        setShowAlert(true);
        return; // Exit if there's an error
      }

      // Step 2: If a file is selected, upload it using the generated fitnessCertificateId
      if (selectedFile && fitnessCertificateId) {
        try {
          const formData = new FormData();
          formData.append('multipartFile', selectedFile); // File key
          formData.append('fitnessCertificateId', fitnessCertificateId.toString()); // Use the generated ID

          const photoResponse = await api.post('cropInspection/upload-fitness-certificate', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
            },
          });

          // Update the photo path in the state with the new path from the response
          const newPhotoPath = photoResponse.data.content.fitnessCertificatePath; // Adjust based on your response structure
          setInspectionData((prevData) => ({
            ...prevData,
            fitnessCertificatePath: newPhotoPath, // Set the new photo path
          }));

          setMessage('Photo uploaded successfully!');
        } catch (uploadError) {
          console.error('Error uploading photo:', uploadError);
          setMessage('Failed to upload photo. Please try again.');
        }
      } else {
        setMessage('Please select or capture an image before uploading.');
      }

    } catch (error) {
      console.error('Error in processing fitness certificate or photo:', error);
      setMessage('Failed to process fitness certificate or upload photo. Please try again.');
      setIsError(true);
    }
  };

  



  const handleCaptureImage = async () => {
    try {
      const image = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 90,
      });
  
      const response = await fetch(image.webPath!);
      const blob = await response.blob();
      const file = new File([blob], "captured_image.jpg", { type: blob.type });
  
      setSelectedFile(file); // Set the captured image as the selected file to be sent to the API
      setPreviewImage(image.webPath ?? null); // Set preview image for viewing, fix type error
    } catch (error) {
      console.error('Error capturing image:', error);
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // Get the first file from the file input
    if (file) {
      setSelectedFile(file); // Set the selected file to the state
      setPreviewImage(URL.createObjectURL(file)); // Set preview image for viewing
    }  
  };
  
  const handleClearFile = () => {
    setSelectedFile(null);
    setPreviewImage(null); // Clear the preview image
  };







  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton /><IonBackButton defaultHref="/" />
            
          </IonButtons>
          <IonTitle><b>Fitness Certificate</b></IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="search-container">
          <IonLabel className="fruits-id-label">Fruits ID</IonLabel>
          <IonInput
            ref={inputRef}
            value={searchText}
            placeholder="Enter Fruits ID"
            onIonInput={handleInputChange}
          /></div>
           <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '10px' }}>

          <IonButton id="searchButton" size="small" onClick={() => {
            inputRef.current?.blur(); // Blur input on search click
            fetchFarmerDetails();
          }}>Search</IonButton>
          <IonButton size="small" fill="clear" onClick={clearSearch}>
            <IonIcon color="danger" icon={trash} />
          </IonButton>
        </div>

        {dataList && dataList.length > 0 && dataList.map((data, index) => (
          <>
            <IonCard key={index} className="details-card">
              <IonCardHeader>
                <IonCardTitle>DFLs Details</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
              <div className="details-row">
                    <IonLabel>Race:</IonLabel>
                    <IonInput value={data.raceName} readonly={true} />
                  </div>
                  {/* <div className="details-row">
                    <IonLabel>Lot Number(of the RSP):</IonLabel>
                    <IonInput value={data.lotNumberRsp} readonly={true} />
                  </div> */}
                  <div className="details-row">
                    <IonLabel>Lot No:</IonLabel>
                    <IonInput value={data.lotNumberCrc} readonly={true} />
                  </div>
                  <div className="details-row">
                    <IonLabel>Number of DFL’s:</IonLabel>
                    <IonInput value={data.numbersOfDfls} readonly={true} />
                  </div>
                  <div className="details-row">
                    <IonLabel>Rate per 100 DFLs:</IonLabel>
                    <IonInput value={data.ratePer100Dfls} readonly={true} />
                  </div>

                
              </IonCardContent>
            </IonCard>

           


            <IonButton expand="full" onClick={() => handleFCClick(data.saleAndDisposalId)}>
              Issue FC
            </IonButton>

            {data.issueFCVisible && data.fcData && (
              <IonCard className="issue-fc-card">
                <IonCardHeader>
                  <IonCardTitle>Issue FC Details</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <div className="details-row">
                    <IonLabel>Note:</IonLabel>
                    <IonInput value={data.fcData.note} readonly={true} />
                  </div>
                  <div className="details-row">
                    <IonLabel>Crop Date:</IonLabel>
                    <IonInput value={data.fcData.cropDate} readonly={true} />
                  </div>
                  <div className="details-row">
                    <IonLabel>Crop Status:</IonLabel>
                    <IonInput value={data.fcData.cropStatusName} readonly={true} />
                  </div>
                  <div className="details-row">
                    <IonLabel>Moult:</IonLabel>
                    <IonInput value={data.fcData.mountName} readonly={true} />
                  </div>

                  <IonCardHeader>
                    <IonCardTitle>Add FC Details</IonCardTitle>
                  </IonCardHeader>
                  <div className="details-row">
                    <IonLabel>Expected Cocoons (in Kgs):</IonLabel>
                    <IonInput 
                      value={inspectionData.expectedCocoon} 
                      onIonChange={e => handleChange(e, "expectedCocoon")} />
                  </div>
                  <div className="details-row">
                    <IonLabel>Lot Test Details:</IonLabel>
                    <IonInput 
                      value={inspectionData.lotTestDetails} 
                      onIonChange={e => handleChange(e,"lotTestDetails")} />
                  </div>

                  <IonCol size="12">
                    <div className="details-row">
                      <IonLabel>
                        <b>Select Status:</b>
                      </IonLabel>
                      {fetchError ? (
                        <p style={{ color: 'red' }}>Failed to fetch Status list. Please try again later.</p>
                      ) : (
                        <IonSelect
                          value={inspectionData.diseaseStatusId}
                          placeholder="Select Status"
                          onIonChange={(e) => handleChange(e,"diseaseStatusId")}
                        >
                          <IonSelectOption value="">None</IonSelectOption>
                          {diseaseListData?.map((disease) => (
                            <IonSelectOption key={disease.diseaseStatusId} value={disease.diseaseStatusId}>
                              {disease.name}
                            </IonSelectOption>
                          ))}
                        </IonSelect>
                      )}
                    </div>
                  </IonCol>

                  <div className="details-row">
                    <IonLabel>No of Chandrika:</IonLabel>
                    <IonInput value={inspectionData.noOfChandies} 
                      onIonChange={e => handleChange(e, "noOfChandies")} />
                  </div>

                  {/* <div className="details-row">
                    <IonLabel>Spun on Date:</IonLabel>
                    <div
                      onClick={() => setShowDispatchDatePicker(true)}
                      className="date-display"
                    >
                      {inspectionData.expectedMarkerDate
                        ? new Date(inspectionData.expectedMarkerDate).toLocaleDateString()
                        : "Select Date"}
                    </div>
                    {showDispatchDatePicker && (
                      <IonModal isOpen={showDispatchDatePicker} onDidDismiss={() => setShowDispatchDatePicker(false)}>
                        <IonDatetime
                          value={inspectionData.expectedMarkerDate || new Date().toISOString()}
                          onIonChange={(e) => {
                            handleChange(e, "expectedMarkerDate");
                            setShowDispatchDatePicker(false);
                          }}
                          onIonCancel={() => setShowDispatchDatePicker(false)}
                        />
                        <IonButton onClick={() => setShowDispatchDatePicker(false)}>Close</IonButton>
                      </IonModal>
                    )}
                  </div> */}

                  <div className="details-row">
  <IonLabel>Spun on Date:</IonLabel>

  {/* Expected Marker Date */}
  <div
    onClick={() => setShowDispatchDatePicker(true)}
    className="date-display"
  >
    {inspectionData.spunFromDate
      ? new Date(inspectionData.spunFromDate).toLocaleDateString()
      : "Select Date"}
  </div>

  {/* Spun Date */}
  <div
    onClick={() => setShowSpunDatePicker(true)}
    className="date-display"
    style={{ marginLeft: "1rem" }} // space between dates
  >
    {inspectionData.spunToDate
      ? new Date(inspectionData.spunToDate).toLocaleDateString()
      : "Select Date"}
  </div>

  {/* Expected Marker Date Picker */}
  {showDispatchDatePicker && (
    <IonModal
      isOpen={showDispatchDatePicker}
      onDidDismiss={() => setShowDispatchDatePicker(false)}
    >
      <IonDatetime
        value={inspectionData.spunFromDate || new Date().toISOString()}
        onIonChange={(e) => {
          handleChange(e, "spunFromDate");
          setShowDispatchDatePicker(false);
        }}
        onIonCancel={() => setShowDispatchDatePicker(false)}
      />
      <IonButton onClick={() => setShowDispatchDatePicker(false)}>Close</IonButton>
    </IonModal>
  )}

  {/* Spun Date Picker */}
  {showSpunDatePicker && (
    <IonModal
      isOpen={showSpunDatePicker}
      onDidDismiss={() => setShowSpunDatePicker(false)}
    >
      <IonDatetime
        value={inspectionData.spunToDate || new Date().toISOString()}
        onIonChange={(e) => {
          handleChange(e, "spunToDate");
          setShowSpunDatePicker(false);
        }}
        onIonCancel={() => setShowSpunDatePicker(false)}
      />
      <IonButton onClick={() => setShowSpunDatePicker(false)}>Close</IonButton>
    </IonModal>
  )}
</div>


                  <div className="file-upload-section">
                    <IonLabel>Choose File:</IonLabel>
                    <input type="file" onChange={handleFileChange} />
                  </div>
                  <div>
                    <IonButton onClick={handleCaptureImage} color="primary">
                      <IonIcon icon={camera} slot="icon-only" />
                    </IonButton>

                    {previewImage && (
                      <>
                        <IonButton onClick={() => setIsModalOpen(true)} color="secondary">
                          <IonIcon icon={eyeSharp} slot="icon-only" />
                        </IonButton>
                        <IonModal isOpen={isModalOpen} onDidDismiss={() => setIsModalOpen(false)}>
                          <IonHeader>
                            <IonToolbar>
                              <IonTitle>View File</IonTitle>
                              <IonButton onClick={() => setIsModalOpen(false)} slot="end" fill="clear">
                                Close
                              </IonButton>
                            </IonToolbar>
                          </IonHeader>
                          <IonContent>
                            <div className="preview-section" style={{ textAlign: 'center', padding: '20px' }}>
                              <IonImg src={previewImage} alt="Preview" />
                            </div>
                          </IonContent>
                        </IonModal>
                      </>
                    )}

                    {selectedFile && (
                      <IonButton onClick={handleClearFile} color="danger">
                        <IonIcon icon={trashSharp} slot="icon-only" />
                      </IonButton>
                    )}
                  </div>

                  {/* <IonButton expand="block">Submit</IonButton> */}
                  <IonButton
                    expand="full"
                    onClick={() => handleEdit(data.saleAndDisposalId)}
                    disabled={
                      !selectedFile ||
                      !inspectionData.spunFromDate ||
                      !inspectionData.spunToDate
                    }
                  >
                    Submit
                  </IonButton>
                </IonCardContent>
              </IonCard>
            )}
          </>
        ))
        }
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

export default FitnessPage;