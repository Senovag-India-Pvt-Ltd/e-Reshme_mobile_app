
// import {
//   IonContent,
//   IonIcon,
//   IonItem,
//   IonLabel,
//   IonList,
//   IonImg,
//   IonListHeader,
//   IonMenu,
//   IonMenuToggle,
//   IonNote,
//   IonCol,
//   IonItemDivider,
//   IonRow,
// } from '@ionic/react';

// import { useLocation } from 'react-router-dom';
// import { archiveOutline, archiveSharp, bookmarkOutline, calculator, calculatorOutline, calculatorSharp, camera, cameraOutline, cameraReverse, cameraSharp, cardSharp, document, documentAttach, documentAttachSharp, documentLockSharp, documentOutline, documentSharp, documentText, fileTrayFull, fileTrayFullOutline, gridOutline, gridSharp, heartOutline, heartSharp, listCircle, listCircleOutline, logoGoogle, mailOutline, mailSharp, menuOutline, menuSharp, notificationsCircle, notificationsCircleOutline, notificationsCircleSharp, notificationsOffOutline, notificationsOffSharp, notificationsOutline, notificationsSharp, paperPlaneOutline, paperPlaneSharp, trashOutline, trashSharp, warningOutline, warningSharp } from 'ionicons/icons';
// import './Menu.css';

// interface AppPage {
//   url: string;
//   iosIcon: string;
//   mdIcon: string;
//   title: string;
// }

// const appPages: AppPage[] = [
//   {
//     title: 'Farmer Profile',
//     url: '/home',
//     iosIcon: mailOutline,
//     mdIcon: mailSharp
//   },

 
//   {
//     title: 'Subsidy/Incentives',
//     url: '/home',
//     iosIcon: paperPlaneOutline,
//     mdIcon: paperPlaneSharp
//   },
//   {
//     title: 'Cocoon Markets',
//     url: '/home',
//     iosIcon: paperPlaneOutline,
//     mdIcon: paperPlaneSharp
//   },
//   {
//     title: 'Disinfectant and Chawki Information',
//     url: '/home',
//     iosIcon: gridSharp,
//     mdIcon: gridSharp
//   },
  
  
 
//   {
//     title: 'KSSRDI-Technical Related Queries',
//     url: '/home',
//     iosIcon: archiveOutline,
//     mdIcon: archiveSharp
//   },
  
//   {
//     title: 'Help',
//     url: '/home',
//     iosIcon: heartOutline,
//     mdIcon: heartSharp
//   },{
//     title: 'Dashboard and Statistics',
//     url: '/home',
//     iosIcon: heartOutline,
//     mdIcon: heartSharp
//   }
 
// ];

// const labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];

// const Menu: React.FC = () => {
//   const location = useLocation();

//   // Use localStorage.getItem("userType") to get the user type

//   if (location.pathname === '/login') {
//     // Don't render the menu for the login screen
//     return null;
//   }

//   const userType = localStorage.getItem("userType");


//   // Modify appPages based on the user type
//   const filteredAppPages = appPages.filter((page) => {
//     // If userType is not 2, show the "Accept Bid" menu item

  
    

//     if (page.title === 'Accept Bid' && (userType == '2' || userType == '3')) {
//       return false;
//     }
    
//     // if (page.title === 'Dashboard' && userType != '3') {
//     //   return false;
//     // }
//     if (page.title === 'Start Bid' && userType != '2') {
//       return false;
//     }
//     return true;
//   });

//   return (
//     <IonMenu contentId="main" type="overlay">
//       <IonContent>
//         <div className='complete-profile-section'>
//           <IonRow>
//             {/* <IonCol size='3'> */}
//             <div className='container-profile'>
//               <div className="profile-image-container">
//                 <IonImg
//                   style={{ alignItems: 'center' }}
//                   className='logo-round'
//                   src="/assets/images/user_profile.png"
//                   alt="Profile"
//                 ></IonImg>
//               </div>
//             </div>
//           </IonRow>
//           <IonRow className='market-section' >
//             <IonLabel>MARKET - {localStorage.getItem("marketName")}</IonLabel>
//           </IonRow>
//           <IonRow className='profile-section'><IonLabel className='profile-contents'>{localStorage.getItem("firstName")} {localStorage.getItem("lastName")}</IonLabel></IonRow>
//           <IonRow className='profile-section'><IonLabel>{localStorage.getItem("username")}</IonLabel></IonRow>
//           <IonRow className='profile-section'><IonLabel>{localStorage.getItem("email")}</IonLabel></IonRow>
//           <IonRow className='profile-section'><IonLabel>{localStorage.getItem("phoneNumber")}</IonLabel></IonRow>
//         </div>
//         <IonList id="inbox-list">
//           {filteredAppPages.map((appPage, index) => {
//             return (
//               <IonMenuToggle key={index} autoHide={false}>
//                 <IonItem className={location.pathname === appPage.url ? 'selected' : ''} routerLink={appPage.url} routerDirection="none" lines="none" detail={false}>
//                   <IonIcon aria-hidden="true" slot="start" ios={appPage.iosIcon} md={appPage.mdIcon} />
//                   <IonLabel>{appPage.title}</IonLabel>
//                 </IonItem>
//               </IonMenuToggle>
//             );
//           })}
//         </IonList>
//       </IonContent>
//     </IonMenu>
//   );
// };

// export default Menu;
