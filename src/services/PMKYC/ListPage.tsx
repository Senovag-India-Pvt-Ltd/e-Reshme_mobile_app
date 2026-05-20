import React, { useState, useEffect } from 'react';
import {
  IonContent, IonPage, IonHeader, IonTitle, IonToolbar,
  IonButton, IonIcon, IonButtons, IonSearchbar, IonModal,
  useIonViewWillEnter, IonBackButton,
} from '@ionic/react';
import axios from 'axios';
import { useParams, useHistory } from 'react-router-dom';
import { API_URL_DBT_ } from '../auth.service';
import {
  close, search, arrowForward, refreshOutline,
  download, chevronDownOutline, chevronUpOutline,
  peopleOutline,
} from 'ionicons/icons';
import '../Inspection/ProfileInfoPage.css';
import './ListPage.css';
import Menu from '../Inspection/Menu';

const getInitials = (name: string) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '?';
};

const ListPage: React.FC = () => {
  const history = useHistory();
  const [lists, setLists] = useState<any[]>([]);
  const [viewIndex, setViewIndex] = useState<number | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [showSearchbar, setShowSearchbar] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const { approvalStageId } = useParams<{ approvalStageId: string }>();

  useEffect(() => {
    fetchData();
  }, []);

  useIonViewWillEnter(() => {
    fetchData();
  });

  const fetchData = () => {
    setLoading(true);
    const fetchDetails = {
      userMasterId: localStorage.getItem('userMasterId'),
    };

    const api = axios.create({ baseURL: API_URL_DBT_ });

    api
      .post(
        `dbt/v1/service/getInProgressTaskListByUserIdAndStepId?userId=${localStorage.getItem('userMasterId')}&stepId=${approvalStageId}`,
        fetchDetails,
        {
          headers: {
            'Content-Type': 'application/json',
            accept: '*/*',
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
          },
        },
      )
      .then((res) => {
        setLists(res.data.content || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('API Fetch Error:', error);
        setLoading(false);
      });
  };

  const handleViewDetails = (index: number) => {
    setViewIndex((prev) => (prev === index ? null : index));
  };

  const handleUploadDocumentsClick = (
    applicationDocumentId: number,
    approvalStageId: number,
    subSchemeId: number,
    financialDelegation: boolean,
    schemeAmount: number,
    designationId: number,
    eligibleAmount: number,
    designationStep: number,
  ) => {
    const amountToPass = eligibleAmount || schemeAmount;
    if (financialDelegation) {
      history.push(
        `/docu/${applicationDocumentId}/${approvalStageId}/${subSchemeId}?financialDelegation=true&schemeAmount=${amountToPass}&eligibleAmount=${eligibleAmount}&designationId=${designationId}&designationStep=${designationStep}&applicationFormId=${applicationDocumentId}`,
      );
    } else {
      history.push(
        `/docu/${applicationDocumentId}/${approvalStageId}/${subSchemeId}?schemeAmount=${amountToPass}&eligibleAmount=${eligibleAmount}&designationId=${designationId}&designationStep=${designationStep}&applicationFormId=${applicationDocumentId}`,
      );
    }
  };

  const filteredLists = lists.filter((item) =>
    (item.farmerFirstName || '').toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="listpage-toolbar">
          <IonButtons slot="start">
            <IonBackButton text="" defaultHref="/dash" />
          </IonButtons>
          <IonTitle>Application List</IonTitle>
          <IonButtons slot="end">
            <IonButton
              className="listpage-action-btn"
              onClick={fetchData}
              aria-label="Refresh"
              disabled={loading}
            >
              <IonIcon slot="icon-only" icon={refreshOutline} />
            </IonButton>
            <IonButton
              className="listpage-action-btn"
              onClick={() => setShowSearchbar(!showSearchbar)}
              aria-label="Search"
            >
              <IonIcon slot="icon-only" icon={showSearchbar ? close : search} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
        {showSearchbar && (
          <IonSearchbar
            value={searchText}
            onIonInput={(e) => setSearchText(e.detail.value!)}
            placeholder="Search by farmer name"
            className="listpage-searchbar"
            animated
          />
        )}
      </IonHeader>

      <IonContent className="listpage-content">
        <div className="listpage-hero" aria-hidden="true"></div>

        <div className="listpage-list">
          {filteredLists.length === 0 ? (
            <div className="listpage-empty">
              <div className="listpage-empty-icon">
                <IonIcon icon={loading ? refreshOutline : peopleOutline} />
              </div>
              <h3>{loading ? 'Loading applications…' : 'No applications'}</h3>
              <p>
                {loading
                  ? 'Please wait while we fetch the latest data.'
                  : 'There are no applications in progress right now.'}
              </p>
            </div>
          ) : (
            filteredLists.map((item, index) => {
              const expanded = viewIndex === index;
              const fullName = item.farmerFirstName || '—';
              return (
                <div key={index} className="listpage-card">
                  <div className="listpage-card-head">
                    <div className="listpage-avatar">{getInitials(fullName)}</div>
                    <div className="listpage-name-block">
                      <span className="listpage-tag">Farmer</span>
                      <h3 className="listpage-name">{fullName}</h3>
                    </div>
                    <IonButton
                      className="listpage-expand-btn"
                      onClick={() => handleViewDetails(index)}
                      aria-label={expanded ? 'Hide details' : 'View details'}
                    >
                      <IonIcon slot="icon-only" icon={expanded ? chevronUpOutline : chevronDownOutline} />
                    </IonButton>
                  </div>

                  <div className="listpage-info-grid">
                    <div className="listpage-row listpage-row--full listpage-row--fid">
                      <span className="listpage-row-label">Fruits ID</span>
                      <span className="listpage-row-value">{item.fruitsId || '—'}</span>
                    </div>

                    {expanded && (
                      <>
                        <div className="listpage-row">
                          <span className="listpage-row-label">Mobile</span>
                          <span className="listpage-row-value">{item.mobileNumber || '—'}</span>
                        </div>
                        <div className="listpage-row">
                          <span className="listpage-row-label">Category</span>
                          <span className="listpage-row-value">{item.categoryName || '—'}</span>
                        </div>
                        <div className="listpage-row listpage-row--full">
                          <span className="listpage-row-label">Head Account</span>
                          <span className="listpage-row-value">{item.headAccountName || '—'}</span>
                        </div>
                        <div className="listpage-row listpage-row--full">
                          <span className="listpage-row-label">Scheme</span>
                          <span className="listpage-row-value">{item.schemeName || '—'}</span>
                        </div>
                        <div className="listpage-row listpage-row--full">
                          <span className="listpage-row-label">Sub Scheme</span>
                          <span className="listpage-row-value">{item.subSchemeName || '—'}</span>
                        </div>
                        <div className="listpage-row">
                          <span className="listpage-row-label">Subsidy Amount</span>
                          <span className="listpage-row-value is-amount">
                            {item.schemeAmount ? `₹${item.schemeAmount}` : '—'}
                          </span>
                        </div>
                        <div className="listpage-row">
                          <span className="listpage-row-label">District</span>
                          <span className="listpage-row-value">{item.districtName || '—'}</span>
                        </div>
                        <div className="listpage-row">
                          <span className="listpage-row-label">Taluk</span>
                          <span className="listpage-row-value">{item.talukName || '—'}</span>
                        </div>
                        <div className="listpage-row">
                          <span className="listpage-row-label">TSC</span>
                          <span className="listpage-row-value">{item.tscName || '—'}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {expanded && (
                    <IonButton
                      className="listpage-proceed"
                      expand="block"
                      onClick={() =>
                        handleUploadDocumentsClick(
                          item.applicationDocumentId,
                          item.approvalStageId,
                          item.subSchemeId,
                          item.financialDelegation,
                          item.schemeAmount,
                          item.designationId,
                          item.eligibleAmount,
                          item.designationStep,
                        )
                      }
                    >
                      <IonIcon icon={arrowForward} slot="start" /> Proceed
                    </IonButton>
                  )}

                  {item.fileName && viewIndex === index + 10000 && (
                    <IonModal isOpen={true} onDidDismiss={() => setViewIndex(index)}>
                      <IonHeader>
                        <IonToolbar>
                          <IonTitle>Image Preview</IonTitle>
                          <IonButtons slot="end">
                            <IonButton fill="clear" onClick={() => setViewIndex(index)}>
                              Close
                            </IonButton>
                          </IonButtons>
                        </IonToolbar>
                      </IonHeader>
                      <IonContent>
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                          <img
                            src={`https://e-reshme.karnataka.gov.in/dbt/v1/service/downLoadFile?fileName=${item.fileName}`}
                            alt="Preview"
                            style={{ maxWidth: '100%', maxHeight: '70vh' }}
                          />
                          <br />
                          <IonButton
                            href={`https://e-reshme.karnataka.gov.in/dbt/v1/service/downLoadFile?fileName=${item.fileName}`}
                            target="_blank"
                            className="listpage-proceed"
                            style={{ marginTop: 12 }}
                          >
                            <IonIcon icon={download} slot="start" /> Download Image
                          </IonButton>
                        </div>
                      </IonContent>
                    </IonModal>
                  )}
                </div>
              );
            })
          )}
        </div>
      </IonContent>
      <Menu />
    </IonPage>
  );
};

export default ListPage;
