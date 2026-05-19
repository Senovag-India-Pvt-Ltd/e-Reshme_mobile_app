import React, { useState, useRef } from "react";
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
  IonAlert,
  IonCol,
  IonGrid,
  IonRow,
} from "@ionic/react";
import { albums, barcode, cash, layers, trash } from "ionicons/icons"; // Import the trash icon
import "./ProfileInfoPage.css";
import "./AddDlfPage.css";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { API_URL_DBT } from "../auth.service";
import { API_URL_ChowkiManagment } from "../auth.service";

const AddDlfPage: React.FC = () => {
  const [searchText, setSearchText] = useState<string>("");
  const [dataList, setDataList] = useState<any[]>([]); // Updated state to handle multiple entries
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

  const inputRef = useRef<HTMLIonInputElement>(null); // Add useRef for input field

  const history = useHistory();

  // Check if Fruits ID format is valid: 3 letters + 13 digits (e.g., FID2802000042820)
  const isValidFruitsId = (id: string): boolean => {
    return /^[A-Za-z]{3}\d{13}$/.test(id);
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

    clearField(); // Clear previous data
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
        // setDataList(farmerResponses); // Set all fetched data entries
        setFarmerId(
          farmerResponses.length > 0 ? farmerResponses[0].farmerId : null,
        ); // Set farmerId if data is available
        setFruitsId(
          farmerResponses.length > 0 ? farmerResponses[0].fruitsId : null,
        );
        console.log("Fruits ID:", farmerResponses[0]?.fruitsId); // Debug log
        if (farmerResponses?.length > 0) {
          const fruitsIdValue = farmerResponses[0].fruitsId;
          console.log("Calling getAllChowkiDetails with:", fruitsIdValue, typeof fruitsIdValue);
          // Convert to string if it's a number, or keep as string
          const fruitsIdString = typeof fruitsIdValue === 'number' ? fruitsIdValue.toString() : fruitsIdValue;
          getAllChowkiDetails(fruitsIdString);
        } else {
          setMessage("No farmer data found for this Fruits ID");
          setIsError(true);
          setShowAlert(true);
        }
      })
      .catch((error) => {
        console.error("Error fetching farmer details:", error);
        console.error("Error response:", (error as any)?.response); // More detailed error logging
        setMessage("Error fetching farmer details or Farmer ID does not exist");
        setIsError(true);
        setShowAlert(true);
      });
  };

  const clearSearch = () => {
    setSearchText("");
    setDataList([]);
    setIsEditable(false);
    setViewAll(false);
  };

  const clearField = () => {
    setViewAll(false);
  };

  const clearFields = () => {
    setFarmerOtherData({});
    setSearchText("");
    setDataList([]);
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
        console.log("Chowki API Response:", res.data); // Debug log
        console.log("Response data type:", typeof res.data);
        console.log("Response data length:", Array.isArray(res.data) ? res.data.length : 'not array');
        if (res.data && res.data.length > 0) {
          console.log("First item in response:", res.data[0]);
          const chowkiData = res.data[0];
          setFarmerOtherData({
            dflsSource: chowkiData.dflsSource,
            numbersOfDfls: chowkiData.numbersOfDfls,
            // lotNumberRsp: chowkiData.lotNumberRsp,
            receiptNo: chowkiData.receiptNo || "",
            lotNumberCrc: chowkiData.lotNumberCrc,
            ratePer100Dfls: chowkiData.ratePer100Dfls, // Handle missing receiptNo
            expectedHatchingDate: chowkiData.expectedHatchingDate,
            dateOfDisposal: chowkiData.dateOfDisposal, // Handle missing receiptNo
          });
          setDataList(res.data);
          setChowkiId(chowkiData.saleAndDisposalId); // Set chowkiId for submission
          setViewAll(true); // Make sure viewAll is set to true to show data
        } else {
          console.log("No chowki data found");
          setMessage("No DFL data found for this Fruits ID");
          setIsError(true);
          setShowAlert(true);
        }
      })
      .catch((error) => {
        console.error("Error fetching chowki details:", error);
        setMessage("Error fetching DFL data");
        setIsError(true);
        setShowAlert(true);
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
    const value = (e.detail?.value ?? "").toString();
    setSearchText(value);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton
              text="Back"
              defaultHref="/"
              style={{ color: "#000" }}
            />
            <IonMenuButton />
          </IonButtons>
          <IonTitle>
            <b>DFL's Page</b>
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ '--padding-bottom': '130px' } as any}>
        <div className="search-container">
          <IonLabel className="fruits-id-label">Fruits ID</IonLabel>
          <IonInput
            ref={inputRef} // Attach ref to IonInput
            value={searchText}
            placeholder="Enter Fruits ID"
            onIonInput={handleInputChange} // Update to use onIonInput
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
            marginTop: "10px",
          }}
        >
          <IonButton
            style={
              {
                "--background": "#ffffff",
                "--color": "#000000",
                color: "#000000",
                backgroundColor: "#ffffff",
              } as any
            }
            size="small"
            onClick={handleSearchClick}
          >
            Search
          </IonButton>
          <IonButton
            style={
              {
                "--background": "#ffffff",
                "--color": "#000000",
                color: "#000000",
                backgroundColor: "#ffffff",
              } as any
            }
            size="small"
            fill="clear"
            onClick={clearSearch}
          >
            <IonIcon color="danger" icon={trash} />
          </IonButton>
        </div>
        <IonButton
          style={
            {
              "--background": isValidFruitsId(searchText)
                ? "#ffffff"
                : "#e0e0e0",
              "--color": "#000000",
              color: "#000000",
              backgroundColor: isValidFruitsId(searchText)
                ? "#ffffff"
                : "#e0e0e0",
            } as any
          }
          expand="block"
          disabled={!isValidFruitsId(searchText)}
          onClick={handleAddDetailsClick}
          title={
            !isValidFruitsId(searchText)
              ? "Enter Fruits ID: 3 letters + 13 digits (e.g., FID2802000042820)"
              : ""
          }
        >
          Add Details
        </IonButton>
        {!isValidFruitsId(searchText) && searchText.length > 0 && (
          <p
            style={{
              color: "#999",
              fontSize: "12px",
              marginTop: "5px",
              textAlign: "center",
            }}
          >
            Fruits ID format: 3 letters + 13 digits (e.g., FID2802000042820)
          </p>
        )}

        {viewAll && dataList.length > 0 && dataList.map((data, index) => {
          console.log("Rendering data item:", index, data);
          return (
          <IonCard key={index} className="details-card">
            <IonCardHeader>
              <IonCardTitle>DFL Details</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div className="details-row">
                <IonLabel>Dfls Source:</IonLabel>
                <IonInput value={data.dflsSource} readonly={true} />
              </div>
              <div className="details-row">
                <IonLabel>Number Of DFLs:</IonLabel>
                <IonInput value={data.numbersOfDfls} readonly={true} />
              </div>
              {/* <div className="details-row">
                <IonLabel>Lot Number Rsp:</IonLabel>
                <IonInput value={data.lotNumberRsp} readonly={true} />
              </div> */}
              <div className="details-row">
                <IonLabel>Lot Number:</IonLabel>
                <IonInput value={data.lotNumberCrc} readonly={true} />
              </div>
              <div className="details-row">
                <IonLabel>Rate Per 100 DFLs:</IonLabel>
                <IonInput value={data.ratePer100Dfls} readonly={true} />
              </div>

              <IonAlert
                isOpen={showAlert}
                onDidDismiss={() => setShowAlert(false)}
                header={isError ? "Error" : "Success"}
                message={message}
                buttons={["OK"]}
              />
            </IonCardContent>
          </IonCard>
          );
        })}
      </IonContent>
    </IonPage>
  );
};

export default AddDlfPage;
