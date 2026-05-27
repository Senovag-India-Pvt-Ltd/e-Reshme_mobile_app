import React, { useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonImg, IonButton, IonButtons, IonIcon,
  IonModal, IonToast, useIonViewWillEnter
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
  // IonRouterOutlet caches pages in memory, so reading localStorage at module
  // evaluation captured the OLD/empty value before the user logged in. Use
  // state + useIonViewWillEnter so the username refreshes every time the page
  // becomes active — works after login, after a re-login, and after logout.
  const [username, setUsername] = useState<string>(() => localStorage.getItem('username') || 'User');
  const firstLetter = (username[0] || 'U').toUpperCase();

  useIonViewWillEnter(() => {
    const fresh = localStorage.getItem('username') || 'User';
    setUsername(fresh);
  });

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
                <span className="brand-mark-title">DOS</span>
                <span className="brand-mark-sub">GOK</span>
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
            <IonToolbar className="saved-images-toolbar">
              <IonTitle>Saved Images</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowSavedModal(false)}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="saved-images-content">
            {savedImages.length === 0 ? (
              <div className="saved-images-empty">
                <IonIcon icon={images} />
                <h3>No saved images yet</h3>
                <p>Captured photos will appear here.</p>
              </div>
            ) : (
              <>
                <div className="saved-images-count">
                  {savedImages.length} {savedImages.length === 1 ? 'image' : 'images'} stored on this device
                </div>
                <div className="images-grid">
                  {savedImages.map((m) => (
                    <div key={m.fileName} className="image-card">
                      <button
                        type="button"
                        className="image-card-thumb"
                        onClick={() => {
                          const url = imageDataUrls[m.fileName];
                          if (url) {
                            setViewImageUrl(url);
                            setViewModalOpen(true);
                          }
                        }}
                      >
                        {imageDataUrls[m.fileName] ? (
                          <img src={imageDataUrls[m.fileName]} alt="" />
                        ) : (
                          <span className="image-card-empty">
                            <IonIcon icon={images} />
                          </span>
                        )}
                        {/* Floating delete chip — sits on the image so the card stays tight */}
                        <span
                          role="button"
                          aria-label="Delete image"
                          className="image-card-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSaved(m.fileName);
                          }}
                        >
                          <IonIcon icon={trashSharp} />
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              </>
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
