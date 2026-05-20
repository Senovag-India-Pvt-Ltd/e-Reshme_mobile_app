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
  arrowBack, search, arrowForward, refreshOutline,
  download, chevronDownOutline, chevronUpOutline,
} from 'ionicons/icons';
import '../Inspection/ProfileInfoPage.css';
import Menu from '../Inspection/Menu';

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
        <IonToolbar className="page-toolbar">
          <IonButtons slot="start">
            <IonBackButton text="Back" defaultHref="/dash" />
          </IonButtons>
          <IonTitle>Application List</IonTitle>
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
              placeholder="Search by Farmer Name"
              className="custom-searchbar"
            />
          </IonToolbar>
        )}
      </IonHeader>

      <IonContent className="page-content">
        <div className="page-hero-extension" aria-hidden="true"></div>

        <div className="modal-list" style={{ marginTop: -40, position: 'relative', zIndex: 2 }}>
          {filteredLists.length === 0 ? (
            <div className="no-data-hint">
              {loading ? 'Loading applications…' : 'No applications in progress.'}
            </div>
          ) : (
            filteredLists.map((item, index) => {
              const expanded = viewIndex === index;
              return (
                <div key={index} className="modal-list-card">
                  <div className="modal-list-head">
                    <div className="modal-list-fid">
                      <span className="info-label">Farmer</span>
                      <span className="modal-list-fid-value">{item.farmerFirstName || '—'}</span>
                    </div>
                    <IonButton
                      className="icon-only-btn"
                      onClick={() => handleViewDetails(index)}
                      aria-label={expanded ? 'Hide details' : 'View details'}
                    >
                      <IonIcon icon={expanded ? chevronUpOutline : chevronDownOutline} />
                    </IonButton>
                  </div>

                  <div className="modal-list-grid">
                    <div className="modal-list-row modal-list-row--full">
                      <span className="info-label">Fruits ID</span>
                      <span>{item.fruitsId || '—'}</span>
                    </div>

                    {expanded && (
                      <>
                        <div className="modal-list-row">
                          <span className="info-label">Mobile</span>
                          <span>{item.mobileNumber || '—'}</span>
                        </div>
                        <div className="modal-list-row">
                          <span className="info-label">Category</span>
                          <span>{item.categoryName || '—'}</span>
                        </div>
                        <div className="modal-list-row modal-list-row--full">
                          <span className="info-label">Head Account</span>
                          <span>{item.headAccountName || '—'}</span>
                        </div>
                        <div className="modal-list-row modal-list-row--full">
                          <span className="info-label">Scheme</span>
                          <span>{item.schemeName || '—'}</span>
                        </div>
                        <div className="modal-list-row modal-list-row--full">
                          <span className="info-label">Sub Scheme</span>
                          <span>{item.subSchemeName || '—'}</span>
                        </div>
                        <div className="modal-list-row">
                          <span className="info-label">Subsidy Amount</span>
                          <span>{item.schemeAmount || '—'}</span>
                        </div>
                        <div className="modal-list-row">
                          <span className="info-label">District</span>
                          <span>{item.districtName || '—'}</span>
                        </div>
                        <div className="modal-list-row">
                          <span className="info-label">Taluk</span>
                          <span>{item.talukName || '—'}</span>
                        </div>
                        <div className="modal-list-row">
                          <span className="info-label">TSC</span>
                          <span>{item.tscName || '—'}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {expanded && (
                    <div className="result-actions" style={{ padding: '8px 0 0' }}>
                      <IonButton
                        className="btn-result-primary is-active"
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
                    </div>
                  )}

                  {/* Image Preview Modal */}
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
                            className="btn-result-primary is-active"
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
