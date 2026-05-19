import { brushSharp, camera, eyeOutline, eyeSharp, fileTrayStackedOutline, imageOutline, trashSharp } from 'ionicons/icons';
import React, { useState, useRef } from 'react';
import { IonButton, IonIcon, IonToast, IonModal, IonImg, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton, IonBackButton, IonInput, IonCard, IonCardHeader, IonCardContent, IonCardTitle, IonLabel, IonCol, IonSelect, IonSelectOption } from '@ionic/react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL_DBT_, API_URL_Inspection } from '../auth.service';
import { Plugins } from '@capacitor/core';
import { CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { getSavedImages, readImageDataUrl, getImageFileAsBlob, deleteImage, SavedImageMeta } from '../imageStorage';

// import { camera } from 'ionicons/icons';
// import React, { useState, useRef } from 'react';
// import { IonButton, IonSelect, IonSelectOption, IonImg, IonIcon, IonToast } from '@ionic/react';
// import { useParams } from 'react-router-dom';
// import axios from 'axios';
// import { API_URL_Inspection } from '../../../services/auth.service';
// import { Capacitor, Plugins } from '@capacitor/core';
// import { CameraResultType, CameraSource } from '@capacitor/camera';
// import { Geolocation } from '@capacitor/geolocation';

// interface DocumentUploadProps {

//       }

//       setUploadSuccess(true);
//       setTimeout(() => setUploadSuccess(false), 3000);

//       setSelectedFiles([]);
//       if (fileInputRef.current) {
//         fileInputRef.current.value = '';
//       }
//     } catch (error) {
//       console.error('Error uploading files:', error);
//       setUploadError(true);
//       setTimeout(() => setUploadError(false), 3000);
//     }
//   };

//   const handleCameraCapture = async () => {
//     try {
//       const capturedPhoto = await Plugins.Camera.getPhoto({
//         quality: 90,
//         allowEditing: false,
//         resultType: CameraResultType.Uri,
//         source: CameraSource.Camera,
//       });

//       if (capturedPhoto && capturedPhoto.webPath) {
//         setSelectedFiles((prevFiles) => [...prevFiles, capturedPhoto.webPath]);
//         if (fileInputRef.current) {
//           fileInputRef.current.value = '';
//         }
//       }
//     } catch (error) {
//       console.error('Error capturing photo:', error);
//     }
//   };

//   const handleClear = () => {
//     setSelectedFiles([]);
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   };

//   const handleSelectChange = (value: string) => {
//     setShowUpload(value === 'yes');
//     setSelectedFiles([]); // Clear selected files on change
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   };

//   return (
//     <div>
//       <IonSelect value={showUpload ? 'yes' : 'no'} onIonChange={(e) => handleSelectChange(e.detail.value)}>
//         <IonSelectOption value="yes">Yes</IonSelectOption>
//         <IonSelectOption value="no">No</IonSelectOption>
//       </IonSelect>
//       {showUpload && (
//         <>
//           <label htmlFor="fileInput">(Max: 5MB)</label>
//           <input type="file" multiple onChange={handleFileChange} ref={fileInputRef} />
//           <IonButton onClick={handleCameraCapture} className='cld'>
//             <IonIcon icon={camera} slot="icon-only" />
//           </IonButton>
//           {selectedFiles.length > 0 && <IonButton onClick={handleUpload}>Upload</IonButton>}
//           {selectedFiles.length > 0 && <IonButton onClick={handleClear}>Clear</IonButton>}
//         </>
//       )}

//       <IonToast
//         isOpen={uploadSuccess}
//         onDidDismiss={() => setUploadSuccess(false)}
//         message="Successfully uploaded"
//         duration={3000}
//       />
//       <IonToast
//         isOpen={uploadError}
//         onDidDismiss={() => setUploadError(false)}
//         message="Error uploading files. Please try again."
//         duration={3000}
//         color="danger"
//       />
//       {selectedFiles.map((file, index) => (
//         <IonImg key={index} src={file} ref={imageRef} />
//       ))}
//     </div>
//   );
// };

// export default DocumentUpload;










//Back button added in this code

// import { brushSharp, camera, eyeOutline, eyeSharp, fileTrayStackedOutline, imageOutline, trashSharp } from 'ionicons/icons';
// import React, { useState, useRef } from 'react';
// import { IonButton, IonIcon, IonToast, IonModal, IonImg, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/react';
// import { useParams } from 'react-router-dom';
// import axios from 'axios';
// import { API_URL_Inspection } from '../../../services/auth.service';
// import { Plugins } from '@capacitor/core';
// import { CameraResultType, CameraSource } from '@capacitor/camera';

// interface DocumentUploadProps {
//   onUpload: (file: File) => void;
//   docId: number;
// }

// const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUpload, docId }) => {
//   const { documentMasterId, inspectionTaskId } = useParams<{ documentMasterId: string; inspectionTaskId: string }>();
//   const [selectedFiles, setSelectedFiles] = useState<{ url: string; name: string }[]>([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalFile, setModalFile] = useState<{ url: string; name: string } | null>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
//   const [uploadError, setUploadError] = useState<boolean>(false);

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     if (event.target.files && event.target.files.length > 0) {
//       const filesArray = Array.from(event.target.files).map((file) => ({
//         url: URL.createObjectURL(file),
//         name: file.name,
//       }));
//       setSelectedFiles((prevFiles) => [...prevFiles, ...filesArray]);
//     }
//   };

//   const handleUpload = async () => {
//     try {
//       if (selectedFiles.length === 0) {
//         console.error('No files selected.');
//         return;
//       }

//       const api = axios.create({
//         baseURL: API_URL_Inspection,
//         headers: {
//           'Content-Type': 'multipart/form-data',
//           Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
//         },
//       });

//       const parameters = `inspectionTaskId=${inspectionTaskId}&documentMasterId=${docId}`;

//       for (const file of selectedFiles) {
//         let uploadFile: File | null = null;

//         if (file.url.startsWith('data:image')) {
//           const blob = await fetch(file.url).then((r) => r.blob());
//           uploadFile = new File([blob], 'capturedImage.jpg', { type: 'image/jpeg' });
//         } else {
//           const response = await fetch(file.url);
//           const blob = await response.blob();
//           uploadFile = new File([blob], file.name, { type: blob.type });
//         }

//         if (!uploadFile) {
//           console.error('Error creating upload file.');
//           continue;
//         }

//         const formData = new FormData();
//         formData.append('multipartFile', uploadFile);
//         await api.post(`/inspection/v1/inspectionTaskDocument/upload?${parameters}`, formData);
  
//         onUpload(uploadFile);
//       }

//       setUploadSuccess(true);
//       setTimeout(() => setUploadSuccess(false), 3000);

//       setSelectedFiles([]);
//       if (fileInputRef.current) {
//         fileInputRef.current.value = '';
//       }
//     } catch (error) {
//       console.error('Error uploading files:', error);
//       setUploadError(true);
//       setTimeout(() => setUploadError(false), 3000);
//     }
//   };

//   const handleCameraCapture = async () => {
//     try {
//       const capturedPhoto = await Plugins.Camera.getPhoto({
//         quality: 90,
//         allowEditing: false,
//         resultType: CameraResultType.Uri,
//         source: CameraSource.Camera,
//       });

//       if (capturedPhoto && capturedPhoto.webPath) {
//         setSelectedFiles((prevFiles) => [...prevFiles, { url: capturedPhoto.webPath, name: 'capturedImage.jpg' }]);
//         if (fileInputRef.current) {
//           fileInputRef.current.value = '';
//         }
//       }
//     } catch (error) {
//       console.error('Error capturing photo:', error);
//     }
//   };

//   const handleClear = () => {
//     setSelectedFiles([]);
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   };

//   const handleViewFile = (file: { url: string; name: string }) => {
//     if (file.name.endsWith('.pdf')) {
//       const link = document.createElement('a');
//       link.href = file.url;
//       link.download = file.name;
//       link.click();
//     } else {
//       setModalFile(file);
//       setIsModalOpen(true);
//     }
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setModalFile(null);
//   };

//   return (
//     <div>
//   <label htmlFor="fileInput">(Max: 5MB)</label>
//       <input type="file" multiple onChange={handleFileChange} ref={fileInputRef} />
//       <IonButton onClick={handleCameraCapture} className='cld'>
//         <IonIcon icon={camera} slot="icon-only" />
//       </IonButton>
//       {selectedFiles.length > 0 && (
//         <>
//           <IonButton onClick={handleUpload}>Upload</IonButton>
//           <IonButton onClick={handleClear} className='bd'><IonIcon icon={trashSharp} slot="icon-only" /></IonButton>
//           {selectedFiles.map((file, index) => (
//             <IonButton key={index} onClick={() => handleViewFile(file)} className='bd'><IonIcon icon={eyeSharp} slot="icon-only" />{index + 1}</IonButton>
//           ))}
//         </>
//       )}

//       <IonToast
//         isOpen={uploadSuccess}
//         onDidDismiss={() => setUploadSuccess(false)}
//         message="Successfully uploaded"
//         duration={3000}
//       />
//       <IonToast
//         isOpen={uploadError}
//         onDidDismiss={() => setUploadError(false)}
//         message="Error uploading files. Please try again."
//         duration={3000}
//         color="danger"
//       />

//       <IonModal isOpen={isModalOpen} onDidDismiss={handleCloseModal}>
//         <IonHeader>
//           <IonToolbar>
//             <IonTitle>View File</IonTitle>
//             <IonButton slot="end" onClick={handleCloseModal}>Close</IonButton>
//           </IonToolbar>
//         </IonHeader>
//         <IonContent>
//           {modalFile && !modalFile.name.endsWith('.pdf') && <IonImg src={modalFile.url} />}
//         </IonContent>
//       </IonModal>
//     </div>
//   );
// };

// export default DocumentUpload;



interface DocumentUploadProps {
  onUpload: (file: File) => void;
  docId: number;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUpload, docId }) => {
  const { documentMasterId, applicationDocumentId } = useParams<{ documentMasterId: string; applicationDocumentId: string }>();
  const [selectedFiles, setSelectedFiles] = useState<{ url: string; name: string }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalFile, setModalFile] = useState<{ url: string; name: string } | null>(null);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [savedList, setSavedList] = useState<SavedImageMeta[]>([]);
  const [savedDataUrls, setSavedDataUrls] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<boolean>(false);

  // Helper: convert File to data URL
  const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  };

  // Helper: compress image File to max `maxSizeMB`
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
        Array.from(event.target.files).forEach(async (file) => {
          const compressed = await compressImageFile(file, 2);
          const url = URL.createObjectURL(compressed);
          setSelectedFiles((prevFiles) => [...prevFiles, { url, name: compressed.name }]);
        });
    }
  };

  const handleUpload = async () => {
    try {
      if (selectedFiles.length === 0) {
        console.error('No files selected.');
        return;
      }

      const api = axios.create({
        baseURL: API_URL_DBT_,
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
        },
      });

      const position = await Geolocation.getCurrentPosition();
      const { latitude, longitude } = position.coords;
      const parameters = `applicationFormId=${applicationDocumentId}&documentTypeId=${docId}&lat=${latitude}&lon=${longitude}`;

      for (const file of selectedFiles) {
        let uploadFile: File | null = null;

        if (file.url.startsWith('data:image')) {
          const blob = await fetch(file.url).then((r) => r.blob());
          uploadFile = new File([blob], 'capturedImage.jpg', { type: 'image/jpeg' });
        } else {
          const response = await fetch(file.url);
          const blob = await response.blob();
          uploadFile = new File([blob], file.name, { type: blob.type });
        }

        if (!uploadFile) {
          console.error('Error creating upload file.');
          continue;
        }

        const formData = new FormData();
        formData.append('multipartFile', uploadFile);
        await api.post(`dbt/v1/service/uploadDocumentWithGeoLocation?${parameters}`, formData);
  
        onUpload(uploadFile);
      }

      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);

      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      setUploadError(true);
      setTimeout(() => setUploadError(false), 3000);
    }
  };

    const handleUploadSingle = async (index: number) => {
      try {
        const fileEntry = selectedFiles[index];
        if (!fileEntry) return;

        let uploadFile: File | null = null;
        if (fileEntry.url.startsWith('data:image')) {
          const blob = await fetch(fileEntry.url).then((r) => r.blob());
          uploadFile = new File([blob], fileEntry.name || 'capturedImage.jpg', { type: 'image/jpeg' });
        } else {
          const response = await fetch(fileEntry.url);
          const blob = await response.blob();
          uploadFile = new File([blob], fileEntry.name, { type: blob.type });
        }

        if (!uploadFile) {
          console.error('Error creating upload file.');
          return;
        }

        const position = await Geolocation.getCurrentPosition();
        const { latitude, longitude } = position.coords;
        const api = axios.create({
          baseURL: API_URL_DBT_,
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
          },
        });
        const parameters = `applicationFormId=${applicationDocumentId}&documentTypeId=${docId}&lat=${latitude}&lon=${longitude}`;
        const formData = new FormData();
        formData.append('multipartFile', uploadFile);
        await api.post(`dbt/v1/service/uploadDocumentWithGeoLocation?${parameters}`, formData);

        onUpload(uploadFile);

        // remove the uploaded file from selectedFiles
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      } catch (err) {
        console.error('Single file upload failed', err);
        setUploadError(true);
        setTimeout(() => setUploadError(false), 3000);
      }
    };

    const handleDeleteSelected = (index: number) => {
      setSelectedFiles((prev) => {
        const toRemove = prev[index];
        try {
          if (toRemove && toRemove.url && toRemove.url.startsWith('blob:')) URL.revokeObjectURL(toRemove.url);
        } catch (e) {
          // ignore
        }
        return prev.filter((_, i) => i !== index);
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
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
        // Get the current position
        const position = await Geolocation.getCurrentPosition();
        const { latitude, longitude } = position.coords;
        const capturedAt = new Date();
        const dateTimeText = capturedAt.toLocaleString('en-IN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        });
  
        // Create a new image element
        const img = new Image();
        img.src = capturedPhoto.webPath;
        img.onload = () => {
          // Create a canvas to draw the image and text
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
  
          // Set canvas dimensions to the image dimensions
          // Optionally resize the image to reduce file size
          const maxWidth = 1024; // Max width for resizing
          const maxHeight = 1024; // Max height for resizing
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
  
          // Draw the image on the canvas
          ctx.drawImage(img, 0, 0, width, height);
  
          // Draw a semi-transparent strip so stamp stays readable on any background
          const stampLines = [
            `Date & Time: ${dateTimeText}`,
            `Latitude: ${latitude.toFixed(6)}`,
            `Longitude: ${longitude.toFixed(6)}`,
          ];
          const lineHeight = 38;
          const boxHeight = stampLines.length * lineHeight + 20;
          ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
          ctx.fillRect(0, 0, width, boxHeight);

          // Set the text style
          ctx.fillStyle = 'white';
          ctx.font = 'bold 30px Arial'; // Set font size to 30px

          // Add date/time and location text
          stampLines.forEach((line, index) => {
            ctx.fillText(line, 10, 45 + index * lineHeight);
          });
  
          // Get the new image URL from the canvas with reduced quality for smaller file size
          const newImageUrl = canvas.toDataURL('image/jpeg', 0.7); // Reduce quality to 70%
  
          // Add the new image with location text to the selected files
          setSelectedFiles((prevFiles) => [...prevFiles, { url: newImageUrl, name: 'capturedImage.jpg' }]);
        };
      }
    } catch (error) {
      console.error('Error capturing photo or fetching location:', error);
    }
  };
  



  const handleClear = () => {
    // revoke any object URLs
    selectedFiles.forEach((f) => {
      try {
        if (f.url && f.url.startsWith('blob:')) URL.revokeObjectURL(f.url);
      } catch (e) {}
    });
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

  return (
    <div>
      <label htmlFor="fileInput">(Max: 5MB)</label>
      <input type="file" multiple onChange={handleFileChange} ref={fileInputRef} />
      <IonButton style={{ '--background': '#ffffff', '--color': '#000000', color: '#000000', backgroundColor: '#ffffff' } as any} onClick={async () => {
        const list = await getSavedImages();
        setSavedList(list);
        const map: Record<string, string> = {};
        await Promise.all(list.map(async (m) => {
          const d = await readImageDataUrl(m.fileName);
          if (d) map[m.fileName] = d;
        }));
        setSavedDataUrls(map);
        setIsSavedModalOpen(true);
      }}>Use Saved Image</IonButton>
      <IonButton style={{ '--background': '#ffffff', '--color': '#000000', color: '#000000', backgroundColor: '#ffffff' } as any} onClick={handleCameraCapture} className='cld'>
        <IonIcon icon={camera} slot="icon-only" />
      </IonButton>
      {selectedFiles.length > 0 && (
        <>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
            <IonButton style={{ '--background': '#ffffff', '--color': '#000000', color: '#000000', backgroundColor: '#ffffff' } as any} onClick={handleUpload}>Upload</IonButton>
            <IonButton style={{ '--background': '#ffffff', '--color': '#000000', color: '#000000', backgroundColor: '#ffffff' } as any} onClick={handleClear} className='bd'><IonIcon icon={trashSharp} slot="icon-only" /></IonButton>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
            {selectedFiles.map((file, index) => (
              <div key={index} style={{ width: 140, border: '1px solid #ddd', borderRadius: 8, padding: 6, background: '#fff' }}>
                {/* thumbnail */}
                <div style={{ width: '100%', height: 100, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {(file.url.startsWith('data:image') || file.url.startsWith('blob:') || file.url.match(/^https?:.*\.(jpg|jpeg|png|gif)$/i)) ? (
                    <IonImg src={file.url} style={{ width: '100%', height: 100, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: 100, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📄</div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 6, marginTop: 8, justifyContent: 'center' }}>
                  <IonButton style={{ '--background': '#ffffff', '--color': '#000000', color: '#000000', backgroundColor: '#ffffff' } as any} title="View" size="small" onClick={() => handleViewFile(file)}>
                    <IonIcon icon={eyeSharp} />
                  </IonButton>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <IonToast
        isOpen={uploadSuccess}
        onDidDismiss={() => setUploadSuccess(false)}
        message="Successfully uploaded"
        duration={3000}
      />
      <IonToast
        isOpen={uploadError}
        onDidDismiss={() => setUploadError(false)}
        message="Error uploading files. Please try again."
        duration={3000}
        color="danger"
      />

      <IonModal isOpen={isModalOpen} onDidDismiss={handleCloseModal}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>View File</IonTitle>
            <IonButton style={{ '--background': '#ffffff', '--color': '#000000', color: '#000000', backgroundColor: '#ffffff' } as any} slot="end" onClick={handleCloseModal}>Close</IonButton>
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
            <IonButton style={{ '--background': '#ffffff', '--color': '#000000', color: '#000000', backgroundColor: '#ffffff' } as any} slot="end" onClick={() => setIsSavedModalOpen(false)}>Close</IonButton>
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
                  <IonButton style={{ '--background': '#ffffff', '--color': '#000000', color: '#000000', backgroundColor: '#ffffff' } as any} title="View" size="small" onClick={() => {
                    const url = savedDataUrls[m.fileName];
                    if (url) {
                      setModalFile({ url, name: m.fileName });
                      setIsModalOpen(true);
                      setIsSavedModalOpen(false);
                    }
                  }}>
                    <IonIcon icon={eyeSharp} />
                  </IonButton>

                  <IonButton style={{ '--background': '#ffffff', '--color': '#000000', color: '#000000', backgroundColor: '#ffffff' } as any} title="Upload" size="small" onClick={async () => {
                    try {
                      const blob = await getImageFileAsBlob(m.fileName);
                      if (!blob) throw new Error('Unable to read file');
                      const file = new File([blob], m.fileName, { type: 'image/jpeg' });

                      const position = await Geolocation.getCurrentPosition();
                      const { latitude, longitude } = position.coords;
                      const api = axios.create({
                        baseURL: API_URL_DBT_,
                        headers: {
                          'Content-Type': 'multipart/form-data',
                          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
                        },
                      });
                      const parameters = `applicationFormId=${applicationDocumentId}&documentTypeId=${docId}&lat=${latitude}&lon=${longitude}`;
                      const formData = new FormData();
                      formData.append('multipartFile', file);
                      await api.post(`dbt/v1/service/uploadDocumentWithGeoLocation?${parameters}`, formData);
                      onUpload(file);
                      await deleteImage(m.fileName);
                      const updated = await getSavedImages();
                      setSavedList(updated);
                      const map = { ...savedDataUrls };
                      delete map[m.fileName];
                      setSavedDataUrls(map);
                      setIsSavedModalOpen(false);
                      setUploadSuccess(true);
                      setTimeout(() => setUploadSuccess(false), 3000);
                    } catch (err) {
                      console.error('Upload saved image failed', err);
                      setUploadError(true);
                      setTimeout(() => setUploadError(false), 3000);
                    }
                  }}>
                    <IonIcon icon={fileTrayStackedOutline} />
                  </IonButton>

                  <IonButton style={{ '--background': '#ffffff', '--color': '#000000', color: '#000000', backgroundColor: '#ffffff' } as any} title="Delete" size="small" onClick={async () => {
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
    </div>
  );
};

export default DocumentUpload;





