

// import React, { useState, useEffect } from 'react';
// import { IonContent, IonPage, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonButtons, IonHeader, IonMenuButton, IonTitle, IonToolbar, IonToast, IonIcon } from '@ionic/react';
// import axios from 'axios';
// import { useParams, useHistory } from 'react-router-dom';
// import './DocPage.css';
// import DocumentUpload from './DocumentUpload'; // Assuming the file path is correct
// import { API_URL_DBT, API_URL_Inspection } from '../../../services/auth.service';
// import { arrowBack } from 'ionicons/icons';

// const DocPage: React.FC = () => {
//   const { inspectionType, inspectionTaskId, requestTypeId } = useParams<{ inspectionType: string; inspectionTaskId: string; requestTypeId: string }>();
//   const history = useHistory();
//   const [documents, setDocuments] = useState<any[]>([]);
//   const [currentLocation, setCurrentLocation] = useState<{ latitude: string; longitude: string }>({ latitude: '', longitude: '' });
//   const [required, setRequired] = useState<boolean>(false);
//   const [inspectionTypeId, setInspectionTypeId] = useState<number>(0);
//   const [request, setRequest] = useState<number>(0);
//   const [status, setStatus] = useState<number>(0); // Add status as state
//   const [submitSuccess, setSubmitSuccess] = useState<boolean>(false); // State for submit success status
//   const [submitError, setSubmitError] = useState<boolean>(false); // State for submit error status

//   useEffect(() => {
//     fetchData();
//     fetchLocationData();
//     fetchCurrentLocation();
//   }, []);

//   useEffect(() => {
//     if (currentLocation.latitude && currentLocation.longitude && required) {
//       sendLocationToAPI(currentLocation.latitude, currentLocation.longitude);
//     }
//   }, [currentLocation, required]);

//   const fetchData = () => {
//     const fetchDetails = {
//       inspectionType: inspectionType,
//     };

//     const api = axios.create({
//       baseURL: API_URL_Inspection,
//     });

//     api.post('inspection/v1/inspectionTypeDocument/get-by-inspection-type', fetchDetails, {
//       headers: {
//         'Content-Type': 'application/json',
//         accept: '*/*',
//         Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
//       },
//     })
//       .then((res) => {
//         console.log(res.data);
//         if (res.data.errorCode === -1) {
//           // Handle error
//         } else {
//           setDocuments(res.data.content?.inspectionTypeDocument || []);
//           setInspectionTypeId(res.data.content.inspectionType);
//         }
//       })
//       .catch((error) => {
//         // Handle error
//       });
//   };

//   const fetchLocationData = () => {
//     const api = axios.create({
//       baseURL: API_URL_Inspection,
//     });

//     api.get(`inspection/v1/inspectionTypeGps/get-by-inspection-type/${inspectionType}`, {
//       headers: {
//         'Content-Type': 'application/json',
//         accept: '*/*',
//         Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
//       },
//     })
//       .then((res) => {
//         console.log(res.data);
//         if (res.data.errorCode === -1) {
//           // Handle error
//         } else {
//           setRequired(res.data.content?.isRequired || false);
//         }
//       })
//       .catch((error) => {
//         // Handle error
//       });
//   };

//   const fetchCurrentLocation = () => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const latitude = position.coords.latitude.toString();
//           const longitude = position.coords.longitude.toString();

//           setCurrentLocation({
//             latitude: latitude,
//             longitude: longitude,
//           });
//         },
//         (error) => {
//           console.error('Error getting current location:', error);
//         }
//       );
//     } else {
//       console.error('Geolocation is not supported by this browser.');
//     }
//   };

//   const sendLocationToAPI = (latitude: string, longitude: string) => {
//     const api = axios.create({
//       baseURL: API_URL_Inspection,
//     });

//     const requestBody = {
//       inspectionTaskId: inspectionTaskId,
//       lat: latitude,
//       lng: longitude,
//     };

//     api.post('inspection/v1/inspectionTaskGps/add', requestBody, {
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
//       },
//     })
//       .then((res) => {
//         console.log(res.data);
//       })
//       .catch((error) => {
//         console.error('Error sending location data:', error);
//       });
//   };

//   const handleUpload = (documentId: string, file: File) => {
//     console.log('File uploaded for document ID:', documentId, file);
//   };

//   const updateInspectionTaskStatus = () => {
//     const api = axios.create({
//       baseURL: API_URL_Inspection,
//     });

//     const requestBody = {
//       inspectionTaskId: inspectionTaskId,
//       inspectionType: inspectionType,
//     };

//     api.post('inspection/v1/inspectionTask/update-status', requestBody, {
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
//       },
//     })
//       .then((res) => {
//         console.log('First API Response:', res.data); // Log entire response
//         const requestTypeId = res.data.content.requestTypeId; // Assuming this is where you get requestTypeId
//         setRequest(requestTypeId); // Assuming setRequest is a function that sets state

//         // Set status here based on your response data
//         const status = res.data.content.status;
//         console.log('Status:', status); // Log status

//         // Check conditions for calling the second API
//         if (
//           ([1, 2, 3].includes(Number(inspectionType)) && status === 3) ||
//           ([4, 5].includes(Number(inspectionType)) && status === 4)
//         ) {
//           console.log('Calling second API...'); // Log message indicating second API call
//           // Call second API here
//           const anotherApi = axios.create({
//             baseURL: API_URL_DBT,
//           });

//           const anotherRequestBody = {
//             id: requestTypeId, // Use the correct variable here
//           };

//           anotherApi.post(`dbt/v1/service/updateApplicationWorkFlowStatusAndTriggerNextStep?id=${requestTypeId}`, {}, {
//             headers: {
//               'Content-Type': 'application/json',
//               accept: '*/*',
//               Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
//             },
//           })
//             .then((res) => {
//               console.log('Second API Response:', res.data); // Log response from second API
//             })
//             .catch((error) => {
//               console.error('Error calling second API:', error);
//               setSubmitError(true);
//               setTimeout(() => setSubmitError(false), 3000);
//             });
//         } else {
//           console.log('Second API not called because conditions not met.');
//         }
//       })
//       .catch((error) => {
//         console.error('Error updating inspection task status:', error);
//       });
//   };

//   const handleSubmit = () => {
//     // Call your API here
//     updateInspectionTaskStatus();

//     setSubmitSuccess(true); // Set submit success status
//     setTimeout(() => setSubmitSuccess(false), 3000);
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
//           <IonTitle><b>Documents</b></IonTitle>
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
//           <IonRow>
//             {documents && documents.length > 0 ? documents.map((item, index) => (
//               <IonCol size="6" key={index}>
//                 <IonCard className='notification-bar'>
//                   <IonCardHeader>
//                     <IonCardTitle>Documents: {item.documentMasterName}</IonCardTitle>
//                   </IonCardHeader>
//                   <IonCardContent>
//                     <DocumentUpload onUpload={(file) => handleUpload(item.documentId, file)} docId={item.documentMasterId} />
//                   </IonCardContent>
//                 </IonCard>
//               </IonCol>
//             )) : (
//               <IonCol size="12">
//                 <p>No documents available.</p>
//               </IonCol>
//             )}
//           </IonRow>
//         </IonGrid>

//         <IonToast
//           isOpen={submitSuccess}
//           onDidDismiss={() => setSubmitSuccess(false)}
//           message="Successfully submitted"
//           duration={3000}
//         />

//         <IonToast
//           isOpen={submitError}
//           onDidDismiss={() => setSubmitError(false)}
//           message="Error submitting. Please try again."
//           duration={3000}
//           color="danger"
//         />

//         {required && currentLocation.latitude && currentLocation.longitude && (
//           <div className="location-container">
//             <label htmlFor="latitude">Latitude:</label>
//             <input type="text" id="latitude" value={currentLocation.latitude} readOnly />
//             <label htmlFor="longitude">Longitude:</label>
//             <input type="text" id="longitude" value={currentLocation.longitude} readOnly />
//           </div>
//         )}
//         <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
//           <IonButton onClick={handleSubmit}>Submit</IonButton>
//         </div>
//       </IonContent>
//     </IonPage>
//   );
// };

// export default DocPage;











import React, { useState, useEffect } from 'react';
import { IonContent, IonPage, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonButtons, IonHeader, IonMenuButton, IonTitle, IonToolbar, IonToast, IonIcon } from '@ionic/react';
import axios from 'axios';
import { useParams, useHistory } from 'react-router-dom';
import './DocPage.css';
import DocumentUpload from './DocumentUpload'; // Assuming the file path is correct
import { API_URL_DBT, API_URL_Inspection } from '../../../services/auth.service';
import { arrowBack } from 'ionicons/icons';

const DocP: React.FC = () => {
  const { inspectionType, inspectionTaskId, requestTypeId } = useParams<{ inspectionType: string; inspectionTaskId: string; requestTypeId: string }>();
  const history = useHistory();
  const [documents, setDocuments] = useState<any[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: string; longitude: string }>({ latitude: '', longitude: '' });
  const [required, setRequired] = useState<boolean>(false);
  const [inspectionTypeId, setInspectionTypeId] = useState<number>(0);
  const [request, setRequest] = useState<number>(0);
  const [status, setStatus] = useState<number>(0); // Add status as state
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false); // State for submit success status
  const [submitError, setSubmitError] = useState<boolean>(false); // State for submit error status

  useEffect(() => {
    fetchData();
    fetchLocationData();
    fetchCurrentLocation();
  }, []);

  useEffect(() => {
    if (currentLocation.latitude && currentLocation.longitude && required) {
      sendLocationToAPI(currentLocation.latitude, currentLocation.longitude);
    }
  }, [currentLocation, required]);

  const fetchData = () => {
    const fetchDetails = {
      inspectionType: inspectionType,
    };

    const api = axios.create({
      baseURL: API_URL_Inspection,
    });

    api.post('inspection/v1/inspectionTypeDocument/get-by-inspection-type', fetchDetails, {
      headers: {
        'Content-Type': 'application/json',
        accept: '*/*',
        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
      },
    })
      .then((res) => {
        console.log(res.data);
        if (res.data.errorCode === -1) {
          // Handle error
        } else {
          setDocuments(res.data.content?.inspectionTypeDocument || []);
          setInspectionTypeId(res.data.content.inspectionType);
        }
      })
      .catch((error) => {
        // Handle error
      });
  };

  const fetchLocationData = () => {
    const api = axios.create({
      baseURL: API_URL_Inspection,
    });

    api.get(`inspection/v1/inspectionTypeGps/get-by-inspection-type/${inspectionType}`, {
      headers: {
        'Content-Type': 'application/json',
        accept: '*/*',
        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
      },
    })
      .then((res) => {
        console.log(res.data);
        if (res.data.errorCode === -1) {
          // Handle error
        } else {
          setRequired(res.data.content?.isRequired || false);
        }
      })
      .catch((error) => {
        // Handle error
      });
  };

  const fetchCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude.toString();
          const longitude = position.coords.longitude.toString();

          setCurrentLocation({
            latitude: latitude,
            longitude: longitude,
          });
        },
        (error) => {
          console.error('Error getting current location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  const sendLocationToAPI = (latitude: string, longitude: string) => {
    const api = axios.create({
      baseURL: API_URL_Inspection,
    });

    const requestBody = {
      inspectionTaskId: inspectionTaskId,
      lat: latitude,
      lng: longitude,
    };

    api.post('inspection/v1/inspectionTaskGps/add', requestBody, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
      },
    })
      .then((res) => {
        console.log(res.data);
      })
      .catch((error) => {
        console.error('Error sending location data:', error);
      });
  };

  const handleUpload = (documentId: string, file: File) => {
    console.log('File uploaded for document ID:', documentId, file);
  };

  const updateInspectionTaskStatus = () => {
    const api = axios.create({
      baseURL: API_URL_Inspection,
    });

    const requestBody = {
      inspectionTaskId: inspectionTaskId,
      inspectionType: inspectionType,
    };

    api.post('inspection/v1/inspectionTask/update-status', requestBody, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
      },
    })
      .then((res) => {
        console.log('First API Response:', res.data); // Log entire response
        const requestTypeId = res.data.content.requestTypeId; // Assuming this is where you get requestTypeId
        setRequest(requestTypeId); // Assuming setRequest is a function that sets state

        // Set status here based on your response data
        const status = res.data.content.status;
        console.log('Status:', status); // Log status

        // Check conditions for calling the second API
        // if (
        //   ([1, 2, 3].includes(Number(inspectionType)) && status === 3) ||
        //   ([4, 5].includes(Number(inspectionType)) && status === 4)
        // ) {
          console.log('Calling second API...'); // Log message indicating second API call
          // Call second API here
          const anotherApi = axios.create({
            baseURL: API_URL_DBT,
          });

          const anotherRequestBody = {
            id: requestTypeId, // Use the correct variable here
          };

          anotherApi.post(`dbt/v1/service/updateApplicationWorkFlowStatusAndTriggerNextStep?id=${requestTypeId}`, {}, {
            headers: {
              'Content-Type': 'application/json',
              accept: '*/*',
              Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
            },
          })
            .then((res) => {
              console.log('Second API Response:', res.data); // Log response from second API
            })
            .catch((error) => {
              console.error('Error calling second API:', error);
              setSubmitError(true);
              setTimeout(() => setSubmitError(false), 3000);
            });
        // } else {
        //   console.log('Second API not called because conditions not met.');
        // }
      })
      .catch((error) => {
        console.error('Error updating inspection task status:', error);
      });
  };

  const handleSubmit = () => {
    // Call your API here
    updateInspectionTaskStatus();

    setSubmitSuccess(true); // Set submit success status
    setTimeout(() => setSubmitSuccess(false), 3000);
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
          <IonTitle><b>Documents</b></IonTitle>
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
          <IonRow>
            {documents && documents.length > 0 ? documents.map((item, index) => (
              <IonCol size="6" key={index}>
                <IonCard className='notification-bar'>
                  <IonCardHeader>
                    <IonCardTitle>Documents: {item.documentMasterName}</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <DocumentUpload onUpload={(file) => handleUpload(item.documentId, file)} docId={item.documentMasterId} />
                  </IonCardContent>
                </IonCard>
              </IonCol>
            )) : (
              <IonCol size="12">
                <p>No documents available.</p>
              </IonCol>
            )}
          </IonRow>
        </IonGrid>

        <IonToast
          isOpen={submitSuccess}
          onDidDismiss={() => setSubmitSuccess(false)}
          message="Successfully submitted"
          duration={3000}
        />

        <IonToast
          isOpen={submitError}
          onDidDismiss={() => setSubmitError(false)}
          message="Error submitting. Please try again."
          duration={3000}
          color="danger"
        />

        {required && currentLocation.latitude && currentLocation.longitude && (
          <div className="location-container">
            <label htmlFor="latitude">Latitude:</label>
            <input type="text" id="latitude" value={currentLocation.latitude} readOnly />
            <label htmlFor="longitude">Longitude:</label>
            <input type="text" id="longitude" value={currentLocation.longitude} readOnly />
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <IonButton onClick={handleSubmit}>Submit</IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default DocP;









