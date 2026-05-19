

import { brushSharp, camera, eyeOutline, eyeSharp, fileTrayStackedOutline, imageOutline, trashSharp } from 'ionicons/icons';
import React, { useState, useRef } from 'react';
import { IonButton, IonIcon, IonToast, IonModal, IonImg, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import { Plugins } from '@capacitor/core';
import { CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { API_URL_DBT_ } from '../auth.service';

interface DocumentUploadProps {
  onUpload: (file: File) => void;
  docId: number;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUpload, docId }) => {
  const { documentMasterId, applicationDocumentId } = useParams<{ documentMasterId: string; applicationDocumentId: string }>();
  const [selectedFiles, setSelectedFiles] = useState<{ url: string; name: string }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalFile, setModalFile] = useState<{ url: string; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<boolean>(false);

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
        
        // Get the current position
        const position = await Geolocation.getCurrentPosition();
        const { latitude, longitude } = position.coords;
  
        // Create a new image element
        const img = new Image();
        img.src = URL.createObjectURL(file);
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
  
          // Set the text style
          ctx.fillStyle = 'white';
          ctx.font = 'bold 30px Arial'; // Set font size to 30px
  
          // Add the location text
          ctx.fillText(`Latitude: ${latitude}`, 10, 50); // Display latitude on the first line
          ctx.fillText(`Longitude: ${longitude}`, 10, 90); // Display longitude on the second line
  
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
    <div>
      <label htmlFor="fileInput">(Max: 5MB)</label>
      <input type="file" multiple onChange={handleFileChange} ref={fileInputRef} />
      <IonButton onClick={handleCameraCapture} className='cld'>
        <IonIcon icon={camera} slot="icon-only" />
      </IonButton>
      {selectedFiles.length > 0 && (
        <>
          <IonButton onClick={handleUpload}>Upload</IonButton>
          <IonButton onClick={handleClear} className='bd'><IonIcon icon={trashSharp} slot="icon-only" /></IonButton>
          {selectedFiles.map((file, index) => (
            <IonButton key={index} onClick={() => handleViewFile(file)} className='bd'><IonIcon icon={eyeSharp} slot="icon-only" />{index + 1}</IonButton>
          ))}
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
            <IonButton slot="end" onClick={handleCloseModal}>Close</IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          {modalFile && !modalFile.name.endsWith('.pdf') && <IonImg src={modalFile.url} />}
        </IonContent>
      </IonModal>
    </div>
  );
};

export default DocumentUpload;