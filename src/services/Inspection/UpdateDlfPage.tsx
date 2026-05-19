import React, { useState, useEffect, useRef } from "react";
import {
  IonContent,
  IonPage,
  IonInput,
  IonButton,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonIcon,
  IonBackButton,
  IonAlert,
  IonModal,
  IonSearchbar,
  IonSpinner,
} from "@ionic/react";
import { InputChangeEventDetail } from "@ionic/core";
import { trash, informationCircle, copy, search, createOutline, checkmarkCircle } from "ionicons/icons";
import "./ProfileInfoPage.css";
import "./AddDlfPage.css";
import "./UpdateDlfPage.css";
import axios from "axios";
import {
  API_URL_DBT,
  API_URL_ChowkiManagment,
  API_URL_Master_Data,
} from "../auth.service";

const UpdateDlfPage: React.FC = () => {
  const [searchText, setSearchText] = useState<string>("");
  const [dataList, setDataList] = useState<any[]>([]);
  const [farmerData, setFarmerData] = useState<any>(null);
  const [farmerOtherData, setFarmerOtherData] = useState<any>({});
  const [viewAll, setViewAll] = useState<boolean>(false);
  const [receiptNo, setReceiptNo] = useState<string>("");
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);
  const [farmerId, setFarmerId] = useState<number | null>(null);
  const [chowkiId, setChowkiId] = useState<number | null>(null);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [fruitsId, setFruitsId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false); // State to control modal visibility
  const [listData, setListData] = useState<any[]>([]); // State to store list data
  const [listSearchTerm, setListSearchTerm] = useState<string>("");
  const [tscMasterId, setTscMasterId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const inputRef = useRef<HTMLIonInputElement>(null); // Add useRef for input field
  const [showCopyAlert, setShowCopyAlert] = useState<boolean>(false);
  const [copyMessage, setShowCopyMessage] = useState<string>("");
  const [searching, setSearching] = useState<boolean>(false);
  const [submittingIndex, setSubmittingIndex] = useState<number | null>(null);

  useEffect(() => {
    getIdList();
  }, []);

  useEffect(() => {
    if (tscMasterId) {
      getSaleandDisposalList(tscMasterId);
    }
  }, [tscMasterId]);

  const getIdList = () => {
    setLoading(true);
    axios
      .get(
        `${API_URL_Master_Data}userMaster/get/${localStorage.getItem("userMasterId")}`,
        {
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        },
      )
      .then((response) => {
        setTscMasterId(response.data.content.tscMasterId);
        getSaleandDisposalList(response.data.content.tscMasterId); // Call the second API with the TSC Master ID
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching TSC Master ID:", err);
        setTscMasterId(null);
        setLoading(false);
      });
  };

  const getSaleandDisposalList = (tscMasterId: string) => {
    setLoading(true);
    axios
      .get(
        `${API_URL_ChowkiManagment}chowkimanagement/getFarmerDetailsFromSaleDisposalOfDFlsByTsc/${tscMasterId}`,
        {
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        },
      )
      .then((response) => {
        setListData(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching sale and disposal list:", err);
        setLoading(false);
      });
  };

  const fetchFarmerDetailsWithValue = (fruitsIdValue: string) => {
    // Direct API call with provided value (used by handleInputChange)
    if (!fruitsIdValue || fruitsIdValue.trim().length === 0) {
      return;
    }

    clearField(); // Clear previous data
    const api = axios.create({
      baseURL: API_URL_DBT,
    });

    api
      .post(
        "farmer-details/getInspectionFarmerDetailsByFruitsId",
        { fruitsId: fruitsIdValue },
        {
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        },
      )
      .then((res) => {
        const farmerResponses = res.data?.content?.[0]?.farmerResponses || [];
        const firstFarmer = farmerResponses[0] || null;
        setFarmerData(firstFarmer);
        setFarmerId(firstFarmer ? firstFarmer.farmerId : null);
        setFruitsId(firstFarmer ? firstFarmer.fruitsId : null);
        if (firstFarmer) {
          getAllChowkiDetails(firstFarmer.fruitsId);
        } else {
          setMessage(`No data found for Fruits ID: ${fruitsIdValue}`);
          setIsError(true);
          setShowAlert(true);
        }
      })
      .catch((error) => {
        console.error("Error fetching farmer details:", error);
        setMessage("Error fetching farmer details. Please try again.");
        setIsError(true);
        setShowAlert(true);
      });
  };

  const fetchFarmerDetails = () => {
    if (!searchText || searchText.trim().length === 0) {
      setMessage("Please enter a Fruits ID first");
      setIsError(true);
      setShowAlert(true);
      return;
    }
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
        },
      )
      .then((res) => {
        const farmerResponses = res.data?.content?.[0]?.farmerResponses || [];
        const firstFarmer = farmerResponses[0] || null;
        setFarmerData(firstFarmer);
        setFarmerId(firstFarmer ? firstFarmer.farmerId : null);
        setFruitsId(firstFarmer ? firstFarmer.fruitsId : null);
        if (firstFarmer) {
          getAllChowkiDetails(firstFarmer.fruitsId);
        } else {
          setMessage(`No data found for Fruits ID: ${searchText}`);
          setIsError(true);
          setShowAlert(true);
        }
        setSearching(false);
      })
      .catch((error) => {
        console.error("Error fetching farmer details:", error);
        setMessage("Error fetching farmer details. Please try again.");
        setIsError(true);
        setShowAlert(true);
        setSearching(false);
      });
  };

  const getAllChowkiDetails = (i: number) => {
    // setViewAll(!viewAll);
    const api = axios.create({
      baseURL: API_URL_ChowkiManagment,
    });
    api
      .get(`chowkimanagement/get-sale-disposal-by-fruits-id/${i}`, {
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      })
      .then((res) => {
        const chowkiData = res.data[0];
        setFarmerOtherData({
          dflsSource: chowkiData.dflsSource,
          numbersOfDfls: chowkiData.numbersOfDfls,
          lotNumberRsp: chowkiData.lotNumberRsp,
          receiptNo: chowkiData.receiptNo || "",
          lotNumberCrc: chowkiData.lotNumberCrc,
          ratePer100Dfls: chowkiData.ratePer100Dfls,
          expectedHatchingDate: chowkiData.expectedHatchingDate,
          dateOfDisposal: chowkiData.dateOfDisposal, // Handle missing receiptNo
        });
        setDataList(res.data);
        // setData({
        //   lotNumberCrc: chowkiData.lotNumberCrc,
        //   ratePer100Dfls: chowkiData.ratePer100Dfls,
        // });
        setChowkiId(chowkiData.saleAndDisposalId); // Set chowkiId for submission
      })
      .catch((error) => {
        setMessage("Farmer number does not exist");
        setIsError(true);
      });
    setViewAll(!viewAll);
  };

  const clearSearch = () => {
    setSearchText("");
    setDataList([]);
    setFarmerData(null);
    setIsEditable(false);
    setViewAll(false);
  };

  const clearField = () => {
    setFarmerData(null);
    setDataList([]);
    setViewAll(false);
  };

  const clearFields = () => {
    setFarmerOtherData({});
    setSearchText("");
    setDataList([]);
    setFarmerData(null);
    setFarmerId(null);
    setViewAll(false);
  };

  const [editedItemIndex, setEditedItemIndex] = useState<number | null>(null);

  const handleChange = (
    e: CustomEvent<InputChangeEventDetail>,
    index: number,
    field: string,
  ) => {
    const updatedDataList = [...dataList];
    updatedDataList[index] = {
      ...updatedDataList[index],
      [field]: e.detail.value ?? "",
    };
    setDataList(updatedDataList); // Update specific item in the list
  };

  const handleSubmit = (index: number) => {
    const selectedItem = dataList[index];

    if (!selectedItem?.receiptNo || !selectedItem.receiptNo.trim()) {
      setMessage("Receipt No is mandatory");
      setIsError(true);
      setShowAlert(true);
      return;
    }
    if (submittingIndex !== null) return;

    setSubmittingIndex(index);

    const api = axios.create({
      baseURL: API_URL_ChowkiManagment,
    });

    api
      .post(
        "chowkimanagement/update-sale-disposal-dfl-info",
        {
          receiptNo: selectedItem.receiptNo,
          saleAndDisposalId: selectedItem.saleAndDisposalId,
          fruitsId: searchText,
        },
        {
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        },
      )
      .then((res) => {
        setMessage("Farmer details updated successfully");
        setIsError(false);
        setShowAlert(true);
        setEditedItemIndex(null);
        setSubmittingIndex(null);
      })
      .catch((error) => {
        console.error("Error updating farmer details", error);
        setMessage("Error updating farmer details");
        setIsError(true);
        setShowAlert(true);
        setSubmittingIndex(null);
      });
  };

  const toggleEditMode = (index: number) => {
    setEditedItemIndex(index); // Set the index of the item being edited
    setIsEditable(!isEditable); // Toggle editable state
  };

  const toggleViewAll = (i: number) => {
    setViewAll(!viewAll);
    const api = axios.create({
      baseURL: API_URL_ChowkiManagment,
    });
    api
      .get(`chowkimanagement/get-sale-disposal-by-fruits-id/${i}`, {
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      })
      .then((res) => {
        const chowkiData = res.data[0];
        setFarmerOtherData({
          dflsSource: chowkiData.dflsSource,
          numbersOfDfls: chowkiData.numbersOfDfls,
          lotNumberRsp: chowkiData.lotNumberRsp,
          receiptNo: chowkiData.receiptNo || "",
          lotNumberCrc: chowkiData.lotNumberCrc,
          ratePer100Dfls: chowkiData.ratePer100Dfls,
          expectedHatchingDate: chowkiData.expectedHatchingDate,
          dateOfDisposal: chowkiData.dateOfDisposal, // Handle missing receiptNo
        });
        // setData({
        //   lotNumberCrc: chowkiData.lotNumberCrc,
        //   ratePer100Dfls: chowkiData.ratePer100Dfls,
        // });
        setChowkiId(chowkiData.saleAndDisposalId); // Set chowkiId for submission
      })
      .catch((error) => {
        setMessage("Farmer number does not exist");
        setIsError(true);
      });
    setViewAll(!viewAll);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLIonInputElement>) => {
    if (e.key === "Enter") {
      inputRef.current?.blur(); // Remove focus from input field
    }
  };

  const handleInputChange = (e: CustomEvent<InputChangeEventDetail>) => {
    const value = e.detail.value;
    setSearchText(value ?? "");
  };

  const fetchListData = () => {
    setLoading(true);
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      setMessage("Authorization token is missing");
      setIsError(true);
      setShowAlert(true);
      setLoading(false);
      return;
    }

    console.log("Fetching list data with token:", token); // Log the token for debugging

    axios
      .get(`${API_URL_ChowkiManagment}chowkimanagement/getListData`, {
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setListData(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching list data:", err);
        console.log("Request headers:", {
          "Content-Type": "application/json",
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        }); // Log request headers for debugging
        setLoading(false);
        setMessage(
          "Error fetching list data: " +
            (err.response?.data?.message || err.message),
        );
        setIsError(true);
        setShowAlert(true);
      });
  };

  const handleIconClick = () => {
    if (!tscMasterId) {
      getIdList(); // Fetch TSC Master ID and then fetch list data
    } else {
      getSaleandDisposalList(tscMasterId); // Fetch list data directly if TSC Master ID is already available
    }
    setShowModal(true);
  };

  const filteredListData = listData.filter((item) => {
    const term = listSearchTerm.toLowerCase();
    return (
      item?.fruitsId?.toString()?.toLowerCase().includes(term) ||
      item?.raceName?.toLowerCase().includes(term) ||
      item?.lotNumberCrc?.toString()?.toLowerCase().includes(term) ||
      item?.grainageMasterName?.toLowerCase().includes(term) ||
      item?.grainageName?.toLowerCase().includes(term)
    );
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setShowCopyMessage("Fruits ID copied to clipboard");
        setShowCopyAlert(true);
      })
      .catch((err) => {
        console.error("Error copying text: ", err);
        setShowCopyMessage("Failed to copy Fruits ID");
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
          <IonTitle>Update DFL's</IonTitle>
          <IonButtons slot="end">
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
              onKeyPress={handleKeyPress}
            />
          </div>
          <div className="search-action-row">
            <IonButton
              className={`btn-primary ${searching ? "is-loading" : ""}`}
              disabled={searching}
              onClick={fetchFarmerDetails}
            >
              {searching ? (
                <>
                  <IonSpinner name="crescent" className="btn-spinner" />
                  <span style={{ marginLeft: 8 }}>Searching...</span>
                </>
              ) : (
                <>
                  <IonIcon icon={search} slot="start" /> Search
                </>
              )}
            </IonButton>
            <IonButton
              className="icon-only-btn danger"
              onClick={clearSearch}
              aria-label="Clear"
              disabled={searching || submittingIndex !== null}
            >
              <IonIcon icon={trash} />
            </IonButton>
          </div>
        </div>

        {farmerData && (
          <div className="result-card">
            <div className="result-head">
              <div className="result-avatar">
                {(farmerData.fullName?.[0] || 'F').toUpperCase()}
              </div>
              <div className="result-head-text">
                <span className="result-eyebrow">Farmer Found</span>
                <h3 className="result-title">{farmerData.fullName || '—'}</h3>
              </div>
            </div>
            <div className="result-body">
              <div className="info-row">
                <label className="info-label">Fruits ID</label>
                <IonInput value={farmerData.fruitsId} readonly={true} />
              </div>
              <div className="info-row">
                <label className="info-label">Address</label>
                <IonInput value={farmerData.address || '—'} readonly={true} />
              </div>
              {farmerData.villageName && (
                <div className="info-row">
                  <label className="info-label">Village</label>
                  <IonInput value={farmerData.villageName} readonly={true} />
                </div>
              )}
              {farmerData.fatherName && (
                <div className="info-row">
                  <label className="info-label">Father / Husband Name</label>
                  <IonInput value={farmerData.fatherName} readonly={true} />
                </div>
              )}
            </div>
          </div>
        )}

        {dataList.map((data, index) => (
          <div key={index} className="result-card">
            <div className="result-head">
              <div className="result-avatar is-accent-cyan">D</div>
              <div className="result-head-text">
                <span className="result-eyebrow">DFL Details</span>
                <h3 className="result-title">Lot {data.lotNumberCrc || '—'}</h3>
              </div>
            </div>
            <div className="result-body">
              <div className="info-row">
                <label className="info-label">DFLs Source</label>
                <IonInput value={data.dflsSource} readonly={true} />
              </div>
              <div className="info-row">
                <label className="info-label">Number of DFLs</label>
                <IonInput value={data.numbersOfDfls} readonly={true} />
              </div>
              <div className="info-row">
                <label className="info-label">Lot Number</label>
                <IonInput value={data.lotNumberCrc} readonly={true} />
              </div>
              <div className="info-row">
                <label className="info-label">Rate per 100 DFLs</label>
                <IonInput value={data.ratePer100Dfls} readonly={true} />
              </div>
              <div className="info-row">
                <label className="info-label">Hatching Date</label>
                <IonInput value={data.expectedHatchingDate} readonly={true} />
              </div>
              <div className="info-row">
                <label className="info-label">Date of Disposal</label>
                <IonInput value={data.dateOfDisposal} readonly={true} />
              </div>

              {editedItemIndex === index && (
                <div className="info-row">
                  <label className="info-label">Receipt No</label>
                  <IonInput
                    value={data.receiptNo}
                    onIonChange={(e) => handleChange(e, index, "receiptNo")}
                  />
                </div>
              )}
            </div>

            <div className="result-actions">
              {editedItemIndex === index ? (
                <IonButton
                  className={`btn-result-primary ${submittingIndex === index ? "is-loading" : ""}`}
                  expand="block"
                  disabled={submittingIndex !== null}
                  onClick={() => handleSubmit(index)}
                >
                  {submittingIndex === index ? (
                    <>
                      <IonSpinner name="crescent" className="btn-spinner" />
                      <span style={{ marginLeft: 8 }}>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <IonIcon icon={checkmarkCircle} slot="start" /> Submit
                    </>
                  )}
                </IonButton>
              ) : (
                <IonButton
                  className="btn-result-primary"
                  expand="block"
                  disabled={submittingIndex !== null}
                  onClick={() => toggleEditMode(index)}
                >
                  <IonIcon icon={createOutline} slot="start" /> Proceed
                </IonButton>
              )}
            </div>
          </div>
        ))}

        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>List Data</IonTitle>
              <IonButtons slot="end">
                <IonButton fill="clear" onClick={() => setShowModal(false)}>
                  Close
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonSearchbar
              value={listSearchTerm}
              onIonInput={(e) => setListSearchTerm(e.detail.value!)}
              placeholder="Search Fruits ID"
              className="custom-searchbar"
              showClearButton="focus"
            />
            <div className="modal-list">
              {filteredListData.map((item, index) => (
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
                    <div className="modal-list-row"><span className="info-label">Race Name</span><span>{item.raceName || '—'}</span></div>
                    <div className="modal-list-row"><span className="info-label">Lot Number</span><span>{item.lotNumberCrc || '—'}</span></div>
                    <div className="modal-list-row modal-list-row--full"><span className="info-label">Farm Address</span><span>{item.nameAndAddressOfTheFarm || '—'}</span></div>
                    <div className="modal-list-row"><span className="info-label">Rate / 100 DFLs</span><span>{item.ratePer100Dfls || '—'}</span></div>
                    <div className="modal-list-row"><span className="info-label">No. of DFLs</span><span>{item.numbersOfDfls || '—'}</span></div>
                    <div className="modal-list-row"><span className="info-label">Hatching Date</span><span>{item.hatchingInspectionDate || item.hatchingDate || '—'}</span></div>
                    <div className="modal-list-row"><span className="info-label">Disposal Date</span><span>{item.dateOfDisposal || item.dispatchDate || '—'}</span></div>
                    <div className="modal-list-row modal-list-row--full"><span className="info-label">Grainage Name</span><span>{item.grainageMasterName || item.grainageName || '—'}</span></div>
                  </div>
                </div>
              ))}
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

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={isError ? "Error" : "Success"}
          message={message}
          buttons={["OK"]}
          cssClass={`app-alert ${isError ? 'app-alert--error' : 'app-alert--success'}`}
        />
      </IonContent>
    </IonPage>
  );
};

export default UpdateDlfPage;
