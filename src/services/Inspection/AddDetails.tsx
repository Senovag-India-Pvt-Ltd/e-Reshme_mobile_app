//Old Working Code

// import React, { useState, useEffect } from "react";
// import {
//     IonContent,
//     IonPage,
//     IonCard,
//     IonCardContent,
//     IonCardHeader,
//     IonCardTitle,
//     IonInput,
//     IonLabel,
//     IonButton,
//     IonHeader,
//     IonToolbar,
//     IonTitle,
//     IonButtons,
//     IonMenuButton,
//     IonIcon,
//     IonBackButton,
//     IonSelect,
//     IonSelectOption,
//     IonDatetime,
//     IonCol,
//     IonAlert,
//     IonModal,
// } from "@ionic/react";
// import { trash } from "ionicons/icons"; // Import the trash icon
// import "./ProfileInfoPage.css";
// import "./AddDlfPage.css";
// import axios from "axios";
// import { API_URL_DBT, API_URL_ChowkiManagment } from "../auth.service";
// import { API_URL_Master_Data } from '../auth.service';
// import { useHistory, useParams } from 'react-router-dom';

// const AddDlfPage: React.FC = () => {
//     const history = useHistory();
//     const [searchText, setSearchText] = useState<string>("");
//     const [data, setData] = useState<any>(null);
//     //   const [isEditable, setIsEditable] = useState<boolean>(false);
//     const [isError, setIsError] = useState<boolean>(false);
//     const [viewAll, setViewAll] = useState<boolean>(false);
//     const [showAlert, setShowAlert] = useState<boolean>(false);
//     const { fruitsId } = useParams<{ fruitsId: string }>(); // Get the Fruits ID from the URL parameter

//     // State variables for dropdown options
//     const [raceOptions, setRaceOptions] = useState<number[]>([
//         1,
//         2,
//     ]); // Dummy data for race options
//     const [tscOptions, setTscOptions] = useState<number[]>([1, 2]); // Dummy data for Tsc options
//     const [showHatchingDatePicker, setShowHatchingDatePicker] =
//         useState<boolean>(false);
//     const [showDispatchDatePicker, setShowDispatchDatePicker] =
//         useState<boolean>(false);
//     const [message, setMessage] = useState<string>("");
//     const [farmerId, setFarmerId] = useState<number | null>(null);
//     const [dflDetails, setDflDetails] = useState<any>({
//         lotNumberofRSP: "",
//         lotNumberofCRC: "",
//         numberofDFLs: "",
//         rateperDFLs: "",
//         price: "",
//         sourceofDFLs: "",
//         dispathdate:"",
//         hatchingdate:"",
//     });

//     console.log("dfldetails", dflDetails);


//     // Fetch race options from the API
//     const fetchRaceOptions = async () => {
//         try {
//             const response = await fetch("API_URL_FOR_RACE_OPTIONS"); // Replace with your API URL
//             const result = await response.json();
//             setRaceOptions(result); // Assuming the API returns an array of strings
//         } catch (error) {
//             console.error("Error fetching race options:", error);
//         }
//     };

//     // Fetch Tsc options from the API
//     const fetchTscOptions = async () => {
//         try {
//             const response = await fetch("API_URL_FOR_TSC_OPTIONS"); // Replace with your API URL
//             const result = await response.json();
//             setTscOptions(result); // Assuming the API returns an array of strings
//         } catch (error) {
//             console.error("Error fetching Tsc options:", error);
//         }
//     };

//     useEffect(() => {
//         // fetchDetails(); // Fetch details when the component mounts
//         fetchRaceOptions(); // Fetch race options on component mount
//         fetchTscOptions(); // Fetch Tsc options on component mount
//     }, []);

//     useEffect(() => {
//         if (dflDetails?.numberofDFLs && dflDetails?.rateperDFLs) {
//             const calculatedPrice = dflDetails.numberofDFLs * dflDetails.rateperDFLs;
//             setDflDetails((prevData: any) => ({
//                 ...prevData,
//                 price: calculatedPrice.toFixed(2), // Update price field with the calculated value
//             }));
//         }
//     }, [dflDetails?.numberofDFLs, dflDetails?.rateperDFLs]);
//     useEffect(() => {
//         clearSearch(); // Call clearSearch when the component mounts
//     }, []);

//     // State for Tsc selection and data fetching
//     const [tsc, setTscMasterId] = useState<string>(''); // Selected Tsc
//     const [tscListData, setTscListData] = useState<any[]>([]); // List of Tsc options from API
//     const [fetchError, setFetchError] = useState<boolean>(false); // Fetch error state
   

//     // Function to fetch Tsc data from the API
//     const fetchTscList = async () => {
//         try {
//             const response = await axios.get(`${API_URL_Master_Data}tscMaster/get-all`, {
//                 headers: {
//                     Authorization: `Bearer ${localStorage.getItem('jwtToken')}`, // Use token if required
//                 },
//             });

//             if (response.data && response.data.content) {
//                 setTscListData(response.data.content.tscMaster); // Set the fetched data
//             } else {
//                 console.error('Unexpected API response format:', response);
//                 setFetchError(true);
//             }
//         } catch (error) {
//             console.error('Error fetching Tsc list:', error);
//             setFetchError(true); // Set error state if fetch fails
//         }
//     };

//     // Function to handle Tsc selection change
//     const handleTscChange = (value: string) => {
//         setTscMasterId(value); // Set the selected Tsc
//     };

//     // Fetch Tsc list when component mounts
//     useEffect(() => {
//         fetchTscList();
//     }, []);

//     // State for Tsc selection and data fetching
//     const [raceOfDfls, setRaceOfDfls] = useState<string>(''); // Selected Tsc
//     const [raceMasterListData, setRaceMasterListData] = useState<any[]>([]); // List of Tsc options from API
//     //  const [fetchError, setFetchError] = useState<boolean>(false); // Fetch error state

//     // Function to fetch Tsc data from the API
//     const fetchRaceMasterList = async () => {
//         try {
//             const response = await axios.get(`${API_URL_Master_Data}raceMaster/get-all`, {
//                 headers: {
//                     Authorization: `Bearer ${localStorage.getItem('jwtToken')}`, // Use token if required
//                 },
//             });

//             if (response.data && response.data.content) {
//                 setRaceMasterListData(response.data.content.raceMaster); // Set the fetched data
//             } else {
//                 console.error('Unexpected API response format:', response);
//                 setFetchError(true);
//             }
//         } catch (error) {
//             console.error('Error fetching Tsc list:', error);
//             setFetchError(true); // Set error state if fetch fails
//         }
//     };

//     // Function to handle Tsc selection change
//     const handleRaceMasterChange = (value: string) => {
//         setRaceOfDfls(value); // Set the selected Tsc
//     };


//     // Fetch Tsc list when component mounts
//     useEffect(() => {
//         fetchRaceMasterList();
//     }, []);


//     // useEffect(() => {
//     //     if (fruitsId) {
//     //         handleEdit(fruitsId);
//     //     }
//     // }, [fruitsId]);

//     const handleEdit = () => {
//         //   if (isEditable) {
//         const api = axios.create({
//             baseURL: API_URL_ChowkiManagment,
//         });
//         api
//             .post(
//                 "chowkimanagement/add-dfl-info",
//                 {
//                     fruitsId: fruitsId,
//                     lotNumberRsp: dflDetails.lotNumberofRSP,
//                     lotNumberCrc: dflDetails.lotNumberofCRC,
//                     numbersOfDfls: dflDetails.numberofDFLs,
//                     ratePer100Dfls: dflDetails.rateperDFLs,
//                     price: dflDetails.price,
//                     dflsSource: dflDetails.sourceofDFLs,
//                     raceOfDfls: dflDetails.raceOfDfls,
//                     tsc: dflDetails.tsc,
//                     soldAfter1stOr2ndMould: dflDetails.soldafterMoult,
//                     dispathDate:dflDetails.dispathdate,
//                     hatchingDate:dflDetails.hatchingdate,
//                 },
//                 {
//                     headers: {
//                         "Content-Type": "application/json",
//                         accept: "*/*",
//                         Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
//                     },
//                 }
//             )
//             .then((res) => {
//                 console.log("Response:", res.data);
//                 if (res.data.error === 0) {
//                     setMessage("Data added successfully!");
//                     setIsError(false);
//                     setShowAlert(true);
//                     clearSearch();

//                      // Redirect to "add-dlf" and refresh the page
//                 // history.push("/add-dlf")
//                 // window.location.reload();

//                  // Redirect to "add-dlf" after a 1-second delay
//                  setTimeout(() => {
//                     history.push("/add-dlf");
//                 }, 1000);

                

//                 } else {
//                     setMessage("Failed to add data.");
//                     setIsError(true);
//                     setShowAlert(true);
//                 }
//             })
//             .catch((error) => {
//                 console.error("Error updating farmer details", error);
//                 setMessage("Error updating farmer details");
//                 setIsError(true);
//                 // setShowAlert(true);
//             });
//         //   }
//         //   setIsEditable(!isEditable); // Toggle editable state
//     };

//     const clearSearch = () => {
//         setSearchText("");
//         setData(null);
//         // setIsEditable(false);
//         setDflDetails({
//             lotNumberofRSP: "",
//             lotNumberofCRC: "",
//             numberofDFLs: "",
//             rateperDFLs: "",
//             price: "",
//             sourceofDFLs: "",
//         });
//     };

//     const handleChange = (e: any, field: string) => {
//         if (dflDetails) {
//             setDflDetails({
//                 ...dflDetails,
//                 [field]: e.detail.value, // Change here to work with IonSelect
//             });
//         }
//     };
//     //   const clearField=()=>{
//     //     setViewAll(false);
//     //   }

//     //   const toggleViewAll = () => {
//     //     setViewAll(!viewAll);
//     //     setIsEditable(!isEditable);
//     //   };

//     return (
//         <IonPage>
//             <IonHeader>
//                 <IonToolbar>
//                     <IonButtons slot="start">
//                         <IonMenuButton /><IonBackButton defaultHref="/" /> 
                        
//                     </IonButtons>
//                     <IonTitle>
//                         <b>Add DFL's Details</b>
//                     </IonTitle>
//                 </IonToolbar>
//             </IonHeader>

//             <IonContent>
//                 {/* <div className="search-container">
//           <IonLabel className="fruits-id-label">Fruits ID</IonLabel>
//           <IonInput
//             value={searchText}
//             placeholder="Enter Fruits ID"
//             onIonChange={(e) => setSearchText(e.detail.value!)}
//           />
//           <IonButton size="small" onClick={fetchFarmerDetails}>Search</IonButton>


//           <IonButton size="small" fill="clear" onClick={clearSearch}>
//             <IonIcon color="danger" icon={trash} />
//           </IonButton>
//         </div> */}

//                 {/* {data && ( */}
//                 <IonCard className="details-card">
//                     {/* <IonCardHeader>
//               <IonCardTitle>DFLs Details</IonCardTitle>
//             </IonCardHeader> */}
//                     <IonCardContent>
//                         {/* {!viewAll ? (
//                 <IonButton expand="full" onClick={toggleViewAll}>
//                   Add Details
//                 </IonButton>
//               ) : (
//                 <>
//                   <IonButton expand="full" onClick={toggleViewAll}>
//                     Hide
//                   </IonButton> */}
//                         <div className="details-row">
//                             <IonLabel>Lot No.(RSP):</IonLabel>
//                             <IonInput
//                                 value={dflDetails.lotNumberofRSP}
//                                 //   readonly={!isEditable}
//                                 onIonChange={(e) => handleChange(e, "lotNumberofRSP")}
//                             />
//                         </div>
//                         <div className="details-row">
//                             <IonLabel>Lot No. (CRC):</IonLabel>
//                             <IonInput
//                                 value={dflDetails.lotNumberofCRC}
//                                 //   readonly={!isEditable}
//                                 onIonChange={(e) => handleChange(e, "lotNumberofCRC")}
//                             />
//                         </div>
//                         <div className="details-row">
//                             <IonLabel>Number of DFL’s:</IonLabel>
//                             <IonInput
//                                 value={dflDetails.numberofDFLs}
//                                 //   readonly={!isEditable}
//                                 onIonChange={(e) => handleChange(e, "numberofDFLs")}
//                             />
//                         </div>
//                         <div className="details-row">
//                             <IonLabel>Rate per 100 DFLs:</IonLabel>
//                             <IonInput
//                                 value={dflDetails.rateperDFLs}
//                                 //   readonly={!isEditable}
//                                 onIonChange={(e) => handleChange(e, "rateperDFLs")}
//                             />
//                         </div>
//                         <div className="details-row">
//                             <IonLabel>Price(in Rupees):</IonLabel>
//                             <IonInput
//                                 value={dflDetails.price}
//                                 readonly={true}
//                                 onIonChange={(e) => handleChange(e, "price")}
//                             />
//                         </div>
//                         <div className="details-row">
//                             <IonLabel>Source of DFLs:</IonLabel>
//                             <IonInput
//                                 value={dflDetails.sourceofDFLs}
//                                 //   readonly={!isEditable}
//                                 onIonChange={(e) => handleChange(e, "sourceofDFLs")}
//                             />
//                         </div>


//                         <IonCol size="12">
//                             <div className="details-row">
//                                 <IonLabel>
//                                     <b>Select Tsc:</b>
//                                 </IonLabel>
//                                 {fetchError ? (
//                                     <p style={{ color: 'red' }}>Failed to fetch Tsc list. Please try again later.</p>
//                                 ) : (
//                                     <IonSelect
//                                         value={dflDetails.tsc}
//                                         // disabled={!isEditable} // Disable if not editable
//                                         placeholder="Select Tsc"
//                                         onIonChange={(e) => handleChange(e, "tsc")}
//                                     >
//                                         <IonSelectOption value="">None</IonSelectOption> {/* Option to deselect */}
//                                         {tscListData?.map((tsc) => (
//                                             <IonSelectOption key={tsc.tscMasterId} value={tsc.tscMasterId}>
//                                                 {tsc.name}
//                                             </IonSelectOption>
//                                         ))}
//                                     </IonSelect>
//                                 )}
//                             </div>
//                         </IonCol>

//                         <IonCol size="12">
//                             <div className="details-row">
//                                 <IonLabel>
//                                     <b>Select Race:</b>
//                                 </IonLabel>
//                                 {fetchError ? (
//                                     <p style={{ color: 'red' }}>Failed to fetch Race list. Please try again later.</p>
//                                 ) : (
//                                     <IonSelect
//                                         value={dflDetails.raceOfDfls}
//                                         // disabled={!isEditable} // Disable if not editable
//                                         placeholder="Select Race"
//                                         onIonChange={(e) => handleChange(e, "raceOfDfls")}
//                                     >
//                                         <IonSelectOption value="">None</IonSelectOption> {/* Option to deselect */}
//                                         {raceMasterListData?.map((race) => (
//                                             <IonSelectOption key={race.raceMasterId} value={race.raceMasterId}>
//                                                 {race.raceMasterName}
//                                             </IonSelectOption>
//                                         ))}
//                                     </IonSelect>
//                                 )}
//                             </div>
//                         </IonCol>

//                         <div className="details-row">
//                             <IonLabel>Sold after 1st/2nd/3rd Moult*:</IonLabel>
//                             <IonSelect
//                                 value={dflDetails.soldafterMoult}
//                                 placeholder="Select Moult"
//                                 //   disabled={!isEditable}
//                                 onIonChange={(e) => handleChange(e, "soldafterMoult")}
//                                 interfaceOptions={{ cssClass: "custom-select" }} // Add custom class for styling
//                             >
//                                 <IonSelectOption value="1st">1st</IonSelectOption>
//                                 <IonSelectOption value="2nd">2nd</IonSelectOption>
//                                 <IonSelectOption value="3rd">3rd</IonSelectOption>
//                             </IonSelect>
//                         </div>

//                         {/* Hatching Date Field */}
//                         <div className="details-row">
//                             <IonLabel>Hatching Date:</IonLabel>
//                             <div
//                                 onClick={() => setShowHatchingDatePicker(true)
//                                     // isEditable && 
//                                 }
//                                 className="date-display"
//                                 style={{ cursor: 'pointer'  }}
//                             >
//                                 {dflDetails.hatchingdate
//                                     ? new Date(dflDetails.hatchingdate).toLocaleDateString()
//                                     : "Select Date"}
//                             </div>
//                             {showHatchingDatePicker && (
//                                 <IonModal isOpen={showHatchingDatePicker} onDidDismiss={() => setShowHatchingDatePicker(false)}>
//                                 <IonDatetime
//                                     value={dflDetails.hatchingdate}
//                                     onIonChange={(e) => {
//                                         handleChange(e, "hatchingdate");
//                                         setShowHatchingDatePicker(false);
//                                     }}
//                                     onIonCancel={() => setShowHatchingDatePicker(false)}
//                                 />
//                                 <IonButton onClick={() => setShowHatchingDatePicker(false)}>Close</IonButton>
//                                 </IonModal>
//                             )}
//                         </div>

//                         {/* Dispatch Date Field */}
//                         {/* <div className="details-row">
//                             <IonLabel>Dispatch Date:</IonLabel>
//                             <div
//                                 onClick={() => setShowDispatchDatePicker(true)
//                                     // isEditable && 
//                                 }
//                                 className="date-display"
//                             >
//                                 {dflDetails.dispathdate
//                                     ? new Date(dflDetails.dispathdate).toLocaleDateString()
//                                     : "Select Date"}
//                             </div>
//                             {showDispatchDatePicker && (
//                                 <IonDatetime
//                                     value={dflDetails.dispathdate}
//                                     onIonChange={(e) => {
//                                         handleChange(e, "dispathdate");
//                                         setShowDispatchDatePicker(false);
//                                     }}
//                                     onIonCancel={() => setShowDispatchDatePicker(false)}
//                                 />
//                             )}
//                         </div> */}

// <div className="details-row">
//     <IonLabel>Dispatch Date:</IonLabel>
//     <div
//         onClick={() => setShowDispatchDatePicker(true)}
//         className="date-display"
//         style={{ cursor: 'pointer' }} // Added to make it look clickable
//     >
//         {dflDetails.dispathdate
//             ? new Date(dflDetails.dispathdate).toLocaleDateString()
//             : "Select Date"}
//     </div>
//     {showDispatchDatePicker && (
//         <IonModal isOpen={showDispatchDatePicker} onDidDismiss={() => setShowDispatchDatePicker(false)}>
//             <IonDatetime
//                 value={dflDetails.dispathdate}
//                 onIonChange={(e) => {
//                     handleChange(e, "dispathdate");
//                     setShowDispatchDatePicker(false);
//                 }}
//                 onIonCancel={() => setShowDispatchDatePicker(false)}
//             />
//             <IonButton onClick={() => setShowDispatchDatePicker(false)}>Close</IonButton>
//         </IonModal>
//     )}
// </div>



//                         <IonButton expand="full" onClick={handleEdit}>
//                             {/* {isEditable ? "Save" : "Edit"} */}Save
//                         </IonButton>


//                     </IonCardContent>
//                 </IonCard>


//                 <IonAlert
//                     isOpen={showAlert}
//                     onDidDismiss={() => setShowAlert(false)}
//                     header={isError ? "Error" : "Success"}
//                     message={message}
//                     buttons={['OK']}
//                 />

//             </IonContent>
//         </IonPage>
//     );
// };

// export default AddDlfPage;





import React, { useState, useEffect } from "react";
import {
    IonContent,
    IonPage,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonInput,
    IonLabel,
    IonButton,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    IonIcon,
    IonBackButton,
    IonSelect,
    IonSelectOption,
    IonDatetime,
    IonCol,
    IonAlert,
    IonModal,
} from "@ionic/react";
import { trash } from "ionicons/icons"; // Import the trash icon
import "./ProfileInfoPage.css";
import "./AddDlfPage.css";
import axios from "axios";
import { API_URL_DBT, API_URL_ChowkiManagment } from "../auth.service";
import { API_URL_Master_Data } from '../auth.service';
import { useHistory, useParams } from 'react-router-dom';

const AddDlfPage: React.FC = () => {
    const history = useHistory();
    const [searchText, setSearchText] = useState<string>("");
    const [data, setData] = useState<any>(null);
    //   const [isEditable, setIsEditable] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(false);
    const [viewAll, setViewAll] = useState<boolean>(false);
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const { fruitsId } = useParams<{ fruitsId: string }>(); // Get the Fruits ID from the URL parameter

    // State variables for dropdown options
    const [raceOptions, setRaceOptions] = useState<number[]>([
        1,
        2,
    ]); // Dummy data for race options
    const [tscOptions, setTscOptions] = useState<number[]>([1, 2]); // Dummy data for Tsc options
    const [showHatchingDatePicker, setShowHatchingDatePicker] =
        useState<boolean>(false);
    const [showDispatchDatePicker, setShowDispatchDatePicker] =
        useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [farmerId, setFarmerId] = useState<number | null>(null);
    const [dflDetails, setDflDetails] = useState<any>({
        tsc: "",
        lotNumberofRSP: "",
        lotNumberofCRC: "",
        numberofDFLs: "",
        rateperDFLs: "",
        price: "",
        raceOfDfls: "",
        soldafterMoult: "",
        sourceofDFLs: "",
        dispathdate:"",
        hatchingdate:"",
    });

    console.log("dfldetails", dflDetails);


    // Fetch race options from the API
    const fetchRaceOptions = async () => {
        try {
            const response = await fetch("API_URL_FOR_RACE_OPTIONS"); // Replace with your API URL
            const result = await response.json();
            setRaceOptions(result); // Assuming the API returns an array of strings
        } catch (error) {
            console.error("Error fetching race options:", error);
        }
    };

    // Fetch Tsc options from the API
    const fetchTscOptions = async () => {
        try {
            const response = await fetch("API_URL_FOR_TSC_OPTIONS"); // Replace with your API URL
            const result = await response.json();
            setTscOptions(result); // Assuming the API returns an array of strings
        } catch (error) {
            console.error("Error fetching Tsc options:", error);
        }
    };

    useEffect(() => {
        // fetchDetails(); // Fetch details when the component mounts
        fetchRaceOptions(); // Fetch race options on component mount
        fetchTscOptions(); // Fetch Tsc options on component mount
    }, []);

    useEffect(() => {
        if (dflDetails?.numberofDFLs && dflDetails?.rateperDFLs) {
            const calculatedPrice = dflDetails.numberofDFLs * dflDetails.rateperDFLs;
            setDflDetails((prevData: any) => ({
                ...prevData,
                price: calculatedPrice.toFixed(2), // Update price field with the calculated value
            }));
        }
    }, [dflDetails?.numberofDFLs, dflDetails?.rateperDFLs]);
    useEffect(() => {
        clearSearch(); // Call clearSearch when the component mounts
    }, []);

    // State for Tsc selection and data fetching
    const [tsc, setTscMasterId] = useState<string>(''); // Selected Tsc
    const [tscListData, setTscListData] = useState<any[]>([]); // List of Tsc options from API
    const [fetchError, setFetchError] = useState<boolean>(false); // Fetch error state
   

    // Function to fetch Tsc data from the API
    const fetchTscList = async () => {
        try {
            const response = await axios.get(`${API_URL_Master_Data}tscMaster/get-all`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('jwtToken')}`, // Use token if required
                },
            });

            if (response.data && response.data.content) {
                setTscListData(response.data.content.tscMaster); // Set the fetched data
            } else {
                console.error('Unexpected API response format:', response);
                setFetchError(true);
            }
        } catch (error) {
            console.error('Error fetching Tsc list:', error);
            setFetchError(true); // Set error state if fetch fails
        }
    };

    // Function to handle Tsc selection change
    const handleTscChange = (value: string) => {
        setTscMasterId(value); // Set the selected Tsc
    };

    // Fetch Tsc list when component mounts
    useEffect(() => {
        fetchTscList();
    }, []);

    // State for Tsc selection and data fetching
    const [raceOfDfls, setRaceOfDfls] = useState<string>(''); // Selected Tsc
    const [raceMasterListData, setRaceMasterListData] = useState<any[]>([]); // List of Tsc options from API
    //  const [fetchError, setFetchError] = useState<boolean>(false); // Fetch error state

    // Function to fetch Tsc data from the API
    const fetchRaceMasterList = async () => {
        try {
            const response = await axios.get(`${API_URL_Master_Data}raceMaster/get-all`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('jwtToken')}`, // Use token if required
                },
            });

            if (response.data && response.data.content) {
                setRaceMasterListData(response.data.content.raceMaster); // Set the fetched data
            } else {
                console.error('Unexpected API response format:', response);
                setFetchError(true);
            }
        } catch (error) {
            console.error('Error fetching Tsc list:', error);
            setFetchError(true); // Set error state if fetch fails
        }
    };

    // Function to handle Tsc selection change
    const handleRaceMasterChange = (value: string) => {
        setRaceOfDfls(value); // Set the selected Tsc
    };


    // Fetch Tsc list when component mounts
    useEffect(() => {
        fetchRaceMasterList();
    }, []);


    // useEffect(() => {
    //     if (fruitsId) {
    //         handleEdit(fruitsId);
    //     }
    // }, [fruitsId]);

    const handleEdit = () => {
        //   if (isEditable) {
        const api = axios.create({
            baseURL: API_URL_ChowkiManagment,
        });
        api
            .post(
                "chowkimanagement/add-sale-disposal-dfl-info",
                {
                    fruitsId: fruitsId,
                    // lotNumberRsp: dflDetails.lotNumberofRSP,
                    lotNumber: dflDetails.lotNumberofCRC,
                    numberOfDflsDisposed: dflDetails.numberofDFLs,
                    ratePer100DflsPrice: dflDetails.rateperDFLs,
                    price: dflDetails.price,
                    dflsSource: dflDetails.sourceofDFLs,
                    raceId: dflDetails.raceOfDfls,
                    tsc: dflDetails.tsc,
                    soldAfter1stOr2ndMould: dflDetails.soldafterMoult,
                    dateOfDisposal:dflDetails.dispathdate,
                    expectedDateOfHatching:dflDetails.hatchingdate,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        accept: "*/*",
                        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
                    },
                }
            )
            .then((res) => {
                console.log("Response:", res.data);
                if (res.data.error === 0) {
                    setMessage("Data added successfully!");
                    setIsError(false);
                    setShowAlert(true);
                    clearSearch();

                     // Redirect to "add-dlf" and refresh the page
                // history.push("/add-dlf")
                // window.location.reload();

                 // Redirect to "add-dlf" after a 1-second delay
                 setTimeout(() => {
                    history.push("/add-dlf");
                }, 1000);

                

                } else {
                    setMessage("Failed to add data.");
                    setIsError(true);
                    setShowAlert(true);
                }
            })
            .catch((error) => {
                console.error("Error updating farmer details", error);
                setMessage("Error updating farmer details");
                setIsError(true);
                // setShowAlert(true);
            });
        //   }
        //   setIsEditable(!isEditable); // Toggle editable state
    };

    const clearSearch = () => {
        setSearchText("");
        setData(null);
        // setIsEditable(false);
        setDflDetails({
            tsc: "",
            // lotNumberofRSP: "",
            lotNumberofCRC: "",
            numberofDFLs: "",
            rateperDFLs: "",
            price: "",
            raceOfDfls: "",
            soldafterMoult: "",
            sourceofDFLs: "",
            dispathdate:"",
            hatchingdate:"",
        });
    };

    const handleChange = (e: any, field: string) => {
        if (dflDetails) {
            setDflDetails({
                ...dflDetails,
                [field]: e.detail.value, // Change here to work with IonSelect
            });
        }
    };
    //   const clearField=()=>{
    //     setViewAll(false);
    //   }

    //   const toggleViewAll = () => {
    //     setViewAll(!viewAll);
    //     setIsEditable(!isEditable);
    //   };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonMenuButton /><IonBackButton defaultHref="/" /> 
                        
                    </IonButtons>
                    <IonTitle>
                        <b>Add DFL's Details</b>
                    </IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent>
                {/* <div className="search-container">
          <IonLabel className="fruits-id-label">Fruits ID</IonLabel>
          <IonInput
            value={searchText}
            placeholder="Enter Fruits ID"
            onIonChange={(e) => setSearchText(e.detail.value!)}
          />
          <IonButton size="small" onClick={fetchFarmerDetails}>Search</IonButton>


          <IonButton size="small" fill="clear" onClick={clearSearch}>
            <IonIcon color="danger" icon={trash} />
          </IonButton>
        </div> */}

                {/* {data && ( */}
                <IonCard className="details-card">
                    {/* <IonCardHeader>
              <IonCardTitle>DFLs Details</IonCardTitle>
            </IonCardHeader> */}
                    <IonCardContent>
                        {/* {!viewAll ? (
                <IonButton expand="full" onClick={toggleViewAll}>
                  Add Details
                </IonButton>
              ) : (
                <>
                  <IonButton expand="full" onClick={toggleViewAll}>
                    Hide
                  </IonButton> */}
                        {/* <div className="details-row">
                            <IonLabel>Lot No.(RSP):</IonLabel>
                            <IonInput
                                value={dflDetails.lotNumberofRSP}
                                //   readonly={!isEditable}
                                onIonChange={(e) => handleChange(e, "lotNumberofRSP")}
                            />
                        </div> */}
                        <div className="details-row">
                            <IonLabel>Lot No:</IonLabel>
                            <IonInput
                                value={dflDetails.lotNumberofCRC}
                                //   readonly={!isEditable}
                                onIonChange={(e) => handleChange(e, "lotNumberofCRC")}
                            />
                        </div>
                        <div className="details-row">
                            <IonLabel>Number of DFL’s:</IonLabel>
                            <IonInput
                                value={dflDetails.numberofDFLs}
                                //   readonly={!isEditable}
                                onIonChange={(e) => handleChange(e, "numberofDFLs")}
                            />
                        </div>
                        <div className="details-row">
                            <IonLabel>Rate per 100 DFLs:</IonLabel>
                            <IonInput
                                value={dflDetails.rateperDFLs}
                                //   readonly={!isEditable}
                                onIonChange={(e) => handleChange(e, "rateperDFLs")}
                            />
                        </div>
                        <div className="details-row">
                            <IonLabel>Price(in Rupees):</IonLabel>
                            <IonInput
                                value={dflDetails.price}
                                readonly={true}
                                onIonChange={(e) => handleChange(e, "price")}
                            />
                        </div>
                        <div className="details-row">
                            <IonLabel>Source of DFLs:</IonLabel>
                            <IonInput
                                value={dflDetails.sourceofDFLs}
                                //   readonly={!isEditable}
                                onIonChange={(e) => handleChange(e, "sourceofDFLs")}
                            />
                        </div>


                        <IonCol size="12">
                            <div className="details-row">
                                <IonLabel>
                                    <b>Select Tsc:</b>
                                </IonLabel>
                                {fetchError ? (
                                    <p style={{ color: 'red' }}>Failed to fetch Tsc list. Please try again later.</p>
                                ) : (
                                    <IonSelect
                                        value={dflDetails.tsc}
                                        // disabled={!isEditable} // Disable if not editable
                                        placeholder="Select Tsc"
                                        onIonChange={(e) => handleChange(e, "tsc")}
                                    >
                                        <IonSelectOption value="">None</IonSelectOption> {/* Option to deselect */}
                                        {tscListData?.map((tsc) => (
                                            <IonSelectOption key={tsc.tscMasterId} value={tsc.tscMasterId}>
                                                {tsc.name}
                                            </IonSelectOption>
                                        ))}
                                    </IonSelect>
                                )}
                            </div>
                        </IonCol>

                        <IonCol size="12">
                            <div className="details-row">
                                <IonLabel>
                                    <b>Select Race:</b>
                                </IonLabel>
                                {fetchError ? (
                                    <p style={{ color: 'red' }}>Failed to fetch Race list. Please try again later.</p>
                                ) : (
                                    <IonSelect
                                        value={dflDetails.raceOfDfls}
                                        // disabled={!isEditable} // Disable if not editable
                                        placeholder="Select Race"
                                        onIonChange={(e) => handleChange(e, "raceOfDfls")}
                                    >
                                        <IonSelectOption value="">None</IonSelectOption> {/* Option to deselect */}
                                        {raceMasterListData?.map((race) => (
                                            <IonSelectOption key={race.raceMasterId} value={race.raceMasterId}>
                                                {race.raceMasterName}
                                            </IonSelectOption>
                                        ))}
                                    </IonSelect>
                                )}
                            </div>
                        </IonCol>

                        <div className="details-row">
                            <IonLabel>Sold after 1st/2nd/3rd Moult*:</IonLabel>
                            <IonSelect
                                value={dflDetails.soldafterMoult}
                                placeholder="Select Moult"
                                //   disabled={!isEditable}
                                onIonChange={(e) => handleChange(e, "soldafterMoult")}
                                interfaceOptions={{ cssClass: "custom-select" }} // Add custom class for styling
                            >
                                <IonSelectOption value="1st">1st</IonSelectOption>
                                <IonSelectOption value="2nd">2nd</IonSelectOption>
                                <IonSelectOption value="3rd">3rd</IonSelectOption>
                            </IonSelect>
                        </div>

                        {/* Hatching Date Field */}
                        <div className="details-row">
                            <IonLabel>Hatching Date:</IonLabel>
                            <div
                                onClick={() => setShowHatchingDatePicker(true)
                                    // isEditable && 
                                }
                                className="date-display"
                                style={{ cursor: 'pointer'  }}
                            >
                                {dflDetails.hatchingdate
                                    ? new Date(dflDetails.hatchingdate).toLocaleDateString()
                                    : "Select Date"}
                            </div>
                            {showHatchingDatePicker && (
                                <IonModal isOpen={showHatchingDatePicker} onDidDismiss={() => setShowHatchingDatePicker(false)}>
                                <IonDatetime
                                    value={dflDetails.hatchingdate|| new Date().toISOString()}
                                    onIonChange={(e) => {
                                        handleChange(e, "hatchingdate");
                                        setShowHatchingDatePicker(false);
                                    }}
                                    onIonCancel={() => setShowHatchingDatePicker(false)}
                                />
                                <IonButton onClick={() => setShowHatchingDatePicker(false)}>Close</IonButton>
                                </IonModal>
                            )}
                        </div>

                        {/* Dispatch Date Field */}
                        {/* <div className="details-row">
                            <IonLabel>Dispatch Date:</IonLabel>
                            <div
                                onClick={() => setShowDispatchDatePicker(true)
                                    // isEditable && 
                                }
                                className="date-display"
                            >
                                {dflDetails.dispathdate
                                    ? new Date(dflDetails.dispathdate).toLocaleDateString()
                                    : "Select Date"}
                            </div>
                            {showDispatchDatePicker && (
                                <IonDatetime
                                    value={dflDetails.dispathdate}
                                    onIonChange={(e) => {
                                        handleChange(e, "dispathdate");
                                        setShowDispatchDatePicker(false);
                                    }}
                                    onIonCancel={() => setShowDispatchDatePicker(false)}
                                />
                            )}
                        </div> */}

<div className="details-row">
    <IonLabel>Dispatch Date:</IonLabel>
    <div
        onClick={() => setShowDispatchDatePicker(true)}
        className="date-display"
        style={{ cursor: 'pointer' }} // Added to make it look clickable
    >
        {dflDetails.dispathdate
            ? new Date(dflDetails.dispathdate).toLocaleDateString()
            : "Select Date"}
    </div>
    {showDispatchDatePicker && (
        <IonModal isOpen={showDispatchDatePicker} onDidDismiss={() => setShowDispatchDatePicker(false)}>
            <IonDatetime
                value={dflDetails.dispathdate || new Date().toISOString()}
                onIonChange={(e) => {
                    handleChange(e, "dispathdate");
                    setShowDispatchDatePicker(false);
                }}
                onIonCancel={() => setShowDispatchDatePicker(false)}
            />
            <IonButton onClick={() => setShowDispatchDatePicker(false)}>Close</IonButton>
        </IonModal>
    )}
</div>



                        <IonButton expand="full" onClick={handleEdit}>
                            {/* {isEditable ? "Save" : "Edit"} */}Save
                        </IonButton>


                    </IonCardContent>
                </IonCard>


                <IonAlert
                    isOpen={showAlert}
                    onDidDismiss={() => setShowAlert(false)}
                    header={isError ? "Error" : "Success"}
                    message={message}
                    buttons={['OK']}
                />

            </IonContent>
        </IonPage>
    );
};

export default AddDlfPage;





//New Code


// import React, { useState, useEffect } from "react";
// import {
//     IonContent,
//     IonPage,
//     IonCard,
//     IonCardContent,
//     IonCardHeader,
//     IonCardTitle,
//     IonInput,
//     IonLabel,
//     IonButton,
//     IonHeader,
//     IonToolbar,
//     IonTitle,
//     IonButtons,
//     IonMenuButton,
//     IonIcon,
//     IonBackButton,
//     IonSelect,
//     IonSelectOption,
//     IonDatetime,
//     IonCol,
//     IonAlert,
//     IonModal,
// } from "@ionic/react";
// import { trash } from "ionicons/icons"; // Import the trash icon
// import "./ProfileInfoPage.css";
// import "./AddDlfPage.css";
// import axios from "axios";
// import { API_URL_DBT, API_URL_ChowkiManagment } from "../auth.service";
// import { API_URL_Master_Data } from '../auth.service';
// import { useHistory, useParams } from 'react-router-dom';

// const AddDlfPage: React.FC = () => {
//     const history = useHistory();
//     const [searchText, setSearchText] = useState<string>("");
//     const [data, setData] = useState<any>(null);
//     //   const [isEditable, setIsEditable] = useState<boolean>(false);
//     const [isError, setIsError] = useState<boolean>(false);
//     const [viewAll, setViewAll] = useState<boolean>(false);
//     const [showAlert, setShowAlert] = useState<boolean>(false);
//     const { fruitsId } = useParams<{ fruitsId: string }>(); // Get the Fruits ID from the URL parameter

//     // State variables for dropdown options
//     const [raceOptions, setRaceOptions] = useState<number[]>([
//         1,
//         2,
//     ]); // Dummy data for race options
//     const [tscOptions, setTscOptions] = useState<number[]>([1, 2]); // Dummy data for Tsc options
//     const [showHatchingDatePicker, setShowHatchingDatePicker] =
//         useState<boolean>(false);
//     const [showDispatchDatePicker, setShowDispatchDatePicker] =
//         useState<boolean>(false);
//     const [message, setMessage] = useState<string>("");
//     const [farmerId, setFarmerId] = useState<number | null>(null);
//     const [dflDetails, setDflDetails] = useState<any>({
//         tsc: "",
//         lotNumberofRSP: "",
//         lotNumberofCRC: "",
//         numberofDFLs: "",
//         rateperDFLs: "",
//         price: "",
//         raceOfDfls: "",
//         soldafterMoult: "",
//         sourceofDFLs: "",
//         dispathdate:"",
//         hatchingdate:"",
//     });

//     console.log("dfldetails", dflDetails);


//     // Fetch race options from the API
//     const fetchRaceOptions = async () => {
//         try {
//             const response = await fetch("API_URL_FOR_RACE_OPTIONS"); // Replace with your API URL
//             const result = await response.json();
//             setRaceOptions(result); // Assuming the API returns an array of strings
//         } catch (error) {
//             console.error("Error fetching race options:", error);
//         }
//     };

//     // Fetch Tsc options from the API
//     const fetchTscOptions = async () => {
//         try {
//             const response = await fetch("API_URL_FOR_TSC_OPTIONS"); // Replace with your API URL
//             const result = await response.json();
//             setTscOptions(result); // Assuming the API returns an array of strings
//         } catch (error) {
//             console.error("Error fetching Tsc options:", error);
//         }
//     };

//     useEffect(() => {
//         // fetchDetails(); // Fetch details when the component mounts
//         fetchRaceOptions(); // Fetch race options on component mount
//         fetchTscOptions(); // Fetch Tsc options on component mount
//     }, []);

//     useEffect(() => {
//         if (dflDetails?.numberofDFLs && dflDetails?.rateperDFLs) {
//             const calculatedPrice = dflDetails.numberofDFLs * dflDetails.rateperDFLs;
//             setDflDetails((prevData: any) => ({
//                 ...prevData,
//                 price: calculatedPrice.toFixed(2), // Update price field with the calculated value
//             }));
//         }
//     }, [dflDetails?.numberofDFLs, dflDetails?.rateperDFLs]);
//     useEffect(() => {
//         clearSearch(); // Call clearSearch when the component mounts
//     }, []);

//     // State for Tsc selection and data fetching
//     const [tsc, setTscMasterId] = useState<string>(''); // Selected Tsc
//     const [tscListData, setTscListData] = useState<any[]>([]); // List of Tsc options from API
//     const [fetchError, setFetchError] = useState<boolean>(false); // Fetch error state
   

//     // Function to fetch Tsc data from the API
//     const fetchTscList = async () => {
//         try {
//             const response = await axios.get(`${API_URL_Master_Data}tscMaster/get-all`, {
//                 headers: {
//                     Authorization: `Bearer ${localStorage.getItem('jwtToken')}`, // Use token if required
//                 },
//             });

//             if (response.data && response.data.content) {
//                 setTscListData(response.data.content.tscMaster); // Set the fetched data
//             } else {
//                 console.error('Unexpected API response format:', response);
//                 setFetchError(true);
//             }
//         } catch (error) {
//             console.error('Error fetching Tsc list:', error);
//             setFetchError(true); // Set error state if fetch fails
//         }
//     };

//     // Function to handle Tsc selection change
//     const handleTscChange = (value: string) => {
//         setTscMasterId(value); // Set the selected Tsc
//     };

//     // Fetch Tsc list when component mounts
//     useEffect(() => {
//         fetchTscList();
//     }, []);

//     // State for Tsc selection and data fetching
//     const [raceOfDfls, setRaceOfDfls] = useState<string>(''); // Selected Tsc
//     const [raceMasterListData, setRaceMasterListData] = useState<any[]>([]); // List of Tsc options from API
//     //  const [fetchError, setFetchError] = useState<boolean>(false); // Fetch error state

//     // Function to fetch Tsc data from the API
//     const fetchRaceMasterList = async () => {
//         try {
//             const response = await axios.get(`${API_URL_Master_Data}raceMaster/get-all`, {
//                 headers: {
//                     Authorization: `Bearer ${localStorage.getItem('jwtToken')}`, // Use token if required
//                 },
//             });

//             if (response.data && response.data.content) {
//                 setRaceMasterListData(response.data.content.raceMaster); // Set the fetched data
//             } else {
//                 console.error('Unexpected API response format:', response);
//                 setFetchError(true);
//             }
//         } catch (error) {
//             console.error('Error fetching Tsc list:', error);
//             setFetchError(true); // Set error state if fetch fails
//         }
//     };

//     // Function to handle Tsc selection change
//     const handleRaceMasterChange = (value: string) => {
//         setRaceOfDfls(value); // Set the selected Tsc
//     };


//     // Fetch Tsc list when component mounts
//     useEffect(() => {
//         fetchRaceMasterList();
//     }, []);


//     // useEffect(() => {
//     //     if (fruitsId) {
//     //         handleEdit(fruitsId);
//     //     }
//     // }, [fruitsId]);

//     const handleEdit = () => {
//         //   if (isEditable) {
//         const api = axios.create({
//             baseURL: API_URL_ChowkiManagment,
//         });
//         api
//             .post(
//                 "chowkimanagement/add-sale-disposal-dfl-info",
//                 {
//                     fruitsId: fruitsId,
//                     lotNumberRsp: dflDetails.lotNumberofRSP,
//                     lotNumber: dflDetails.lotNumberofCRC,
//                     numberOfDflsDisposed: dflDetails.numberofDFLs,
//                     ratePer100DflsPrice: dflDetails.rateperDFLs,
//                     price: dflDetails.price,
//                     dflsSource: dflDetails.sourceofDFLs,
//                     raceId: dflDetails.raceOfDfls,
//                     tsc: dflDetails.tsc,
//                     soldAfter1stOr2ndMould: dflDetails.soldafterMoult,
//                     dateOfDisposal:dflDetails.dispathdate,
//                     expectedDateOfHatching:dflDetails.hatchingdate,
//                 },
//                 {
//                     headers: {
//                         "Content-Type": "application/json",
//                         accept: "*/*",
//                         Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
//                     },
//                 }
//             )
//             .then((res) => {
//                 console.log("Response:", res.data);
//                 if (res.data.error === 0) {
//                     setMessage("Data added successfully!");
//                     setIsError(false);
//                     setShowAlert(true);
//                     clearSearch();

//                      // Redirect to "add-dlf" and refresh the page
//                 // history.push("/add-dlf")
//                 // window.location.reload();

//                  // Redirect to "add-dlf" after a 1-second delay
//                  setTimeout(() => {
//                     history.push("/add-dlf");
//                 }, 1000);

                

//                 } else {
//                     setMessage("Failed to add data.");
//                     setIsError(true);
//                     setShowAlert(true);
//                 }
//             })
//             .catch((error) => {
//                 console.error("Error updating farmer details", error);
//                 setMessage("Error updating farmer details");
//                 setIsError(true);
//                 // setShowAlert(true);
//             });
//         //   }
//         //   setIsEditable(!isEditable); // Toggle editable state
//     };

//     const clearSearch = () => {
//         setSearchText("");
//         setData(null);
//         // setIsEditable(false);
//         setDflDetails({
//             tsc: "",
//         lotNumberofRSP: "",
//         lotNumberofCRC: "",
//         numberofDFLs: "",
//         rateperDFLs: "",
//         price: "",
//         raceOfDfls: "",
//         soldafterMoult: "",
//         sourceofDFLs: "",
//         dispathdate:"",
//         hatchingdate:"",
//         });
//     };

//     const handleChange = (e: any, field: string) => {
//         if (dflDetails) {
//             setDflDetails({
//                 ...dflDetails,
//                 [field]: e.detail.value, // Change here to work with IonSelect
//             });
//         }
//     };
//     //   const clearField=()=>{
//     //     setViewAll(false);
//     //   }

//     //   const toggleViewAll = () => {
//     //     setViewAll(!viewAll);
//     //     setIsEditable(!isEditable);
//     //   };

//     return (
//         <IonPage>
//             <IonHeader>
//                 <IonToolbar>
//                     <IonButtons slot="start">
//                         <IonBackButton defaultHref="/" /> {/* Back button added */}
//                         <IonMenuButton />
//                     </IonButtons>
//                     <IonTitle>
//                         <b>Add DFL's Details</b>
//                     </IonTitle>
//                 </IonToolbar>
//             </IonHeader>

//             <IonContent>
//                 {/* <div className="search-container">
//           <IonLabel className="fruits-id-label">Fruits ID</IonLabel>
//           <IonInput
//             value={searchText}
//             placeholder="Enter Fruits ID"
//             onIonChange={(e) => setSearchText(e.detail.value!)}
//           />
//           <IonButton size="small" onClick={fetchFarmerDetails}>Search</IonButton>


//           <IonButton size="small" fill="clear" onClick={clearSearch}>
//             <IonIcon color="danger" icon={trash} />
//           </IonButton>
//         </div> */}

//                 {/* {data && ( */}
//                 <IonCard className="details-card">
//                     {/* <IonCardHeader>
//               <IonCardTitle>DFLs Details</IonCardTitle>
//             </IonCardHeader> */}
//                     <IonCardContent>
//                         {/* {!viewAll ? (
//                 <IonButton expand="full" onClick={toggleViewAll}>
//                   Add Details
//                 </IonButton>
//               ) : (
//                 <>
//                   <IonButton expand="full" onClick={toggleViewAll}>
//                     Hide
//                   </IonButton> */}
//                         <div className="details-row">
//                             <IonLabel>Lot No.(RSP):</IonLabel>
//                             <IonInput
//                                 value={dflDetails.lotNumberofRSP}
//                                 //   readonly={!isEditable}
//                                 onIonChange={(e) => handleChange(e, "lotNumberofRSP")}
//                             />
//                         </div>
//                         <div className="details-row">
//                             <IonLabel>Lot No. (CRC):</IonLabel>
//                             <IonInput
//                                 value={dflDetails.lotNumberofCRC}
//                                 //   readonly={!isEditable}
//                                 onIonChange={(e) => handleChange(e, "lotNumberofCRC")}
//                             />
//                         </div>
//                         <div className="details-row">
//                             <IonLabel>Number of DFL’s:</IonLabel>
//                             <IonInput
//                                 value={dflDetails.numberofDFLs}
//                                 //   readonly={!isEditable}
//                                 onIonChange={(e) => handleChange(e, "numberofDFLs")}
//                             />
//                         </div>
//                         <div className="details-row">
//                             <IonLabel>Rate per 100 DFLs:</IonLabel>
//                             <IonInput
//                                 value={dflDetails.rateperDFLs}
//                                 //   readonly={!isEditable}
//                                 onIonChange={(e) => handleChange(e, "rateperDFLs")}
//                             />
//                         </div>
//                         <div className="details-row">
//                             <IonLabel>Price(in Rupees):</IonLabel>
//                             <IonInput
//                                 value={dflDetails.price}
//                                 readonly={true}
//                                 onIonChange={(e) => handleChange(e, "price")}
//                             />
//                         </div>
//                         <div className="details-row">
//                             <IonLabel>Source of DFLs:</IonLabel>
//                             <IonInput
//                                 value={dflDetails.sourceofDFLs}
//                                 //   readonly={!isEditable}
//                                 onIonChange={(e) => handleChange(e, "sourceofDFLs")}
//                             />
//                         </div>


//                         <IonCol size="12">
//                             <div className="details-row">
//                                 <IonLabel>
//                                     <b>Select Tsc:</b>
//                                 </IonLabel>
//                                 {fetchError ? (
//                                     <p style={{ color: 'red' }}>Failed to fetch Tsc list. Please try again later.</p>
//                                 ) : (
//                                     <IonSelect
//                                         value={dflDetails.tsc}
//                                         // disabled={!isEditable} // Disable if not editable
//                                         placeholder="Select Tsc"
//                                         onIonChange={(e) => handleChange(e, "tsc")}
//                                     >
//                                         <IonSelectOption value="">None</IonSelectOption> {/* Option to deselect */}
//                                         {tscListData?.map((tsc) => (
//                                             <IonSelectOption key={tsc.tscMasterId} value={tsc.tscMasterId}>
//                                                 {tsc.name}
//                                             </IonSelectOption>
//                                         ))}
//                                     </IonSelect>
//                                 )}
//                             </div>
//                         </IonCol>

//                         <IonCol size="12">
//                             <div className="details-row">
//                                 <IonLabel>
//                                     <b>Select Race:</b>
//                                 </IonLabel>
//                                 {fetchError ? (
//                                     <p style={{ color: 'red' }}>Failed to fetch Race list. Please try again later.</p>
//                                 ) : (
//                                     <IonSelect
//                                         value={dflDetails.raceOfDfls}
//                                         // disabled={!isEditable} // Disable if not editable
//                                         placeholder="Select Race"
//                                         onIonChange={(e) => handleChange(e, "raceOfDfls")}
//                                     >
//                                         <IonSelectOption value="">None</IonSelectOption> {/* Option to deselect */}
//                                         {raceMasterListData?.map((race) => (
//                                             <IonSelectOption key={race.raceMasterId} value={race.raceMasterId}>
//                                                 {race.raceMasterName}
//                                             </IonSelectOption>
//                                         ))}
//                                     </IonSelect>
//                                 )}
//                             </div>
//                         </IonCol>

//                         <div className="details-row">
//                             <IonLabel>Sold after 1st/2nd/3rd Moult*:</IonLabel>
//                             <IonSelect
//                                 value={dflDetails.soldafterMoult}
//                                 placeholder="Select Moult"
//                                 //   disabled={!isEditable}
//                                 onIonChange={(e) => handleChange(e, "soldafterMoult")}
//                                 interfaceOptions={{ cssClass: "custom-select" }} // Add custom class for styling
//                             >
//                                 <IonSelectOption value="1st">1st</IonSelectOption>
//                                 <IonSelectOption value="2nd">2nd</IonSelectOption>
//                                 <IonSelectOption value="3rd">3rd</IonSelectOption>
//                             </IonSelect>
//                         </div>

//                         {/* Hatching Date Field */}
//                         <div className="details-row">
//                             <IonLabel>Hatching Date:</IonLabel>
//                             <div
//                                 onClick={() => setShowHatchingDatePicker(true)
//                                     // isEditable && 
//                                 }
//                                 className="date-display"
//                                 style={{ cursor: 'pointer'  }}
//                             >
//                                 {dflDetails.hatchingdate
//                                     ? new Date(dflDetails.hatchingdate).toLocaleDateString()
//                                     : "Select Date"}
//                             </div>
//                             {showHatchingDatePicker && (
//                                 <IonModal isOpen={showHatchingDatePicker} onDidDismiss={() => setShowHatchingDatePicker(false)}>
//                                 <IonDatetime
//                                     value={dflDetails.hatchingdate}
//                                     onIonChange={(e) => {
//                                         handleChange(e, "hatchingdate");
//                                         setShowHatchingDatePicker(false);
//                                     }}
//                                     onIonCancel={() => setShowHatchingDatePicker(false)}
//                                 />
//                                 <IonButton onClick={() => setShowHatchingDatePicker(false)}>Close</IonButton>
//                                 </IonModal>
//                             )}
//                         </div>

//                         {/* Dispatch Date Field */}
//                         {/* <div className="details-row">
//                             <IonLabel>Dispatch Date:</IonLabel>
//                             <div
//                                 onClick={() => setShowDispatchDatePicker(true)
//                                     // isEditable && 
//                                 }
//                                 className="date-display"
//                             >
//                                 {dflDetails.dispathdate
//                                     ? new Date(dflDetails.dispathdate).toLocaleDateString()
//                                     : "Select Date"}
//                             </div>
//                             {showDispatchDatePicker && (
//                                 <IonDatetime
//                                     value={dflDetails.dispathdate}
//                                     onIonChange={(e) => {
//                                         handleChange(e, "dispathdate");
//                                         setShowDispatchDatePicker(false);
//                                     }}
//                                     onIonCancel={() => setShowDispatchDatePicker(false)}
//                                 />
//                             )}
//                         </div> */}

// <div className="details-row">
//     <IonLabel>Dispatch Date:</IonLabel>
//     <div
//         onClick={() => setShowDispatchDatePicker(true)}
//         className="date-display"
//         style={{ cursor: 'pointer' }} // Added to make it look clickable
//     >
//         {dflDetails.dispathdate
//             ? new Date(dflDetails.dispathdate).toLocaleDateString()
//             : "Select Date"}
//     </div>
//     {showDispatchDatePicker && (
//         <IonModal isOpen={showDispatchDatePicker} onDidDismiss={() => setShowDispatchDatePicker(false)}>
//             <IonDatetime
//                 value={dflDetails.dispathdate}
//                 onIonChange={(e) => {
//                     handleChange(e, "dispathdate");
//                     setShowDispatchDatePicker(false);
//                 }}
//                 onIonCancel={() => setShowDispatchDatePicker(false)}
//             />
//             <IonButton onClick={() => setShowDispatchDatePicker(false)}>Close</IonButton>
//         </IonModal>
//     )}
// </div>



//                         <IonButton expand="full" onClick={handleEdit}>
//                             {/* {isEditable ? "Save" : "Edit"} */}Save
//                         </IonButton>


//                     </IonCardContent>
//                 </IonCard>


//                 <IonAlert
//                     isOpen={showAlert}
//                     onDidDismiss={() => setShowAlert(false)}
//                     header={isError ? "Error" : "Success"}
//                     message={message}
//                     buttons={['OK']}
//                 />

//             </IonContent>
//         </IonPage>
//     );
// };

// export default AddDlfPage;