



// import React, { useState, useEffect } from 'react';
// import { IonContent, IonPage, IonList, IonItem, IonLabel, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonGrid, IonHeader, IonMenuButton, IonRow, IonTitle, IonToolbar, IonButton, IonIcon } from '@ionic/react';
// import axios from 'axios';
// import { useHistory } from 'react-router-dom';
// import { useParams } from 'react-router-dom';
// import { arrowBack } from 'ionicons/icons';
// import { API_URL_Inspection } from '../../../services/auth.service';

// const ListPage: React.FC = () => {

//   const { inspectionType } = useParams<{ inspectionType: string }>();
//   const history = useHistory();
//   const [lists, setLists] = useState<any[]>([]);
//   const { id } = useParams<{ id: string }>();
//   const [iserror, setIserror] = useState<boolean>(false);
//   const [message, setMessage] = useState<string>("");

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = () => {
//     const fetchDetails = {
//       "inspectionType":  inspectionType,
//       "userMasterId": localStorage.getItem("userMasterId"),
//     }

//     const api = axios.create({
//       baseURL: API_URL_Inspection
//     });

//     api.post("inspection/v1/inspectionTask/get-task-list-by-user-and-type", fetchDetails, {
//       headers: {
//         "Content-Type": "application/json",
//         accept: "*/*",
//         Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
//       },
//     })
//       .then(res => {
//         console.log(res.data);
//         if (res.data.errorCode === -1) {
//           setMessage(res.data.errorMessages[0].message);
//           setIserror(true)
//         } else {
//           setLists(res.data.content.inspectionTask);
//         }
//       })
//       .catch(error => {
//         console.error("API Fetch Error:", error);
//         // Handle error
//       });
//   };

//   const handleBoxClick = (id: number, inspTaskId: number) => {
//     history.push(`/docu/${id}/${inspTaskId}`);
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
//           <IonTitle><b>List Page</b></IonTitle>
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
//             {lists.map((item, index) => (
//               <IonCol size="13" key={index}>
//                 <IonCard onClick={() => handleBoxClick(item.inspectionType, item.inspectionTaskId)} className="card">
//                   <IonCardHeader>
//                     <IonCardTitle>Request Type ID: {item.requestTypeId}</IonCardTitle>
//                   </IonCardHeader>
//                   <IonCardContent>Request Type: {item.requestType}</IonCardContent>
//                   <IonCardContent>Name: {item.inspectionName}</IonCardContent>
//                 </IonCard>
//               </IonCol>
//             ))}
//           </IonRow>
//         </IonGrid>
//       </IonContent>
//     </IonPage>
//   );
// }

// export default ListPage;


import React, { useState, useEffect } from 'react';
import { IonContent, IonPage, IonList, IonItem, IonLabel, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonGrid, IonHeader, IonMenuButton, IonRow, IonTitle, IonToolbar, IonButton, IonIcon, IonSelect, IonSelectOption } from '@ionic/react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { arrowBack, personCircle, calendar, cube, bookmark, list, time, alertCircle, cloudUpload } from 'ionicons/icons';
import { API_URL_Inspection } from '../../../services/auth.service';
import './ListPage.css';

const List: React.FC = () => {

  const { inspectionType } = useParams<{ inspectionType: string }>();
  const history = useHistory();
  const [lists, setLists] = useState<any[]>([]);
  const { id } = useParams<{ id: string }>();
  const [iserror, setIserror] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [selectedReason, setSelectedReason] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    const fetchDetails = {
      "inspectionType": inspectionType,
      "userMasterId": localStorage.getItem("userMasterId"),
    }

    const api = axios.create({
      baseURL: API_URL_Inspection
    });

    api.post("inspection/v1/inspectionTask/get-task-list-by-user-and-type", fetchDetails, {
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
      },
    })
      .then(res => {
        console.log(res.data);
        if (res.data.errorCode === -1) {
          setMessage(res.data.errorMessages[0].message);
          setIserror(true)
        } else {
          setLists(res.data.content.inspectionTask);
        }
      })
      .catch(error => {
        console.error("API Fetch Error:", error);
        // Handle error
      });
  };

  const handleUploadDocumentsClick = (id: number, inspTaskId: number) => {
    history.push(`/docu/${id}/${inspTaskId}`);
  };

  const handleGoBack = () => {
    history.goBack();
  };

  const handleReasonChange = (event: CustomEvent) => {
    setSelectedReason(event.detail.value);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle><b>List Page</b></IonTitle>
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
            {lists.map((item, index) => (
              <IonCol size="12" key={index}>
                <IonCard className="card">
                  <IonCardHeader>
                    <IonCardTitle><IonIcon icon={personCircle} /> Farmer Id: {item.farmerId || "12345"}</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonLabel><IonIcon icon={personCircle} /> Farmer Name: {item.farmerName || "John Doe"}</IonLabel>
                  </IonCardContent>
                  <IonCardContent>
                    <IonLabel><IonIcon icon={calendar} /> Financial Year: {item.financialYear || "2023-2024"}</IonLabel>
                  </IonCardContent>
                  <IonCardContent>
                    <IonLabel><IonIcon icon={bookmark} /> Category: {item.category || "Sample Category"}</IonLabel>
                  </IonCardContent>
                  <IonCardContent>
                    <IonLabel><IonIcon icon={cube} /> Item: {item.item || "Sample Item"}</IonLabel>
                  </IonCardContent>
                  <IonCardContent>
                    <IonLabel><IonIcon icon={time} /> Date: {item.date || "2024-01-01"}</IonLabel>
                  </IonCardContent>
                  <IonCardContent>
                    <IonLabel><IonIcon icon={alertCircle} /> Reason:</IonLabel>
                    <IonSelect value={selectedReason} placeholder="Select Reason" onIonChange={handleReasonChange}>
                      <IonSelectOption value="reason1">Reason 1</IonSelectOption>
                      <IonSelectOption value="reason2">Reason 2</IonSelectOption>
                      <IonSelectOption value="reason3">Reason 3</IonSelectOption>
                    </IonSelect>
                  </IonCardContent>
                  <IonCardContent>
                    <IonButton onClick={() => handleUploadDocumentsClick(item.inspectionType, item.inspectionTaskId)} expand="block">
                      <IonIcon icon={cloudUpload} slot="start" />
                      Upload Documents
                    </IonButton>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
}

export default List;
