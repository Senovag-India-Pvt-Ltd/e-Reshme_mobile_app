import React, { useState, useEffect, useRef } from "react";
import {
  IonContent,IonPage,IonCard,IonCardContent,IonCardHeader,IonCardTitle,IonInput,IonLabel,IonButton,IonHeader,IonToolbar,IonTitle,IonButtons,
  IonMenuButton,IonIcon,IonBackButton,
  IonSelect,IonSelectOption,IonDatetime,IonCol,IonAlert,IonItem,IonImg,IonModal,
} from "@ionic/react";
import { camera, eyeSharp, trash, trashSharp } from "ionicons/icons";
import "./ProfileInfoPage.css";
import axios from "axios";
import { API_URL_DBT } from "../auth.service";
import { API_URL_Master_Data } from '../auth.service';
import { API_URL_ChowkiManagment } from "../auth.service";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
// import DocumentUpload from "./FitnessUpload";

const MulberryPage: React.FC = () => {

  const fileInputRef = useRef(null);
  const inputRef = useRef<HTMLIonInputElement>(null); // Add useRef for input field

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
   const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState<string>("");
  const [data, setData] = useState<any>(null);
  const [viewAll, setViewAll] = useState<boolean>(false);
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [iserror, setIserror] = useState<boolean>(false);
  const [farmerId, setFarmerId] = useState<number | null>(null);
  const [isUprootingReasonEnabled, setIsUprootingReasonEnabled] = useState(false);
  const [isNurseryEnabled,setIsNurseryEnabled]=useState(false);
  const [showHatchingDatePicker, setShowHatchingDatePicker] =
  useState<boolean>(false);
  const [showUprootingDatePicker, setShowUprootingDatePicker] =
  useState<boolean>(false);
  const [farmerLandDetailsId, setFarmerLandDetailsId] = useState<number | null>(
    null
  );
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [farmerOtherData, setFarmerOtherData] = useState<any>({
    mulberryVarietyId: "",
    mulberryArea: "",
    uprootingReason:"",
    extensionDate: "",
    uprootingDate: "",
    photoPath: "",
    scheme:"",
    spacing:"",
    noOfSapplings:"",
    applicationType: "",
    tsc:"",
  });
  const [nurseryDate, setNurseryDate] = useState<string>(""); // New state for nursery date
  const [showNurseryDatePicker, setShowNurseryDatePicker] = useState<boolean>(false); // Picker visibility

  const fetchDetails = () => {
    clearField();
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

        // Set the land details response to state
        setData(farmerLandDetailsResponse);

        // Set farmerId from the land details response
        setFarmerId(farmerLandDetailsResponse.farmerId);
        setFarmerLandDetailsId(farmerLandDetailsResponse.farmerLandDetailsId);

        // Now you can call toggleViewAll with the farmerId
        // toggleViewAll(farmerLandDetailsResponse.farmerId);
      })
      .catch((error) => {
        setMessage("Farmer number does not exist");
        setIserror(true);
      });
  };

  const handleClear = () => {
    setSearchText("");
    setData([]);
    setFarmerOtherData(null);
    setViewAll(false);
    setIsEditable(false);
    setFarmerId(null);
  };

  // const clearSearch = () => {
  //   setSearchText('');
  //   setData(null);
  //   setIsEditable(false);
  //   setViewAll(false);
  // };

  const clearSearch = () => {
    setSearchText(''); // Clear the search text field
    setData(null); // Clear the fetched data
    setFarmerOtherData({
      applicationType: '',
      mulberryArea: '',
      spacing: '',
      uprootingReason: '',
      uprootingDate: '',
      noOfSapplings: '',
      mulberryVarietyId: '',
      scheme: '',
      extensionDate: '',
    }); // Reset all fields related to farmerOtherData
    setPreviewImage(null); // Clear the preview image
    setSelectedFile(null); // Clear the selected file
    setShowUprootingDatePicker(false); // Close any open date picker
    setShowHatchingDatePicker(false); // Close any open date picker
    setIsEditable(false); // Reset the edit mode
    setViewAll(false); // Collapse the details section
  };
  


  // const handleEditToggle = (id: number) => {
  //   setEditableStates((prevState) => ({
  //     ...prevState,
  //     [id]: !prevState[id], // Toggle the editable state for the specific record
  //   }));
  // };

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
  
  useEffect(() => {
    fetchMulberryVarietyList();
  }, []);


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
      setPreviewImage(image.webPath); // Set preview image for viewing
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

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  // const handleEdit = () => {
  //   if (isEditable) {
  //     // TODO: Whichever is ID in below need to get that from dropdown which get from master data
  //     const api = axios.create({
  //       baseURL: API_URL_ChowkiManagment
  //     });
  //     api.post("cropInspection/add-farmer-mulberry-extension-info", {
  //       farmerLandDetailsId: farmerLandDetailsId,
  //       farmerId: farmerId,
  //       mulberryArea: farmerOtherData.mulberryArea,
  //       mulberryVarietyId:farmerOtherData.mulberryVarietyId,
  //       extensionDate:farmerOtherData.extensionDate,
  //       spacing:farmerOtherData.spacing,
  //       scheme:farmerOtherData.scheme,
  //       uprootingReason:farmerOtherData.uprootingReason,
  //       uprootingDate:farmerOtherData.uprootingDate,
  //       applicationType:farmerOtherData.applicationType,
  //       noOfSapplings:farmerOtherData.noOfSapplings


  //     }, {
  //       headers: {
  //         "Content-Type": "application/json",
  //         accept: "*/*",
  //         Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
  //       },
  //     })
  //       .then(res => {
  //         console.log("Farmer Land details updated successfully", res.data);
  //         setMessage("Farmer Land details updated successfully");
  //         setIserror(false);
  //         setShowAlert(true);
  //         clearSearch();
  //       })
  //       .catch(error => {
  //         console.error("Error updating farmer details", error);
  //         setMessage("Error updating farmer details");
  //         setIserror(true);
  //         setShowAlert(true);
  //       });
  //   }
  //   setIsEditable(!isEditable);
  // };



//old working Code

  const handleEdit = async () => {
    try {
      if (isEditable) {

  if (!selectedFile) {
    setMessage('Please select or capture an image before uploading.');
    setIserror(true);
    setShowAlert(true);
    return; // Exit if no file is selected
  }
        const api = axios.create({
          baseURL: API_URL_ChowkiManagment,
        });
  
        // Step 1: Save the main farmer mulberry extension info and get the generated ID
        let farmerMulberryExtensionId = null;
        try {
          const response = await api.post('cropInspection/add-farmer-mulberry-extension-info', {
            farmerLandDetailsId: farmerLandDetailsId,
            farmerId: farmerId,
            mulberryArea: farmerOtherData.mulberryArea,
            mulberryVarietyId: farmerOtherData.mulberryVarietyId,
            extensionDate: farmerOtherData.extensionDate,
            spacing: farmerOtherData.spacing,
            scheme: farmerOtherData.scheme,
            tsc:farmerOtherData.tsc,
            photoPath: farmerOtherData.photoPath,
            uprootingReason: farmerOtherData.uprootingReason,
            uprootingDate: farmerOtherData.uprootingDate,
            applicationType: farmerOtherData.applicationType,
            noOfSapplings: farmerOtherData.noOfSaplings,
          }, {
            headers: {
              'Content-Type': 'application/json',
              accept: '*/*',
              Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
            },
          });
  
          // Capture the generated ID from the response
          farmerMulberryExtensionId = response.data.farmerMulberryExtensionId;
          console.log('Farmer Mulberry Extension ID:', farmerMulberryExtensionId);
        } catch (submissionError) {
          console.error('Error saving farmer mulberry extension:', submissionError);
          setMessage('Error saving farmer mulberry extension. Please try again.');
          setIserror(true);
          setShowAlert(true);
          return; // Exit if there's an error
        }
  
        // Step 2: If a file is selected, upload it using the generated ID
        if (selectedFile && farmerMulberryExtensionId) {
          try {
            const formData = new FormData();
            formData.append('multipartFile', selectedFile);
            formData.append('farmerMulberryExtensionId', farmerMulberryExtensionId); // Use the generated ID
  
            const photoResponse = await api.post('cropInspection/upload-mulberry-photo', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
              },
            });
  
            const newPhotoPath = photoResponse.data.content.photoPath;
            setFarmerOtherData((prevData) => ({
              ...prevData,
              photoPath: newPhotoPath,
            }));
  
            setMessage('Mulbnerry details and photo uploaded successfully');
            setIserror(false); // Mark as success
            resetFormFields();
            setShowAlert(true);
          } catch (uploadError) {
            console.error('Error uploading photo:', uploadError);
            setMessage('Failed to upload photo. Please try again.');
          }
        } else {
          setMessage('Please select or capture an image before uploading.');
        }
  
      }
    } catch (generalError) {
      console.error('An unexpected error occurred:', generalError);
      setMessage('An unexpected error occurred. Please try again.');
      setIserror(true);
      setShowAlert(true);
    } finally {
      setIsEditable(!isEditable);
    }
  };
  



  //New Validation Code
  // const handleEdit = async () => {
  //   try {
  //     if (isEditable) {
  //       const api = axios.create({
  //         baseURL: API_URL_ChowkiManagment,
  //       });
  
  //       // Step 1: Save the main farmer mulberry extension info and get the generated ID
  //       let farmerMulberryExtensionId = null;
  //       try {
  //         const response = await api.post(
  //           'cropInspection/add-farmer-mulberry-extension-info',
  //           {
  //             farmerLandDetailsId: farmerLandDetailsId,
  //             farmerId: farmerId,
  //             mulberryArea: farmerOtherData.mulberryArea,
  //             mulberryVarietyId: farmerOtherData.mulberryVarietyId,
  //             extensionDate: farmerOtherData.extensionDate,
  //             spacing: farmerOtherData.spacing,
  //             scheme: farmerOtherData.scheme,
  //             photoPath: farmerOtherData.photoPath,
  //             uprootingReason: farmerOtherData.uprootingReason,
  //             uprootingDate: farmerOtherData.uprootingDate,
  //             applicationType: farmerOtherData.applicationType,
  //             noOfSapplings: farmerOtherData.noOfSaplings,
  //           },
  //           {
  //             headers: {
  //               'Content-Type': 'application/json',
  //               accept: '*/*',
  //               Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
  //             },
  //           }
  //         );
  
  //         // Capture the generated ID from the response
  //         farmerMulberryExtensionId = response.data.farmerMulberryExtensionId;
  //         console.log('Farmer Mulberry Extension ID:', farmerMulberryExtensionId);
  //       } catch (submissionError) {
  //         console.error('Error saving farmer mulberry extension:', submissionError);
  //         setMessage('Error saving farmer mulberry extension. Please try again.');
  //         setIserror(true);
  //         setShowAlert(true);
  //         return; // Exit if there's an error
  //       }
  
  //       // Step 2: Check if a file is selected before attempting upload
  //       if (!selectedFile) {
  //         setMessage('Please select or capture an image before uploading.');
  //         setIserror(true);
  //         setShowAlert(true);
  //         return; // Exit if no file is selected
  //       }
  
  //       // Step 3: If a file is selected, upload it using the generated ID
  //       if (farmerMulberryExtensionId) {
  //         try {
  //           const formData = new FormData();
  //           formData.append('multipartFile', selectedFile);
  //           formData.append('farmerMulberryExtensionId', farmerMulberryExtensionId); // Use the generated ID
  
  //           const photoResponse = await api.post(
  //             'cropInspection/upload-mulberry-photo',
  //             formData,
  //             {
  //               headers: {
  //                 'Content-Type': 'multipart/form-data',
  //                 Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
  //               },
  //             }
  //           );
  
  //           const newPhotoPath = photoResponse.data.content.photoPath;
  //           setFarmerOtherData((prevData) => ({
  //             ...prevData,
  //             photoPath: newPhotoPath,
  //           }));
  
  //           setMessage('Mulberry details and photo uploaded successfully');
  //           resetFormFields();
  //           setShowAlert(true);
  //         } catch (uploadError) {
  //           console.error('Error uploading photo:', uploadError);
  //           setMessage('Failed to upload photo. Please try again.');
  //           setIserror(true);
  //           setShowAlert(true);
  //         }
  //       }
  //     }
  //   } catch (generalError) {
  //     console.error('An unexpected error occurred:', generalError);
  //     setMessage('An unexpected error occurred. Please try again.');
  //     setIserror(true);
  //     setShowAlert(true);
  //   } finally {
  //     setIsEditable(!isEditable);
  //   }
  // };


  // const handleEdit = async () => {
  //   try {
  //     if (isEditable) {
  //       // Validate file selection before proceeding
  //       if (!selectedFile) {
  //         setMessage('Please select or capture an image before uploading.');
  //         setIserror(true);
  //         setShowAlert(true);
  //         return; // Exit if no file is selected
  //       }
  
  //       const api = axios.create({
  //         baseURL: API_URL_ChowkiManagment,
  //       });
  
  //       // Step 1: Save the main farmer mulberry extension info and get the generated ID
  //       let farmerMulberryExtensionId = null;
  //       try {
  //         const response = await api.post(
  //           'cropInspection/add-farmer-mulberry-extension-info',
  //           {
  //             farmerLandDetailsId: farmerLandDetailsId,
  //             farmerId: farmerId,
  //             mulberryArea: farmerOtherData.mulberryArea,
  //             mulberryVarietyId: farmerOtherData.mulberryVarietyId,
  //             extensionDate: farmerOtherData.extensionDate,
  //             spacing: farmerOtherData.spacing,
  //             scheme: farmerOtherData.scheme,
  //             photoPath: farmerOtherData.photoPath,
  //             uprootingReason: farmerOtherData.uprootingReason,
  //             uprootingDate: farmerOtherData.uprootingDate,
  //             applicationType: farmerOtherData.applicationType,
  //             noOfSapplings: farmerOtherData.noOfSaplings,
  //           },
  //           {
  //             headers: {
  //               'Content-Type': 'application/json',
  //               accept: '*/*',
  //               Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
  //             },
  //           }
  //         );
  
  //         // Capture the generated ID from the response
  //         farmerMulberryExtensionId = response.data.farmerMulberryExtensionId;
  //         console.log('Farmer Mulberry Extension ID:', farmerMulberryExtensionId);
  //       } catch (submissionError) {
  //         console.error('Error saving farmer mulberry extension:', submissionError);
  //         setMessage('Error saving farmer mulberry extension. Please try again.');
  //         setIserror(true);
  //         setShowAlert(true);
  //         return; // Exit if there's an error
  //       }
  
  //       // Step 2: Upload the selected file
  //       try {
  //         const formData = new FormData();
  //         formData.append('multipartFile', selectedFile);
  //         formData.append('farmerMulberryExtensionId', farmerMulberryExtensionId); // Use the generated ID
  
  //         const photoResponse = await api.post(
  //           'cropInspection/upload-mulberry-photo',
  //           formData,
  //           {
  //             headers: {
  //               'Content-Type': 'multipart/form-data',
  //               Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
  //             },
  //           }
  //         );
  
  //         const newPhotoPath = photoResponse.data.content.photoPath;
  //         setFarmerOtherData((prevData) => ({
  //           ...prevData,
  //           photoPath: newPhotoPath,
  //         }));
  
  //         setMessage('Mulberry details and photo uploaded successfully');
  //         resetFormFields();
  //         setShowAlert(true);
  //       } catch (uploadError) {
  //         console.error('Error uploading photo:', uploadError);
  //         setMessage('Failed to upload photo. Please try again.');
  //         // setIserror(true);
  //         // setShowAlert(true);
  //       }
  //     }
  //   } catch (generalError) {
  //     console.error('An unexpected error occurred:', generalError);
  //     setMessage('An unexpected error occurred. Please try again.');
  //     setIserror(true);
  //     setShowAlert(true);
  //   } finally {
  //     setIsEditable(!isEditable);
  //   }
  // };
  
  

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

   // State for Tsc selection and data fetching
const [tscMasterId, setTscMasterId] = useState<string>(''); // Selected Tsc
const [tscListData, setTscListData] = useState<any[]>([]); // List of Tsc options from API
const [fetchError, setFetchError] = useState<boolean>(false); // Fetch error state

// Function to fetch Tsc data from the API
const fetchTscList = async () => {
  try {
    const response = await axios.get(`${API_URL_Master_Data}mulberry-variety/get-all`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`, // Use token if required
      },
    });

    if (response.data && response.data.content) {
      setTscListData(response.data.content.mulberryVariety); // Set the fetched data
    } else {
      console.error('Unexpected API response format:', response);
      setFetchError(true);
    }
  } catch (error) {
    console.error('Error fetching Tsc list:', error);
    setFetchError(true); // Set error state if fetch fails
  }
};

// Function to handle Tsc selection change
const handleTscChange = (value: string) => {
  setTscMasterId(value); // Set the selected Tsc
};

// Fetch Tsc list when component mounts
useEffect(() => {
  fetchTscList();
}, []);

const clearField=()=>{
  setViewAll(false);
};

const toggleViewAll = () => {
  setViewAll(!viewAll);
  setIsEditable(true);
};

// const handleChanges = (e, fieldName) => {
//   const value = e.detail.value; // Extract the value from the event object

//   setFarmerOtherData((prevData) => ({
//     ...prevData,
//     [fieldName]: value,
//   }));

//   // Check if the selected application is "Uprooting"
//   if (fieldName === 'application' && value === '3rd') {
//     setIsUprootingReasonEnabled(true); // Enable Uprooting Reason field
//   } else {
//     setIsUprootingReasonEnabled(false); // Disable Uprooting Reason field
//   }
//    if (fieldName === 'application'&& value === '4rth')
// {
// setIsNurseryEnabled(true);
// }else {
//   setIsNurseryEnabled(false);
// }};

const handleChanges = (e, fieldName) => {
  const value = e.detail.value; // Extract the value from the event object

  setFarmerOtherData((prevData) => ({
    ...prevData,
    [fieldName]: value,
  }));
  setIsUprootingReasonEnabled(false);
  setIsNurseryEnabled(false);
  if (fieldName === 'applicationType') {
    if (value === 'Uprooting') {
      setIsUprootingReasonEnabled(true); // Enable Uprooting Reason field
    }
    if (value === 'Nursery') {
      setIsNurseryEnabled(true); // Enable Nursery field
      setNurseryDate(""); // Reset nursery date when switching to Nursery
    }
  }
};


const resetFormFields = () => {
  setFarmerOtherData({
    mulberryArea: '',
    mulberryVarietyId: '',
    extensionDate: '',
    spacing: '',
    scheme: '',
    photoPath: '',
    uprootingReason: '',
    uprootingDate: '',
    applicationType: '',
    noOfSapplings: '',
  });
  setNurseryDate(""); // Reset nursery date
  setSelectedFile(null);
  setPreviewImage(null);
  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
};

const handleSearchInputChange = (e: CustomEvent) => {
  const value = (e.target as HTMLIonInputElement).value!;
  setSearchText(value);
  if (value.length === 16) {
    inputRef.current?.blur(); // Remove focus from input field
    fetchDetails();
  }
};

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton /><IonBackButton defaultHref="/" />
            
          </IonButtons>
          <IonTitle>
            <b>Mulberry Activity</b>
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="search-container">
          <IonLabel className="fruits-id-label">Fruits ID</IonLabel>
          <IonInput
            ref={inputRef} // Attach ref to IonInput
            value={searchText}
            placeholder="Enter Fruits ID"
            onIonInput={handleSearchInputChange} // Update to use onIonInput
          /></div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
          <IonButton size="small" onClick={fetchDetails}>Search</IonButton>

          {/* Clear button with trash icon */}
          <IonButton size="small" fill="clear" onClick={clearSearch}>
            <IonIcon color="danger" icon={trash} />
          </IonButton>
        </div>
       
        {data && (
          <IonCard className="details-card">
            <IonCardHeader>
              <IonCardTitle>Mulberry Variety Details</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div className="details-row">
                <IonLabel>Survey No:</IonLabel>
                <IonInput
                  value={data.surveyNumber}
                  readonly={true} // Set to always be readonly
                  // onIonChange={e => handleChange(e, 'farmername')}
                />
              </div>
              <div className="details-row">
                <IonLabel>Village Name:</IonLabel>
                <IonInput
                  value={data.villageName}
                  readonly={true} // Set to always be readonly
                  // onIonChange={e => handleChange(e, 'village')}
                />
              </div>
              <div className="details-row">
                <IonLabel>TSC:</IonLabel>
                <IonInput
                  value={data.tsc}
                  readonly={true} // Set to always be readonly
                  // onIonChange={e => handleChange(e, 'village')}
                />
              </div>

              {!viewAll ? (
                <IonButton expand="full" onClick={toggleViewAll}>
                  Add Details
                </IonButton>
              ) : (
                <>
                  <IonButton expand="full" onClick={toggleViewAll}>
                    Hide
                  </IonButton>

    {/* {farmerOtherData && (
      <> */}

                            <div className="details-row">
                            <IonLabel>Application Type:</IonLabel>
                            <IonSelect
                            value={farmerOtherData.applicationType}
                            placeholder="Select Application Type"
                            onIonChange={(e) => handleChanges(e, "applicationType")}
                            interfaceOptions={{ cssClass: "custom-select" }}
                          >
                            <IonSelectOption value="New Plantation">New Plantation</IonSelectOption>
                            <IonSelectOption value="Mulberry Extension">Mulberry Extension</IonSelectOption>
                            <IonSelectOption value="Uprooting">Uprooting</IonSelectOption>
                            <IonSelectOption value="Nursery">Nursery</IonSelectOption>
                          </IonSelect>
                        </div>


        <div className="details-row">
          <IonLabel>Mulberry Area:</IonLabel>
          <IonInput
            value={farmerOtherData?.mulberryArea}
            readonly={!isEditable}
            onIonChange={(e) => handleChange(e, "mulberryArea")}
          />
        </div>

        <div className="details-row">
          <IonLabel>Spacing:</IonLabel>
          <IonInput
            value={farmerOtherData?.spacing}
            readonly={!isEditable}
            onIonChange={(e) => handleChange(e, "spacing")}
          />
        </div>


                        <div>{isUprootingReasonEnabled && (

                  <div className="details-row">
                    <IonLabel>Uprooting Reason:</IonLabel>
                    <IonInput
                      value={farmerOtherData.uprootingReason || ""}
                      onIonChange={(e) => handleChange(e, "uprootingReason")}
                      placeholder="Enter Uprooting Reason"
                    />
                  </div>
        
)}</div>
                  <div>{isUprootingReasonEnabled && (
                  <div className="details-row">
                    <IonLabel>
                      Uprooting Date<span style={{ color: "red" }}>*</span>
                    </IonLabel>
                    <div
                      onClick={() => isEditable && setShowUprootingDatePicker(true)}
                      className="date-display"
                      style={{ cursor: 'pointer' }}
                    >
                      {farmerOtherData?.uprootingDate
                        ? new Date(farmerOtherData?.uprootingDate).toLocaleDateString()
                        : "Select Date"}
                    </div>
                    {showUprootingDatePicker && (
                      <IonModal isOpen={showUprootingDatePicker} onDidDismiss={() => setShowUprootingDatePicker(false)}>
                      <IonDatetime
                        value={farmerOtherData?.uprootingDate || new Date().toISOString()}
                        onIonChange={(e) => {
                          handleChange(e, "uprootingDate");
                          setShowUprootingDatePicker(false);
                        }}
                        onIonCancel={() => setShowUprootingDatePicker(false)}
                      />
                      <IonButton onClick={() => setShowUprootingDatePicker(false)}>Close</IonButton>
                      </IonModal>
                    )}
                  </div>)}</div>

                <div>{isNurseryEnabled && (
                  <>
                <div className="details-row">
                    <IonLabel>Number Of Saplings:</IonLabel>
                    <IonInput
                      value={farmerOtherData.noOfSapplings || ""}
                      onIonChange={(e) => handleChange(e, "noOfSapplings")}
                      placeholder="Enter Number of noOfSapplings"
                    />
                  </div>
                  <div className="details-row">
                    <IonLabel>
                      Date<span style={{ color: "red" }}>*</span>
                    </IonLabel>
                    <div
                      onClick={() => isEditable && setShowNurseryDatePicker(true)}
                      className="date-display"
                      style={{ cursor: 'pointer' }}
                    >
                      {farmerOtherData.extensionDate
                        ? new Date(farmerOtherData.extensionDate).toLocaleDateString()
                        : "Select Date"}
                    </div>
                    {showNurseryDatePicker && (
                      <IonModal isOpen={showNurseryDatePicker} onDidDismiss={() => setShowNurseryDatePicker(false)}>
                      <IonDatetime
                        value={farmerOtherData.extensionDate || new Date().toISOString()}
                        onIonChange={(e) => {
                          const value = (e.target as HTMLInputElement).value;
                          setNurseryDate(value);
                          setFarmerOtherData((prev) => ({
                            ...prev,
                            extensionDate: value
                          }));
                          setShowNurseryDatePicker(false);
                        }}
                        onIonCancel={() => setShowNurseryDatePicker(false)}
                      />
                      <IonButton onClick={() => setShowNurseryDatePicker(false)}>Close</IonButton>
                      </IonModal>
                    )}
                  </div>
                  </>)}</div>


        <IonCol size="12">
              <div className="details-row">
                <IonLabel>
                  <b>Select Mulberry Variety:</b>
                </IonLabel>
                {fetchError ? (
                  <p style={{ color: 'red' }}>Failed to fetch Mulberry list. Please try again later.</p>
                ) : (
                  <IonSelect
                    value={farmerOtherData.mulberryVarietyId}
                    disabled={!isEditable} // Disable if not editable
                    placeholder="Select Mulberry Source"
                    onIonChange={(e) => handleChange(e,"mulberryVarietyId")}
                  >
                    <IonSelectOption value="">None</IonSelectOption> {/* Option to deselect */}
                    {mulberryVarietyData?.map((variety) => (
                      <IonSelectOption key={variety.mulberryVarietyId} value={variety.mulberryVarietyId}>
                        {variety.mulberryVarietyName}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                )}
              </div>
            </IonCol>
            {/* <IonCol size="12">
                      <div className="details-row">
                        <IonLabel>
                          <b>File Upload:</b>
                        </IonLabel>
                        <DocumentUpload onUpload={(file) => console.log(file)} docId={0}  />
                      </div>
                    </IonCol> */}
                                    
                <div className="details-row">
                      <IonLabel>Choose File:</IonLabel>
                      <input type="file" onChange={handleFileChange} ref={fileInputRef} /></div>
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
     <div className="details-row">
                            <IonLabel>Scheme:</IonLabel>
                            <IonSelect
                                value={farmerOtherData.scheme}
                                placeholder="Select Scheme"
                                //   disabled={!isEditable}
                                onIonChange={(e) => handleChange(e, "scheme")}
                                interfaceOptions={{ cssClass: "custom-select" }} // Add custom class for styling
                            >   <IonSelectOption value="None">None</IonSelectOption>
                                <IonSelectOption value="MgNrega">MGNREGA</IonSelectOption>
                                <IonSelectOption value="Non-MgNrega">Non-MGNREGA</IonSelectOption>
                                
                            </IonSelect>
                        </div>

                        <div>{!(isUprootingReasonEnabled || isNurseryEnabled )&& (
                    <div className="details-row">
                    <IonLabel>
                      Extension Date<span style={{ color: "red" }}>*</span>
                    </IonLabel>
                    <div
                      onClick={() =>
                        isEditable && setShowHatchingDatePicker(true)
                      }
                      className="date-display"
                      style={{ cursor: 'pointer' }}
                    >
                      {farmerOtherData?.extensionDate
                        ? new Date(farmerOtherData?.extensionDate).toLocaleDateString()
                        : "Select Date"}
                    </div>
                    {showHatchingDatePicker && (
                      <IonModal isOpen={showHatchingDatePicker} onDidDismiss={() => setShowHatchingDatePicker(false)}>
                      <IonDatetime
                        value={farmerOtherData?.extensionDate || new Date().toISOString() }
                        onIonChange={(e) => {
                          handleChange(e, "extensionDate");
                          setShowHatchingDatePicker(false);
                        }}
                        onIonCancel={() => setShowHatchingDatePicker(false)}
                      />
                      <IonButton onClick={() => setShowHatchingDatePicker(false)}>Close</IonButton>
                      </IonModal>
                    )}
                  </div>)}</div>
        
      </>
    )}

              <IonButton onClick={handleEdit}>
                {isEditable ? "Save" : "Edit"}
              </IonButton>
             
            </IonCardContent>
          </IonCard>
        )}
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={iserror ? "Error" : "Success"}
          message={message}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default MulberryPage;

