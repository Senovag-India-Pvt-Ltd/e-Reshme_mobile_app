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
  IonBackButton,
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
import { arrowBack, camera, trashSharp, eyeSharp, fileTrayStackedOutline, locationOutline, documentTextOutline, imagesOutline, cloudUploadOutline, checkmarkCircle } from "ionicons/icons";
import { Plugins } from '@capacitor/core';
import { CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { getSavedImages, readImageDataUrl, getImageFileAsBlob, deleteImage, SavedImageMeta } from '../imageStorage';

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
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [savedList, setSavedList] = useState<SavedImageMeta[]>([]);
  const [savedDataUrls, setSavedDataUrls] = useState<Record<string, string>>({});

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
      Array.from(event.target.files).forEach(async (file) => {
        const compressed = await compressImageFile(file, 2);
        const url = URL.createObjectURL(compressed);
        setSelectedFiles((prevFiles) => [...prevFiles, { url, name: compressed.name, file: compressed }]);
      });
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
        const response = await fetch(capturedPhoto.webPath);
        const blob = await response.blob();
        let file = new File([blob], 'captured_image.jpg', { type: blob.type });
        
        // Compress to 2 MB
        file = await compressImageFile(file, 2);
        
        const position = await Geolocation.getCurrentPosition();
        const { latitude, longitude } = position.coords;

        const img = new Image();
        img.src = URL.createObjectURL(file);
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

          // Add date and time to watermark
          const dateTimeStr = new Date().toLocaleString('en-IN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          });
          ctx.fillText(`${dateTimeStr}`, 10, 50);
          ctx.fillText(`Latitude: ${latitude}`, 10, 90);
          ctx.fillText(`Longitude: ${longitude}`, 10, 130);

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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="page-toolbar">
          <IonButtons slot="start">
            <IonBackButton text="Back" defaultHref="/list" />
          </IonButtons>
          <IonTitle>Reeler Inspection</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="page-content">
        <div className="page-hero-extension" aria-hidden="true"></div>

        <div className="result-card">
          <div className="result-head">
            <div className="result-avatar is-accent-cyan">
              <IonIcon icon={locationOutline} />
            </div>
            <div className="result-head-text">
              <span className="result-eyebrow">Reeling Unit</span>
              <h3 className="result-title">GPS Co-ordinates</h3>
            </div>
          </div>

          <div className="result-body">
            <div className="info-row">
              <label className="info-label">Latitude</label>
              <IonInput
                value={currentLocation.latitude}
                placeholder="Latitude"
                disabled
              />
            </div>
            <div className="info-row">
              <label className="info-label">Longitude</label>
              <IonInput
                value={currentLocation.longitude}
                placeholder="Longitude"
                disabled
              />
            </div>
            <div className="info-row">
              <label className="info-label">Inspection Date</label>
              <IonInput
                value={new Date(inspectionFields.date).toLocaleDateString()}
                readonly={true}
                disabled={true}
              />
            </div>

            <div className="info-row">
              <label className="info-label">
                Inspection Photo <span className="info-hint">(max 5 MB)</span>
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                ref={fileInputRef}
                id="docFileInput"
                style={{ display: 'none' }}
              />
              <div className="file-action-row">
                <IonButton
                  className="btn-result-primary is-active"
                  expand="block"
                  onClick={() => document.getElementById('docFileInput')?.click()}
                  style={{ flex: 1 }}
                >
                  <IonIcon icon={documentTextOutline} slot="start" /> Choose File
                </IonButton>
                <IonButton
                  className="icon-only-btn"
                  onClick={handleCameraCapture}
                  aria-label="Capture image"
                >
                  <IonIcon icon={camera} />
                </IonButton>
                <IonButton
                  className="icon-only-btn"
                  onClick={async () => {
                    const list = await getSavedImages();
                    setSavedList(list);
                    const map: Record<string, string> = {};
                    await Promise.all(list.map(async (m) => {
                      const d = await readImageDataUrl(m.fileName);
                      if (d) map[m.fileName] = d;
                    }));
                    setSavedDataUrls(map);
                    setIsSavedModalOpen(true);
                  }}
                  aria-label="Use saved image"
                >
                  <IonIcon icon={imagesOutline} />
                </IonButton>
              </div>

              {selectedFiles.length > 0 && (
                <div className="info-file-preview" style={{ flexWrap: 'wrap', gap: 8 }}>
                  <span className="info-file-name">
                    {selectedFiles.length} image{selectedFiles.length > 1 ? 's' : ''} selected
                  </span>
                  {selectedFiles.map((file, index) => (
                    <IonButton
                      className="icon-only-btn"
                      key={index}
                      onClick={() => handleViewFile(file)}
                      aria-label={`View image ${index + 1}`}
                    >
                      <IonIcon icon={eyeSharp} />
                    </IonButton>
                  ))}
                  <IonButton
                    className="icon-only-btn danger"
                    onClick={handleClear}
                    aria-label="Clear images"
                  >
                    <IonIcon icon={trashSharp} />
                  </IonButton>
                  <IonButton
                    className="btn-result-primary is-active"
                    expand="block"
                    onClick={uploadFile}
                    style={{ flex: '1 0 100%', marginTop: 8 }}
                  >
                    <IonIcon icon={cloudUploadOutline} slot="start" /> Upload Image
                  </IonButton>
                </div>
              )}
            </div>
          </div>

          <div className="result-actions">
            <IonButton
              className={`btn-result-primary ${isImageUploaded ? 'is-active' : 'is-disabled-state'}`}
              expand="block"
              onClick={handleSubmit}
              disabled={!isImageUploaded}
            >
              <IonIcon icon={checkmarkCircle} slot="start" /> Submit Inspection
            </IonButton>
          </div>
        </div>
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

      <IonModal isOpen={isSavedModalOpen} onDidDismiss={() => setIsSavedModalOpen(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Saved Images</IonTitle>
            <IonButton slot="end" onClick={() => setIsSavedModalOpen(false)}>Close</IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent style={{ padding: 12 }}>
          {savedList.length === 0 && <p>No saved images</p>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {savedList.map((m) => (
              <div key={m.fileName} style={{ width: 140, border: '2px solid #ddd', borderRadius: '8px', overflow: 'hidden', padding: 6, background: '#fff' }}>
                {savedDataUrls[m.fileName] ? (
                  <IonImg src={savedDataUrls[m.fileName]} style={{ width: '100%', height: 100, objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: 100, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📷</div>
                )}
                <div style={{ display: 'flex', gap: 8, marginTop: 6, justifyContent: 'center' }}>
                  <IonButton title="View" size="small" onClick={() => {
                    const url = savedDataUrls[m.fileName];
                    if (url) {
                      setModalFile({ url, name: m.fileName });
                      setIsModalOpen(true);
                      setIsSavedModalOpen(false);
                    }
                  }}>
                    <IonIcon icon={eyeSharp} />
                  </IonButton>
                  <IonButton title="Use" size="small" onClick={async () => {
                    try {
                      const blob = await getImageFileAsBlob(m.fileName);
                      if (!blob) throw new Error('Unable to read file');
                      const file = new File([blob], m.fileName, { type: 'image/jpeg' });
                      const url = URL.createObjectURL(file);
                      setSelectedFiles((prevFiles) => [...prevFiles, { url, name: m.fileName, file }]);
                      setIsSavedModalOpen(false);
                    } catch (err) {
                      console.error('Failed to use saved image', err);
                    }
                  }}>
                    <IonIcon icon={fileTrayStackedOutline} />
                  </IonButton>
                  <IonButton title="Delete" size="small" onClick={async () => {
                    await deleteImage(m.fileName);
                    const updated = await getSavedImages();
                    setSavedList(updated);
                    const map = { ...savedDataUrls };
                    delete map[m.fileName];
                    setSavedDataUrls(map);
                  }}>
                    <IonIcon icon={trashSharp} />
                  </IonButton>
                </div>
              </div>
            ))}
          </div>
        </IonContent>
      </IonModal>
    </IonPage>
  );
};

export default Doc;
