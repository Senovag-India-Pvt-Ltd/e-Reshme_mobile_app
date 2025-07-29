



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

const CropSubMenuPage: React.FC = () => {
  const history = useHistory();

  // Define sub-submenus for Farmer Profile
  const cropSubMenus = [
    { id: '1', name: 'Add DFLs Info' },
    { id: '2', name: 'Update DFLs Info' },
    { id: '3', name: 'Track Cocoon Sale' },
    { id: '4', name: 'Crop Inspection' },
    { id: '5', name: 'Fitness Certificate' },
  ];

  
  // Handle click on the submenu items
  const handleSubSubMenuClick = (subSubMenuId: string) => {
    if (subSubMenuId === '1') {
      history.push('/add-dlf'); // Redirect to ProfileInfoPage
    } else if (subSubMenuId === '2') {
      history.push('/upd-dlf'); // Redirect to LandInfoPage
    }else if (subSubMenuId === '4') {
      history.push('/crp-ins'); // Redirect to LandInfoPage
    }else if (subSubMenuId === '5') {
      history.push('/fit'); // Redirect to LandInfoPage
    }else if (subSubMenuId === '3') {
      history.push('/trac'); // Redirect to LandInfoPage
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/menu" />
          </IonButtons>
          <IonTitle className="menucolor">Crop Information Submenus</IonTitle>
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

export default CropSubMenuPage;




