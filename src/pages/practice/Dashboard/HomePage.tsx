



// import React, { useState, useEffect } from 'react';
// import { IonContent, IonPage, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButtons, IonHeader, IonMenuButton, IonTitle, IonToolbar, IonButton, IonIcon } from '@ionic/react';
// import { arrowBack } from 'ionicons/icons';
// import axios from 'axios';
// import { useHistory } from 'react-router-dom';
// import './HomePage.css'; // Import your CSS file here
// import { API_URL_Inspection } from '../../../services/auth.service';

// const HomePage: React.FC = () => {
//   const [data, setData] = useState<any[]>([]);
//   const [totalTask, setTotalTask] = useState<number>(0);
//   const [name, setName] = useState<string>("");
//   const history = useHistory();

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = () => {
//     const fetchDetails = {
//       "userMasterId": localStorage.getItem("userMasterId"),
//     };

//     const api = axios.create({
//       baseURL: API_URL_Inspection,
//     });

//     api.post("inspection/v1/inspectionTask/get-dashboard-count-by-user", fetchDetails, {
//       headers: {
//         "Content-Type": "application/json",
//         accept: "*/*",
//         Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
//       },
//     })
//       .then(res => {
//         console.log("API Response:", res.data);
        
//         if (res.data.errorCode === 0) {
//           const content = res.data.content;
//           setData(content.inspectionTask || []); // Ensure data is set as an empty array if no tasks
//         } else {
//           console.error("API Error:", res.data.errorMessages);
//           // Handle error
//         }
//       })
//       .catch(error => {
//         console.error("API Fetch Error:", error);
//         // Handle error
//       });
//   };

//   const handleBoxClick = (id: number) => {
//     history.push(`/list/${id}`);
//   };

//   const handleGoBack = () => {
//     history.goBack();
//   };

//   return (
//     <IonPage>
//       <IonHeader>
//         <IonToolbar>
//           <IonButtons slot="start">
//             <IonMenuButton />
//           </IonButtons>
//           <IonTitle><b>Dashboard</b></IonTitle>
//           <IonButtons slot="end">
//             <IonButton onClick={handleGoBack}>
//               <IonIcon icon={arrowBack} />
//               Go Back
//             </IonButton>
//           </IonButtons>
//         </IonToolbar>
//       </IonHeader>
//       <IonContent>
//         <IonGrid>
//           <IonRow className="card-container">
//             {data.length > 0 ? (
//               data.map((item, index) => (
//                 <IonCol size="13" key={index}>
//                   <IonCard onClick={() => handleBoxClick(item.inspectionType)} className="card">
//                     <IonCardHeader>
//                       <IonCardTitle>Name: {item.inspectionName}</IonCardTitle>
//                     </IonCardHeader>
//                     <IonCardContent>Total Items: {item.userMasterId}</IonCardContent>
//                   </IonCard>
//                 </IonCol>
//               ))
//             ) : (
//               <IonCol size="12">
//                <center><h2><b><p>No data available</p></b></h2></center>
//               </IonCol>
//             )}
//           </IonRow>
//         </IonGrid>
//       </IonContent>
//     </IonPage>
//   );
// };

// export default HomePage;




// Modified Code


// import React, { useState, useEffect } from 'react';
// import { IonContent, IonPage, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButtons, IonHeader, IonMenuButton, IonTitle, IonToolbar, IonButton, IonIcon } from '@ionic/react';
// import { arrowBack } from 'ionicons/icons';
// import axios from 'axios';
// import { useHistory } from 'react-router-dom';
// import './HomePage.css'; // Import your CSS file here
// import { API_URL_Inspection } from '../../../services/auth.service';

// const HomePage: React.FC = () => {
//   const [data, setData] = useState<any[]>([]);
//   const history = useHistory();

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = () => {
//     const fetchDetails = {
//       "userMasterId": localStorage.getItem("userMasterId"),
//     };

//     const api = axios.create({
//       baseURL: API_URL_Inspection,
//     });

//     api.post("inspection/v1/inspectionTask/get-dashboard-count-by-user", fetchDetails, {
//       headers: {
//         "Content-Type": "application/json",
//         accept: "*/*",
//         Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
//       },
//     })
//       .then(res => {
//         console.log("API Response:", res.data);
        
//         if (res.data.errorCode === 0) {
//           const content = res.data.content;
//           setData(content.inspectionTask || []); // Ensure data is set as an empty array if no tasks
//         } else {
//           console.error("API Error:", res.data.errorMessages);
//           // Handle error
//         }
//       })
//       .catch(error => {
//         console.error("API Fetch Error:", error);
//         // Handle error
//       });
//   };

//   const handleBoxClick = (id: number) => {
//     history.push(`/list/${id}`);
//   };

//   const handleGoBack = () => {
//     history.goBack();
//   };

//   return (
//     <IonPage>
//       <IonHeader>
//         <IonToolbar>
//           <IonButtons slot="start">
//             <IonMenuButton />
//           </IonButtons>
//           <IonTitle><b>Dashboard</b></IonTitle>
//           <IonButtons slot="end">
//             <IonButton onClick={handleGoBack}>
//               <IonIcon icon={arrowBack} />
//               Go Back
//             </IonButton>
//           </IonButtons>
//         </IonToolbar>
//       </IonHeader>
//       <IonContent>
//         <IonGrid>
//           <IonRow className="card-container">
//             {data.length > 0 ? (
//               data.map((item, index) => (
//                 <IonCol size="12" key={index}>
//                   <IonCard onClick={() => handleBoxClick(item.inspectionType)} className="card">
//                     <IonCardHeader>
//                       <IonCardTitle>PreInspection{item.inspectionName}</IonCardTitle>
//                     </IonCardHeader>
//                     <IonCardContent>
//                       <IonGrid>
//                         <IonRow>
//                           <IonCol size="6">FID2904000024422{item.fruitsId}</IonCol>
//                           <IonCol size="6">2023-2024 {item.financialYear}</IonCol>
//                         </IonRow>
//                         <IonRow>
//                           <IonCol size="6">Dharwad {item.district}</IonCol>
//                           <IonCol size="6">Hubli {item.taluk}</IonCol>
//                         </IonRow>
//                         <IonRow>
//                           <IonCol size="6">Revadihala {item.village}</IonCol>
//                           <IonCol size="6">Hubli TSC {item.tsc}</IonCol>
//                         </IonRow>
//                         <IonRow>
//                           <IonCol size="6">Pre Inspection: {item.preInspection}</IonCol>
//                           <IonCol size="6">Subsidy for construction of Mounting Hall MH 600 {item.component}</IonCol>
//                         </IonRow>
//                       </IonGrid>
//                     </IonCardContent>
//                   </IonCard>
//                 </IonCol>
//               ))
//             ) : (
//               <IonCol size="12">
//                 <center><h2><b><p>No data available</p></b></h2></center>
//               </IonCol>
//             )}
//           </IonRow>
//         </IonGrid>
//       </IonContent>
//     </IonPage>
//   );
// };

// export default HomePage;



import React, { useState, useEffect } from 'react';
import { IonContent, IonPage, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButtons, IonHeader, IonMenuButton, IonTitle, IonToolbar, IonButton, IonIcon } from '@ionic/react';
import { arrowBack } from 'ionicons/icons';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import './HomePage.css'; // Import your CSS file here
import { API_URL_Inspection } from '../../../services/auth.service';

const HomePage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const history = useHistory();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    const fetchDetails = {
      "userMasterId": localStorage.getItem("userMasterId"),
    };

    const api = axios.create({
      baseURL: API_URL_Inspection,
    });

    api.post("inspection/v1/inspectionTask/get-dashboard-count-by-user", fetchDetails, {
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
      },
    })
      .then(res => {
        console.log("API Response:", res.data);
        
        if (res.data.errorCode === 0) {
          const content = res.data.content;
          setData(content.inspectionTask || []); // Ensure data is set as an empty array if no tasks
        } else {
          console.error("API Error:", res.data.errorMessages);
          // Handle error
        }
      })
      .catch(error => {
        console.error("API Fetch Error:", error);
        // Handle error
      });
  };

  const handlePreInspectionClick = (id: number) => {
    history.push(`/list/${id}`);
  };

  const handleGoBack = () => {
    history.goBack();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle><b>Dashboard</b></IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleGoBack}>
              <IonIcon icon={arrowBack} />
              Go Back
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonGrid>
          <IonRow className="card-container">
            {data.length > 0 ? (
              data.map((item, index) => (
                <IonCol size="12" key={index}>
                  <IonCard className="card">
                    <IonCardHeader >
                      <IonCardTitle><b>Beneficiary Id</b> {item.inspectionName}</IonCardTitle>
                      </IonCardHeader>
                    <IonCardContent>
                      <IonGrid>
                        <IonRow>
                          <IonCol size="6">FID2904000024422 {item.fruitsId}</IonCol>
                          <IonCol size="6">2023-2024 {item.financialYear}</IonCol>
                        </IonRow>
                        <IonRow>
                          <IonCol size="6">Dharwad {item.district}</IonCol>
                          <IonCol size="6">Hubli {item.taluk}</IonCol>
                        </IonRow>
                        <IonRow>
                          <IonCol size="6">Revadihala {item.village}</IonCol>
                          <IonCol size="6">Hubli TSC {item.tsc}</IonCol>
                        </IonRow>
                        <IonRow>
                          <IonCol size="6" onClick={() => handlePreInspectionClick(item.inspectionType)}><b>Pre Inspection:</b> {item.preInspection}</IonCol>
                          <IonCol size="6">Subsidy for construction of Mounting Hall MH 600 {item.component}</IonCol>
                        </IonRow>
                      </IonGrid>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              ))
            ) : (
              <IonCol size="12">
                <center><h2><b><p>No data available</p></b></h2></center>
              </IonCol>
            )}
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default HomePage;

