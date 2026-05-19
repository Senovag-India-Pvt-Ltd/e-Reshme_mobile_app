import React, { useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonRow, IonCol,
  IonImg, IonButtons, IonButton, IonIcon, IonLabel, useIonRouter,
  IonModal, IonToast, IonGrid
} from '@ionic/react';
import './Home.css';
import {
  personCircleOutline, cloudDownloadOutline, images,
  trashSharp, logOut, leaf, settings
} from 'ionicons/icons';
import {
  saveImageWithLocation, getSavedImages, readImageDataUrl,
  deleteImage, SavedImageMeta
} from '../imageStorage';
import { useHistory } from 'react-router-dom';

const cardStyle: React.CSSProperties = {
  padding: '16px 12px',
  borderRadius: '8px',
  border: 'none',
  background: 'white',
  color: '#000',
  fontSize: '14px',
  fontWeight: '800',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  width: '100%'
};

const Home: React.FC = () => {
  const router = useIonRouter();
  const history = useHistory();
  const username = localStorage.getItem('username') || 'User';

  const [showSavedModal, setShowSavedModal] = useState<boolean>(false);
  const [savedImages, setSavedImages] = useState<SavedImageMeta[]>([]);
  const [imageDataUrls, setImageDataUrls] = useState<Record<string, string>>({});
  const [toastMsg, setToastMsg] = useState<string>('');
  const [toastOpen, setToastOpen] = useState<boolean>(false);
  const [viewImageUrl, setViewImageUrl] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);
  

  const handleCaptureClick = async () => {
    const meta = await saveImageWithLocation();
    if (meta) {
      setToastMsg('Image saved to app storage');
      setToastOpen(true);
      const list = await getSavedImages();
      setSavedImages(list);
    } else {
      setToastMsg('Failed to Capture Image, Try Again');
      setToastOpen(true);
    }
  };

  const openSavedImages = async () => {
    const list = await getSavedImages();
    setSavedImages(list);
    const map: Record<string, string> = {};
    await Promise.all(list.map(async (m) => {
      const dataUrl = await readImageDataUrl(m.fileName);
      if (dataUrl) map[m.fileName] = dataUrl;
    }));
    setImageDataUrls(map);
    setShowSavedModal(true);
  };

  const handleDeleteSaved = async (fileName: string) => {
    await deleteImage(fileName);
    const list = await getSavedImages();
    setSavedImages(list);
    const newMap = { ...imageDataUrls };
    delete newMap[fileName];
    setImageDataUrls(newMap);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ background: '#1a1a1a', borderBottom: '1px solid #333333' }}>
          <IonTitle style={{ color: '#040404' }}><b>Home</b></IonTitle>
          <IonButtons slot="end">
            <IonIcon icon={personCircleOutline} style={{ color: '#0d0d0d', fontSize: '24px' }} />
            <IonLabel style={{ color: '#050404', marginLeft: '8px' }}>{username}</IonLabel>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen style={{ background: '#000000' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', padding: '20px 12px', marginBottom: '20px' }}>
          <IonImg src="/assets/images/kg_logo.png" style={{ width: '100px', height: '100px', margin: '0 auto' }} />
          <h2 style={{ color: '#000', fontSize: '20px', fontWeight: 'bold' }}>Department of Sericulture</h2>
          <h2 style={{ color: '#000', fontSize: '18px', fontWeight: 'bold' }}>Government of Karnataka</h2>
        </div>

        {/* 3 Rows, 2 Columns */}
        <IonGrid>

          {/* Row 1 */}
          <IonRow>
            <IonCol size="6">
              <button style={cardStyle} onClick={() => history.push('/menu/1')}>
                <IonIcon icon={leaf} style={{ fontSize: 32 }} />
                General TSC
              </button>
            </IonCol>
          
             <IonCol size="6">
              <button style={cardStyle} onClick={handleCaptureClick}>
                <IonIcon icon={cloudDownloadOutline} style={{ fontSize: 32 }} />
                Capture
              </button>
            </IonCol>
          </IonRow>

          {/* Row 2 */}
          <IonRow>
              <IonCol size="6">
              <button style={cardStyle} onClick={() => history.push('/menu/2')}>
                <IonIcon icon={settings} style={{ fontSize: 32 }} />
                Reeling TSC
              </button>
            </IonCol>
            <IonCol size="6">
              <button style={cardStyle} onClick={openSavedImages}>
                <IonIcon icon={images} style={{ fontSize: 32 }} />
                Saved Images
              </button>
            </IonCol>
          
          </IonRow>

          {/* Row 3 */}
          <IonRow>
            <IonCol size="6">
              <button style={cardStyle} onClick={() => window.location.href = '/dash'}>
                <IonIcon icon={personCircleOutline} style={{ fontSize: 32 }} />
                Dashboard
              </button>
            </IonCol>
          
            <IonCol size="6">
              <button
                style={cardStyle}
                onClick={() => {
                  localStorage.clear();
                  history.push('/login');
                }}
              >
                <IonIcon icon={logOut} style={{ fontSize: 32 }} />
                Logout
              </button>
            </IonCol>
          </IonRow>

        </IonGrid>

        {/* Toast */}
        <IonToast isOpen={toastOpen} onDidDismiss={() => setToastOpen(false)} message={toastMsg} duration={2500} />

        {/* Saved Images Modal */}
        <IonModal isOpen={showSavedModal} onDidDismiss={() => setShowSavedModal(false)}>

          <IonHeader>
            <IonToolbar color="light">
              <IonTitle color="dark">Saved Images</IonTitle>
              <IonButton slot="end" onClick={() => setShowSavedModal(false)}>Close</IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {savedImages.map((m) => (
              <div key={m.fileName}>
                <IonImg src={imageDataUrls[m.fileName]} />
                <IonButton onClick={() => handleDeleteSaved(m.fileName)}>
                  <IonIcon icon={trashSharp} />
                </IonButton>
              </div>
            ))}
          </IonContent>
        </IonModal>
         {/* Saved Images Modal */}
        <IonModal isOpen={showSavedModal} onDidDismiss={() => setShowSavedModal(false)}>
          <IonHeader>
            <IonToolbar color="light">
              <IonTitle color="dark">Saved Images</IonTitle>
              <IonButton slot="end" onClick={() => setShowSavedModal(false)}>
                Close
              </IonButton>
            </IonToolbar>
          </IonHeader>

          <IonContent style={{ padding: 12 }}>
            {savedImages.length === 0 ? (
              <p style={{ textAlign: 'center', marginTop: 20 }}>No saved images yet</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {savedImages.map((m) => (
                  <div
                    key={m.fileName}
                    style={{
                      width: 140,
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    {imageDataUrls[m.fileName] ? (
                      <IonImg
                        src={imageDataUrls[m.fileName]}
                        style={{ width: '100%', height: 100, objectFit: 'cover' }}
                        onClick={() => {
                          const url = imageDataUrls[m.fileName];
                          setViewImageUrl(url);
                          setViewModalOpen(true);
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: 100,
                          background: '#eee',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        📷
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'center', padding: 6 }}>
                      <IonButton
                        title="Delete"
                        size="small"
                        onClick={() => handleDeleteSaved(m.fileName)}
                      >
                        <IonIcon icon={trashSharp} />
                      </IonButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </IonContent>
        </IonModal>

        {/* View Image Modal */}
        <IonModal
          isOpen={viewModalOpen}
          onDidDismiss={() => {
            setViewModalOpen(false);
            setViewImageUrl(null);
          }}
        >
          <IonHeader>
            <IonToolbar color="light">
              <IonTitle color="dark">View Image</IonTitle>
              <IonButton
                slot="end"
                onClick={() => {
                  setViewModalOpen(false);
                  setViewImageUrl(null);
                }}
              >
                Close
              </IonButton>
            </IonToolbar>
          </IonHeader>

          <IonContent
            className="ion-padding"
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            {viewImageUrl ? (
              <IonImg
                src={viewImageUrl}
                style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
              />
            ) : (
              <p>No image</p>
            )}
          </IonContent>
        </IonModal>

      </IonContent>
    </IonPage>
  );
};

export default Home;
