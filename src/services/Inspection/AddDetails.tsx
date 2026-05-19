import React, { useState, useEffect } from "react";
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
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonAlert,
  IonModal,
  IonSearchbar,
  IonSpinner,
} from "@ionic/react";
import {
  checkmarkCircle,
  chevronDownOutline,
  calendarOutline,
} from "ionicons/icons";
import "./ProfileInfoPage.css";
import "./AddDlfPage.css";
import axios from "axios";
import { API_URL_ChowkiManagment, API_URL_Master_Data } from "../auth.service";
import { useHistory, useParams } from "react-router-dom";

const AddDetailsPage: React.FC = () => {
  const history = useHistory();
  const [isError, setIsError] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const { fruitsId } = useParams<{ fruitsId?: string }>();
  const resolvedFruitsId = (
    fruitsId ||
    window.location.pathname.split("/").pop() ||
    ""
  ).trim();

  const [showHatchingDatePicker, setShowHatchingDatePicker] = useState<boolean>(false);
  const [showDispatchDatePicker, setShowDispatchDatePicker] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [dflDetails, setDflDetails] = useState<any>({
    tsc: "",
    lotNumberofCRC: "",
    numberofDFLs: "",
    rateperDFLs: "",
    price: "",
    raceOfDfls: "",
    soldafterMoult: "",
    sourceofDFLs: "",
    dispathdate: "",
    hatchingdate: "",
  });

  // Auto-calculate price from number * rate
  useEffect(() => {
    if (dflDetails?.numberofDFLs && dflDetails?.rateperDFLs) {
      const calculatedPrice = dflDetails.numberofDFLs * dflDetails.rateperDFLs;
      setDflDetails((prevData: any) => ({
        ...prevData,
        price: calculatedPrice.toFixed(2),
      }));
    }
  }, [dflDetails?.numberofDFLs, dflDetails?.rateperDFLs]);

  useEffect(() => {
    clearSearch();
  }, []);

  // ── TSC list (searchable dropdown via modal) ──
  const [tscListData, setTscListData] = useState<any[]>([]);
  const [fetchError, setFetchError] = useState<boolean>(false);
  const [tscModalOpen, setTscModalOpen] = useState<boolean>(false);
  const [tscSearch, setTscSearch] = useState<string>("");

  const fetchTscList = async () => {
    try {
      const response = await axios.get(
        `${API_URL_Master_Data}tscMaster/get-all`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        },
      );
      if (response.data && response.data.content) {
        setTscListData(response.data.content.tscMaster);
      } else {
        console.error("Unexpected API response format:", response);
        setFetchError(true);
      }
    } catch (error) {
      console.error("Error fetching Tsc list:", error);
      setFetchError(true);
    }
  };

  useEffect(() => {
    fetchTscList();
  }, []);

  // ── Race list ──
  const [raceMasterListData, setRaceMasterListData] = useState<any[]>([]);

  const fetchRaceMasterList = async () => {
    try {
      const response = await axios.get(
        `${API_URL_Master_Data}raceMaster/get-all`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        },
      );
      if (response.data && response.data.content) {
        setRaceMasterListData(response.data.content.raceMaster);
      } else {
        console.error("Unexpected API response format:", response);
        setFetchError(true);
      }
    } catch (error) {
      console.error("Error fetching Race list:", error);
      setFetchError(true);
    }
  };

  useEffect(() => {
    fetchRaceMasterList();
  }, []);

  const handleEdit = () => {
    if (!resolvedFruitsId) {
      setMessage("Enter Fruits ID first");
      setIsError(true);
      setShowAlert(true);
      return;
    }

    const requiredFields = [
      { key: "tsc", label: "TSC" },
      { key: "raceOfDfls", label: "Race" },
      { key: "lotNumberofCRC", label: "Lot No" },
      { key: "numberofDFLs", label: "Number of DFLs" },
      { key: "rateperDFLs", label: "Rate per DFL" },
      { key: "sourceofDFLs", label: "Source of DFLs" },
      { key: "soldafterMoult", label: "Sold after Moult" },
      { key: "hatchingdate", label: "Hatching Date" },
      { key: "dispathdate", label: "Dispatch Date" },
    ];

    const missing = requiredFields
      .filter((f) => {
        const value = dflDetails[f.key];
        return value === undefined || value === null || value.toString().trim() === "";
      })
      .map((f) => f.label);

    if (missing.length > 0) {
      setMessage(`Please fill all mandatory fields. Missing: ${missing.join(", ")}`);
      setIsError(true);
      setShowAlert(true);
      return;
    }

    setSubmitting(true);

    const api = axios.create({ baseURL: API_URL_ChowkiManagment });
    api
      .post(
        "chowkimanagement/add-sale-disposal-dfl-info",
        {
          fruitsId: resolvedFruitsId,
          lotNumber: dflDetails.lotNumberofCRC,
          numberOfDflsDisposed: dflDetails.numberofDFLs,
          ratePer100DflsPrice: dflDetails.rateperDFLs,
          price: dflDetails.price,
          dflsSource: dflDetails.sourceofDFLs,
          raceId: dflDetails.raceOfDfls,
          tsc: dflDetails.tsc,
          soldAfter1stOr2ndMould: dflDetails.soldafterMoult,
          dateOfDisposal: dflDetails.dispathdate,
          expectedDateOfHatching: dflDetails.hatchingdate,
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
        if (res.data.error === 0) {
          setMessage("Data added successfully!");
          setIsError(false);
          setShowAlert(true);
          clearSearch();
          setTimeout(() => {
            history.push("/add-dlf");
          }, 1000);
          // keep submitting=true while we navigate away
        } else {
          setMessage("Failed to add data.");
          setIsError(true);
          setShowAlert(true);
          setSubmitting(false);
        }
      })
      .catch((error) => {
        console.error("Error updating farmer details", error);
        setMessage("Error updating farmer details. Please try again.");
        setIsError(true);
        setShowAlert(true);
        setSubmitting(false);
      });
  };

  const clearSearch = () => {
    setDflDetails({
      tsc: "",
      lotNumberofCRC: "",
      numberofDFLs: "",
      rateperDFLs: "",
      price: "",
      raceOfDfls: "",
      soldafterMoult: "",
      sourceofDFLs: "",
      dispathdate: "",
      hatchingdate: "",
    });
  };

  const handleChange = (e: any, field: string) => {
    if (dflDetails) {
      setDflDetails({
        ...dflDetails,
        [field]: e.detail.value,
      });
    }
  };

  const selectedTscName = dflDetails.tsc
    ? tscListData.find((t) => String(t.tscMasterId) === String(dflDetails.tsc))?.name
    : "";

  const isFormFilled =
    !!resolvedFruitsId &&
    [
      dflDetails.tsc,
      dflDetails.raceOfDfls,
      dflDetails.lotNumberofCRC,
      dflDetails.numberofDFLs,
      dflDetails.rateperDFLs,
      dflDetails.sourceofDFLs,
      dflDetails.soldafterMoult,
      dflDetails.hatchingdate,
      dflDetails.dispathdate,
    ].every((v) => v !== undefined && v !== null && v.toString().trim() !== "");

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="page-toolbar">
          <IonButtons slot="start">
            <IonBackButton text="Back" defaultHref="/add-dlf" />
          </IonButtons>
          <IonTitle>Add DFL's Details</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="page-content">
        <div className="page-hero-extension" aria-hidden="true"></div>

        <div className="result-card">
          <div className="result-head">
            <div className="result-avatar is-accent-violet">+</div>
            <div className="result-head-text">
              <span className="result-eyebrow">New Entry</span>
              <h3 className="result-title">DFL Details</h3>
            </div>
          </div>

          <div className="result-body">
            <div className="info-row">
              <label className="info-label">Lot No</label>
              <IonInput
                value={dflDetails.lotNumberofCRC}
                placeholder="Enter Lot Number"
                onIonChange={(e) => handleChange(e, "lotNumberofCRC")}
              />
            </div>

            <div className="info-row">
              <label className="info-label">Number of DFLs</label>
              <IonInput
                type="number"
                value={dflDetails.numberofDFLs}
                placeholder="0"
                onIonChange={(e) => handleChange(e, "numberofDFLs")}
              />
            </div>

            <div className="info-row">
              <label className="info-label">Rate per DFL</label>
              <IonInput
                type="number"
                value={dflDetails.rateperDFLs}
                placeholder="0.00"
                onIonChange={(e) => handleChange(e, "rateperDFLs")}
              />
            </div>

            <div className="info-row">
              <label className="info-label">Price (₹)</label>
              <IonInput
                value={dflDetails.price}
                readonly={true}
                placeholder="Calculated automatically"
              />
            </div>

            <div className="info-row">
              <label className="info-label">Source of DFLs</label>
              <IonInput
                type="text"
                value={dflDetails.sourceofDFLs}
                placeholder="Enter source of DFLs"
                onIonChange={(e) => handleChange(e, "sourceofDFLs")}
              />
            </div>

            {/* Select TSC — opens searchable modal */}
            <div className="info-row">
              <label className="info-label">Select TSC</label>
              {fetchError ? (
                <p className="info-error">Failed to fetch TSC list. Please try again later.</p>
              ) : (
                <button
                  type="button"
                  className="select-trigger"
                  onClick={() => {
                    setTscSearch("");
                    setTscModalOpen(true);
                  }}
                  aria-label="Select TSC"
                >
                  <span className={selectedTscName ? "select-value" : "select-placeholder"}>
                    {selectedTscName || "Tap to select TSC"}
                  </span>
                  <IonIcon icon={chevronDownOutline} />
                </button>
              )}
            </div>

            {/* Select Race */}
            <div className="info-row">
              <label className="info-label">Select Race</label>
              {fetchError ? (
                <p className="info-error">Failed to fetch Race list. Please try again later.</p>
              ) : (
                <IonSelect
                  value={dflDetails.raceOfDfls}
                  placeholder="Select Race"
                  interface="action-sheet"
                  onIonChange={(e) => handleChange(e, "raceOfDfls")}
                >
                  <IonSelectOption value="">Select Race</IonSelectOption>
                  {raceMasterListData?.map((race) => (
                    <IonSelectOption key={race.raceMasterId} value={race.raceMasterId}>
                      {race.raceMasterName}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              )}
            </div>

            {/* Sold After Moult */}
            <div className="info-row">
              <label className="info-label">Sold After Moult *</label>
              <IonSelect
                value={dflDetails.soldafterMoult}
                placeholder="Select Moult"
                interface="action-sheet"
                onIonChange={(e) => handleChange(e, "soldafterMoult")}
              >
                <IonSelectOption value="1st">1st Moult</IonSelectOption>
                <IonSelectOption value="2nd">2nd Moult</IonSelectOption>
                <IonSelectOption value="3rd">3rd Moult</IonSelectOption>
              </IonSelect>
            </div>

            {/* Hatching Date */}
            <div className="info-row">
              <label className="info-label">Hatching Date</label>
              <button
                type="button"
                className="select-trigger"
                onClick={() => setShowHatchingDatePicker(true)}
                aria-label="Select Hatching Date"
              >
                <span className={dflDetails.hatchingdate ? "select-value" : "select-placeholder"}>
                  {dflDetails.hatchingdate
                    ? new Date(dflDetails.hatchingdate).toLocaleDateString()
                    : "Tap to select date"}
                </span>
                <IonIcon icon={calendarOutline} />
              </button>
            </div>

            {/* Dispatch Date */}
            <div className="info-row">
              <label className="info-label">Dispatch Date</label>
              <button
                type="button"
                className="select-trigger"
                onClick={() => setShowDispatchDatePicker(true)}
                aria-label="Select Dispatch Date"
              >
                <span className={dflDetails.dispathdate ? "select-value" : "select-placeholder"}>
                  {dflDetails.dispathdate
                    ? new Date(dflDetails.dispathdate).toLocaleDateString()
                    : "Tap to select date"}
                </span>
                <IonIcon icon={calendarOutline} />
              </button>
            </div>
          </div>

          <div className="result-actions">
            <IonButton
              className={`btn-result-primary ${submitting ? "is-loading" : (isFormFilled ? "is-active" : "is-disabled-state")}`}
              expand="block"
              disabled={!isFormFilled || submitting}
              onClick={handleEdit}
            >
              {submitting ? (
                <>
                  <IonSpinner name="crescent" className="btn-spinner" />
                  <span style={{ marginLeft: 8 }}>Saving...</span>
                </>
              ) : (
                <>
                  <IonIcon icon={checkmarkCircle} slot="start" /> Save Details
                </>
              )}
            </IonButton>
          </div>
        </div>

        {/* TSC selection modal */}
        <IonModal isOpen={tscModalOpen} onDidDismiss={() => setTscModalOpen(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Select TSC</IonTitle>
              <IonButtons slot="end">
                <IonButton fill="clear" onClick={() => setTscModalOpen(false)}>
                  Close
                </IonButton>
              </IonButtons>
            </IonToolbar>
            <IonToolbar>
              <IonSearchbar
                value={tscSearch}
                onIonInput={(e) => setTscSearch(e.detail.value!)}
                placeholder="Search TSC"
                className="custom-searchbar"
              />
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div className="modal-options-list">
              <button
                type="button"
                className={`modal-option ${!dflDetails.tsc ? "is-selected" : ""}`}
                onClick={() => {
                  handleChange({ detail: { value: "" } } as any, "tsc");
                  setTscModalOpen(false);
                }}
              >
                <span className="modal-option-label">None</span>
                {!dflDetails.tsc && <IonIcon icon={checkmarkCircle} />}
              </button>
              {tscListData
                .filter(
                  (t) =>
                    !tscSearch ||
                    t.name.toLowerCase().includes(tscSearch.toLowerCase()),
                )
                .map((t) => {
                  const isSelected = String(dflDetails.tsc) === String(t.tscMasterId);
                  return (
                    <button
                      key={t.tscMasterId}
                      type="button"
                      className={`modal-option ${isSelected ? "is-selected" : ""}`}
                      onClick={() => {
                        handleChange(
                          { detail: { value: String(t.tscMasterId) } } as any,
                          "tsc",
                        );
                        setTscModalOpen(false);
                      }}
                    >
                      <span className="modal-option-label">{t.name}</span>
                      {isSelected && <IonIcon icon={checkmarkCircle} />}
                    </button>
                  );
                })}

              {tscListData.filter(
                (t) =>
                  !tscSearch ||
                  t.name.toLowerCase().includes(tscSearch.toLowerCase()),
              ).length === 0 && (
                <p className="no-data-hint">No TSC matches "{tscSearch}"</p>
              )}
            </div>
          </IonContent>
        </IonModal>

        {/* Hatching date picker modal */}
        {showHatchingDatePicker && (
          <IonModal
            isOpen={showHatchingDatePicker}
            onDidDismiss={() => setShowHatchingDatePicker(false)}
          >
            <IonHeader>
              <IonToolbar>
                <IonTitle>Hatching Date</IonTitle>
                <IonButtons slot="end">
                  <IonButton fill="clear" onClick={() => setShowHatchingDatePicker(false)}>
                    Close
                  </IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
              <IonDatetime
                presentation="date"
                showDefaultButtons={true}
                preferWheel={false}
                value={dflDetails.hatchingdate || new Date().toISOString()}
                onIonChange={(e) => {
                  handleChange(e, "hatchingdate");
                  setShowHatchingDatePicker(false);
                }}
                onIonCancel={() => setShowHatchingDatePicker(false)}
              />
            </IonContent>
          </IonModal>
        )}

        {/* Dispatch date picker modal */}
        {showDispatchDatePicker && (
          <IonModal
            isOpen={showDispatchDatePicker}
            onDidDismiss={() => setShowDispatchDatePicker(false)}
          >
            <IonHeader>
              <IonToolbar>
                <IonTitle>Dispatch Date</IonTitle>
                <IonButtons slot="end">
                  <IonButton fill="clear" onClick={() => setShowDispatchDatePicker(false)}>
                    Close
                  </IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
              <IonDatetime
                presentation="date"
                showDefaultButtons={true}
                preferWheel={false}
                value={dflDetails.dispathdate || new Date().toISOString()}
                onIonChange={(e) => {
                  handleChange(e, "dispathdate");
                  setShowDispatchDatePicker(false);
                }}
                onIonCancel={() => setShowDispatchDatePicker(false)}
              />
            </IonContent>
          </IonModal>
        )}

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={isError ? "Error" : "Success"}
          message={message}
          buttons={["OK"]}
          cssClass={`app-alert ${isError ? "app-alert--error" : "app-alert--success"}`}
        />
      </IonContent>
    </IonPage>
  );
};

export default AddDetailsPage;
