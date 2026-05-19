import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonIcon,
} from '@ionic/react';
import {
  personCircleOutline,
  mapOutline,
  chevronForwardOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import './MenuPage.css';

const SubSubMenuPage: React.FC = () => {
  const history = useHistory();

  const items = [
    { id: '1', name: 'Profile Info', icon: personCircleOutline, variant: 'is-green' },
    { id: '2', name: 'Land Info',    icon: mapOutline,          variant: 'is-cyan'  },
  ];

  const handleClick = (id: string) => {
    if (id === '1') history.push('/profile-info');
    else if (id === '2') history.push('/land-info');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="page-toolbar">
          <IonButtons slot="start">
            <IonBackButton text="Back" defaultHref="/menu/1" />
          </IonButtons>
          <IonTitle>Farmer Profile</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="page-content">
        <div className="page-hero-extension" aria-hidden="true"></div>
        <div className="menu-tile-list">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`menu-tile ${item.variant}`}
              onClick={() => handleClick(item.id)}
              aria-label={item.name}
            >
              <span className="tile-icon"><IonIcon icon={item.icon} /></span>
              <span className="tile-label">{item.name}</span>
              <span className="tile-chevron"><IonIcon icon={chevronForwardOutline} /></span>
            </button>
          ))}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SubSubMenuPage;
