import React, { useState, useEffect, useRef } from "react";
import {
  IonContent,
  IonPage,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonButtons,
  IonHeader,
  IonMenuButton,
  IonTitle,
  IonToolbar,
  IonToast,
  IonIcon,
  IonInput,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonSearchbar,
  IonModal,
  IonImg,
} from "@ionic/react";
import axios from "axios";
import { useParams, useHistory } from "react-router-dom";
import "./Doc.css";

import { API_URL_DBT } from '../auth.service';
import { arrowBack, camera, trashSharp, eyeSharp } from "ionicons/icons";
import { Plugins } from '@capacitor/core';
import { CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';

const Doc: React.FC = () => {
  const { reelerId } = useParams<{ reelerId: string }>();
  const history = useHistory();
  const [currentLocation, setCurrentLocation] = useState<{ latitude: string; longitude: string }>({
    latitude: "",
    longitude: "",
  });
  const [comment, setComment] = useState<string>("");
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<boolean>(false);
  const [usernames, setUsernames] = useState<any[]>([]);
  const [selectedUsername, setSelectedUsername] = useState<string>("");
  const [inspectionFields, setInspectionFields] = useState({ date: new Date().toISOString() });
  const [selectedFiles, setSelectedFiles] = useState<{ url: string; name: string; file: File }[]>([]);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalFile, setModalFile] = useState<{ url: string; name: string } | null>(null);
  const [isImageUploaded, setIsImageUploaded] = useState<boolean>(false);

  useEffect(() => {
    fetchCurrentLocation();
  }, []);

  const fetchCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          });
        },
        (error) => {
          console.error("Error getting current location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const filesArray = Array.from(event.target.files).map((file) => ({
        url: URL.createObjectURL(file),
        name: file.name,
        file: file,
      }));
      setSelectedFiles((prevFiles) => [...prevFiles, ...filesArray]);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const capturedPhoto = await Plugins.Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });

      if (capturedPhoto && capturedPhoto.webPath) {
        const position = await Geolocation.getCurrentPosition();
        const { latitude, longitude } = position.coords;

        const img = new Image();
        img.src = capturedPhoto.webPath;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          const maxWidth = 1024;
          const maxHeight = 1024;
          let { width, height } = img;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          ctx.drawImage(img, 0, 0, width, height);

          ctx.fillStyle = 'white';
          ctx.font = 'bold 30px Arial';

          ctx.fillText(`Latitude: ${latitude}`, 10, 50);
          ctx.fillText(`Longitude: ${longitude}`, 10, 90);

          const newImageUrl = canvas.toDataURL('image/jpeg', 0.7);

          fetch(newImageUrl)
            .then(res => res.blob())
            .then(blob => {
              const file = new File([blob], 'capturedImage.jpg', { type: 'image/jpeg' });
              setSelectedFiles((prevFiles) => [...prevFiles, { url: newImageUrl, name: 'capturedImage.jpg', file }]);
            });
        };
      }
    } catch (error) {
      console.error('Error capturing photo or fetching location:', error);
    }
  };

  const handleClear = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleViewFile = (file: { url: string; name: string }) => {
    if (file.name.endsWith('.pdf')) {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      link.click();
    } else {
      setModalFile(file);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalFile(null);
  };

  const sendLocationData = () => {
    const requestBody = {
      reelerId: reelerId,
      inspectionDate: new Date().toISOString(),
      chakbandiLat: currentLocation.latitude,
      chakbandiLng: currentLocation.longitude,
    };
  
    const token = localStorage.getItem('jwtToken'); // Assuming the token is stored in localStorage
  
    axios
      .post(`${API_URL_DBT}reeler/edit-reeler-gps-details`, requestBody, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("Location data sent successfully:", response.data);
      })
      .catch((error) => {
        console.error("Error sending location data:", error);
        setSubmitError(true);
      });
  };

  const uploadFile = async () => {
    if (selectedFiles.length > 0) {
      const formData = new FormData();
      formData.append('multipartFile', selectedFiles[0].file); // Assuming only one file is uploaded at a time
  
      const token = localStorage.getItem('jwtToken'); // Assuming the token is stored in localStorage
  
      try {
        const response = await axios.post(`${API_URL_DBT}reeler/upload-document?reelerId=${reelerId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            "Authorization": `Bearer ${token}`, // Include the token in the headers
          },
        });
        console.log("File uploaded successfully:", response.data);
        setIsImageUploaded(true);
        setUploadSuccess(true);
        setSelectedFiles([]); // Clear selected files after successful upload
      } catch (error) {
        console.error("Error uploading file:", error);
        setUploadError(true);
      }
    }
  };
  
  const handleSubmit = async () => {
    try {
      await sendLocationData();
      setSubmitSuccess(true);
      setTimeout(() => {
        history.push("/list");
        window.location.reload();
      }, 3000);
    } catch (error) {
      setSubmitError(true);
      console.error("Error submitting data:", error);
    } finally {
      setTimeout(() => setSubmitSuccess(false), 3000);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>
            <b>Inspection</b>
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => history.goBack()}>
              <IonIcon icon={arrowBack} />
              Go Back
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonGrid>
          <IonRow>
            <IonCol size="12">
              <IonLabel className="capture-coordinates-label">
                <b>CAPTURE GPS CO-ORDINATES OF THE REELING UNIT</b>
              </IonLabel>
            </IonCol>
            <IonCol size="12" className="location-container">
              <IonLabel className="location-label">Current Location:</IonLabel>
              <IonInput
                value={currentLocation.latitude}
                placeholder="Latitude"
                disabled
              />
              <IonInput
                value={currentLocation.longitude}
                placeholder="Longitude"
                disabled
              />
            </IonCol>
            <IonCol size="12" className="location-container">
              <IonLabel className="location-label">Inspection Date:</IonLabel>
              <IonInput
                value={new Date(inspectionFields.date).toLocaleDateString()}
                readonly={true}
                disabled={true}
              />
            </IonCol>
            <IonCol size="12" className="location-container">
              <IonLabel className="location-label">Capture Image:</IonLabel>
              <label htmlFor="fileInput" className="capture-label">(Max: 2mb)</label>
              <input type="file" multiple onChange={handleFileChange} ref={fileInputRef} />
              <IonButton onClick={handleCameraCapture} className='cld'>
                <IonIcon icon={camera} slot="icon-only" />
              </IonButton>
              {selectedFiles.length > 0 && (
                <>
                  <IonButton onClick={handleClear} className='bd'>
                    <IonIcon icon={trashSharp} slot="icon-only" />
                  </IonButton>
                  {selectedFiles.map((file, index) => (
                    <IonButton key={index} onClick={() => handleViewFile(file)} className='bd'>
                      <IonIcon icon={eyeSharp} slot="icon-only" />{index + 1}
                    </IonButton>
                  ))}
                  <IonButton onClick={uploadFile} className='bd'>
                    Upload Image
                  </IonButton>
                </>
              )}
            </IonCol>
            <IonCol size="12">
              <IonButton expand="block" onClick={handleSubmit} disabled={!isImageUploaded}>
                Submit
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>

      <IonToast
        isOpen={submitSuccess}
        onDidDismiss={() => setSubmitSuccess(false)}
        message="Successfully submitted"
        duration={3000}
      />
      <IonToast
        isOpen={submitError}
        onDidDismiss={() => setSubmitError(false)}
        message="Error submitting data"
        duration={3000}
      />
      <IonToast
        isOpen={uploadSuccess}
        onDidDismiss={() => setUploadSuccess(false)}
        message="Image uploaded successfully"
        duration={3000}
      />
      <IonToast
        isOpen={uploadError}
        onDidDismiss={() => setUploadError(false)}
        message="Error uploading image"
        duration={3000}
      />

      <IonModal isOpen={isModalOpen} onDidDismiss={handleCloseModal}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>View File</IonTitle>
            <IonButton slot="end" onClick={handleCloseModal}>Close</IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          {modalFile && !modalFile.name.endsWith('.pdf') && <IonImg src={modalFile.url} />}
        </IonContent>
      </IonModal>
    </IonPage>
  );
};

export default Doc;
