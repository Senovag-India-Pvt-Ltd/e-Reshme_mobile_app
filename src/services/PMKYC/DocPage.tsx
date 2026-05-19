import React, { useState, useEffect } from "react";
import {
  IonContent,
  IonPage,
  IonGrid,
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
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonSearchbar,
} from "@ionic/react";
import axios from "axios";
import { useParams, useHistory } from "react-router-dom";
import "./DocPage.css";
import DocumentUpload from "./DocumentUpload";
import Menu from "../Inspection/Menu";
import {
  API_URL_DBT,
  API_URL_DBT_,
  API_URL_Inspection,
  API_URL_Master,
} from '../auth.service';
import { arrowBack } from "ionicons/icons";

const DocPage: React.FC = () => {
  const { applicationDocumentId, approvalStageId, subSchemeId } = useParams<{
    applicationDocumentId: string;
    approvalStageId: string;
    subSchemeId: string;
  }>();

  // Get applicationFormId from query params (fallback to applicationDocumentId)
  const query = new URLSearchParams(window.location.search);
  const applicationFormId = query.get('applicationFormId') || applicationDocumentId;
  const financialDelegation = query.get('financialDelegation') === 'true';
  const schemeAmountQuery = query.get('schemeAmount');
  const eligibleAmountQuery = query.get('eligibleAmount');
  const [designationId, setDesignationId] = useState<number | null>(null);

  const schemeAmount = !eligibleAmountQuery || eligibleAmountQuery === '0'
    ? schemeAmountQuery
    : eligibleAmountQuery;

  const [isApprovalPowerChecked, setIsApprovalPowerChecked] = useState<boolean>(false);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState<boolean>(false);
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
  const [districtId, setDistrictId] = useState<number | null>(null);
  const [talukId, setTalukId] = useState<number | null>(null);

  // New state for Reject Type
  const [rejectType, setRejectType] = useState<string>("");

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
        setDocuments(res.data.content?.documentMaster || []);
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
    }
  };

  const callObjectionRejectAPI = async () => {
    try {
      // Use actual Objection API endpoint
      await axios.post(
        `https://e-reshme.karnataka.gov.in/dbt/v1/service/getRejectedBeforeStepDetailsAfterSubmitBySubSchemeIdAndApprovalStageId?subSchemeId=${subSchemeId}&approvalStageId=${approvalStageId}`,
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

  // ⭐ NEW: Mandatory check for Approval Stage & Username (only when NOT Permanent Reject)
  // ------------------------------------------------------------------------
  if (rejectType !== "Permanent") {
    if (!selectedNextstep) {
      setValidationError(true);
      return;
    }
    if (!selectedUsername) {
      setValidationError(true);
      return;
    }
  }
  // ------------------------------------------------------------------------

  // If Reject Type is selected, handle accordingly
  if (rejectType === "Permanent") {
    if (!rejectionReason) {
      setValidationError(true);
      return;
    }
    callPermanentRejectAPI();
    return;
  }
  if (rejectType === "Objection") {
    if (!selectedNextstep || !selectedUsername || !rejectionReason) {
      setValidationError(true);
      return;
    }
    callObjectionRejectAPI();
    return;
  }

  // Existing validation for nextstep (kept as-is)
  if (!selectedNextstep) {
    setValidationError(true);
    return;
  }

  updateInspectionTaskStatus();
  setSubmitSuccess(true);
  setTimeout(() => setSubmitSuccess(false), 3000);
};


  const handleDocumentSelect = (value: string) => {
    const selected = documents.find((doc) => doc.documentMasterId === value);
    setSelectedDocument(selected || null);
  };

  const filteredUsernames = usernames.filter((user) =>
    user.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            {/* Removed IonMenuButton since we're using bottom tab menu */}
          </IonButtons>
          <IonTitle>
            <b>Documents</b>
          </IonTitle>
          <IonButtons slot="end">
            <IonButton style={{ '--background': '#ffffff', '--color': '#000000', color: '#000000', backgroundColor: '#ffffff' } as any} onClick={() => history.goBack()}>
              <IonIcon icon={arrowBack} />
              Go Back
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="with-bottom-menu" style={{ ['--padding-bottom' as any]: '180px' } as React.CSSProperties}>
        <IonGrid>
          <IonRow>
            {/* --- NEW: Reject Type Dropdown --- */}
            <IonCol size="12">
              <IonLabel>
                <b>Reject Type:</b>
              </IonLabel>
              <IonSelect
                value={rejectType}
                placeholder="Select Reject Type"
                onIonChange={e => setRejectType(e.detail.value!)}
              >
                <IonSelectOption value="">None</IonSelectOption>
                <IonSelectOption value="Permanent">Permanent</IonSelectOption>
                <IonSelectOption value="Objection">Objection</IonSelectOption>
              </IonSelect>
              
            </IonCol>
            {/* --- END NEW --- */}

            <IonCol size="12">
              <IonLabel>
                <b>Select Rejection Reason:</b>
              </IonLabel>
              {fetchError ? (
                <p style={{ color: "red" }}>
                  Failed to fetch rejection reasons. Please try again later.
                </p>
              ) : (
                <IonSelect
                  value={rejectionReason}
                  placeholder="Select reason for rejection"
                  onIonChange={(e) => handleRejectionChange(e.detail.value!)}
                >
                  <IonSelectOption value="">None</IonSelectOption>{" "}
                  {/* Option to deselect */}
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
            </IonCol>

            {/* Document Selection Dropdown */}
            <IonCol size="12">
              <IonLabel>
                <b>Select Document:</b>
              </IonLabel>
              <IonSelect
                value={selectedDocument?.documentMasterId || ""}
                placeholder="Select a document"
                onIonChange={(e) => handleDocumentSelect(e.detail.value!)}
              >
                <IonSelectOption value="">None</IonSelectOption>{" "}
                {/* Option to deselect */}
                {documents.map((doc) => (
                  <IonSelectOption
                    key={doc.documentMasterId}
                    value={doc.documentMasterId}
                  >
                    {doc.documentMasterName}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonCol>

            {/* Show Card for Selected Document */}
            {selectedDocument && (
              <IonCol size="8">
                <IonCard className="notification-bar" style={{ '--background': '#ffffff', '--color': '#000000', background: '#ffffff', color: '#000000' } as any}>
                  <IonCardHeader style={{ color: '#000000', fontWeight: 800 }}>
                    <IonCardTitle>
                      Documents: {selectedDocument.documentMasterName}
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent style={{ color: '#000000' }}>
                    <DocumentUpload
                      onUpload={(file) => console.log(file)}
                      docId={selectedDocument.documentMasterId}
                    />
                  </IonCardContent>
                </IonCard>
              </IonCol>
            )}
          </IonRow>
        </IonGrid>

        {/* Comment and Location */}
        <IonGrid>
          <IonRow>
            <IonCol size="12">
              <IonLabel>
                <b>Comment:</b>
              </IonLabel>
              <IonInput
                value={comment}
                placeholder="Enter comment here"
                onIonChange={(e) => setComment(e.detail.value!)}
              />
            </IonCol>

            {/* Eligible Subsidy Input */}
            {/* <IonCol size="12">
              <IonLabel>
                <b>Eligible Subsidy:</b>
              </IonLabel>
              <IonInput
                value={eligibleAmount}
                placeholder="Enter Eligible Subsidy Amount"
                onIonChange={(e) => setEligibleSubsidy(e.detail.value!)}
              />
            </IonCol> */}

            {/* Username Dropdown */}
            {/* <IonCol size="12">
              <IonLabel>
                <b>Select Username:</b>
              </IonLabel>
              <IonSelect
                value={selectedUsername}
                placeholder="Select a username"
                onIonChange={(e) => handleUsernameChange(e.detail.value!)}
              >
                <IonSelectOption value="">None</IonSelectOption>
                {usernames.map((user) => (
                  <IonSelectOption key={user.userMasterId} value={user.userMasterId}>
                                       {user.username}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonCol> */}

            

            {/* Approval Stage Dropdown - disabled if Permanent */}
            <IonCol size="12">
              <IonLabel>
                <b>Select Approval Stage:</b>
              </IonLabel>
              <IonSelect
                value={selectedNextstep}
                placeholder="Select a NextStep"
                onIonChange={(e) => handleNextstepChange(e.detail.value!)}
                disabled={rejectType === "Permanent"}
              >
                <IonSelectOption value="">None</IonSelectOption>
                {nextsteps.map((user) => (
                  <IonSelectOption
                    key={user.approvalStageId}
                    value={user.approvalStageId}
                  >
                    {user.approvalStageName}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonCol>

            {/* Username Dropdown - disabled if Permanent */}
            <IonCol size="12">
              <IonLabel>
                <b>Select Username:</b>
              </IonLabel>

              {/* Searchbar for filtering usernames */}
              <IonSearchbar
                value={searchTerm}
                onIonInput={(e) => setSearchTerm(e.detail.value!)}
                placeholder="Search for a username"
                className="custom-searchbar"
                disabled={rejectType === "Permanent"}
              />

              <IonSelect
                value={selectedUsername}
                placeholder="Select a username"
                onIonChange={(e) => handleUsernameChange(e.detail.value!)}
                disabled={rejectType === "Permanent"}
              >
                <IonSelectOption value="">None</IonSelectOption>
                {filteredUsernames.map((user) => (
                  <IonSelectOption key={user.userId} value={user.userId}>
                    {user.userName}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonCol>

            {/* Styled Location Section */}
            <IonCol size="12" className="location-container">
              <div className="location-box">
                <IonLabel className="location-label">
                  <b>Current Location</b>
                </IonLabel>
                <IonRow>
                  <IonCol size="6">
                    <IonInput
                      value={currentLocation.latitude}
                      placeholder="Latitude"
                      disabled
                    />
                  </IonCol>
                  <IonCol size="6">
                    <IonInput
                      value={currentLocation.longitude}
                      placeholder="Longitude"
                      disabled
                    />
                  </IonCol>
                </IonRow>
              </div>
            </IonCol>

            {/* Submit Button */}
            <IonCol size="12">
              <IonButton style={{ '--background': '#ffffff', '--color': '#000000', color: '#000000', backgroundColor: '#ffffff' } as any} expand="block" className="submit-button" onClick={handleSubmit} disabled={isSubmitDisabled}>
                Submit
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>

      {/* Toasts */}
      <IonToast
        isOpen={validationError}
        onDidDismiss={() => setValidationError(false)}
        message="Selecting Approval Stage is Mandatory"
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
        duration={4000}
      />
      <Menu />
    </IonPage>
  );
};

export default DocPage;
