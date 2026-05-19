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
  personOutline,
  leafOutline,
  flaskOutline,
  documentTextOutline,
  sparklesOutline,
  chevronForwardOutline,
} from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import './MenuPage.css';

type SubMenuItem = {
  id: string;
  name: string;
  icon: string;
  variant: string;
};

const MenuPage: React.FC = () => {
  const { menuId } = useParams<{ menuId: string }>();
  const history = useHistory();

  const subMenus: { [key: string]: SubMenuItem[] } = {
    '1': [
      { id: '1', name: 'Farmer Profile',           icon: personOutline,       variant: 'is-green'  },
      { id: '2', name: 'Crop Information/Tracking', icon: leafOutline,         variant: 'is-cyan'   },
      { id: '3', name: 'Mulberry Activity',        icon: sparklesOutline,     variant: 'is-violet' },
      { id: '6', name: 'Disinfectant Supply',      icon: flaskOutline,        variant: 'is-amber'  },
    ],
    '2': [
      { id: '1', name: 'Reeler Profile',                             icon: personOutline,        variant: 'is-green'  },
      { id: '2', name: 'Inspection for Issuing/Renewal Reeler Licence', icon: documentTextOutline, variant: 'is-cyan'   },
    ],
  };

  const currentSubMenus = subMenus[menuId] || [];
  const pageTitle = menuId === '1' ? 'General TSC' : 'Reeling TSC / PCT';

  const navigate = (name: string, id: string) => {
    if (name === 'Farmer Profile') history.push('/subsubmenu');
    else if (name === 'Crop Information/Tracking') history.push('/cropsub');
    else if (name === 'Reeler Profile') history.push('/reeler');
    else if (name === 'Mulberry Activity') history.push('/mul');
    else if (name === 'Disinfectant Supply') history.push('/dis-inf');
    else if (name === 'Subsidy Application') history.push('/subsidy');
    else if (name === 'Inspection for Issuing/Renewal Reeler Licence') history.push('/list');
    else history.push(`/menu/${menuId}/submenu/${id}`);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="page-toolbar">
          <IonButtons slot="start">
            <IonBackButton text="Back" defaultHref="/homepage" />
          </IonButtons>
          <IonTitle>{pageTitle}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="page-content">
        <div className="page-hero-extension" aria-hidden="true"></div>
        <div className="menu-tile-list">
          {currentSubMenus.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`menu-tile ${item.variant}`}
              onClick={() => navigate(item.name, item.id)}
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

export default MenuPage;
