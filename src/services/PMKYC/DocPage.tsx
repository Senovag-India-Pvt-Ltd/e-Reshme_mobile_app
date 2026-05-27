import React, { useState, useEffect } from "react";
import {
  IonContent,
  IonPage,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonButtons,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonToast,
  IonIcon,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonSearchbar,
  IonSpinner,
} from "@ionic/react";
import axios from "axios";
import { useParams, useHistory, useLocation } from "react-router-dom";
import "./DocPage.css";
import DocumentUpload from "./DocumentUpload";
import Menu from "../Inspection/Menu";
import {
  API_URL_DBT,
  API_URL_DBT_,
  API_URL_Inspection,
  API_URL_Master,
} from '../auth.service';
import {
  arrowBack,
  documentTextOutline,
  chatbubbleEllipsesOutline,
  layersOutline,
  personOutline,
  locationOutline,
  closeCircleOutline,
  warningOutline,
  checkmarkCircleOutline,
  cloudUploadOutline,
} from "ionicons/icons";

const DocPage: React.FC = () => {
  const { applicationDocumentId, approvalStageId, subSchemeId } = useParams<{
    applicationDocumentId: string;
    approvalStageId: string;
    subSchemeId: string;
  }>();

  // Get applicationFormId from query params (fallback to applicationDocumentId)
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const applicationFormId = query.get('applicationFormId') || applicationDocumentId;
  const schemeId = query.get('schemeId');
  const financialDelegation = query.get('financialDelegation') === 'true';
  const schemeAmountQuery = query.get('schemeAmount');
  const eligibleAmountQuery = query.get('eligibleAmount');
  const [designationId, setDesignationId] = useState<number | null>(null);

  const schemeAmount = !eligibleAmountQuery || eligibleAmountQuery === '0'
    ? schemeAmountQuery
    : eligibleAmountQuery;

  const [isApprovalPowerChecked, setIsApprovalPowerChecked] = useState<boolean>(false);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState<boolean>(false);
  // Locks the Submit button while any of the three submit API calls is in flight.
  // Prevents double-taps from creating duplicate records (same pattern as Profile/Land Info).
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showApprovalPowerPopup, setShowApprovalPowerPopup] = useState<boolean>(false);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (financialDelegation && schemeAmount && designationId) {
      console.log('Calling checkApprovalPower API');
      checkApprovalPower();
    }
  }, [financialDelegation, schemeAmount, designationId]);

  const fetchUser = () => {
    axios
      .get(
        `${API_URL_Master}master-data/v1/userMaster/get-join/${localStorage.getItem(
          "userMasterId"
        )}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        }
      )
      .then((res) => {
        const districtId: number = res.data.content.districtId;
        const talukId: number = res.data.content.talukId;
        const designationId: number = res.data.content.designationId;
        setDistrictId(districtId);
        setDesignationId(designationId);
        setTalukId(talukId);
        if (districtId && talukId) {
          fetchNextsteps();
        }
      })
      .catch((error) => {
        console.error("Error fetching user details:", error);
      });
  };

  const checkApprovalPower = () => {
    const amountToSend = !eligibleAmount || eligibleAmount === '0'
      ? schemeAmountQuery
      : eligibleAmount;
    const url = `${API_URL_DBT_}dbt/v1/service/checkApprovalPower?approvalStageId=${approvalStageId}&designationId=${designationId}&schemeAmount=${amountToSend}&subSchemeId=${subSchemeId}&applicationFormId=${applicationDocumentId}`;
    axios.post(url, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
      },
    })
    .then(res => {
      console.log('checkApprovalPower API response:', res.data);
      if (res.data === true) {
        setIsSubmitDisabled(true);
        setShowApprovalPowerPopup(true);
        fetchNextsteps();
      } else if (financialDelegation) {
        fetchSameStepApprovalStages();
      } else {
        fetchNextsteps();
      }
      setIsApprovalPowerChecked(true);
    })
    .catch(error => {
      console.error("Error checking approval power:", error);
    });
  };

  const fetchSameStepApprovalStages = () => {
    const designationStep = query.get('designationStep');
    axios.post(
      `${API_URL_DBT_}dbt/v1/service/getSameStepDetailsAfterSubmitBySubSchemeIdAndApprovalStageId?subSchemeId=${subSchemeId}&approvalStageId=${approvalStageId}&designationStep=${designationStep}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      }
    )
    .then(response => {
      if (response.data && response.data.content) {
        setNextsteps(response.data.content || []);
      } else {
        console.error("Unexpected API response format:", response);
      }
    })
    .catch(error => {
      console.error("Error fetching same step approval stages:", error);
    });
  };

  const fetchSameStepUsernames = async (approvalStageId: string) => {
    const designationStep = query.get('designationStep');
    if (districtId && talukId) {
      try {
        const response = await axios.post(
          `${API_URL_DBT_}dbt/v1/service/getUserBySubSchemeIdAndScApprovalStageIdAndTalukIdAndDistrictIdForSameStep?subSchemeId=${subSchemeId}&approvalStageId=${approvalStageId}&districtId=${districtId}&talukId=${talukId}&designationStep=${designationStep}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
            },
          }
        );
        if (response.data && response.data.content) {
          setUsernames(response.data.content || []);
        } else {
          console.error("Unexpected API response format:", response);
        }
      } catch (error) {
        console.error("Error fetching usernames:", error);
      }
    } else {
      console.error("District ID or Taluk ID is missing.");
    }
  };

  const fetchNextsteps = async () => {
    if (!financialDelegation || (financialDelegation && isApprovalPowerChecked)) {
      try {
        const response = await axios.post(
          `${API_URL_DBT_}dbt/v1/service/getNextStepDetailsAfterSubmitBySubSchemeIdAndApprovalStageId?subSchemeId=${subSchemeId}&approvalStageId=${approvalStageId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
            },
          }
        );
        if (response.data && response.data.content) {
          setNextsteps(response.data.content || []);
        } else {
          console.error("Unexpected API response format:", response);
        }
      } catch (error) {
        console.error("Error fetching next steps:", error);
      }
    }
  };

  const history = useHistory();
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: string;
    longitude: string;
  }>({
    latitude: "",
    longitude: "",
  });
  const [comment, setComment] = useState<string>("");
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<boolean>(false);
  const [eligibleAmount, setEligibleSubsidy] = useState<string>("");
  // const [selectedNextstep, setSelectedNextstep] = useState<string>(defaultApprovalStageId || "");
 // New state for Eligible Subsidy

  // Rejection reasons
  const [rejectionReason, setRejectionReason] = useState<string>(""); // Rejection reason state
  const [rejectionOptions, setRejectionOptions] = useState<any[]>([]); // List of rejection reasons from API
  const [fetchError, setFetchError] = useState<boolean>(false); // Fetch error state

  // Usernames
  const [usernames, setUsernames] = useState<any[]>([]);
  const [selectedUsername, setSelectedUsername] = useState<string>(""); // Selected username
  // Nextsteps
  const [nextsteps, setNextsteps] = useState<any[]>([]);
  const [selectedNextstep, setSelectedNextstep] = useState<string>(""); // Selected username
  const [searchTerm, setSearchTerm] = useState("");
  const [documentSearchTerm, setDocumentSearchTerm] = useState<string>("");
  const [districtId, setDistrictId] = useState<number | null>(null);
  const [talukId, setTalukId] = useState<number | null>(null);

  // New state for Reject Type
  const [rejectType, setRejectType] = useState<string>("");
  // Web parity: when rejectType is "Objection", the Approval Stage dropdown
  // shows the BEFORE-step stages (stages the application can be sent back to)
  // — fetched from getRejectedBeforeStepDetailsAfterSubmitBySubSchemeIdAndApprovalStageId.
  // For all other rejectTypes (incl. normal forward) we keep using `nextsteps`.
  const [beforeStepList, setBeforeStepList] = useState<any[]>([]);

  const fetchBeforeStepList = async () => {
    try {
      const response = await axios.post(
        `${API_URL_DBT_}dbt/v1/service/getRejectedBeforeStepDetailsAfterSubmitBySubSchemeIdAndApprovalStageId?subSchemeId=${subSchemeId}&approvalStageId=${approvalStageId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        }
      );
      if (response.data && response.data.content) {
        setBeforeStepList(response.data.content || []);
      } else {
        setBeforeStepList([]);
      }
    } catch (error) {
      console.error("Error fetching before-step list for Objection:", error);
      setBeforeStepList([]);
    }
  };
  const [showRejectPanel, setShowRejectPanel] = useState<boolean>(false);
  const [validationErrorMessage, setValidationErrorMessage] = useState<string>("");

  useEffect(() => {
    fetchDocuments();
    fetchCurrentLocation();
    fetchRejectionReasons();
    fetchUser();
  }, []);

  // const fetchUser = () => {
  //   axios
  //     .get(
  //       `${API_URL_Master}master-data/v1/userMaster/get-join/${localStorage.getItem(
  //         "userMasterId"
  //       )}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
  //         },
  //       }
  //     )
  //     .then((res) => {
  //       const districtId: number = res.data.content.districtId;
  //       const talukId: number = res.data.content.talukId;
  //       setDistrictId(districtId);
  //       setTalukId(talukId);
  //       if (districtId && talukId) {
  //         fetchNextsteps();
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching user details:", error);
  //     });
  // };

  const fetchDocuments = () => {
    axios
      .get(`${API_URL_Master}master-data/v1/documentMaster/get-all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      })
      .then((res) => {
        const allDocs = res.data.content?.documentMaster || [];

        if (schemeId && subSchemeId) {
          axios
            .get(`${API_URL_Master}master-data/v1/schemeDocumentMaster/get-by-scheme-and-sub-scheme`, {
              params: {
                scSchemeDetailsId: schemeId,
                scSubSchemeDetailsId: subSchemeId,
              },
              headers: {
                Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
              },
            })
            .then((filterRes: any) => {
              const mappings = filterRes.data.content?.schemeDocumentMaster || [];
              const filtered = mappings.map((m: any) => ({
                documentMasterId: m.documentId,
                documentMasterName: m.documentMasterName,
              }));
              setDocuments(filtered.length > 0 ? filtered : allDocs);
            })
            .catch(() => {
              setDocuments(allDocs);
            });
        } else {
          setDocuments(allDocs);
        }
      })
      .catch((error) => {
        console.error("Error fetching documents:", error);
      });
  };

  const fetchCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          });
        },
        (error) => {
          console.error("Error getting current location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  const fetchRejectionReasons = async () => {
    try {
      const response = await axios.get(
        `${API_URL_Master}master-data/v1/rejectReasonWorkFlowMaster/get-all`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        }
      );

      if (response.data && response.data.content) {
        setRejectionOptions(response.data.content.rejectReasonWorkFlowMaster);
      } else {
        console.error("Unexpected API response format:", response);
        setFetchError(true);
      }
    } catch (error) {
      console.error("Error fetching rejection reasons:", error);
      setFetchError(true);
    }
  };

  // Fetch usernames from the API
  const fetchUsernames = async (approvalStageId: string) => {
    if (districtId && talukId) {
      try {
        const response = await axios.post(
          `${API_URL_DBT_}dbt/v1/service/getUserBySubSchemeIdAndScApprovalStageIdAndTalukIdAndDistrictId?subSchemeId=${subSchemeId}&approvalStageId=${approvalStageId}&districtId=${districtId}&talukId=${talukId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
            },
          }
        );
        if (response.data && response.data.content) {
          setUsernames(response.data.content || []);
        } else {
          console.error("Unexpected API response format:", response);
        }
      } catch (error) {
        console.error("Error fetching usernames:", error);
      }
    } else {
      console.error("District ID or Taluk ID is missing.");
    }
  };
  

  // Fetch nextstep from the API
  // const fetchNextsteps = async () => {
  //   try {
  //     const response = await axios.post(
  //       `${API_URL_DBT_}dbt/v1/service/getNextStepDetailsAfterSubmitBySubSchemeIdAndApprovalStageId?subSchemeId=${subSchemeId}&approvalStageId=${approvalStageId}`,
  //       {},
  //       {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
  //         },
  //       }
  //     );
  //     if (response.data && response.data.content) {
  //       setNextsteps(response.data.content || []);
  //     } else {
  //       console.error("Unexpected API response format:", response);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching usernames:", error);
  //   }
  // };


  const handleRejectionChange = (value: string) => {
    setRejectionReason(value); // Set the selected rejection reason
  };

  const handleUsernameChange = (value: string) => {
    setSelectedUsername(value); // Set the selected username
  };
  const handleNextstepChange = (value: string) => {
    setSelectedNextstep(value); // Set the selected nextstep
    if (value) {
      if (financialDelegation && !isApprovalPowerChecked) {
        fetchSameStepUsernames(value).catch(error => {
          console.error("Error fetching same step usernames:", error);
        });
      } else {
        fetchUsernames(value).catch(error => {
          console.error("Error fetching usernames:", error);
        });
      }
      // New API call when conditions are met
      if (financialDelegation && schemeAmount && designationId) {
        const designationStep = query.get('designationStep');
        axios.post(
          `${API_URL_DBT_}dbt/v1/service/getUserBySubSchemeIdAndScApprovalStageIdAndTalukIdAndDistrictIdForSameStep?subSchemeId=${subSchemeId}&approvalStageId=${approvalStageId}&districtId=${districtId}&talukId=${talukId}&designationStep=${designationStep}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
            },
          }
        )
        .then(response => {
          if (response.data && response.data.content) {
            setUsernames(response.data.content || []);
          } else {
            console.error("Unexpected API response format:", response);
          }
        })
        .catch(error => {
          console.error("Error fetching same step usernames:", error);
        });
      }
    }
  };

  const updateInspectionTaskStatus = () => {
    // Construct the payload dynamically based on selected values
    const requestBody: any = {
      applicationFormId: applicationDocumentId, // Replace with actual ID or state if dynamic
      lat: currentLocation.latitude,
      lon: currentLocation.longitude,
      description: comment || "Field Verification", // Default if no comment
      eligibleAmount: eligibleAmount, // Add eligible subsidy to request body
    };
    if (rejectionReason) {
      requestBody.rejectedReasonId = parseInt(rejectionReason);
    }
    if (selectedUsername) {
      requestBody.userId = parseInt(selectedUsername);
    }
    if (selectedNextstep) {
      requestBody.stepId = parseInt(selectedNextstep);
    }
    axios
      .post(`${API_URL_DBT_}dbt/v1/service/inspectionUpdate`, requestBody, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      })
      .then((res) => {
        console.log("API Response:", res.data);
        setSubmitSuccess(true);
        setTimeout(() => {
          setSubmitSuccess(false);
          history.push("/dash");
          window.location.reload();
        }, 3000);
      })
      .catch((error) => {
        console.error("Error updating inspection task status:", error);
        setSubmitError(true);
        setTimeout(() => setSubmitError(false), 3000);
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  // Example API calls for Permanent and Objection
  const callPermanentRejectAPI = async () => {
    try {
      // Call rejectServiceApplication API for Permanent rejection
      const payload = {
        applicationFormId: applicationFormId,
        rejectedReasonId: rejectionReason ? parseInt(rejectionReason) : undefined,
      };
      await axios.post(
        `${API_URL_DBT_}dbt/v1/service/rejectServiceApplication`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        }
      );
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        history.push("/dash");
        window.location.reload();
      }, 3000);
    } catch (error) {
      setSubmitError(true);
      setTimeout(() => setSubmitError(false), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const callObjectionRejectAPI = async () => {
    try {
      // Use actual Objection API endpoint
      await axios.post(
        `${API_URL_DBT_}dbt/v1/service/getRejectedBeforeStepDetailsAfterSubmitBySubSchemeIdAndApprovalStageId?subSchemeId=${subSchemeId}&approvalStageId=${approvalStageId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        }
      );
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        history.push("/dash");
        window.location.reload();
      }, 3000);
    } catch (error) {
      setSubmitError(true);
      setTimeout(() => setSubmitError(false), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  // const handleSubmit = () => {
  //   // If Reject Type is selected, handle accordingly
  //   if (rejectType === "Permanent") {
  //     if (!rejectionReason) {
  //       setValidationError(true);
  //       return;
  //     }
  //     callPermanentRejectAPI();
  //     return;
  //   }
  //   if (rejectType === "Objection") {
  //     if (!selectedNextstep || !selectedUsername || !rejectionReason) {
  //       setValidationError(true);
  //       return;
  //     }
  //     callObjectionRejectAPI();
  //     return;
  //   }
  //   // ...existing code...
  //   if (!selectedNextstep) {
  //     setValidationError(true);
  //     return;
  //   }
  //   updateInspectionTaskStatus();
  //   setSubmitSuccess(true);
  //   setTimeout(() => setSubmitSuccess(false), 3000);
  // };


  const handleSubmit = () => {
    // Double-click guard — once a submit is in flight, ignore further taps until
    // the API resolves. Prevents duplicate records (same as Profile/Land Info).
    if (submitting) return;

    // Reset the previous validation message
    setValidationErrorMessage("");

    // If Reject Type is selected, handle rejection-specific validation
    if (rejectType === "Permanent") {
      if (!rejectionReason) {
        setValidationErrorMessage("Selecting a rejection reason is mandatory");
        setValidationError(true);
        return;
      }
      setSubmitting(true);
      callPermanentRejectAPI();
      return;
    }

    if (rejectType === "Objection") {
      if (!selectedNextstep) {
        setValidationErrorMessage("Selecting Approval Stage is mandatory");
        setValidationError(true);
        return;
      }
      if (!selectedUsername) {
        setValidationErrorMessage("Selecting Username is mandatory");
        setValidationError(true);
        return;
      }
      if (!rejectionReason) {
        setValidationErrorMessage("Selecting a rejection reason is mandatory");
        setValidationError(true);
        return;
      }
      setSubmitting(true);
      // Web parity: Objection sends the application BACK to a previous stage
      // with a rejection reason and user. The same `inspectionUpdate` endpoint
      // handles this — updateInspectionTaskStatus already builds the right
      // payload (stepId + userId + rejectedReasonId + description), so we just
      // route Objection through it instead of the legacy callObjectionRejectAPI
      // which was incorrectly POSTing to a list-fetching URL.
      updateInspectionTaskStatus();
      return;
    }

    if (!selectedNextstep) {
      setValidationErrorMessage("Selecting Approval Stage is mandatory");
      setValidationError(true);
      return;
    }

    if (!selectedUsername) {
      setValidationErrorMessage("Selecting Username is mandatory");
      setValidationError(true);
      return;
    }

    setSubmitting(true);
    // Note: do NOT set submitSuccess here — it will be set inside the API's .then()
    // once the call actually resolves. Previously this was firing optimistically.
    updateInspectionTaskStatus();
  };


  const handleDocumentSelect = (value: string) => {
    const selected = documents.find((doc) => doc.documentMasterId === value);
    setSelectedDocument(selected || null);
  };

  const filteredDocuments = documents.filter((doc) => {
    const term = documentSearchTerm.toLowerCase();
    return (
      doc.documentMasterName?.toLowerCase().includes(term) ||
      String(doc.documentMasterId).toLowerCase().includes(term)
    );
  });

  const filteredUsernames = usernames.filter((user) =>
    user.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="docpage-toolbar">
          <IonButtons slot="start">
            {/* Removed IonMenuButton since we're using bottom tab menu */}
          </IonButtons>
          <IonTitle>Documents</IonTitle>
          <IonButtons slot="end">
            <IonButton className="docpage-back-btn" onClick={() => history.goBack()}>
              <IonIcon icon={arrowBack} />
              Go Back
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent
        className="with-bottom-menu docpage-content"
        style={{ ['--padding-bottom' as any]: '180px' } as React.CSSProperties}
      >
        <div className="docpage-hero" />
        <div className="docpage-wrap">

          {/* Document Selection Card */}
          <section className="docpage-card">
            <h3 className="docpage-card-title">
              <span className="docpage-card-title-icon">
                <IonIcon icon={documentTextOutline} />
              </span>
              Select Document
            </h3>

            <div className="docpage-field">
              <span className="docpage-field-label">Search</span>
              <IonSearchbar
                value={documentSearchTerm}
                onIonInput={(e) => setDocumentSearchTerm(e.detail.value!)}
                placeholder="Search documents..."
                className="docpage-searchbar"
                showClearButton="focus"
              />
            </div>

            <div className="docpage-field">
              <span className="docpage-field-label">Document</span>
              <IonSelect
                className="docpage-select"
                value={selectedDocument?.documentMasterId || ""}
                placeholder="Select a document"
                interface="action-sheet"
                onIonChange={(e) => handleDocumentSelect(e.detail.value!)}
              >
                <IonSelectOption value="">None</IonSelectOption>
                {filteredDocuments.map((doc) => (
                  <IonSelectOption
                    key={doc.documentMasterId}
                    value={doc.documentMasterId}
                  >
                    {doc.documentMasterName}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </div>

            {selectedDocument && (
              <>
                <div className="docpage-doc-chip">
                  <span className="docpage-doc-chip-icon">
                    <IonIcon icon={documentTextOutline} />
                  </span>
                  <span>{selectedDocument.documentMasterName}</span>
                </div>
                <IonCard className="docpage-upload-card">
                  <IonCardHeader>
                    <IonCardTitle>
                      <IonIcon
                        icon={cloudUploadOutline}
                        style={{ marginRight: 6, verticalAlign: 'middle' }}
                      />
                      Upload Document
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <DocumentUpload
                      onUpload={(file) => console.log(file)}
                      docId={selectedDocument.documentMasterId}
                    />
                  </IonCardContent>
                </IonCard>
              </>
            )}
          </section>

          {/* Review Details Card */}
          <section className="docpage-card">
            <h3 className="docpage-card-title">
              <span className="docpage-card-title-icon">
                <IonIcon icon={chatbubbleEllipsesOutline} />
              </span>
              Review Details
            </h3>

            <div className="docpage-field">
              <span className="docpage-field-label">Comment</span>
              <IonInput
                className="docpage-input docpage-textarea"
                value={comment}
                placeholder="Enter comment here"
                onIonChange={(e) => setComment(e.detail.value!)}
              />
            </div>

            <div className="docpage-field">
              <span className="docpage-field-label">
                <IonIcon icon={layersOutline} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Approval Stage
              </span>
              <IonSelect
                className="docpage-select"
                value={selectedNextstep}
                placeholder={rejectType === "Objection" ? "Select stage to send back to" : "Select a NextStep"}
                interface="action-sheet"
                onIonChange={(e) => handleNextstepChange(e.detail.value!)}
                disabled={rejectType === "Permanent"}
              >
                <IonSelectOption value="">None</IonSelectOption>
                {/* Web parity: for Objection use the BEFORE-step stages (stages the
                    application can be sent back to). For everything else use the
                    regular forward-next-step list (`nextsteps`). */}
                {(rejectType === "Objection" ? beforeStepList : nextsteps).map((user) => (
                  <IonSelectOption
                    key={user.approvalStageId}
                    value={user.approvalStageId}
                  >
                    {user.approvalStageName}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </div>

            <div className="docpage-field">
              <span className="docpage-field-label">
                <IonIcon icon={personOutline} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Username
              </span>
              <IonSearchbar
                value={searchTerm}
                onIonInput={(e) => setSearchTerm(e.detail.value!)}
                placeholder="Search for a username"
                className="docpage-searchbar"
                disabled={rejectType === "Permanent"}
              />
              <IonSelect
                className="docpage-select"
                value={selectedUsername}
                placeholder="Select a username"
                interface="action-sheet"
                onIonChange={(e) => handleUsernameChange(e.detail.value!)}
                disabled={rejectType === "Permanent"}
                style={{ marginTop: 8 }}
              >
                <IonSelectOption value="">None</IonSelectOption>
                {filteredUsernames.map((user) => (
                  <IonSelectOption key={user.userId} value={user.userId}>
                    {user.userName}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </div>
          </section>

          {/* Location card */}
          <section className="docpage-location">
            <div className="docpage-location-header">
              <span className="docpage-location-icon">
                <IonIcon icon={locationOutline} />
              </span>
              <div>
                <div className="docpage-location-title">Current Location</div>
                <div className="docpage-location-sub">Auto-detected from device</div>
              </div>
            </div>
            <IonRow>
              <IonCol size="6">
                <div className="docpage-coord">
                  <span className="docpage-coord-label">Latitude</span>
                  <span className="docpage-coord-value">
                    {currentLocation.latitude || '—'}
                  </span>
                </div>
              </IonCol>
              <IonCol size="6">
                <div className="docpage-coord">
                  <span className="docpage-coord-label">Longitude</span>
                  <span className="docpage-coord-value">
                    {currentLocation.longitude || '—'}
                  </span>
                </div>
              </IonCol>
            </IonRow>
          </section>

          {/* Reject panel (only shown when the user has tapped the side button) */}
          {showRejectPanel && (
            <section className="docpage-reject-panel">
              <div className="docpage-reject-banner">
                <span className="docpage-reject-banner-icon">
                  <IonIcon icon={warningOutline} />
                </span>
                <span className="docpage-reject-banner-text">Rejection Details</span>
              </div>

              <div className="docpage-field">
                <span className="docpage-field-label">Reject Type</span>
                <IonSelect
                  className="docpage-select"
                  value={rejectType}
                  placeholder="Select Reject Type"
                  interface="action-sheet"
                  onIonChange={(e) => {
                    const next = e.detail.value!;
                    setRejectType(next);
                    // Clear stage/user selections so the user doesn't accidentally
                    // submit a stale stepId/userId from the previous reject type.
                    setSelectedNextstep("");
                    setSelectedUsername("");
                    if (next === "Objection") {
                      // Web parity: load the BEFORE-step stages so the user can pick
                      // a stage to send the application back to.
                      fetchBeforeStepList();
                    } else {
                      setBeforeStepList([]);
                    }
                  }}
                >
                  <IonSelectOption value="">None</IonSelectOption>
                  <IonSelectOption value="Permanent">Permanent</IonSelectOption>
                  <IonSelectOption value="Objection">Objection</IonSelectOption>
                </IonSelect>
              </div>

              <div className="docpage-field" style={{ marginBottom: 0 }}>
                <span className="docpage-field-label">Rejection Reason</span>
                {fetchError ? (
                  <p className="docpage-error-note">
                    Failed to fetch rejection reasons. Please try again later.
                  </p>
                ) : (
                  <IonSelect
                    className="docpage-select"
                    value={rejectionReason}
                    placeholder="Select reason for rejection"
                    interface="action-sheet"
                    onIonChange={(e) => handleRejectionChange(e.detail.value!)}
                  >
                    <IonSelectOption value="">None</IonSelectOption>
                    {rejectionOptions.map((option) => (
                      <IonSelectOption
                        key={option.rejectReasonWorkFlowMasterId}
                        value={option.rejectReasonWorkFlowMasterId}
                      >
                        {option.reason}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                )}
              </div>
            </section>
          )}

          {/* Compute whether the form has enough info to submit — drives the
              vibrant/grey color so the user gets visual feedback the moment they
              finish filling required fields. Click validation still runs in
              handleSubmit, so clicking a "grey" button shows a helpful alert. */}
          {(() => {
            const canSubmit = (
              rejectType === 'Permanent'
                ? !!rejectionReason
                : rejectType === 'Objection'
                  ? !!(selectedNextstep && selectedUsername && rejectionReason)
                  : !!(selectedNextstep && selectedUsername)
            );
            return (
          <div className="docpage-actions docpage-actions--row">
            <IonButton
              expand="block"
              className={
                `docpage-submit ${
                  submitting ? 'is-submitting' : (canSubmit ? 'is-ready' : 'is-empty')
                }`
              }
              onClick={handleSubmit}
              disabled={isSubmitDisabled || submitting}
            >
              {submitting ? (
                <>
                  <IonSpinner name="crescent" className="docpage-submit-spinner" />
                  <span style={{ marginLeft: 6 }}>Submitting...</span>
                </>
              ) : (
                <>
                  <IonIcon icon={checkmarkCircleOutline} />
                  Submit
                </>
              )}
            </IonButton>
            <IonButton
              className={`docpage-reject-side${showRejectPanel ? ' is-open' : ''}`}
              aria-label={showRejectPanel ? 'Hide reject options' : 'Reject application'}
              disabled={submitting}
              onClick={() => {
                setShowRejectPanel((prev) => {
                  const next = !prev;
                  if (!next) {
                    setRejectType("");
                    setRejectionReason("");
                  }
                  return next;
                });
              }}
            >
              <IonIcon icon={closeCircleOutline} />
              <span className="docpage-reject-side-label">
                {showRejectPanel ? 'Cancel' : 'Reject'}
              </span>
            </IonButton>
          </div>
            );
          })()}

        </div>
      </IonContent>

      {/* Toasts */}
      <IonToast
        isOpen={validationError}
        onDidDismiss={() => setValidationError(false)}
        message={validationErrorMessage || "Validation error occurred"}
        duration={3000}
      />
      <IonToast
        isOpen={submitSuccess}
        onDidDismiss={() => setSubmitSuccess(false)}
        message="Successfully submitted"
        duration={3000}
      />
      <IonToast
        isOpen={submitError}
        onDidDismiss={() => setSubmitError(false)}
        message="Error submitting data"
        duration={3000}
      />
      <IonToast
        isOpen={showApprovalPowerPopup}
        onDidDismiss={() => setShowApprovalPowerPopup(false)}
        message="Login to Web Application and Generate Sanction Order"
        duration={8000}
      />
      <Menu />
    </IonPage>
  );
};

export default DocPage;
