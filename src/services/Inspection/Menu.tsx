import React, { useEffect, useRef } from 'react';
import {
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonLabel,
  IonButtons,
  IonMenuButton,
  IonIcon,
} from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  personOutline,
  helpCircleOutline,
  gridSharp,
  exitSharp,
  personCircleOutline,
} from 'ionicons/icons';
import './Menu.css';

const Menu: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const menuRef = useRef<HTMLIonMenuElement>(null);
  const username = localStorage.getItem('username') || 'User'; // Replace with actual username from your authentication logic

  const menus = [
    {
      id: '1',
      name: 'General TSC',
      icon: personOutline,
      subMenus: [
        { id: '1', name: 'Farmer Profile' },
        { id: '2', name: 'Crop Information/Tracking' },
        { id: '3', name: 'Mulberry Activity' },
        { id: '4', name: 'Subsidy Application' },
        { id: '5', name: 'Target & Achievement' },
        { id: '6', name: 'Dis-Infectantant Suppy' }
      ],
    },
    {
      id: '2',
      name: 'Reeling TSC/PCT',
      icon: helpCircleOutline,
      subMenus: [
        { id: '1', name: 'Reeler Profile' },
        { id: '2', name: 'Subsidy Application' },
        { id: '3', name: 'Target & Achievement' }
      ],
    },
    {
      id: '3',
      name: 'Service DashBoard',
      icon: gridSharp,
    },
    {
      id: '4',
      name: 'Logout',
      icon: exitSharp,
    },
  ];

  const handleMenuClick = (menuId: string) => {
    if (menuId === '3') {
      window.location.href = '/dash'; // Redirect and refresh
    } else if (menuId === '4') {
      history.push('/login');
    } else {
      history.push(`/menu/${menuId}`);
    }
    if (menuRef.current) {
      menuRef.current.close();
    }
  };

  useEffect(() => {
    if (menuRef.current && location.pathname === '/homepage') {
      menuRef.current.open();
    }
  }, [location.pathname]);

  return (
    <IonMenu contentId="main" ref={menuRef}>
      <IonHeader className="menu-header">
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle className="menu-title"><b>Menu</b></IonTitle>
          <IonButtons slot="end">
            <div className="user-info">
              <IonIcon icon={personCircleOutline} />
              <IonLabel>{username}</IonLabel>
            </div>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="menu-content">
        <IonGrid>
          {menus.map((menu, index) => (
            <IonRow key={index}>
              <IonCol size="12">
                <IonItem
                  button
                  className="menu-item"
                  onClick={() => handleMenuClick(menu.id)}
                >
                  <IonIcon icon={menu.icon} slot="start" className="menu-icon" />
                  <IonLabel className="menu-label">{menu.name}</IonLabel>
                </IonItem>
              </IonCol>
            </IonRow>
          ))}
        </IonGrid>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;
