import React, { useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonImg, IonButton, IonIcon,
  IonModal, IonToast
} from '@ionic/react';
import './Home.css';
import {
  cloudDownloadOutline, images, trashSharp, logOutOutline,
  leafOutline, cogOutline, gridOutline
} from 'ionicons/icons';
import {
  saveImageWithLocation, getSavedImages, readImageDataUrl,
  deleteImage, SavedImageMeta
} from '../imageStorage';
import { useHistory } from 'react-router-dom';

const Home: React.FC = () => {
  const history = useHistory();
  const username = localStorage.getItem('username') || 'User';
  const firstLetter = (username[0] || 'U').toUpperCase();

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
    <IonPage className="home-page">
      <IonContent fullscreen>
        <div className="home-bg">
          <span className="orb orb-1" aria-hidden="true"></span>
          <span className="orb orb-2" aria-hidden="true"></span>

          {/* ---------- Top bar ---------- */}
          <div className="home-topbar">
            <div className="brand-mark">
              <img src="/assets/images/kg_logo.png" alt="Sericulture" />
              <div className="brand-mark-text">
                <span className="brand-mark-title">Sericulture</span>
                <span className="brand-mark-sub">GoK</span>
              </div>
            </div>

            <button type="button" className="user-chip" aria-label="User">
              <span className="avatar">{firstLetter}</span>
              <span className="user-meta">
                <span className="user-label">Welcome</span>
                <span className="user-name">{username}</span>
              </span>
            </button>
          </div>

          {/* ---------- Hero greeting ---------- */}
          <div className="home-hero">
            <h1 className="greeting-title">Hello, {username}</h1>
            <p className="greeting-sub">Department of Sericulture · Government of Karnataka</p>
          </div>

          {/* ---------- Section title ---------- */}
          <div className="section-title">
            <span>Quick Actions</span>
          </div>

          {/* ---------- Action grid ---------- */}
          <div className="action-grid">
            <button
              type="button"
              className="action-card is-green"
              onClick={() => history.push('/menu/1')}
              aria-label="General TSC"
            >
              <span className="action-icon"><IonIcon icon={leafOutline} /></span>
              <span className="action-label">General TSC</span>
            </button>

            <button
              type="button"
              className="action-card is-cyan"
              onClick={() => history.push('/menu/2')}
              aria-label="Reeling TSC"
            >
              <span className="action-icon"><IonIcon icon={cogOutline} /></span>
              <span className="action-label">Reeling TSC</span>
            </button>

            <button
              type="button"
              className="action-card is-violet"
              onClick={handleCaptureClick}
              aria-label="Capture"
            >
              <span className="action-icon"><IonIcon icon={cloudDownloadOutline} /></span>
              <span className="action-label">Capture</span>
            </button>

            <button
              type="button"
              className="action-card is-amber"
              onClick={openSavedImages}
              aria-label="Saved Images"
            >
              <span className="action-icon"><IonIcon icon={images} /></span>
              <span className="action-label">Saved Images</span>
            </button>

            <button
              type="button"
              className="action-card is-indigo"
              onClick={() => window.location.href = '/dash'}
              aria-label="Dashboard"
            >
              <span className="action-icon"><IonIcon icon={gridOutline} /></span>
              <span className="action-label">Dashboard</span>
            </button>

            <button
              type="button"
              className="action-card is-rose"
              onClick={() => {
                localStorage.clear();
                history.push('/login');
              }}
              aria-label="Logout"
            >
              <span className="action-icon"><IonIcon icon={logOutOutline} /></span>
              <span className="action-label">Logout</span>
            </button>
          </div>
        </div>

        {/* Toast */}
        <IonToast
          isOpen={toastOpen}
          onDidDismiss={() => setToastOpen(false)}
          message={toastMsg}
          duration={2500}
          position="top"
        />

        {/* Saved Images Modal */}
        <IonModal isOpen={showSavedModal} onDidDismiss={() => setShowSavedModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Saved Images</IonTitle>
              <IonButton slot="end" fill="clear" onClick={() => setShowSavedModal(false)}>
                Close
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            {savedImages.length === 0 ? (
              <p className="no-images-message">No saved images yet</p>
            ) : (
              <div className="images-grid">
                {savedImages.map((m) => (
                  <div key={m.fileName} className="image-card">
                    {imageDataUrls[m.fileName] ? (
                      <IonImg
                        src={imageDataUrls[m.fileName]}
                        onClick={() => {
                          const url = imageDataUrls[m.fileName];
                          setViewImageUrl(url);
                          setViewModalOpen(true);
                        }}
                      />
                    ) : (
                      <div className="image-card-empty">📷</div>
                    )}
                    <div className="image-card-actions">
                      <IonButton
                        title="Delete"
                        size="small"
                        fill="clear"
                        color="danger"
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
            <IonToolbar>
              <IonTitle>View Image</IonTitle>
              <IonButton
                slot="end"
                fill="clear"
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
