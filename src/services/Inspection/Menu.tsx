import React from 'react';
import { IonIcon } from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import { homeOutline } from 'ionicons/icons';

const Menu: React.FC = () => {
  const history = useHistory();
  const location = useLocation();

  if (location.pathname === '/homepage' || location.pathname === '/login' || location.pathname === '/') {
    return null;
  }

  return (
    <div className="bottom-home-menu">
      <button
        type="button"
        className="home-fab-btn"
        onClick={() => history.push('/homepage')}
        aria-label="Home"
        title="Home"
      >
        <IonIcon icon={homeOutline} />
      </button>
    </div>
  );
};

export default Menu;
