



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
} from '@ionic/react';
import { useHistory } from 'react-router-dom';

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
            <IonBackButton text="Back" slot="start" defaultHref="/menu" style={{ color: '#000' }} />
          </IonButtons>
          <IonTitle className="menucolor">Farmer Profile Submenus</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="menu-content">
        <IonGrid>
          <IonRow className="menu-row">
            {cropSubMenus.map((subMenu) => (
              <IonCol size="12" size-md="6" className="menu-col" key={subMenu.id}>
                <button
                  style={{
                    padding: '16px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'white',
                    color: '#000',
                    fontSize: '14px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    width: '100%'
                  }}
                  onClick={() => handleSubSubMenuClick(subMenu.id)}
                >
                  {subMenu.name}
                </button>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default MulberrybMenuPage;




