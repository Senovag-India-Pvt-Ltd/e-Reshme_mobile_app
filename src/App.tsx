import React, { useEffect } from 'react';
import { IonApp, IonRouterOutlet, IonSplitPane, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';


import AddDlfPage from './services/Inspection/AddDlfPage';
import CropSubMenuPage from './services/Inspection/CropsubMenuPage';
import LandInfoPage from './services/Inspection/LandInfoPage';
import MenuPage from './services/Inspection/MenuPage';
import ProfileInfoPage from './services/Inspection/ProfileInfoPage';
import ReelerInfoPage from './services/Inspection/ReelerProfile';
import SubMenuPage from './services/Inspection/SubMenuPage';
import SubSubMenuPage from './services/Inspection/SubSubMenuPage';
import UpdateDlfPage from './services/Inspection/UpdateDlfPage';
import Menu from './services/Inspection/Menu';
import Home from './services/Inspection/Home';
import Login from './pages/Auth/Login';
import CropInspectionPage from './services/Inspection/CropInspection';
import FitnessPage from './services/Inspection/FitnessCert';
import MulberryPage from './services/Inspection/MulberryPage';

import MulberryActivitySubMenus from './services/Inspection/MulberryActivitySubMenus';

import AddDetails from './services/Inspection/AddDetails';
import InspectionDetails from './services/Inspection/InspectionDetails';
import DisinfectantPage from './services/Inspection/DisInfectantPage';
import TracCocoonPage from './services/Inspection/TrackCocoonSale';
import AddTracCocoonPage from './services/Inspection/AddTracCocoon';
import SubsidyPage from './services/Inspection/SubsidyApplication';

import ReelerListPage from './services/Inspection/ReelerListPage';

import Doc from './services/Inspection/Doc';
import Dashboard from './services/PMKYC/Dashboard';
import ListPage from './services/PMKYC/ListPage';
import DocPage from './services/PMKYC/DocPage';
import Logout from './pages/Logout/Logout';

/* Theme variables */
import './theme/variables.css';


setupIonicReact();

const App: React.FC = () => {
  useEffect(() => {
    if (Capacitor.isNative) {
      const handler = CapacitorApp.addListener('backButton', () => {
        try {
          const histState: any = window.history.state;
          const idx = histState && histState.idx;

          // If React Router history index is available, use it to decide
          if (typeof idx === 'number') {
            if (idx > 0) {
              window.history.back();
              return;
            } else {
              // idx === 0 => first entry
              if (window.location.pathname === '/login' || window.location.pathname === '/') {
                CapacitorApp.exitApp();
              } else {
                // fallback to back (may navigate within app)
                window.history.back();
              }
              return;
            }
          }

          // If idx not available, attempt a safe back then exit only if still at root
          window.history.back();
          setTimeout(() => {
            if (window.location.pathname === '/login' || window.location.pathname === '/') {
              CapacitorApp.exitApp();
            }
          }, 300);
        } catch (e) {
          try {
            window.history.back();
          } catch (_) {
            CapacitorApp.exitApp();
          }
        }
      });
      return () => {
        handler.remove();
      };
    }
    return;
  }, []);

  return (
  <IonApp>
    <IonReactRouter>
      <IonSplitPane contentId="main">
        <Menu />
        <IonRouterOutlet id="main">
          <Route path="/" exact={true}>
            <Redirect to="/login" />
          </Route>
          <Route path="/login" exact={true}>
            <Login/>
          </Route>
          <Route path="/homepage" exact={true}>
            <Home />
          </Route>
          <Route path="/menu/:menuId" exact={true}>
            <MenuPage />
          </Route>

          {/* Submenu Route */}
          <Route path="/menu/:menuId/submenu/:submenuId" exact={true}>
            <SubMenuPage />
          </Route>

          {/* Subsubmenu Route */}
          <Route path="/subsubmenu" exact={true}>
            <SubSubMenuPage />
          </Route>
          <Route path="/subsidy" exact={true}>
            <SubsidyPage />
          </Route>

          <Route path="/reeler" exact={true}>
            <ReelerInfoPage />
          </Route>

          {/* Farmer Profile Sub-Submenu Routes */}
          <Route path="/profile-info" exact={true}>
            <ProfileInfoPage />  {/* Profile Info Page Route */}
          </Route>
          <Route path="/list" exact={true}>
            <ReelerListPage />  {/* Profile Info Page Route */}
          </Route>
          <Route path="/doc/:reelerId" exact={true}>
            <Doc/>  {/* Profile Info Page Route */}
          </Route>

          <Route path="/land-info" exact={true}>
            <LandInfoPage />  
          </Route>
          
          <Route path="/add-dlf" exact={true}>
            <AddDlfPage/>  {/* Profile Info Page Route */}
          </Route>
          <Route path="/trac" exact={true}>
            <TracCocoonPage/>  {/* Profile Info Page Route */}
          </Route>
          <Route path="/add-det/:fruitsId" exact={true}>
            <AddDetails/>  {/* Profile Info Page Route */}
          </Route>
          <Route path="/add-trac/:saleAndDisposalId" exact={true}>
            <AddTracCocoonPage/>  {/* Profile Info Page Route */}
          </Route>
          <Route path="/upd-dlf" exact={true}>
            <UpdateDlfPage/>  {/* Profile Info Page Route */}
          </Route>
          <Route path="/crp-ins" exact={true}>
            <CropInspectionPage/>  {/* Profile Info Page Route */}
          </Route>
          <Route path="/dis-inf" exact={true}>
            <DisinfectantPage/>  {/* Profile Info Page Route */}
          </Route>
          <Route path="/ins/:fid/:chowkiDetailId/:farmerId" exact={true}>
            <InspectionDetails/>  {/* Profile Info Page Route */}
          </Route>
          <Route path="/fit" exact={true}>
            <FitnessPage/>  {/* Profile Info Page Route */}
          </Route>
          <Route path="/mul" exact={true}>
            <MulberryPage/>  {/* Profile Info Page Route */}
          </Route>
          <Route path="/dash" exact={true}>
              <Dashboard/>
              </Route>
              <Route path="/list/:approvalStageId" exact={true}>
                <ListPage/>
              </Route>
              <Route path="/docu/:applicationDocumentId/:approvalStageId/:subSchemeId" exact={true}>
                <DocPage/>
              </Route>
              <Route path="/logout" exact={true}>
              <Logout />
            </Route>
         
          <Route path="/cropsub" exact={true}>
            <CropSubMenuPage/>  {/* Profile Info Page Route */}
          </Route>
          <Route path="/mulsub" exact={true}>
            <MulberryActivitySubMenus/>  {/* Profile Info Page Route */}
          </Route>
        </IonRouterOutlet>
      </IonSplitPane>
      <Route path="/login" exact={true}>
            <Login/>
          </Route>
    </IonReactRouter>
  </IonApp>
);
}
export default App;