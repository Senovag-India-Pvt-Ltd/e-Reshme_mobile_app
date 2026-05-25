import React, { useState, useEffect, useRef } from "react";
import {
  IonContent,IonPage,IonCard,IonCardContent,IonCardHeader,IonCardTitle,IonInput,IonLabel,IonButton,IonHeader,IonToolbar,IonTitle,IonButtons,
  IonMenuButton,IonIcon,IonBackButton,
  IonSelect,IonSelectOption,IonDatetime,IonCol,IonAlert,IonItem,IonImg,IonModal,IonToast,
} from "@ionic/react";
import { camera, eyeSharp, trash, trashSharp, searchOutline, refreshOutline, leafOutline, alertCircleOutline, cloudOfflineOutline, timeOutline, closeCircle, checkmarkCircleOutline } from "ionicons/icons";
import { IonSpinner } from "@ionic/react";
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
  const [searching, setSearching] = useState<boolean>(false);
  const [isNurseryEnabled,setIsNurseryEnabled]=useState(false);
  const [showHatchingDatePicker, setShowHatchingDatePicker] =
  useState<boolean>(false);
  const [showUprootingDatePicker, setShowUprootingDatePicker] =
  useState<boolean>(false);
  const [farmerLandDetailsId, setFarmerLandDetailsId] = useState<number | null>(
    null
  );
  const [showAlert, setShowAlert] = useState<boolean>(false);
  // Locks the Save button while the save API is in flight to prevent
  // duplicate records from double-clicks (same as Profile/Land Info).
  const [submitting, setSubmitting] = useState<boolean>(false);
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

  // ────────────────────────────────────────────────────────────
  // New search UX state — same pattern as Profile/Land Info
  // ────────────────────────────────────────────────────────────
  const FRUITS_ID_LENGTH = 16;
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('recentFruitsIds_mulberry');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [searchAttempted, setSearchAttempted] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<'notFound' | 'network' | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);

  const saveRecent = (id: string) => {
    const trimmed = id.trim().toUpperCase();
    if (!trimmed) return;
    setRecentSearches(prev => {
      const next = [trimmed, ...prev.filter(x => x !== trimmed)].slice(0, 5);
      try { localStorage.setItem('recentFruitsIds_mulberry', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const removeRecent = (id: string) => {
    setRecentSearches(prev => {
      const next = prev.filter(x => x !== id);
      try { localStorage.setItem('recentFruitsIds_mulberry', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const handleRecentClick = (id: string) => {
    setSearchText(id);
    setSearchError(null);
    setSearchAttempted(false);
    setTimeout(() => fetchDetails(id), 0);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLIonInputElement>) => {
    if (e.key === 'Enter' && searchText.trim() && !searching) {
      inputRef.current?.blur();
      fetchDetails();
    }
  };

  const fetchDetails = (overrideId?: string) => {
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
        (async () => {
          try {
            const compressed = await compressImageFile(file, 2);
            setSelectedFile(compressed); // Set compressed file
            setPreviewImage(URL.createObjectURL(compressed)); // Set preview image for viewing
          } catch (err) {
            console.error('Compression error, using original file:', err);
            setSelectedFile(file);
            setPreviewImage(URL.createObjectURL(file));
          }
        })();
    }  
  };
  
  const handleClearFile = () => {
    setSelectedFile(null);
    setPreviewImage(null); // Clear the preview image

    if (fileInputRef.current) {
      fileInputRef.current.value = '';

    // Helper: convert File to data URL
    const fileToDataURL = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
      });
    };

    // Helper: compress image File to max 2 MB
    const compressImageFile = async (file: File, maxSizeMB = 2): Promise<File> => {
      const maxSize = maxSizeMB * 1024 * 1024;

      if (!file.type.startsWith('image/')) {
        return file;
      }

      if (file.size <= maxSize) return file;

      const dataUrl = await fileToDataURL(file);
      const img = document.createElement('img');
      img.src = dataUrl;

      await new Promise((resolve, reject) => {
        img.onload = () => resolve(true);
        img.onerror = (e) => reject(e);
      });

      const canvas = document.createElement('canvas');
      let [width, height] = [img.naturalWidth, img.naturalHeight];

      const maxDim = 1600;
      if (Math.max(width, height) > maxDim) {
        const scale = maxDim / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return file;

      ctx.drawImage(img, 0, 0, width, height);

      let quality = 0.92;
      let blob: Blob | null = null;

      for (let i = 0; i < 8; i++) {
        blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((b) => resolve(b), file.type === 'image/png' ? 'image/jpeg' : file.type, quality);
        });

        if (!blob) break;
        if (blob.size <= maxSize) break;

        quality = Math.max(0.4, quality - 0.12);

        if (i === 3) {
          width = Math.round(width * 0.8);
          height = Math.round(height * 0.8);
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
        }
      }

      if (blob && blob.size <= file.size) {
        const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, '') + '.jpg', { type: 'image/jpeg' });
        return newFile.size <= maxSize ? newFile : file;
      }

      return file;
    };
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
    // Double-click guard — once a save is in flight, ignore further taps
    // until success or failure. Prevents duplicate records.
    if (submitting) return;
    try {
      if (isEditable) {
        // Validate mandatory date fields
        if (
          (!isUprootingReasonEnabled && !isNurseryEnabled && !farmerOtherData.extensionDate) ||
          (isUprootingReasonEnabled && !farmerOtherData.uprootingDate) ||
          (isNurseryEnabled && !farmerOtherData.extensionDate)
        ) {
          setMessage('Please select the required date before submitting.');
          setIserror(true);
          setShowAlert(true);
          return;
        }
        // Validate file selection
        if (!selectedFile) {
          setMessage('Please select or capture an image before uploading.');
          setIserror(true);
          setShowAlert(true);
          return; // Exit if no file is selected
        }
        setSubmitting(true);
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
            noOfSapplings: farmerOtherData.noOfSapplings, // <-- fix: use correct field name
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
      // Always release the submit lock on success AND failure, so a failed
      // save doesn't leave the button permanently disabled.
      setSubmitting(false);
    }
    // Note: do NOT flip isEditable here. The form stays editable so the user
    // can save additional changes without having to click twice.
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

// ────────────────────────────────────────────────────────────
// Real TSC dropdown options (the legacy `tscListData` above is misleadingly
// populated with mulberry-variety data — leaving it untouched to avoid breaking
// anything else, and using a fresh state for the actual TSC list)
// ────────────────────────────────────────────────────────────
const [tscOptions, setTscOptions] = useState<any[]>([]);
const [tscFetchError, setTscFetchError] = useState<boolean>(false);

const fetchTscOptions = async () => {
  try {
    const response = await axios.get(`${API_URL_Master_Data}tscMaster/get-all`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
      },
    });
    if (response.data && response.data.content) {
      setTscOptions(response.data.content.tscMaster || []);
    } else {
      setTscFetchError(true);
    }
  } catch (e) {
    console.error('Error fetching TSC list:', e);
    setTscFetchError(true);
  }
};

useEffect(() => {
  fetchTscOptions();
}, []);

// When farmer data loads, seed the editable form's TSC value with what the
// backend already has so the dropdown shows the current selection.
useEffect(() => {
  if (data?.tsc !== undefined && data?.tsc !== null) {
    setFarmerOtherData((prev: any) => ({ ...(prev || {}), tsc: data.tsc }));
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [data]);

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
          <IonTitle>Mulberry Activity</IonTitle>
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
       
        {data && (
          <div className="result-card">
            <div className="result-head">
              <div className="result-avatar is-accent-green">
                <IonIcon icon={leafOutline} />
              </div>
              <div className="result-head-text">
                <span className="result-eyebrow">Mulberry Variety Details</span>
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
              {!viewAll ? (
                <div className="result-actions" style={{ padding: '12px 0 0' }}>
                  <IonButton
                    className="btn-result-primary is-active"
                    expand="block"
                    onClick={toggleViewAll}
                  >
                    Add Details
                  </IonButton>
                </div>
              ) : (
                <div className="mulberry-form">
                  <div className="mulberry-form-divider">
                    <span>Activity Details</span>
                    <button
                      type="button"
                      className="mulberry-collapse-link"
                      onClick={toggleViewAll}
                      aria-label="Collapse details"
                    >
                      ▲
                    </button>
                  </div>

                  {/* TSC dropdown — placed at the top of the editable section */}
                  <div className="details-row">
                    <IonLabel>TSC:</IonLabel>
                    {tscFetchError ? (
                      <IonInput value={data.tsc} readonly={true} />
                    ) : (
                      <IonSelect
                        value={farmerOtherData?.tsc ?? data.tsc ?? ''}
                        placeholder="Select TSC"
                        interface="action-sheet"
                        onIonChange={(e) => handleChange(e, 'tsc')}
                      >
                        <IonSelectOption value="">None</IonSelectOption>
                        {tscOptions.map((tsc: any) => (
                          <IonSelectOption key={tsc.tscMasterId} value={tsc.name}>
                            {tsc.name}
                          </IonSelectOption>
                        ))}
                      </IonSelect>
                    )}
                  </div>

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
                      <IonButton style={{ '--background': '#ffffff', '--color': '#000000', color: '#000000', backgroundColor: '#ffffff' } as any} onClick={() => setShowUprootingDatePicker(false)}>Close</IonButton>
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
                      <IonButton style={{ '--background': '#ffffff', '--color': '#000000', color: '#000000', backgroundColor: '#ffffff' } as any} onClick={() => setShowNurseryDatePicker(false)}>Close</IonButton>
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
                  <IonLabel>Farmer Photo: <span className="info-hint">(max 5 MB)</span></IonLabel>

                  <input
                    id="mulberry-photo-gallery"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                  />

                  <div className="photo-picker-row">
                    <button
                      type="button"
                      className="photo-picker-btn photo-picker-btn--camera"
                      onClick={handleCaptureImage}
                    >
                      <IonIcon icon={camera} />
                      <span>Camera</span>
                    </button>
                    <button
                      type="button"
                      className="photo-picker-btn photo-picker-btn--file"
                      onClick={() => document.getElementById('mulberry-photo-gallery')?.click()}
                    >
                      <IonIcon icon={eyeSharp} />
                      <span>Choose File</span>
                    </button>
                  </div>

                  {(selectedFile || previewImage) && (
                    <div className="info-file-preview">
                      {previewImage && (
                        <img
                          src={previewImage}
                          alt="Preview"
                          onClick={() => setIsModalOpen(true)}
                          style={{ cursor: 'pointer' }}
                        />
                      )}
                      <span className="info-file-name">
                        {selectedFile?.name || 'Captured image'}
                      </span>
                      <button
                        type="button"
                        className="recent-chip-remove"
                        aria-label="Remove photo"
                        onClick={handleClearFile}
                      >
                        <IonIcon icon={trashSharp} />
                      </button>
                    </div>
                  )}

                  {previewImage && (
                    <IonModal isOpen={isModalOpen} onDidDismiss={() => setIsModalOpen(false)}>
                      <IonHeader>
                        <IonToolbar>
                          <IonTitle>View Photo</IonTitle>
                          <IonButtons slot="end">
                            <IonButton onClick={() => setIsModalOpen(false)}>Close</IonButton>
                          </IonButtons>
                        </IonToolbar>
                      </IonHeader>
                      <IonContent>
                        <div className="preview-section" style={{ textAlign: 'center', padding: '20px' }}>
                          <IonImg src={previewImage} alt="Preview" />
                        </div>
                      </IonContent>
                    </IonModal>
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
                      <IonButton style={{ '--background': '#ffffff', '--color': '#000000', color: '#000000', backgroundColor: '#ffffff' } as any} onClick={() => setShowHatchingDatePicker(false)}>Close</IonButton>
                      </IonModal>
                    )}
                  </div>)}</div>

                </div>
              )}

              {viewAll && (
                <div className="result-actions" style={{ paddingTop: 12 }}>
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
                        Save Changes
                      </>
                    )}
                  </IonButton>
                </div>
              )}

            </div>
          </div>
        )}
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={iserror ? "Error" : "Success"}
          message={message}
          buttons={['OK']}
        />

        {/* Non-blocking success toast — top position to clear floating UI */}
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
          message="This will clear the Fruits ID and any unsaved details. Continue?"
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

export default MulberryPage;

