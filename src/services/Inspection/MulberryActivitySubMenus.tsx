



import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './MenuPage.css'; // Ensure you import the CSS file

const MulberrybMenuPage: React.FC = () => {
  const history = useHistory();

  // Define sub-submenus for Farmer Profile
  const cropSubMenus = [
    { id: '1', name: 'New Plantation' },
    { id: '2', name: 'Mulbery Extention' },
    { id: '3', name: 'Uprooting' },
    { id: '4', name: 'Nursery' },
   
  ];

  
  // Handle click on the submenu items
  const handleSubSubMenuClick = (subSubMenuId: string) => {
    if (subSubMenuId === '1') {
      history.push('/plan'); // Redirect to ProfileInfoPage
    } else if (subSubMenuId === '2') {
      history.push('/mul'); // Redirect to LandInfoPage
    }else if (subSubMenuId === '3') {
      history.push('/up'); // Redirect to LandInfoPage
    }else if (subSubMenuId === '4') {
      history.push('/nur'); // Redirect to LandInfoPage
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/menu" />
          </IonButtons>
          <IonTitle className="menucolor">Farmer Profile Submenus</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="menu-content"> {/* Add the menu-content class */}
        <IonGrid>
          <IonRow className="menu-row">
            {cropSubMenus.map((subMenu) => (
              <IonCol size="12" size-md="6" className="menu-col" key={subMenu.id}>
                <IonCard
                  button
                  className="menu-button" // Add the menu-button class
                  onClick={() => handleSubSubMenuClick(subMenu.id)}
                >
                  <IonCardHeader>
                    <IonCardTitle className="menu-label">{subMenu.name}</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    {/* Add any additional description or icons here if needed */}
                  </IonCardContent>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default MulberrybMenuPage;




