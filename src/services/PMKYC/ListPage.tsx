import React, { useState, useEffect } from 'react';
import { IonContent, IonPage, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonGrid, IonRow, IonHeader, IonMenuButton, IonTitle, IonToolbar, IonButton, IonIcon, IonLabel, IonButtons, IonSearchbar, IonModal } from '@ionic/react';
import axios from 'axios';
import { useParams, useHistory } from 'react-router-dom';
import { API_URL_DBT_ } from '../auth.service';
import { arrowBack, cloudUpload, personCircle, calendar, bookmark, cube, time, document, layers, wallet, albums, cash, location, pin, barcode, call, pinOutline, arrowForwardSharp, arrowForward, search } from 'ionicons/icons';
import './ListPage.css';

const ListPage: React.FC = () => {
  const history = useHistory();
  const [lists, setLists] = useState<any[]>([]);
  const [viewIndex, setViewIndex] = useState<number | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [showSearchbar, setShowSearchbar] = useState<boolean>(false);
 
  const {approvalStageId} = useParams<{approvalStageId:string}>();
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    const fetchDetails = {
      userMasterId: localStorage.getItem("userMasterId"),
      
    };

    const api = axios.create({
      baseURL: API_URL_DBT_,
    });

    api.post(`dbt/v1/service/getInProgressTaskListByUserIdAndStepId?userId=${localStorage.getItem("userMasterId")}&stepId=${approvalStageId}`, fetchDetails, {
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
      },
    })
    .then(res => {
      setLists(res.data.content);
    })
    .catch(error => {
      console.error("API Fetch Error:", error);
    });
  };

  const handleViewDetails = (index: number) => {
    setViewIndex(prevIndex => (prevIndex === index ? null : index));
  };

  const handleUploadDocumentsClick = (applicationDocumentId: number, approvalStageId: number, subSchemeId: number, financialDelegation: boolean, schemeAmount: number, designationId: number, eligibleAmount: number, designationStep: number) => {
    console.log('Navigating to DocPage with params:', { applicationDocumentId, approvalStageId, subSchemeId, financialDelegation, schemeAmount, designationId, eligibleAmount, designationStep });
    const amountToPass = eligibleAmount || schemeAmount;
    // Pass applicationFormId as well (same as applicationDocumentId)
    if (financialDelegation) {
      history.push(`/docu/${applicationDocumentId}/${approvalStageId}/${subSchemeId}?financialDelegation=true&schemeAmount=${amountToPass}&eligibleAmount=${eligibleAmount}&designationId=${designationId}&designationStep=${designationStep}&applicationFormId=${applicationDocumentId}`);
    } else {
      history.push(`/docu/${applicationDocumentId}/${approvalStageId}/${subSchemeId}?schemeAmount=${amountToPass}&eligibleAmount=${eligibleAmount}&designationId=${designationId}&designationStep=${designationStep}&applicationFormId=${applicationDocumentId}`);
    }
  };

  const handleGoBack = () => {
    history.goBack();
  };

  const filteredLists = lists.filter(item =>
    item.farmerFirstName.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle><b>List Page</b></IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowSearchbar(!showSearchbar)}>
              <IonIcon icon={showSearchbar ? arrowBack : search} />
            </IonButton>
            <IonButton onClick={handleGoBack}>
              <IonIcon icon={arrowBack} />
              Go Back
            </IonButton>
          </IonButtons>
        </IonToolbar>
        {showSearchbar && (
          <IonSearchbar
            value={searchText}
            onIonChange={e => setSearchText(e.detail.value!)}
            placeholder="Search by Farmer Name"
          />
        )}
      </IonHeader>

      <IonContent>
        <IonGrid>
          <IonRow className="card-container">
            {filteredLists.map((item, index) => (
              <IonCol size="12" key={index}>
                <IonCard className="card" >
                  <IonCardHeader>
                    <IonCardTitle><IonIcon icon={personCircle} /> <b>Farmer Name:</b> {item.farmerFirstName}</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonLabel><IonIcon icon={barcode} /> <span style={{ fontSize: '15px' }}><b>Fruits Id:</b></span>
                    {item.fruitsId}</IonLabel>
                    <IonButton expand="full" className="gradient-button" onClick={() => handleViewDetails(index)}>
                      {viewIndex === index ? "Hide" : "View"}
                    </IonButton>
                  </IonCardContent>

                  {viewIndex === index && (
                    <IonCardContent>
                      <IonLabel><IonIcon icon={document} /> <b>Application Document Id</b>: {item.applicationDocumentId}</IonLabel><br />
                      <IonLabel><IonIcon icon={call} /> <b>Mobile No:</b> {item.mobileNumber}</IonLabel><br />
                      <IonLabel><IonIcon icon={layers} /> <b>Category:</b> {item.categoryName}</IonLabel><br />
                      <IonLabel><IonIcon icon={wallet} /> <b>Head Account:</b> {item.headAccountName}</IonLabel><br />
                      <IonLabel><IonIcon icon={albums} /><b> Scheme:</b> {item.schemeName}</IonLabel><br />
                      <IonLabel><IonIcon icon={albums} /> <b>Sub Scheme:</b> {item.subSchemeName}</IonLabel><br />
                      <IonLabel><IonIcon icon={cash} /><b>Subsidy Amount:</b> {item.schemeAmount}</IonLabel><br />
                      <IonLabel><IonIcon icon={cash} /><b>Eligible Subsidy:</b> {item.eligibleAmount}</IonLabel><br />
                      {/* <IonLabel><IonIcon icon={cash} /> <b>Eligible subsidy:</b> {item.eligibleSubsidy}</IonLabel><br /> */}
                      <IonLabel><IonIcon icon={location} /> <b>District:</b> {item.districtName}</IonLabel><br />
                      <IonLabel><IonIcon icon={pin} /> <b>Taluk:</b> {item.talukName}</IonLabel><br />
                      <IonLabel><IonIcon icon={pinOutline} /> <b>TSC:</b> {item.tscName}</IonLabel><br />
                      {/* View Image Button and Modal */}
                      {item.fileName && (
                        <>
                          <IonButton color="primary" onClick={() => setViewIndex(index + 10000)}>
                            View Image
                          </IonButton>
                          {viewIndex === index + 10000 && (
                            <IonModal isOpen={true} onDidDismiss={() => setViewIndex(index)}>
                              <IonHeader>
                                <IonToolbar>
                                  <IonTitle>Image Preview</IonTitle>
                                  <IonButton slot="end" fill="clear" onClick={() => setViewIndex(index)}>
                                    Close
                                  </IonButton>
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
                                    color="secondary"
                                    href={`https://e-reshme.karnataka.gov.in/dbt/v1/service/downLoadFile?fileName=${item.fileName}`}
                                    target="_blank"
                                  >
                                    Download Image
                                  </IonButton>
                                </div>
                              </IonContent>
                            </IonModal>
                          )}
                        </>
                      )}
                      

                     

                      <IonButton
                        expand="full"
                        className="gradient-button"
                        onClick={() => handleUploadDocumentsClick(item.applicationDocumentId, item.approvalStageId, item.subSchemeId, item.financialDelegation, item.schemeAmount, item.designationId, item.eligibleAmount, item.designationStep)}
                      >
                        <IonIcon icon={arrowForward} slot="start" />
                        Proceed
                      </IonButton>
                    </IonCardContent>
                  )}
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
}

export default ListPage;

