import React, { useState, useEffect, useRef } from 'react';
import { 
  IonContent, IonPage, IonCard, IonCardContent, IonCardHeader, 
  IonCardTitle, IonInput, IonLabel, IonButton, IonHeader, 
  IonToolbar, IonTitle, IonButtons, IonMenuButton, IonIcon, IonBackButton, 
  IonSelect, IonSelectOption, IonDatetime, IonItem,IonCol,
  IonAlert,
} from '@ionic/react';
import { trash } from 'ionicons/icons'; // Import the trash icon
import './ProfileInfoPage.css';
import './AddDlfPage.css';
import axios from "axios";
import { useHistory } from 'react-router-dom';
import { API_URL_DBT,API_URL_ChowkiManagment } from "../auth.service";
import { API_URL_Master_Data } from '../auth.service';

const CropInspectionPage: React.FC = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [data, setData] = useState<any>(null);
  const [viewAll, setViewAll] = useState<boolean>(false);
  const [showInspectionFields, setShowInspectionFields] = useState<boolean>(false); // Show/hide inspection fields
  const [selectedDate, setSelectedDate] = useState<string>(''); // To store selected date
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const [farmerId, setFarmerId] = useState<number | null>(null); 
  const [message, setMessage] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<{ url: string; name: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saleAndDisposalId, setChowkiId] = useState<number | null>(null);
  const [dataList, setDataList] = useState<any[]>([]);


  interface DocumentUploadProps {
    onUpload: (file: File) => void;
    docId: number;
  }
  // const [isEditable, setIsEditable] = useState<boolean>(false);
  const [showHatchingDatePicker, setShowHatchingDatePicker] =
  useState<boolean>(false);
const [showDispatchDatePicker, setShowDispatchDatePicker] =
  useState<boolean>(false);// Date picker visibility
  const [inspectionFields, setInspectionFields] = useState({
    cropInspectionTypeId: '',
    date: '',
    reasonId: '',
    note: '',
    cropStatusId: '',
    mountId: '',
  });
  const [showAlert, setShowAlert] = useState<boolean>(false);

  // State variables for dropdown options
  const [raceOptions, setRaceOptions] = useState<string[]>(['Race A', 'Race B']); // Dummy data for race options
  const [tscOptions, setTscOptions] = useState<string[]>(['Tsc 1', 'Tsc 2']); // Dummy data for Tsc options
  const history = useHistory();
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<boolean>(false);
  const [fid,setFid] = useState<string>("");
  const fetchFarmerDetails = () => {
    clearField();
    const api = axios.create({
      baseURL: API_URL_DBT,
    });
    api
      .post(
        "farmer-details/getInspectionFarmerDetailsByFruitsId",
        { fruitsId: searchText },
        {
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        }
      )
      .then((res) => {
        

        const farmerData = res.data.content[0].farmerResponses;
        setDataList(farmerData); // Set all farmer response data to the dataList state
        if (farmerData.length > 0) {
          setFarmerId(farmerData[0].farmerId);
          toggleViewAll(farmerData[0].fruitsId);
          setFid(farmerData[0].fruitsId);
        }
      })
      .catch((error) => {
        setMessage("Farmer number does not exist");
        setIsError(false);
      });
  };

  const handleChange = (e: any, field: string) => {
    if (inspectionFields) {
      setInspectionFields({
        ...inspectionFields,
        [field]: e.detail.value, // Change here to work with IonSelect
      });
    }
  };
const clearField=()=>{
  setViewAll(false);
}

  const clearSearch = () => {
    setSearchText('');
    setData(null);
    setViewAll(false);
    setShowInspectionFields(false);
    setViewAll(false);
  };
  const [fetchError, setFetchError] = useState<boolean>(false);

  const [mountData, setMountData] = useState<any[]>([]);
  const fetchMountList = async () => {
    try {
      const response = await axios.get(`${API_URL_Master_Data}mount/get-all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
        },
      });
      if (response.data && response.data.content) {
        setMountData(response.data.content.mount);
      } else {
        console.error('Unexpected API response format:', response);
        setFetchError(true);
      }
    } catch (error) {
      console.error('Error fetching Inspection Type:', error);
      setFetchError(true);
    }
  };

  useEffect(() => {
    fetchMountList();
  }, []);

  const [reasonData, setReasonData] = useState<any[]>([]);
  const fetchReasonList = async () => {
    try {
      const response = await axios.get(`${API_URL_Master_Data}reason/get-all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
        },
      });
      if (response.data && response.data.content) {
        setReasonData(response.data.content.reason);
      } else {
        console.error('Unexpected API response format:', response);
        setFetchError(true);
      }
    } catch (error) {
      console.error('Error fetching Tsc list:', error);
      setFetchError(true);
    }
  };

  useEffect(() => {
    fetchReasonList();
  }, []);

  const [cropStatusData, setCropStatusData] = useState<any[]>([]);
  const fetchCropStatusList = async () => {
    try {
      const response = await axios.get(`${API_URL_Master_Data}cropStatus/get-all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
        },
      });
      if (response.data && response.data.content) {
        setCropStatusData(response.data.content.cropStatus);
      } else {
        console.error('Unexpected API response format:', response);
        setFetchError(true);
      }
    } catch (error) {
      console.error('Error fetching Tsc list:', error);
      setFetchError(true);
    }
  };

  useEffect(() => {
    fetchCropStatusList();
  }, []);

  const [cropInspectionTypeData, setCropInspectionTypeData] = useState<any[]>([]);
  const cropInspection = (saleAndDisposalId: number) => {
    const api = axios.create({
      baseURL: API_URL_ChowkiManagment
    });
    
    api.get(`cropInspection/getInspectionTypeForCropFromSaleAndDisposalOfDfl/${saleAndDisposalId}`, {
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
      },
    })
    .then(res => {
      const chowkiData = res.data[0];
      setCropInspectionTypeData(res.data); // Update to directly set the new data
      setChowkiId(chowkiData.saleAndDisposalId); // Set chowkiId for submission
    })
    .catch(error => {
      setMessage("Farmer number does not exist");
      setIsError(true);
    });
  };
  
  // Effect to call cropInspection when chowkiId changes
  useEffect(() => {
    if (saleAndDisposalId !== null) {
      cropInspection(saleAndDisposalId); // Pass chowkiId to cropInspection
    }
  }, [saleAndDisposalId]);



const [isReadyToSubmit, setIsReadyToSubmit] = useState(false); // To control when to call handleEdit

const toggleViewAll = (i: number) => {
  setViewAll(!viewAll);
  const api = axios.create({
    baseURL: API_URL_ChowkiManagment,
  });
  


  api.get(`chowkimanagement/getInspectioninfoForFarmerFromSaleDisposalOfDFls/${i}`, {
    headers: {
      "Content-Type": "application/json",
      accept: "*/*",
      Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
    },
  })
  .then((res) => {
    if (res.data && res.data.length > 0) {
      const chowkiData = res.data[0];

      // Setting specific fields using setData with the first item for other logic
      setData({
        saleAndDisposalId: chowkiData.saleAndDisposalId,
        dflsSource: chowkiData.dflsSource,
        numbersOfDfls: chowkiData.numbersOfDfls,
        lotNumberRsp: chowkiData.lotNumberRsp,
        receiptNo: chowkiData.receiptNo || '',
        raceName: chowkiData.raceName,
        price: chowkiData.price,
        lotNumberCrc: chowkiData.lotNumberCrc,
        ratePer100Dfls: chowkiData.ratePer100Dfls,
      });

      // Set the dataList with the entire array of response data
      setDataList(res.data); // <-- Update this line to use all data
    } else {
      setMessage("No data found for the given farmer ID");
      setIsError(false);
    }
  })
  .catch((error) => {
    setMessage("Farmer number does not exist");
    setIsError(false);
  });





  setViewAll(!viewAll)
};



  const toggleInspectionFields = () => {
    setShowInspectionFields(!showInspectionFields);
  };

  const handleDateChange = (e: any) => {
    setSelectedDate(e.detail.value.split('T')[0]); // Only save the date (YYYY-MM-DD format)
    setIsDatePickerOpen(false); // Close date picker after selection
  };
  const handleAddDetailsClick = (saleAndDisposalId: number,fruitsId: string,farmerId: number) => {
    history.push(`/ins/${fruitsId}/${saleAndDisposalId}/${farmerId}`);
  };

  const inputRef = useRef<HTMLIonInputElement>(null); // Add useRef for input field

  const handleInputChange = (e: CustomEvent) => {
    const value = (e.target as HTMLIonInputElement).value!;
    setSearchText(value);
    if (value.length === 16) {
      inputRef.current?.blur(); // Remove focus from input field
      fetchFarmerDetails();
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton /><IonBackButton defaultHref="/" /> 
            
          </IonButtons>
          <IonTitle><b>Crop Inspection</b></IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="search-container">
          <IonLabel className="fruits-id-label">Fruits ID</IonLabel>
          <IonInput
            ref={inputRef} // Attach ref to IonInput
            value={searchText}
            placeholder="Enter Fruits ID"
            onIonInput={handleInputChange} // Update to use onIonInput
          /></div>
         <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '10px' }}>

          <IonButton id="searchButton" size="small" onClick={() => {
            document.querySelector('input').blur(); // Add this line to blur the input field
            fetchFarmerDetails();
          }}>Search</IonButton>

          {/* Clear button with trash icon */}
          <IonButton size="small" fill="clear" onClick={clearSearch}>
            <IonIcon color="danger" icon={trash} />
          </IonButton>
        </div>

        {dataList && dataList.length > 0 && dataList.map((data, index) => (
  <React.Fragment key={index}> {/* Use React.Fragment with a key if necessary */}
    <IonCard className="details-card">
      <IonCardHeader>
        <IonCardTitle>DFLs Details</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <div className="details-row">
          <IonLabel>Race:</IonLabel>
          <IonInput value={data.raceName} readonly={true} />
        </div>
        {/* <div className="details-row">
          <IonLabel>Lot Number(of the RSP):</IonLabel>
          <IonInput value={data.lotNumberRsp} readonly={true} />
        </div> */}
        <div className="details-row">
          <IonLabel>Lot No:</IonLabel>
          <IonInput value={data.lotNumberCrc} readonly={true} />
        </div>
        <div className="details-row">
          <IonLabel>Number of DFL’s:</IonLabel>
          <IonInput value={data.numbersOfDfls} readonly={true} />
        </div>
        <div className="details-row">
          <IonLabel>Rate per 100 DFLs:</IonLabel>
          <IonInput value={data.ratePer100Dfls} readonly={true} />
        </div>
        <IonButton expand="block" onClick={() => handleAddDetailsClick(data.saleAndDisposalId ?? 0,fid ?? 0,farmerId ?? 0)}>
          Inspection
        </IonButton>
      </IonCardContent>
    </IonCard>
  </React.Fragment>
))}

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
export default CropInspectionPage;
