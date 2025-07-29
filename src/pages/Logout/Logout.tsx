import { IonAlert, IonButton, IonButtons, IonCol, IonContent, IonGrid, IonHeader, IonInput, IonItem, IonLabel, IonMenuButton, IonPage, IonRow, IonSegment, IonSegmentButton, IonTitle, IonToolbar } from '@ionic/react';
import { useParams } from 'react-router';
import ExploreContainer from '../../components/ExploreContainer';
import './../Logout/Logout.css';
import axios from "axios";
import { useState } from 'react';
import React, { useEffect } from 'react';
import authService from '../../services/auth.service';
import { useHistory } from 'react-router-dom';

const Logout: React.FC = () => {
  const history = useHistory();
  useEffect(() => {
    authService.logout();
    history.push("/login");
  }, []);

  return (
    <IonPage>
      
    </IonPage>
  );
};

export default Logout;
