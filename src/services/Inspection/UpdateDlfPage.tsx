import React, { useState, useEffect, useRef } from "react";
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
  IonModal,
  IonList,
  IonItem,
  IonText,
} from "@ionic/react";
import { trash, informationCircle, copy } from "ionicons/icons"; // Import the trash and info icons
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
  const [tscMasterId, setTscMasterId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const inputRef = useRef<HTMLIonInputElement>(null); // Add useRef for input field
  const [showCopyAlert, setShowCopyAlert] = useState<boolean>(false);
  const [copyMessage, setShowCopyMessage] = useState<string>("");

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
        setFarmerId(
          farmerResponses.length > 0 ? farmerResponses[0].farmerId : null,
        );
        setFruitsId(
          farmerResponses.length > 0 ? farmerResponses[0].fruitsId : null,
        );
        if (farmerResponses?.length > 0) {
          getAllChowkiDetails(farmerResponses[0].fruitsId);
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
    // Check if searchText is empty before proceeding
    if (!searchText || searchText.trim().length === 0) {
      setMessage("Please enter a Fruits ID first");
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
        const farmerResponses = res.data?.content?.[0]?.farmerResponses || [];
        // setDataList(farmerResponses); // Set all fetched data entries
        setFarmerId(
          farmerResponses.length > 0 ? farmerResponses[0].farmerId : null,
        ); // Set farmerId if data is available
        setFruitsId(
          farmerResponses.length > 0 ? farmerResponses[0].fruitsId : null,
        );
        if (farmerResponses?.length > 0) {
          getAllChowkiDetails(farmerResponses[0].fruitsId);
        } else {
          // Show error message when no data is found
          setMessage(`No data found for Fruits ID: ${searchText}`);
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

  const [editedItemIndex, setEditedItemIndex] = useState<number | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    field: string,
  ) => {
    const updatedDataList = [...dataList];
    updatedDataList[index] = {
      ...updatedDataList[index],
      [field]: e.target.value,
    };
    setDataList(updatedDataList); // Update specific item in the list
  };

  const handleSubmit = (index: number) => {
    const selectedItem = dataList[index]; // Get the specific item being edited

    // Validate that receiptNo is provided
    if (!selectedItem?.receiptNo || !selectedItem.receiptNo.trim()) {
      setMessage("Receipt No is mandatory");
      setIsError(true);
      setShowAlert(true);
      return;
    }

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
        setEditedItemIndex(null); // Clear edit mode
      })
      .catch((error) => {
        console.error("Error updating farmer details", error);
        setMessage("Error updating farmer details");
        setIsError(true);
        setShowAlert(true);
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

  const handleInputChange = (e: CustomEvent) => {
    const value = (e.target as HTMLIonInputElement).value!;
    setSearchText(value);
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
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton
              text="Back"
              slot="start"
              defaultHref="/"
              style={{ color: "#000" }}
            />
            <IonMenuButton />
          </IonButtons>
          <IonTitle>
            <b>Update DFL's</b>
          </IonTitle>
          <IonButton
            style={
              {
                "--background": "#ffffff",
                "--color": "#000000",
                color: "#000000",
                backgroundColor: "#ffffff",
              } as any
            }
            slot="end"
            fill="clear"
            onClick={handleIconClick}
          >
            <IonIcon icon={informationCircle} />
          </IonButton>
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
            onKeyPress={handleKeyPress}
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
            onClick={fetchFarmerDetails}
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

        {dataList.map((data, index) => (
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
              <div className="details-row">
                <IonLabel>Lot Number:</IonLabel>
                <IonInput value={data.lotNumberCrc} readonly={true} />
              </div>
              <div className="details-row">
                <IonLabel>Rate Per DFLs:</IonLabel>
                <IonInput value={data.ratePer100Dfls} readonly={true} />
              </div>

              <div className="details-row">
                <IonLabel>Hatching Date:</IonLabel>
                <IonInput value={data.expectedHatchingDate} readonly={true} />
              </div>
              <div className="details-row">
                <IonLabel>Date of Disposal:</IonLabel>
                <IonInput value={data.dateOfDisposal} readonly={true} />
              </div>

              {editedItemIndex === index ? (
                <div className="details-row">
                  <IonLabel>Receipt No:</IonLabel>
                  <IonInput
                    value={data.receiptNo}
                    onIonChange={(e) => handleChange(e, index, "receiptNo")}
                  />
                  <IonButton
                    style={
                      {
                        "--background": "#ffffff",
                        "--color": "#000000",
                        color: "#000000",
                        backgroundColor: "#ffffff",
                      } as any
                    }
                    expand="full"
                    onClick={() => handleSubmit(index)}
                  >
                    Submit
                  </IonButton>
                </div>
              ) : (
                <IonButton
                  style={
                    {
                      "--background": "#ffffff",
                      "--color": "#000000",
                      color: "#000000",
                      backgroundColor: "#ffffff",
                    } as any
                  }
                  expand="full"
                  onClick={() => toggleEditMode(index)}
                >
                  Proceed
                </IonButton>
              )}

              <IonAlert
                isOpen={showAlert}
                onDidDismiss={() => setShowAlert(false)}
                header={isError ? "Error" : "Success"}
                message={message}
                buttons={["OK"]}
              />
            </IonCardContent>
          </IonCard>
        ))}

        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>List Data</IonTitle>
              <IonButtons slot="end">
                <IonButton
                  style={
                    {
                      "--background": "#ffffff",
                      "--color": "#000000",
                      color: "#000000",
                      backgroundColor: "#ffffff",
                    } as any
                  }
                  onClick={() => setShowModal(false)}
                >
                  Close
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList>
              {listData.map((item, index) => (
                <IonCard key={index} className="list-card">
                  <IonCardContent>
                    <div className="list-item">
                      <IonText>
                        <b>Fruits ID:</b> {item.fruitsId}
                      </IonText>
                      <IonButton
                        style={
                          {
                            "--background": "#ffffff",
                            "--color": "#000000",
                            color: "#000000",
                            backgroundColor: "#ffffff",
                          } as any
                        }
                        fill="clear"
                        onClick={() => copyToClipboard(item.fruitsId)}
                        style={{ marginLeft: "10px" }}
                      >
                        <IonIcon icon={copy} />
                      </IonButton>
                    </div>
                    <IonText>
                      <b>Race Name:</b> {item.raceName}
                    </IonText>
                    <IonText>
                      <b>Lot Number CRC:</b> {item.lotNumberCrc}
                    </IonText>
                    <IonText>
                      <b>Name and Address of the Farm:</b>{" "}
                      {item.nameAndAddressOfTheFarm}
                    </IonText>
                    <IonText>
                      <b>Rate per 100 DFLs:</b> {item.ratePer100Dfls}
                    </IonText>
                    <IonText>
                      <b>Number of DFLs:</b> {item.numbersOfDfls}
                    </IonText>
                  </IonCardContent>
                </IonCard>
              ))}
            </IonList>
            <IonAlert
              isOpen={showCopyAlert}
              onDidDismiss={() => setShowCopyAlert(false)}
              header="Copy Status"
              message={copyMessage}
              buttons={["OK"]}
            />
          </IonContent>
        </IonModal>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={isError ? "Error" : "Success"}
          message={message}
          buttons={["OK"]}
        />
      </IonContent>
    </IonPage>
  );
};

export default UpdateDlfPage;
