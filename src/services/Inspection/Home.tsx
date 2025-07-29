import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonRow, IonCol, IonImg, IonButtons, IonMenuButton, IonButton, IonIcon, IonLabel, useIonRouter } from '@ionic/react';
import './Home.css';
import { personCircleOutline } from 'ionicons/icons';

const Home: React.FC = () => {
  const router = useIonRouter();
  const username = localStorage.getItem('username') || 'User'; // Replace with actual username from your authentication logic

  const handleBack = () => {
    // Navigate back
    router.back();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle className="header-title">
            <b>Home</b>
          </IonTitle>
          <IonButtons slot="end">
            <div className="user-info">
              <IonIcon icon={personCircleOutline} />
              <IonLabel>{username}</IonLabel>
            </div>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="background">
        <div className="trapezoid"></div>
        <IonRow className="ion-padding">
          <IonCol>
            <div className="container">
              <div className="image-container">
                <IonImg
                  className="logo-round"
                  src="/assets/images/kg_logo.png"
                  alt="Department of Sericulture"
                />
              </div>
            </div>
            <div className="text-container">
              <h2 className="sericulture-text"><b>Department of Sericulture</b></h2>
              <h2 className="karnataka-text" style={{ marginTop: '-10px' }}><b>Government of Karnataka</b></h2>
            </div>
          </IonCol>
        </IonRow>
      </IonContent>
    </IonPage>
  );
};

export default Home;
