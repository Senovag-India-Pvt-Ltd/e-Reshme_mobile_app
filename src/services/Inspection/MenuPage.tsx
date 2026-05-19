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
  IonCol,
  IonRow,
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
      { id: '6', name: 'Disinfectant Supply' }
    ],
    '2': [
      { id: '1', name: 'Reeler Profile' },
      { id: '2', name: 'Inspection for Issuing/Renewal Reeler Licence' },
    ],
  };

  const currentSubMenus = subMenus[menuId] || [];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="submenu-toolbar">
          <IonButtons slot="start">
            <IonBackButton text="Back" slot="start" defaultHref="/homepage" style={{ color: '#000' }} />
          </IonButtons>
          <IonTitle className="menucolor" style={{ color: '#030303', backgroundColor: 'transparent' }}><b>{menuId === '1' ? 'General TSC' : 'Reeling TSC/PCT'}</b></IonTitle>
          <IonButtons slot="end">
            {/* <IonButton onClick={() => history.push('/homepage')} fill="clear" color="dark">
              <IonIcon icon={home} style={{ color: '#000', fontSize: '24px' }} />
            </IonButton> */}
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="menu-content">
        <IonGrid>
          <IonRow className="menu-row">
            {currentSubMenus.map((subMenu) => (
              <IonCol size="12" size-md="6" className="menu-col" key={subMenu.id}>
                <button
                  style={{
                    padding: '24px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'white',
                    color: '#000',
                    fontSize: '18px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    width: '100%',
                    minHeight: '100px'
                  }}
                  onClick={() => {
                    if (subMenu.name === 'Farmer Profile') {
                      history.push(`/subsubmenu`);
                    } else if (subMenu.name === 'Crop Information/Tracking') {
                      history.push(`/cropsub`);
                    } else if (subMenu.name === 'Reeler Profile') {
                      history.push(`/reeler`);
                    } else if (subMenu.name === 'Mulberry Activity') {
                      history.push(`/mul`);
                    } else if (subMenu.name === 'Disinfectant Supply') {
                      history.push(`/dis-inf`);
                    } else if (subMenu.name === 'Subsidy Application') {
                      history.push(`/subsidy`);
                    } else if (subMenu.name === 'Inspection for Issuing/Renewal Reeler Licence') {
                      history.push(`/list`);
                    } else {
                      history.push(`/menu/${menuId}/submenu/${subMenu.id}`);
                    }
                  }}
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

export default MenuPage;



