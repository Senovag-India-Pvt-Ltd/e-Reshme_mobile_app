import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardContent,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonDatetime,
  IonAlert,
  IonCol,
  IonIcon,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonMenuButton,
} from '@ionic/react';
import { API_URL_DBT, API_URL_ChowkiManagment } from "../auth.service";
import {API_URL_Master_Data}from "../auth.service";
import { search, trash } from 'ionicons/icons';
import { useParams } from 'react-router-dom';


const YourComponent = () => {
  const [dflDetails, setDflDetails] = useState({
    dispathdate: '',
    marketName: '',
    cocoonQty: '',
    ratekg: '',
    buyerType: '',
    marketMasterId: '',
    externalUser: ''
  });
  const [searchText, setSearchText] = useState<string>('');
  const [showDispatchDatePicker, setShowDispatchDatePicker] = useState(false);
  const [isReelerEnabled, setIsReelerEnabled] = useState(false);
  const [isExternalEnabled, setIsExternalEnabled] = useState(false);
  // const [reelerData, setReelerData] = useState<any[]>([]);
  const [fetchError, setFetchError] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState('');
  const [data, setData] = useState<any>(null);
  const [reelerId, setReelerId] = useState<number | null>(null);
  const { saleAndDisposalId } = useParams<{ saleAndDisposalId: string }>();
  const [ReelerDetails,setReelerDetails] = useState<any>({})
  const [marketMasterData, setMarketMasterData] = useState<any[]>([]);


  const fetchReelerDetails = () => {
    // clearField();
    axios
      .post(`${API_URL_DBT}reeler/get-reeler-details-by-fruits-id-or-reeler-license-number`,{
        text: searchText,
      }, {
        headers: {
          'Content-Type': 'application/json',
          accept: '*/*',
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
        },
      })
      .then(res => {
        // Directly set the first reeler response if available
        const reelerDetails = res.data.content.body.content[0];
        setData(reelerDetails?.name);
        setReelerId(reelerDetails?.reelerId);  // Safely handle setting reelerId
        setReelerDetails(reelerDetails);
        setMessage('');  // Clear message
        setIsError(false);  // Reset error state
      })
      .catch(() => {
        setMessage('Reeler does not exist');  // Handle error message
        setIsError(true);  // Set error state
        setData(null);  // Clear data on error
      });
  };





  useEffect(() => {
    if (dflDetails.buyerType === 'Reeler') {
      setIsReelerEnabled(true);
      setIsExternalEnabled(false);
    } else if (dflDetails.buyerType === 'External User') {
      setIsExternalEnabled(true);
      setIsReelerEnabled(false);
    } else {
      setIsReelerEnabled(false);
      setIsExternalEnabled(false);
    }
  }, [dflDetails.buyerType]);




  // Fetch Market List from API
  const fetchMarketList = async () => {
    try {
      const response = await axios.get(`${API_URL_Master_Data}marketMaster/get-all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
        },
      });
      if (response.data && response.data.content) {
        setMarketMasterData(response.data.content.marketMaster);
      } else {
        console.error('Unexpected API response format:', response);
        setFetchError(true);
      }
    } catch (error) {
      console.error('Error fetching Reeler List:', error);
      setFetchError(true);
    }
  };

  useEffect(() => {
    fetchMarketList();
  }, []);



  const handleChange = (e, fieldName) => {
    const { value } = e.detail;
    if (fieldName === 'cocoonQty' || fieldName === 'ratekg') {
      if (isNaN(value)) return; // Prevent non-numeric input
    }
    setDflDetails({ ...dflDetails, [fieldName]: value });
  };

  const handleEdit = () => {
    const api = axios.create({
      baseURL: API_URL_ChowkiManagment,
    });

    api
      .post(
        'cropInspection/add-sale-track-cocoon-info',
        {
          fruitsId: dflDetails.marketName, // Replace with actual field for fruitsId
          marketAuctionDate: dflDetails.dispathdate,
          marketMasterId: dflDetails.marketMasterId,
          cocoonsQty: dflDetails.cocoonQty,
          ratePerKg: dflDetails.ratekg,
          buyerType: dflDetails.buyerType,
          reelerId, // Assuming sourceofDFLs corresponds to marketMasterId
          saleAndDisposalId: saleAndDisposalId, // Assuming raceOfDfls corresponds to externalUser
          externalUnitRegistrationName: dflDetails.externalUser,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            accept: '*/*',
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
          },
        }
      )
      .then((res) => {
        console.log('Response:', res.data);
        if (res.data.error === 0) {
          setMessage('Data added successfully!');
          setIsError(false);
          setShowAlert(true);
        } else {
          setMessage('Failed to add data.');
          setIsError(true);
          setShowAlert(true);
        }
      })
      .catch((error) => {
        console.error('Error updating farmer details', error);
        setMessage('Error updating farmer details');
        setIsError(true);
        setShowAlert(true);
      });
  };

  

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton text="Back" slot="start" defaultHref="/dashboard" style={{ color: '#000' }} />
            <IonMenuButton />
          </IonButtons>
          <IonTitle>
            <b>Add Trac Cocoon</b>
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent>
        <IonCard className="details-card">
          <IonCardContent>
            <div className="details-row">
              <IonLabel>Market Date:</IonLabel>
              <div onClick={() => setShowDispatchDatePicker(true)} className="date-display">
                {dflDetails.dispathdate
                  ? new Date(dflDetails.dispathdate).toLocaleDateString()
                  : 'Select Date'}
              </div>
              {showDispatchDatePicker && (
                <IonModal isOpen={showDispatchDatePicker} onDidDismiss={() => setShowDispatchDatePicker(false)}>
                <IonDatetime
                  value={dflDetails.dispathdate || new Date().toISOString()}
                  onIonChange={(e) => {
                    handleChange(e, 'dispathdate');
                    setShowDispatchDatePicker(false);
                  }}
                  onIonCancel={() => setShowDispatchDatePicker(false)}
                />
                 <IonButton onClick={() => setShowDispatchDatePicker(false)}>Close</IonButton>
                 </IonModal>
              )}
            </div>

            {/* <div className="details-row">
              <IonLabel>Market Name:</IonLabel>
              <IonInput
                value={dflDetails.marketName}
                onIonChange={(e) => handleChange(e, 'marketName')}
              />
            </div> */}




            <IonCol size="12">
                <div className="details-row">
                  <IonLabel>
                    <b>Market Name:</b>
                  </IonLabel>
                  {fetchError ? (
                    <p style={{ color: 'red' }}>Failed to fetch market list. Please try again later.</p>
                  ) : (
                    <IonSelect
                      value={dflDetails.marketMasterId}
                      placeholder="Select Market"
                      onIonChange={(e) => handleChange(e, 'marketMasterId')}
                    >
                      {marketMasterData?.map((market) => (
                        <IonSelectOption key={market.marketMasterId} value={market.marketMasterId}>
                          {market.marketMasterName}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  )}
                </div>
              </IonCol>

            <div className="details-row">
              <IonLabel>Cocoons Qty:</IonLabel>
              <IonInput
                value={dflDetails.cocoonQty}
                onIonChange={(e) => handleChange(e, 'cocoonQty')}
              />
            </div>

            <div className="details-row">
              <IonLabel>Rate/Kg:</IonLabel>
              <IonInput
                value={dflDetails.ratekg}
                onIonChange={(e) => handleChange(e, 'ratekg')}
              />
            </div>

            <div className="details-row">
              <IonLabel>Buyer Type:</IonLabel>
              <IonSelect
                value={dflDetails.buyerType}
                placeholder="Select Buyer Type"
                onIonChange={(e) => handleChange(e, 'buyerType')}
                interfaceOptions={{ cssClass: 'custom-select' }}
              >
                <IonSelectOption value="None">None</IonSelectOption>
                <IonSelectOption value="Reeler">Reeler</IonSelectOption>
                <IonSelectOption value="External User">External User</IonSelectOption>
              </IonSelect>
            </div>

            {isReelerEnabled && (
              
              
             

              
              <div className="search-container">
              <IonLabel className="fruits-id-label">Reeler</IonLabel>
              <IonInput
                value={searchText}
                placeholder="Enter Fruits ID"
                onIonChange={e => setSearchText(e.detail.value!)}
              />
              <IonButton size="small" onClick={fetchReelerDetails}><IonIcon icon={search} /></IonButton>
    
             
              {data && (
          
            
           
              <div className="details-row">
                <IonLabel>Reeler Name:</IonLabel>
                <IonInput
                  value={data}
                  readonly={true} // Set to always be readonly
                  // onIonChange={e => handleChange(e, 'reelername')}
                />
              </div>)}

            </div>


            )}

            {isExternalEnabled && (
              <div className="details-row">
                <IonLabel>External User Name:</IonLabel>
                <IonInput
                  value={dflDetails.externalUser || ''}
                  onIonChange={(e) => handleChange(e, 'externalUser')}
                  placeholder="External User"
                />
              </div>
            )}

            <IonButton expand="full" onClick={handleEdit}>
              Save
            </IonButton>
          </IonCardContent>
        </IonCard>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={isError ? 'Error' : 'Success'}
          message={message}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default YourComponent;






function clearField() {
  throw new Error('Function not implemented.');
}

function setData(arg0: any) {
  throw new Error('Function not implemented.');
}

