import React, { useState, useEffect } from 'react';
import { IonContent, IonPage, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonGrid, IonRow, IonHeader, IonMenuButton, IonTitle, IonToolbar, IonButton, IonIcon, IonLabel, IonButtons, IonSearchbar, IonBackButton } from '@ionic/react';
import axios from 'axios';
import { useParams, useHistory } from 'react-router-dom';
import { API_URL_DBT } from '../auth.service';
import { arrowBack, search, personCircle, calendar, bookmark, cube, time, document, layers, wallet, albums, cash, location, pin, barcode, call, pinOutline, arrowForwardSharp, arrowForward } from 'ionicons/icons';
import './ReelerListPage.css';

const ReelerListPage: React.FC = () => {
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
    const api = axios.create({
      baseURL: API_URL_DBT,
    });

    api.get('reeler/get-reeler-details-by-assigned-inspect', {
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
      },
    })
    .then(res => {
      setLists(res.data);
    })
    .catch(error => {
      console.error("API Fetch Error:", error);
    });
  };

  const handleViewDetails = (index: number) => {
    setViewIndex(prevIndex => (prevIndex === index ? null : index));
  };

  const handleUploadDocumentsClick = (reelerId: number, approvalStageId: number, subSchemeId: number) => {
    history.push(`/doc/${reelerId}`);
  };

  
  const filteredLists = lists.filter(item =>
    item.name.toLowerCase().includes(searchText.toLowerCase()) ||
    item.fruitsId.toLowerCase().includes(searchText.toLowerCase()) ||
    item.mobileNumber.includes(searchText) ||
    item.reelerLicenseNumber.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton text="Back" defaultHref="/list" style={{ color: '#000' }} />
          </IonButtons>

          <IonTitle style={{ color: '#000000' }}><b>List Page</b></IonTitle>
          <IonButtons slot="end">
            <IonButton style={{ '--background': '#ffffff', '--color': '#000000', color: '#000000', backgroundColor: '#ffffff' } as any} onClick={() => setShowSearchbar(!showSearchbar)}>
              <IonIcon icon={showSearchbar ? arrowBack : search} />
            </IonButton>
            <IonMenuButton />
          </IonButtons>
        </IonToolbar>
        {showSearchbar && (
          <IonSearchbar
            value={searchText}
            onIonChange={e => setSearchText(e.detail.value!)}
            placeholder="Search by Name, FID, Mobile, License"
          />
        )}
      </IonHeader>

      <IonContent style={{ '--padding-bottom': '130px' } as any}>
        <IonGrid>
          <IonRow className="card-container">
            {filteredLists.length > 0 ? (
              filteredLists.map((item, index) => (
                <IonCol size="12" key={index}>
                  <IonCard className="card" >
                    <IonCardHeader style={{ '--background': '#ffffff', backgroundColor: '#ffffff' } as any}>
                      <IonCardTitle style={{ color: '#000000', '--background': '#ffffff', backgroundColor: '#ffffff' } as any}><IonIcon icon={personCircle} /> <b>Reeler Name:</b> {item.name}</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <IonLabel><IonIcon icon={barcode} /> <span style={{ fontSize: '15px' }}><b>FID:</b></span> {item.fruitsId}</IonLabel><br />
                      <IonLabel><IonIcon icon={call} /> <b>Mobile No:</b> {item.mobileNumber}</IonLabel><br />
                      <IonLabel><IonIcon icon={document} /> <b>Reeler License Number:</b> {item.reelerLicenseNumber}</IonLabel><br />
                      <IonLabel><IonIcon icon={location} /> <b>Reeler Address:</b> {item.address}</IonLabel><br />
                    </IonCardContent>
                      <IonCardContent>
                        <IonButton
                          style={{ '--background': '#ffffff', '--color': '#000000', color: '#000000', backgroundColor: '#ffffff' } as any}
                          expand="full"
                          className="gradient-button"
                          onClick={() => handleUploadDocumentsClick(item.reelerId, item.approvalStageId, item.subSchemeId)}
                        >
                          <IonIcon icon={arrowForward} slot="start" />
                          Proceed
                        </IonButton>
                      </IonCardContent>
                  </IonCard>
                </IonCol>
              ))
            ) : (
              <IonCol size="12">
                <center><h2><b>No data available</b></h2></center>
              </IonCol>
            )}
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
}

export default ReelerListPage;
