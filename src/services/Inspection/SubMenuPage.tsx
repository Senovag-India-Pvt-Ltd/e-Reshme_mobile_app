import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonMenuButton } from '@ionic/react';
import { useParams } from 'react-router-dom';
import './SubMenuPage.css';

const SubMenuPage: React.FC = () => {
  const { menuId, submenuId } = useParams<{ menuId: string, submenuId: string }>();

  return (
    <IonPage>
      <IonHeader >
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle className="menucolor"><b>Menu {menuId} - Sub Menu {submenuId}</b></IonTitle>
          <IonButtons slot="end">
            <IonBackButton text="Back" slot="start" defaultHref={`/menu/${menuId}`} style={{ color: '#000' }} />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="subpage-content ion-padding">
        <p className="subpage-text">Content of Menu {menuId} - Sub Menu {submenuId}</p>
      </IonContent>
    </IonPage>
  );
};

export default SubMenuPage;
