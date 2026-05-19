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
  addCircleOutline,
  createOutline,
  swapHorizontalOutline,
  checkmarkCircleOutline,
  ribbonOutline,
  chevronForwardOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import './MenuPage.css';

const CropSubMenuPage: React.FC = () => {
  const history = useHistory();

  const items = [
    { id: '1', name: 'Add DFLs Info',      icon: addCircleOutline,       variant: 'is-green',  route: '/add-dlf' },
    { id: '2', name: 'Update DFLs Info',   icon: createOutline,          variant: 'is-cyan',   route: '/upd-dlf' },
    { id: '3', name: 'Track Cocoon Sale',  icon: swapHorizontalOutline,  variant: 'is-violet', route: '/trac' },
    { id: '4', name: 'Crop Inspection',    icon: checkmarkCircleOutline, variant: 'is-amber',  route: '/crp-ins' },
    { id: '5', name: 'Fitness Certificate', icon: ribbonOutline,          variant: 'is-indigo', route: '/fit' },
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="page-toolbar">
          <IonButtons slot="start">
            <IonBackButton text="Back" defaultHref="/menu/1" />
          </IonButtons>
          <IonTitle>Crop Information</IonTitle>
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
              onClick={() => history.push(item.route)}
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

export default CropSubMenuPage;
