import React, { useState, useEffect, useRef } from 'react';
import {
  IonContent, IonPage, IonInput, IonButton, IonHeader,
  IonToolbar, IonTitle, IonButtons, IonMenuButton, IonIcon, IonBackButton,
  IonSelect, IonSelectOption, IonDatetime, IonItem,
  IonAlert, IonModal,
} from '@ionic/react';
import { trash, informationCircle, copy, searchOutline, refreshOutline, leafOutline, clipboardOutline, arrowForwardCircle } from 'ionicons/icons';
import { IonSpinner } from '@ionic/react';
import './ProfileInfoPage.css';
import './AddDlfPage.css';
import './UpdateDlfPage.css';
import axios from "axios";
import { useHistory } from 'react-router-dom';
import { API_URL_DBT, API_URL_ChowkiManagment, API_URL_Inspection, API_URL_Master } from "../auth.service";
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
  const [tscMasterId, setTscMasterId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [lastAttemptedUrl, setLastAttemptedUrl] = useState<string>("");
  const [pendingFetchStatus, setPendingFetchStatus] = useState<string>("");
  const [pendingFetchIds, setPendingFetchIds] = useState<string>("");
  const [searching, setSearching] = useState<boolean>(false);

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

  // Pending list modal state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [listData, setListData] = useState<any[]>([]);
  const [listSearchTerm, setListSearchTerm] = useState<string>("");
  const [showCopyAlert, setShowCopyAlert] = useState<boolean>(false);
  const [copyMessage, setCopyMessage] = useState<string>("");
  const fetchFarmerDetails = () => {
    if (searching) return;
    clearField();
    setSearching(true);
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
        setDataList(farmerData);
        if (farmerData.length > 0) {
          setFarmerId(farmerData[0].farmerId);
          toggleViewAll(farmerData[0].fruitsId);
          setFid(farmerData[0].fruitsId);
        }
        setSearching(false);
      })
      .catch((error) => {
        setMessage("Farmer number does not exist");
        setIsError(false);
        setSearching(false);
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

  const getIdList = async () => {
    try {
      const response = await axios.get(
        `${API_URL_Master_Data}userMaster/get/${localStorage.getItem("userMasterId")}`,
        {
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        },
      );
      const tscId = response.data?.content?.tscMasterId;
      if (tscId) {
        setTscMasterId(tscId);
        return tscId;
      }
    } catch (error) {
      console.error("Error fetching TSC Master ID:", error);
    }
    return null;
  };

  const normalizePendingPayload = (payload: any) => {
    const content = payload?.content ?? payload;
    if (Array.isArray(content)) {
      return { rows: content, count: content.length };
    }
    const rows =
      content?.pendingList ||
      content?.list ||
      content?.data ||
      (Array.isArray(content?.content) ? content.content : []) ||
      [];
    const count =
      payload?.pendingCount ??
      content?.pendingCount ??
      (Array.isArray(rows) ? rows.length : 0);
    return { rows: Array.isArray(rows) ? rows : [], count };
  };

  const fetchPendingCropInspections = async (tscIdParam?: string) => {
    setLoading(true);
    const rawTscId = tscIdParam || tscMasterId || (await getIdList());
    // Strict numeric validation — backend expects Long, so refuse "undefined"/"null"/non-numeric strings.
    const numericTscId =
      rawTscId != null && rawTscId !== "undefined" && rawTscId !== "null"
        ? Number(rawTscId)
        : NaN;
    if (!Number.isFinite(numericTscId) || numericTscId <= 0) {
      setPendingCount(0);
      setListData([]);
      setMessage(
        "Your user profile does not have a TSC Master ID assigned. Please contact your administrator.",
      );
      setIsError(true);
      setShowAlert(true);
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("jwtToken");
    if (!token || token === "null" || token === "undefined") {
      setPendingCount(0);
      setListData([]);
      setMessage("Your session has expired. Please sign in again.");
      setIsError(true);
      setShowAlert(true);
      setLoading(false);
      return;
    }

    try {
      const url = `${API_URL_ChowkiManagment}chowkimanagement/getpendingCropInspectionByTsc/${numericTscId}`;
      console.info(`Fetching pending crop inspections from: ${url}`);
      console.info(`TSC ID: ${numericTscId}`);

      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });

      console.info("Pending crop inspections response:", response.data);
      const payload = response.data;
      const rows = Array.isArray(payload)
        ? payload
        : payload?.list || payload?.data || payload?.content || payload?.pendingList || [];
      const count =
        payload?.pendingCount ??
        (Array.isArray(payload) ? payload.length : rows.length);

      setPendingCount(Number(count) || rows.length || 0);
      setListData(Array.isArray(rows) ? rows : []);
      setMessage(`Loaded ${count || 0} pending crop inspections.`);
      setIsError(false);
    } catch (error: any) {
      const statusCode = error?.response?.status;
      console.error("Error fetching pending crop inspections:", error);
      console.error("Error response:", error?.response?.data);
      setPendingCount(0);
      setListData([]);

      if (statusCode === 401 || statusCode === 403) {
        // Real auth failure — JWT is invalid or expired
        setMessage(
          "Your session is invalid or has expired. Please sign out and sign in again.",
        );
        setIsError(true);
        setShowAlert(true);
      } else if (statusCode === 404) {
        setMessage("No pending crop inspections found for your TSC.");
        setIsError(false);
        setShowAlert(true);
      } else {
        setMessage(
          `Unable to load pending crop inspections${statusCode ? ` (status ${statusCode})` : ""}. Please try again.`,
        );
        setIsError(true);
        setShowAlert(true);
      }
    } finally {
      setLoading(false);
    }
  };

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
  


  api.get(`chowkimanagement/getInspectioninfoForFarmerFromSaleDisposalOfDFlsForNewApp/${i}`, {
    headers: {
      "Content-Type": "application/json",
      accept: "*/*",
      Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
    },
  })
  .then((res) => {
    if (res.data && res.data.length > 0) {
      const chowkiData = res.data[0];
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
      setDataList(res.data);
    } else {
      setDataList([]);
      setMessage("No DFL data found for the given Fruits ID");
      setIsError(false);
      setShowAlert(true);
    }
  })
  .catch((error) => {
    console.error("Error fetching inspection info:", error);
    setDataList([]);
    setMessage("No DFL data found for the given Fruits ID");
    setIsError(false);
    setShowAlert(true);
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

  const handleIconClick = async () => {
    await fetchPendingCropInspections();
    setShowModal(true);
  };

  const filteredListData = listData.filter((item) => {
    const term = listSearchTerm.toLowerCase();
    return (
      item?.fruitsId?.toString()?.toLowerCase().includes(term) ||
      item?.farmerName?.toLowerCase().includes(term) ||
      item?.raceName?.toLowerCase().includes(term) ||
      item?.lotNumber?.toString()?.toLowerCase().includes(term)
    );
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopyMessage("Fruits ID copied to clipboard");
        setShowCopyAlert(true);
      })
      .catch(() => {
        setCopyMessage("Failed to copy Fruits ID");
        setShowCopyAlert(true);
      });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="page-toolbar">
          <IonButtons slot="start">
            <IonBackButton text="Back" defaultHref="/cropsub" />
          </IonButtons>
          <IonTitle>Crop Inspection</IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={clearSearch} aria-label="Refresh" disabled={searching}>
              <IonIcon icon={refreshOutline} />
            </IonButton>
            <IonButton fill="clear" onClick={handleIconClick} aria-label="Info">
              <IonIcon icon={informationCircle} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="page-content">
        <div className="page-hero-extension" aria-hidden="true"></div>
        <div className="search-section">
          <div className="search-input-wrap">
            <span className="search-label">Fruits ID</span>
            <IonInput
              ref={inputRef}
              value={searchText}
              placeholder="Enter Fruits ID"
              onIonInput={handleInputChange}
            />
          </div>
          <div className="search-action-row">
            <IonButton
              className={`btn-primary ${searching ? "is-loading" : (searchText.trim() ? "is-active" : "is-disabled-state")}`}
              id="searchButton"
              disabled={searching}
              onClick={() => {
                (document.querySelector('input') as HTMLInputElement | null)?.blur();
                fetchFarmerDetails();
              }}
            >
              {searching ? (
                <>
                  <IonSpinner name="crescent" className="btn-spinner" />
                  <span style={{ marginLeft: 8 }}>Searching...</span>
                </>
              ) : (
                <>
                  <IonIcon icon={searchOutline} slot="start" /> Search
                </>
              )}
            </IonButton>
            <IonButton
              className="icon-only-btn danger"
              onClick={clearSearch}
              aria-label="Clear"
              disabled={searching}
            >
              <IonIcon icon={trash} />
            </IonButton>
          </div>
        </div>
        {dataList && dataList.length > 0 && dataList.map((data, index) => (
          <div key={index} className="result-card">
            <div className="result-head">
              <div className="result-avatar is-accent-green">
                <IonIcon icon={leafOutline} />
              </div>
              <div className="result-head-text">
                <span className="result-eyebrow">DFL Details</span>
                <h3 className="result-title">
                  {index === 0 && data.farmerName ? data.farmerName : `Lot ${data.lotNumberCrc || '—'}`}
                </h3>
              </div>
            </div>

            <div className="result-body">
              {index === 0 && data.farmerName && (
                <div className="info-row">
                  <label className="info-label">Farmer Name</label>
                  <IonInput value={data.farmerName} readonly={true} />
                </div>
              )}
              <div className="info-row">
                <label className="info-label">Race</label>
                <IonInput value={data.raceName} readonly={true} />
              </div>
              <div className="info-row">
                <label className="info-label">Lot Number</label>
                <IonInput value={data.lotNumberCrc} readonly={true} />
              </div>
              <div className="info-row">
                <label className="info-label">Number of DFLs</label>
                <IonInput value={data.numbersOfDfls} readonly={true} />
              </div>
              <div className="info-row">
                <label className="info-label">Rate per 100 DFLs</label>
                <IonInput value={data.ratePer100Dfls} readonly={true} />
              </div>
            </div>

            <div className="result-actions">
              <IonButton
                className="btn-result-primary is-active"
                expand="block"
                onClick={() => handleAddDetailsClick(data.saleAndDisposalId ?? 0, fid ?? 0, farmerId ?? 0)}
              >
                <IonIcon icon={arrowForwardCircle} slot="start" /> Start Inspection
              </IonButton>
            </div>
          </div>
        ))}

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={isError ? "Error" : "Success"}
          message={message}
          buttons={['OK']}
          cssClass={`app-alert ${isError ? 'app-alert--error' : 'app-alert--success'}`}
        />

        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Pending Crop Inspections</IonTitle>
              <IonButtons slot="end">
                <IonButton fill="clear" onClick={() => setShowModal(false)}>
                  Close
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div className={`modal-search ${listSearchTerm ? 'has-value' : ''}`}>
              <IonIcon icon={searchOutline} />
              <input
                type="text"
                value={listSearchTerm}
                onChange={(e) => setListSearchTerm(e.target.value)}
                placeholder="Search Fruits ID"
                aria-label="Search Fruits ID"
              />
              {listSearchTerm && (
                <button
                  type="button"
                  className="clear-btn"
                  onClick={() => setListSearchTerm('')}
                  aria-label="Clear"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="pending-count-banner">
              <IonIcon icon={clipboardOutline} />
              <span><strong>{pendingCount}</strong> pending inspections</span>
            </div>
            <div className="modal-list">
              {filteredListData.length === 0 ? (
                <div className="no-data-hint">No pending inspections match your search.</div>
              ) : (
                filteredListData.map((item, index) => (
                  <div key={index} className="modal-list-card">
                    <div className="modal-list-head">
                      <div className="modal-list-fid">
                        <span className="info-label">Fruits ID</span>
                        <span className="modal-list-fid-value">{item.fruitsId}</span>
                      </div>
                      <IonButton
                        className="icon-only-btn"
                        onClick={() => copyToClipboard(item.fruitsId)}
                        aria-label="Copy Fruits ID"
                      >
                        <IonIcon icon={copy} />
                      </IonButton>
                    </div>
                    <div className="modal-list-grid">
                      <div className="modal-list-row modal-list-row--full">
                        <span className="info-label">Farmer Name</span>
                        <span>{item.farmerName || '—'}</span>
                      </div>
                      <div className="modal-list-row">
                        <span className="info-label">Race</span>
                        <span>{item.raceName || '—'}</span>
                      </div>
                      <div className="modal-list-row">
                        <span className="info-label">Lot Number</span>
                        <span>{item.lotNumber || item.lotNumberCrc || '—'}</span>
                      </div>
                      <div className="modal-list-row">
                        <span className="info-label">Rate / 100 DFLs</span>
                        <span>{item.ratePerDfls || item.ratePer100Dfls || '—'}</span>
                      </div>
                      <div className="modal-list-row">
                        <span className="info-label">No. of DFLs</span>
                        <span>{item.numbersOfDfls || '—'}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <IonAlert
              isOpen={showCopyAlert}
              onDidDismiss={() => setShowCopyAlert(false)}
              header="Copy Status"
              message={copyMessage}
              buttons={["OK"]}
              cssClass="app-alert app-alert--success"
            />
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};
export default CropInspectionPage;
