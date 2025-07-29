

import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonMenuButton,
  IonLabel,
  IonGrid,
  IonCol,
  IonRow,
  IonButton,
} from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import './MenuPage.css';

const MenuPage: React.FC = () => {
  const { menuId } = useParams<{ menuId: string }>();
  const history = useHistory();

  const subMenus: { [key: string]: { id: string; name: string }[] } = {
    "1": [
      { id: '1', name: 'Farmer Profile' },
      { id: '2', name: 'Crop Information/Tracking' },
      { id: '3', name: 'Mulberry Activity' },
      // { id: '4', name: 'Subsidy Application' },
      // { id: '5', name: 'Target & Achievement' },
      { id: '6', name: 'Disinfectant Supply' }
    ],
    '2': [
      { id: '1', name: 'Reeler Profile' },
      // { id: '2', name: 'Subsidy Application' },
       { id: '2', name: 'Inspection for Issuing/Renewal Reeler Licence' },
      // { id: '3', name: 'Target & Achievement' }
    ],
  };

  const currentSubMenus = subMenus[menuId] || [];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          
          <IonTitle className="menucolor"><b>General TSC</b></IonTitle>
          <IonButtons slot="end">
            <IonBackButton defaultHref="/" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="menu-content">
        <IonGrid>
          <IonRow className="menu-row">
            {currentSubMenus.map((subMenu) => (
              <IonCol size="12" size-md="6" className="menu-col" key={subMenu.id}>
                <IonButton
                  className="menu-button"
                  fill="clear"
                  onClick={() => {
                    // Redirect to SubSubMenuPage for Farmer Profile
                    if (subMenu.name === 'Farmer Profile') {
                      history.push(`/subsubmenu`);
                    } else if (subMenu.name === 'Crop Information/Tracking') {
                      history.push(`/cropsub`);}
                      else if (subMenu.name === 'Reeler Profile') {
                        history.push(`/reeler`);}
                        else if (subMenu.name === 'Mulberry Activity') {
                          history.push(`/mul`);}
                          else if (subMenu.name === 'Disinfectant Supply') {
                            history.push(`/dis-inf`);}
                            else if (subMenu.name === 'Subsidy Application') {
                              history.push(`/subsidy`);}
                              else if (subMenu.name === 'Inspection for Issuing/Renewal Reeler Licence') {
                                history.push(`/list`);}
                      else {
                      history.push(`/menu/${menuId}/submenu/${subMenu.id}`);
                    }
                  }}
                >
                  <IonLabel className="menu-label">{subMenu.name}</IonLabel>
                </IonButton>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default MenuPage;



