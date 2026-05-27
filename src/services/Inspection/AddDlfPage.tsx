import React, { useState, useRef } from "react";
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
  IonSpinner,
} from "@ionic/react";
import { trash, searchOutline, addCircleOutline, refreshOutline } from "ionicons/icons";
import "./ProfileInfoPage.css";
import "./AddDlfPage.css";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { API_URL_DBT } from "../auth.service";
import { API_URL_ChowkiManagment } from "../auth.service";

const AddDlfPage: React.FC = () => {
  const [searchText, setSearchText] = useState<string>("");
  const [dataList, setDataList] = useState<any[]>([]); // Updated state to handle multiple entries
  const [farmerData, setFarmerData] = useState<any>(null);
  const [farmerOtherData, setFarmerOtherData] = useState<any>({});
  const [viewAll, setViewAll] = useState<boolean>(false);
  const [receiptNo, setReceiptNo] = useState<string>("");
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);
  const [farmerId, setFarmerId] = useState<number | null>(null);
  const [fruitsId, setFruitsId] = useState<number | null>(null);
  const [saleAndDisposalId, setChowkiId] = useState<number | null>(null);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [searching, setSearching] = useState<boolean>(false);

  const inputRef = useRef<HTMLIonInputElement>(null); // Add useRef for input field

  const history = useHistory();

  // Check if Fruits ID format is valid: 3 letters + 13 digits (e.g., FID2802000042820)
  // Trim whitespace so pasted values with trailing spaces still validate.
  const isValidFruitsId = (id: string): boolean => {
    return /^[A-Za-z]{3}\d{13}$/.test((id || "").trim());
  };

  const fetchFarmerDetails = () => {
    if (!searchText || !searchText.trim()) {
      setMessage("Enter Fruits ID");
      setIsError(true);
      setShowAlert(true);
      return;
    }

    if (!isValidFruitsId(searchText)) {
      setMessage(
        "Fruits ID must be 3 letters + 13 digits (e.g., FID2802000042820)",
      );
      setIsError(true);
      setShowAlert(true);
      return;
    }
    if (searching) return;

    clearField(); // Clear previous data
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
        console.log("Farmer API Response:", res.data); // Debug log
        const farmerResponses = res.data?.content?.[0]?.farmerResponses || [];
        console.log("Farmer responses:", farmerResponses); // Debug log
        const firstFarmer = farmerResponses[0] || null;
        setFarmerData(firstFarmer);
        setFarmerId(firstFarmer ? firstFarmer.farmerId : null);
        setFruitsId(firstFarmer ? firstFarmer.fruitsId : null);
        console.log("Fruits ID:", firstFarmer?.fruitsId); // Debug log
        if (firstFarmer) {
          const fruitsIdValue = firstFarmer.fruitsId;
          console.log("Calling getAllChowkiDetails with:", fruitsIdValue, typeof fruitsIdValue);
          const fruitsIdString = typeof fruitsIdValue === 'number' ? fruitsIdValue.toString() : fruitsIdValue;
          getAllChowkiDetails(fruitsIdString);
        } else {
          setMessage("No farmer data found for this Fruits ID");
          setIsError(true);
          setShowAlert(true);
        }
        setSearching(false);
      })
      .catch((error) => {
        console.error("Error fetching farmer details:", error);
        console.error("Error response:", (error as any)?.response);
        setMessage("Error fetching farmer details or Farmer ID does not exist");
        setIsError(true);
        setShowAlert(true);
        setSearching(false);
      });
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

  const handleSubmit = () => {
    // Validation: Check if Fruits ID is entered
    if (!searchText) {
      setMessage("Enter Fruits ID");
      setIsError(true);
      setShowAlert(true);
      return;
    }

    // Validation: Check if receiptNo is filled (assuming it's mandatory)
    if (!farmerOtherData.receiptNo) {
      setMessage("Please fill the Receipt No field");
      setIsError(true);
      setShowAlert(true);
      return;
    }

    const api = axios.create({
      baseURL: API_URL_ChowkiManagment,
    });
    api
      .post(
        "chowkimanagement/update-dfl-info",
        {
          receiptNo: farmerOtherData.receiptNo,
          saleAndDisposalId: saleAndDisposalId,
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
        console.log("Farmer details updated successfully", res.data);
        setMessage("Farmer details updated successfully");
        setIsError(false);
        setShowAlert(true);
        clearFields(); // Clear fields upon successful submission
      })
      .catch((error) => {
        console.error("Error updating farmer details", error);
        setMessage("Error updating farmer details");
        setIsError(true);
        setShowAlert(true);
      });
    setIsEditable(!isEditable);
  };

  const getAllChowkiDetails = (fruitsId: string) => {
    const apiUrl = `chowkimanagement/get-sale-disposal-by-fruits-id/${fruitsId}`;
    console.log("Calling chowki API with URL:", API_URL_ChowkiManagment + apiUrl);
    // setViewAll(!viewAll);
    const api = axios.create({
      baseURL: API_URL_ChowkiManagment,
    });
    api
      .get(apiUrl, {
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      })
      .then((res) => {
        console.log("Chowki API Response:", res.data);
        if (res.data && res.data.length > 0) {
          const chowkiData = res.data[0];
          setFarmerOtherData({
            dflsSource: chowkiData.dflsSource,
            numbersOfDfls: chowkiData.numbersOfDfls,
            receiptNo: chowkiData.receiptNo || "",
            lotNumberCrc: chowkiData.lotNumberCrc,
            ratePer100Dfls: chowkiData.ratePer100Dfls,
            expectedHatchingDate: chowkiData.expectedHatchingDate,
            dateOfDisposal: chowkiData.dateOfDisposal,
          });
          setDataList(res.data);
          setChowkiId(chowkiData.saleAndDisposalId);
          setViewAll(true);
        } else {
          // No existing DFLs is expected on the Add page — user will create the first one.
          console.log("No existing DFL data — ready to add new.");
          setDataList([]);
          setViewAll(false);
        }
      })
      .catch((error) => {
        // 404 / missing data is fine on the Add page — silently allow user to proceed.
        console.log("No existing DFL data (catch):", error?.response?.status);
        setDataList([]);
        setViewAll(false);
      });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string,
  ) => {
    setFarmerOtherData((prev: any) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleAddDetailsClick = () => {
    if (!searchText || !searchText.trim()) {
      setMessage("Enter Fruits ID");
      setIsError(true);
      setShowAlert(true);
      return;
    }

    if (!isValidFruitsId(searchText)) {
      setMessage(
        "Fruits ID must be 3 letters + 13 digits (e.g., FID2802000042820)",
      );
      setIsError(true);
      setShowAlert(true);
      return;
    }

    const fruitId = searchText.trim();
    history.push(`/add-det/${encodeURIComponent(fruitId)}`);
  };

  const handleSearchClick = () => {
    fetchFarmerDetails();
  };

  const handleInputChange = (e: any) => {
    // Strip whitespace from anywhere in the value (e.g. trailing space from paste).
    const value = (e.detail?.value ?? "").toString().replace(/\s+/g, "");
    setSearchText(value);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="page-toolbar">
          <IonButtons slot="start">
            <IonBackButton text="Back" defaultHref="/cropsub" />
          </IonButtons>
          <IonTitle>DFL's Page</IonTitle>
          <IonButtons slot="end">
            <IonButton
              fill="clear"
              onClick={clearSearch}
              aria-label="Refresh"
              disabled={searching}
            >
              <IonIcon icon={refreshOutline} />
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
              disabled={searching}
              onClick={handleSearchClick}
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

          {!isValidFruitsId(searchText) && searchText.length > 0 && (
            <p className="search-hint">
              Fruits ID format: 3 letters + 13 digits (e.g., FID2802000042820)
            </p>
          )}
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
            <div className="result-actions">
              <IonButton
                className="btn-result-primary"
                expand="block"
                onClick={handleAddDetailsClick}
              >
                <IonIcon icon={addCircleOutline} slot="start" /> Add Details
              </IonButton>
            </div>
          </div>
        )}

        {!farmerData && isValidFruitsId(searchText) && (
          <div className="cta-section">
            <IonButton
              className="btn-result-primary"
              expand="block"
              onClick={handleAddDetailsClick}
            >
              <IonIcon icon={addCircleOutline} slot="start" /> Add Details
            </IonButton>
          </div>
        )}

        {viewAll && dataList.length > 0 && dataList.map((data, index) => {
          console.log("Rendering data item:", index, data);
          return (
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
              </div>
            </div>
          );
        })}

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

export default AddDlfPage;
