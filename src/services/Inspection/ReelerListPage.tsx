import React, { useState, useEffect } from 'react';
import {
  IonContent, IonPage, IonHeader, IonTitle, IonToolbar,
  IonButton, IonIcon, IonButtons, IonSearchbar, IonBackButton,
} from '@ionic/react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { API_URL_DBT } from '../auth.service';
import {
  arrowBack, search, arrowForward, refreshOutline,
} from 'ionicons/icons';
import './ProfileInfoPage.css';

const ReelerListPage: React.FC = () => {
  const history = useHistory();
  const [lists, setLists] = useState<any[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [showSearchbar, setShowSearchbar] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    const api = axios.create({ baseURL: API_URL_DBT });

    api
      .get('reeler/get-reeler-details-by-assigned-inspect', {
        headers: {
          accept: '*/*',
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
        },
      })
      .then((res) => {
        setLists(res.data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('API Fetch Error:', error);
        setLoading(false);
      });
  };

  const handleUploadDocumentsClick = (reelerId: number) => {
    history.push(`/doc/${reelerId}`);
  };

  const filteredLists = lists.filter(
    (item) =>
      (item.name || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (item.fruitsId || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (item.mobileNumber || '').includes(searchText) ||
      (item.reelerLicenseNumber || '').toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="page-toolbar">
          <IonButtons slot="start">
            <IonBackButton text="Back" defaultHref="/menu/2" />
          </IonButtons>
          <IonTitle>Reeler List</IonTitle>
          <IonButtons slot="end">
            <IonButton
              fill="clear"
              onClick={fetchData}
              aria-label="Refresh"
              disabled={loading}
            >
              <IonIcon icon={refreshOutline} />
            </IonButton>
            <IonButton
              fill="clear"
              onClick={() => setShowSearchbar(!showSearchbar)}
              aria-label="Search"
            >
              <IonIcon icon={showSearchbar ? arrowBack : search} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
        {showSearchbar && (
          <IonToolbar>
            <IonSearchbar
              value={searchText}
              onIonInput={(e) => setSearchText(e.detail.value!)}
              placeholder="Search by Name, FID, Mobile, License"
              className="custom-searchbar"
            />
          </IonToolbar>
        )}
      </IonHeader>

      <IonContent className="page-content">
        <div className="page-hero-extension" aria-hidden="true"></div>

        <div className="modal-list" style={{ marginTop: -40, position: 'relative', zIndex: 2 }}>
          {filteredLists.length > 0 ? (
            filteredLists.map((item, index) => (
              <div
                key={index}
                className="modal-list-card"
                onClick={() => handleUploadDocumentsClick(item.reelerId)}
                style={{ cursor: 'pointer' }}
              >
                <div className="modal-list-head">
                  <div className="modal-list-fid">
                    <span className="info-label">Reeler</span>
                    <span className="modal-list-fid-value">{item.name || '—'}</span>
                  </div>
                  <IonButton
                    className="icon-only-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUploadDocumentsClick(item.reelerId);
                    }}
                    aria-label="Open"
                  >
                    <IonIcon icon={arrowForward} />
                  </IonButton>
                </div>
                <div className="modal-list-grid">
                  <div className="modal-list-row">
                    <span className="info-label">Fruits ID</span>
                    <span>{item.fruitsId || '—'}</span>
                  </div>
                  <div className="modal-list-row">
                    <span className="info-label">Mobile</span>
                    <span>{item.mobileNumber || '—'}</span>
                  </div>
                  <div className="modal-list-row modal-list-row--full">
                    <span className="info-label">License Number</span>
                    <span>{item.reelerLicenseNumber || '—'}</span>
                  </div>
                  <div className="modal-list-row modal-list-row--full">
                    <span className="info-label">Address</span>
                    <span>{item.address || '—'}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-data-hint">
              {loading ? 'Loading reelers…' : 'No reelers assigned for inspection.'}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ReelerListPage;
