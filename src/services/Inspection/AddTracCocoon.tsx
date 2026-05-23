import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  IonPage,
  IonContent,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonDatetime,
  IonAlert,
  IonIcon,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonSpinner,
  IonToast,
} from '@ionic/react';
import { API_URL_DBT, API_URL_ChowkiManagment, API_URL_Master_Data } from "../auth.service";
import { searchOutline, checkmarkCircleOutline, leafOutline, calendarOutline } from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import './ProfileInfoPage.css';

const AddTracCocoonPage: React.FC = () => {
  const [dflDetails, setDflDetails] = useState<any>({
    dispathdate: '',
    marketName: '',
    cocoonQty: '',
    ratekg: '',
    buyerType: '',
    marketMasterId: '',
    externalUser: '',
  });
  const [searchText, setSearchText] = useState<string>('');
  const [showDispatchDatePicker, setShowDispatchDatePicker] = useState(false);
  const [isReelerEnabled, setIsReelerEnabled] = useState(false);
  const [isExternalEnabled, setIsExternalEnabled] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState('');
  const [data, setData] = useState<any>(null);
  const [reelerId, setReelerId] = useState<number | null>(null);
  const { saleAndDisposalId } = useParams<{ saleAndDisposalId: string }>();
  const [reelerLoading, setReelerLoading] = useState(false);
  const [marketMasterData, setMarketMasterData] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);

  const fetchReelerDetails = () => {
    if (!searchText.trim() || reelerLoading) return;
    setReelerLoading(true);
    setData(null);
    axios
      .post(
        `${API_URL_DBT}reeler/get-reeler-details-by-fruits-id-or-reeler-license-number`,
        { text: searchText.trim() },
        {
          headers: {
            'Content-Type': 'application/json',
            accept: '*/*',
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
          },
        }
      )
      .then((res) => {
        const reelerDetails = res.data?.content?.body?.content?.[0];
        if (reelerDetails) {
          setData(reelerDetails?.name);
          setReelerId(reelerDetails?.reelerId);
          setMessage('');
          setIsError(false);
        } else {
          setMessage('Reeler not found for that ID');
          setIsError(true);
        }
      })
      .catch(() => {
        setMessage('Reeler does not exist');
        setIsError(true);
        setData(null);
      })
      .finally(() => setReelerLoading(false));
  };

  useEffect(() => {
    if (dflDetails.buyerType === 'Reeler') {
      setIsReelerEnabled(true);
      setIsExternalEnabled(false);
    } else if (dflDetails.buyerType === 'External User') {
      setIsExternalEnabled(true);
      setIsReelerEnabled(false);
    } else {
      setIsReelerEnabled(false);
      setIsExternalEnabled(false);
    }
  }, [dflDetails.buyerType]);

  const fetchMarketList = async () => {
    try {
      const response = await axios.get(`${API_URL_Master_Data}marketMaster/get-all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
        },
      });
      if (response.data && response.data.content) {
        setMarketMasterData(response.data.content.marketMaster);
      } else {
        console.error('Unexpected API response format:', response);
        setFetchError(true);
      }
    } catch (error) {
      console.error('Error fetching Market List:', error);
      setFetchError(true);
    }
  };

  useEffect(() => {
    fetchMarketList();
  }, []);

  const handleChange = (e: any, fieldName: string) => {
    const { value } = e.detail;
    if (fieldName === 'cocoonQty' || fieldName === 'ratekg') {
      if (isNaN(value)) return;
    }
    setDflDetails({ ...dflDetails, [fieldName]: value });
  };

  const handleEdit = () => {
    // Double-click guard
    if (submitting) return;
    setSubmitting(true);
    const api = axios.create({ baseURL: API_URL_ChowkiManagment });
    api
      .post(
        'cropInspection/add-sale-track-cocoon-info',
        {
          fruitsId: dflDetails.marketName,
          marketAuctionDate: dflDetails.dispathdate,
          marketMasterId: dflDetails.marketMasterId,
          cocoonsQty: dflDetails.cocoonQty,
          ratePerKg: dflDetails.ratekg,
          buyerType: dflDetails.buyerType,
          reelerId,
          saleAndDisposalId: saleAndDisposalId,
          externalUnitRegistrationName: dflDetails.externalUser,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            accept: '*/*',
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
          },
        }
      )
      .then((res) => {
        if (res.data?.error === 0) {
          setMessage('Cocoon sale added successfully!');
          setIsError(false);
          setShowSuccessToast(true);
        } else {
          setMessage('Failed to add data.');
          setIsError(true);
          setShowAlert(true);
        }
      })
      .catch((error) => {
        console.error('Error adding cocoon sale', error);
        setMessage('Error adding cocoon sale');
        setIsError(true);
        setShowAlert(true);
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="page-toolbar">
          <IonButtons slot="start">
            <IonBackButton text="Back" defaultHref="/cropsub" />
          </IonButtons>
          <IonTitle>Add Cocoon Sale</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="page-content">
        <div className="page-hero-extension" aria-hidden="true"></div>

        <div className="result-card">
          {/* Header with green leaf accent */}
          <div className="result-head">
            <div className="result-avatar is-accent-green">
              <IonIcon icon={leafOutline} />
            </div>
            <div className="result-head-text">
              <span className="result-eyebrow">New Sale Entry</span>
              <h3 className="result-title">Add Trac Cocoon</h3>
            </div>
          </div>

          {/* Editable form */}
          <div className="result-body">
            <div className="mulberry-form" style={{ paddingTop: 0 }}>
              <div className="mulberry-form-divider">
                <span>Sale Details</span>
              </div>

              <div className="details-row">
                <IonLabel>Market Date:</IonLabel>
                <div
                  onClick={() => setShowDispatchDatePicker(true)}
                  className="date-display date-display--withIcon"
                  style={{ cursor: 'pointer' }}
                >
                  <IonIcon icon={calendarOutline} />
                  {dflDetails.dispathdate
                    ? new Date(dflDetails.dispathdate).toLocaleDateString()
                    : 'Select Date'}
                </div>
                {showDispatchDatePicker && (
                  <IonModal
                    isOpen={showDispatchDatePicker}
                    onDidDismiss={() => setShowDispatchDatePicker(false)}
                  >
                    <IonDatetime
                      value={dflDetails.dispathdate || new Date().toISOString()}
                      onIonChange={(e) => {
                        handleChange(e, 'dispathdate');
                        setShowDispatchDatePicker(false);
                      }}
                      onIonCancel={() => setShowDispatchDatePicker(false)}
                    />
                    <IonButton onClick={() => setShowDispatchDatePicker(false)}>Close</IonButton>
                  </IonModal>
                )}
              </div>

              <div className="details-row">
                <IonLabel>Market Name:</IonLabel>
                {fetchError ? (
                  <p className="info-error">Failed to fetch market list. Please try again later.</p>
                ) : (
                  <IonSelect
                    value={dflDetails.marketMasterId}
                    placeholder="Select Market"
                    interface="action-sheet"
                    onIonChange={(e) => handleChange(e, 'marketMasterId')}
                  >
                    {marketMasterData?.map((market) => (
                      <IonSelectOption key={market.marketMasterId} value={market.marketMasterId}>
                        {market.marketMasterName}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                )}
              </div>

              <div className="details-row">
                <IonLabel>Cocoons Qty (kg):</IonLabel>
                <IonInput
                  type="number"
                  placeholder="e.g. 120"
                  value={dflDetails.cocoonQty}
                  onIonChange={(e) => handleChange(e, 'cocoonQty')}
                />
              </div>

              <div className="details-row">
                <IonLabel>Rate / Kg (₹):</IonLabel>
                <IonInput
                  type="number"
                  placeholder="e.g. 550"
                  value={dflDetails.ratekg}
                  onIonChange={(e) => handleChange(e, 'ratekg')}
                />
              </div>

              <div className="details-row">
                <IonLabel>Buyer Type:</IonLabel>
                <IonSelect
                  value={dflDetails.buyerType}
                  placeholder="Select Buyer Type"
                  interface="action-sheet"
                  onIonChange={(e) => handleChange(e, 'buyerType')}
                >
                  <IonSelectOption value="None">None</IonSelectOption>
                  <IonSelectOption value="Reeler">Reeler</IonSelectOption>
                  <IonSelectOption value="External User">External User</IonSelectOption>
                </IonSelect>
              </div>

              {isReelerEnabled && (
                <>
                  <div className="details-row">
                    <IonLabel>Reeler Fruits ID:</IonLabel>
                    <div className="reeler-search-row">
                      <IonInput
                        value={searchText}
                        placeholder="Enter Fruits ID / License No."
                        onIonInput={(e) => setSearchText((e.target as HTMLIonInputElement).value as string ?? '')}
                      />
                      <IonButton
                        className="btn-primary is-active"
                        onClick={fetchReelerDetails}
                        disabled={reelerLoading || !searchText.trim()}
                      >
                        {reelerLoading ? (
                          <IonSpinner name="crescent" className="btn-spinner" />
                        ) : (
                          <IonIcon icon={searchOutline} slot="icon-only" />
                        )}
                      </IonButton>
                    </div>
                  </div>

                  {data && (
                    <div className="details-row">
                      <IonLabel>Reeler Name:</IonLabel>
                      <IonInput value={data} readonly={true} />
                    </div>
                  )}
                </>
              )}

              {isExternalEnabled && (
                <div className="details-row">
                  <IonLabel>External User Name:</IonLabel>
                  <IonInput
                    value={dflDetails.externalUser || ''}
                    placeholder="Enter buyer name"
                    onIonChange={(e) => handleChange(e, 'externalUser')}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action footer */}
          <div className="result-actions">
            <IonButton
              className={`btn-result-primary ${submitting ? 'is-loading' : 'is-active'}`}
              expand="block"
              disabled={submitting}
              onClick={handleEdit}
            >
              {submitting ? (
                <>
                  <IonSpinner name="crescent" className="btn-spinner" />
                  <span style={{ marginLeft: 8 }}>Saving...</span>
                </>
              ) : (
                <>
                  <IonIcon icon={checkmarkCircleOutline} slot="start" />
                  Save
                </>
              )}
            </IonButton>
          </div>
        </div>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={isError ? 'Error' : 'Success'}
          message={message}
          buttons={['OK']}
        />

        <IonToast
          isOpen={showSuccessToast}
          onDidDismiss={() => setShowSuccessToast(false)}
          message={message || 'Saved successfully'}
          duration={2800}
          position="top"
          color="success"
          cssClass="app-toast app-toast--success"
        />
      </IonContent>
    </IonPage>
  );
};

export default AddTracCocoonPage;
