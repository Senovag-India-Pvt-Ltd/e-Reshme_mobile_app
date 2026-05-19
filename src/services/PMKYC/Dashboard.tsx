import React, { useState, useEffect } from 'react';
import { IonContent, IonPage, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButtons, IonHeader, IonMenuButton, IonTitle, IonToolbar, IonButton, IonIcon, IonSearchbar, IonBackButton } from '@ionic/react';
import { arrowBack, search } from 'ionicons/icons';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import './Dashboard.css';
import { API_URL_DBT_ } from '../auth.service';

const HomePage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [showSearchbar, setShowSearchbar] = useState<boolean>(false);
  const history = useHistory();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    const fetchDetails = {
      "userMasterId": localStorage.getItem("userMasterId")
    };

    const api = axios.create({
      baseURL: API_URL_DBT_,
    });

    api.post(`dbt/v1/service/getUserDashboardCount?id=${localStorage.getItem("userMasterId")}`, fetchDetails, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": '*',
        accept: "*/*",
        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
      },
    })
      .then(res => {
        console.log("API Response:", res.data);
        
        if (res.data.errorCode === 0) {
          const content = res.data.content;
          if (content.length > 0) {
            setData(content); // Set the API data directly
          }
        } else {
          console.error("API Error:", res.data.errorMessages);
        }
      })
      .catch(error => {
        console.error("API Fetch Error:", error);
      });
  };

  const handleBoxClick = (id: number) => {
    history.push(`/list/${id}`);
  };

  const handleGoBack = () => {
    history.goBack();
  };

  const filteredData = data.filter(item =>
    item.stepName.toLowerCase().includes(searchText.toLowerCase())
  );

  const boxColors = [
    '#ffffff', // White background
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton text="Back" slot="start" defaultHref="/homepage" style={{ color: '#000' }} />
            <IonMenuButton />
          </IonButtons>
          <IonTitle><b>User Dashboard</b></IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowSearchbar(!showSearchbar)}>
              <IonIcon icon={showSearchbar ? arrowBack : search} />
            </IonButton>
            {/* removed redundant Go Back button — use left Back button instead */}
          </IonButtons>
        </IonToolbar>
        {showSearchbar && (
          <IonSearchbar
            value={searchText}
            onIonChange={e => setSearchText(e.detail.value!)}
            placeholder="Search by Step Name"
          />
        )}
      </IonHeader>

      <IonContent>
        <IonGrid>
          <IonRow className="card-container">
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <IonCol size="6" key={index}>
                <IonCard 
                          onClick={() => handleBoxClick(item.approvalStageId)} 
                          className="card" 
                          style={{ 
                            background: '#ffffff',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            border: 'none'
                          }}
                        >
                          <IonCardHeader className="card-header" style={{ background: '#ffffff', color: '#000' }}>
                            <IonCardTitle className="step-name" style={{ color: '#000', fontWeight: '800' }}>{item.stepName}</IonCardTitle>
                          </IonCardHeader>
                          <IonCardContent className="card-content" style={{ background: '#ffffff', color: '#000' }}>
                            <h2 className="count" style={{ color: '#000', fontWeight: '800' }}>
                              {item.count}
                            </h2>
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
};

export default HomePage;
