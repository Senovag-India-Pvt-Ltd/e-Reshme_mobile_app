import React, { useState, useEffect } from 'react';
import { IonContent, IonPage, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButtons, IonHeader, IonMenuButton, IonTitle, IonToolbar, IonButton, IonIcon, IonSearchbar, IonBackButton } from '@ionic/react';
import { search, close, fileTrayStackedOutline, documentTextOutline, checkmarkDoneOutline, clipboardOutline, ribbonOutline, leafOutline, walletOutline, shieldCheckmarkOutline, hourglassOutline, briefcaseOutline } from 'ionicons/icons';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import './Dashboard.css';
import { API_URL_DBT_ } from '../auth.service';

const CARD_THEMES = [
  { color: '#6366f1', soft: 'rgba(99, 102, 241, 0.12)',  gradient: 'linear-gradient(90deg, #6366f1, #8b5cf6)', icon: clipboardOutline },
  { color: '#ec4899', soft: 'rgba(236, 72, 153, 0.12)',  gradient: 'linear-gradient(90deg, #ec4899, #f43f5e)', icon: ribbonOutline },
  { color: '#0ea5e9', soft: 'rgba(14, 165, 233, 0.12)',  gradient: 'linear-gradient(90deg, #0ea5e9, #06b6d4)', icon: documentTextOutline },
  { color: '#10b981', soft: 'rgba(16, 185, 129, 0.12)',  gradient: 'linear-gradient(90deg, #10b981, #22c55e)', icon: checkmarkDoneOutline },
  { color: '#f59e0b', soft: 'rgba(245, 158, 11, 0.12)',  gradient: 'linear-gradient(90deg, #f59e0b, #f97316)', icon: hourglassOutline },
  { color: '#ef4444', soft: 'rgba(239, 68, 68, 0.12)',   gradient: 'linear-gradient(90deg, #ef4444, #f87171)', icon: shieldCheckmarkOutline },
  { color: '#8b5cf6', soft: 'rgba(139, 92, 246, 0.12)',  gradient: 'linear-gradient(90deg, #8b5cf6, #a855f7)', icon: briefcaseOutline },
  { color: '#14b8a6', soft: 'rgba(20, 184, 166, 0.12)',  gradient: 'linear-gradient(90deg, #14b8a6, #2dd4bf)', icon: leafOutline },
  { color: '#3b82f6', soft: 'rgba(59, 130, 246, 0.12)',  gradient: 'linear-gradient(90deg, #3b82f6, #6366f1)', icon: walletOutline },
];

const HomePage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [showSearchbar, setShowSearchbar] = useState<boolean>(false);
  const history = useHistory();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    const fetchDetails = {
      "userMasterId": localStorage.getItem("userMasterId")
    };

    const api = axios.create({
      baseURL: API_URL_DBT_,
    });

    api.post(`dbt/v1/service/getUserDashboardCount?id=${localStorage.getItem("userMasterId")}`, fetchDetails, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": '*',
        accept: "*/*",
        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
      },
    })
      .then(res => {
        if (res.data.errorCode === 0) {
          const content = res.data.content;
          if (content.length > 0) {
            setData(content);
          }
        } else {
          console.error("API Error:", res.data.errorMessages);
        }
      })
      .catch(error => {
        console.error("API Fetch Error:", error);
      });
  };

  const handleBoxClick = (id: number) => {
    history.push(`/list/${id}`);
  };

  const filteredData = data.filter(item =>
    item.stepName.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="dashboard-toolbar">
          <IonButtons slot="start">
            <IonBackButton text="" defaultHref="/homepage" />
            <IonMenuButton />
          </IonButtons>
          <IonTitle className="dashboard-title">User Dashboard</IonTitle>
          <IonButtons slot="end">
            <IonButton className="search-toggle-btn" onClick={() => setShowSearchbar(!showSearchbar)}>
              <IonIcon slot="icon-only" icon={showSearchbar ? close : search} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
        {showSearchbar && (
          <IonSearchbar
            className="dashboard-searchbar"
            value={searchText}
            onIonChange={e => setSearchText(e.detail.value!)}
            placeholder="Search by step name"
            animated
          />
        )}
      </IonHeader>

      <IonContent className="dashboard-content">
        <IonGrid className="dashboard-grid">
          <IonRow className="card-container">
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => {
                const theme = CARD_THEMES[index % CARD_THEMES.length];
                const cardStyle: React.CSSProperties = {
                  // @ts-ignore — custom CSS vars
                  '--accent-color': theme.color,
                  '--accent-soft': theme.soft,
                  '--accent-gradient': theme.gradient,
                };
                return (
                  <IonCol size="6" key={index}>
                    <IonCard
                      onClick={() => handleBoxClick(item.approvalStageId)}
                      className="modern-card"
                      style={cardStyle}
                    >
                      <div className="card-icon-badge">
                        <IonIcon icon={theme.icon} />
                      </div>
                      <IonCardHeader className="card-header">
                        <IonCardTitle className="step-name">{item.stepName}</IonCardTitle>
                      </IonCardHeader>
                      <IonCardContent className="card-content">
                        <span className="count-label">Pending</span>
                        <h2 className="count">{item.count}</h2>
                      </IonCardContent>
                    </IonCard>
                  </IonCol>
                );
              })
            ) : (
              <IonCol size="12">
                <div className="empty-state">
                  <IonIcon icon={fileTrayStackedOutline} />
                  <h2>No data available</h2>
                  <p>There are no items to display right now.</p>
                </div>
              </IonCol>
            )}
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default HomePage;
