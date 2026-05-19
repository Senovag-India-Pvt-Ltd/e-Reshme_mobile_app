import React from 'react';
import {
  IonIcon,
} from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  home,
} from 'ionicons/icons';
import './Menu.css';

const Menu: React.FC = () => {
  const history = useHistory();
  const location = useLocation();

  // Hide menu on home page
  if (location.pathname === '/homepage') {
    return null;
  }

  return (
    <div className="bottom-home-menu">
      <button
        onClick={() => history.push('/homepage')}
        style={{
          padding: '12px 16px',
          borderRadius: '8px',
          border: 'none',
          background: 'white',
          color: '#000',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0px',
          transition: 'all 0.2s ease',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
          margin: '2px'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 -4px 12px rgba(0,0,0,0.15)')}
        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 -2px 8px rgba(0,0,0,0.1)')}
        title="Home"
      >
        <IonIcon icon={home} style={{ color: '#000', fontSize: '24px' }} />
      </button>
    </div>
  );
};

export default Menu;
