import React, { useState, useEffect } from "react";
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
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonItem,
  IonCol,
  IonAlert,
  IonImg,
  IonModal,
  IonText,
} from "@ionic/react";
import { camera, eyeSharp, trash, trashSharp } from "ionicons/icons"; // Import the trash icon
import "./ProfileInfoPage.css";
import "./AddDlfPage.css";
import axios from "axios";
import { API_URL_DBT, API_URL_ChowkiManagment } from "../auth.service";
import { API_URL_Master_Data } from "../auth.service";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Geolocation } from "@capacitor/geolocation";
// import DocumentUpload from './CropInspectionUpload';
import { useParams } from "react-router-dom";

const CropInspectionPage: React.FC = () => {
  const [searchText, setSearchText] = useState<string>("");
  const { chowkiDetailId, fid, farmerId } = useParams<{
    chowkiDetailId: string;
    fid: string;
    farmerId: string;
  }>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [data, setData] = useState<any>(null);
  const [viewAll, setViewAll] = useState<boolean>(false);
  const [showInspectionFields, setShowInspectionFields] =
    useState<boolean>(false); // Show/hide inspection fields
  const [selectedDate, setSelectedDate] = useState<string>(""); // To store selected date
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  //const [farmerId, setFarmerId] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);
  const [saleAndDisposalId, setChowkiId] = useState<number | null>(null);
  const [image, setImage] = useState<string | ArrayBuffer | null>(null); // State for captured image
  // const [isEditable, setIsEditable] = useState<boolean>(false);
  const [showHatchingDatePicker, setShowHatchingDatePicker] =
    useState<boolean>(false);
  const [showDispatchDatePicker, setShowDispatchDatePicker] =
    useState<boolean>(false); // Date picker visibility
  const [inspectionFields, setInspectionFields] = useState({
    cropInspectionTypeId: "",
    date: new Date().toISOString(),
    reasonId: "",
    note: "",
    cropStatusId: "",
    mountId: "",
    cropInspectionPath: "",
  });
  const [showAlert, setShowAlert] = useState<boolean>(false);

  // State variables for dropdown options
  const [raceOptions, setRaceOptions] = useState<string[]>([
    "Race A",
    "Race B",
  ]); // Dummy data for race options
  const [tscOptions, setTscOptions] = useState<string[]>(["Tsc 1", "Tsc 2"]); // Dummy data for Tsc options

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [locationData, setLocationData] = useState<{
    latitude?: number;
    longitude?: number;
    capturedAt?: string;
  }>({});
  const [hasCameraCaptureLocation, setHasCameraCaptureLocation] =
    useState<boolean>(false);

  const handleChange = (e: any, field: string) => {
    if (inspectionFields) {
      setInspectionFields({
        ...inspectionFields,
        [field]: e.detail.value, // Change here to work with IonSelect
      });
    }
  };
  const clearField = () => {
    setViewAll(false);
  };

  const clearSearch = () => {
    setSearchText("");
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
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      });
      if (response.data && response.data.content) {
        setMountData(response.data.content.mount);
      } else {
        console.error("Unexpected API response format:", response);
        setFetchError(true);
      }
    } catch (error) {
      console.error("Error fetching Inspection Type:", error);
      setFetchError(true);
    }
  };

  useEffect(() => {
    fetchMountList();
    if (chowkiDetailId) {
      cropInspection(chowkiDetailId);
    }
  }, []);

  useEffect(() => {
    setInspectionFields((prevFields) => ({
      ...prevFields,
      date: new Date().toISOString(),
    }));
  }, []);

  const [reasonData, setReasonData] = useState<any[]>([]);
  const fetchReasonList = async () => {
    try {
      const response = await axios.get(`${API_URL_Master_Data}reason/get-all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      });
      if (response.data && response.data.content) {
        setReasonData(response.data.content.reason);
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
    fetchReasonList();
  }, []);

  const [cropStatusData, setCropStatusData] = useState<any[]>([]);
  const fetchCropStatusList = async () => {
    try {
      const response = await axios.get(
        `${API_URL_Master_Data}cropStatus/get-all`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        },
      );
      if (response.data && response.data.content) {
        setCropStatusData(response.data.content.cropStatus);
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
    fetchCropStatusList();
  }, []);

  const [cropInspectionTypeData, setCropInspectionTypeData] = useState<any[]>(
    [],
  );
  const cropInspection = (saleAndDisposalId: string) => {
    const api = axios.create({
      baseURL: API_URL_ChowkiManagment,
    });

    api
      .get(
        `cropInspection/getInspectionTypeForCropFromSaleAndDisposalOfDfl/${saleAndDisposalId}`,
        {
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        },
      )
      .then((res) => {
        const chowkiData = res.data[0];
        setCropInspectionTypeData(res.data); // Update to directly set the new data
        setChowkiId(chowkiData.saleAndDisposalId); // Set chowkiId for submission
      })
      .catch((error) => {
        setMessage("Farmer number does not exist");
        setIsError(true);
      });
  };

  // Effect to call cropInspection when chowkiId changes
  useEffect(() => {
    if (saleAndDisposalId !== null) {
      cropInspection(chowkiDetailId); // Pass chowkiId to cropInspection
    }
  }, [saleAndDisposalId]);

  const [isReadyToSubmit, setIsReadyToSubmit] = useState(false); // To control when to call handleEdit

  const toggleViewAll = (i: number) => {
    setViewAll(!viewAll);
    const api = axios.create({
      baseURL: API_URL_ChowkiManagment,
    });

    api
      .get(
        `chowkimanagement/getInspectioninfoForFarmerFromSaleDisposalOfDFls/${i}`,
        {
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        },
      )
      .then((res) => {
        const chowkiData = res.data[0];
        setData({
          saleAndDisposalId: chowkiData.saleAndDisposalId,
          dflsSource: chowkiData.dflsSource,
          numbersOfDfls: chowkiData.numbersOfDfls,
          lotNumberRsp: chowkiData.lotNumberRsp,
          receiptNo: chowkiData.receiptNo || "",
          raceName: chowkiData.raceName,
          price: chowkiData.price,
          lotNumberCrc: chowkiData.lotNumberCrc,
          ratePer100Dfls: chowkiData.ratePer100Dfls, // Handle missing receiptNo
        });
        setChowkiId(chowkiData.saleAndDisposalId); // This sets the chowkiId in state
        // setIsReadyToSubmit(true); // This triggers handleEdit after state is updated
      })
      .catch((error) => {
        setMessage("Farmer number does not exist");
        setIsError(false);
        // setShowAlert(true);
      });
    setViewAll(!viewAll);
  };

  const handleCaptureImage = async () => {
    try {
      const image = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 90,
      });

      const response = await fetch(image.webPath!);
      const blob = await response.blob();
      const file = new File([blob], "captured_image.jpg", { type: blob.type });

      setSelectedFile(file); // Set the captured image as the selected file to be sent to the API
      setPreviewImage(image.webPath ?? null); // Set preview image for viewing
      setHasCameraCaptureLocation(true);

      try {
        const position = await Geolocation.getCurrentPosition();
        setLocationData({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          capturedAt: new Date().toISOString(),
        });
        setMessage(
          `Location captured: ${position.coords.latitude}, ${position.coords.longitude}`,
        );
        setIsError(false);
        setShowAlert(true);
      } catch (geoError) {
        console.warn(
          "Geolocation not available or permission denied",
          geoError,
        );
        setLocationData({});
        setMessage("Image captured, but location not available.");
        setIsError(false);
        setShowAlert(true);
      }
    } catch (error) {
      console.error("Error capturing image:", error);
      setMessage("Error capturing image. Please try again.");
      setIsError(true);
      setShowAlert(true);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // Get the first file from the file input
    if (file) {
      (async () => {
        try {
          const compressed = await compressImageFile(file, 2);
          setSelectedFile(compressed); // Set compressed file
          setPreviewImage(URL.createObjectURL(compressed)); // Set preview image for viewing
          setHasCameraCaptureLocation(false);
          setLocationData({});
        } catch (err) {
          console.error("Compression error, using original file:", err);
          setSelectedFile(file);
          setPreviewImage(URL.createObjectURL(file));
          setHasCameraCaptureLocation(false);
          setLocationData({});
        }
      })();
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setPreviewImage(null); // Clear the preview image
  };

  // Helper: convert File to data URL
  const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  };

  // Helper: compress image File to max 2 MB
  const compressImageFile = async (
    file: File,
    maxSizeMB = 2,
  ): Promise<File> => {
    const maxSize = maxSizeMB * 1024 * 1024;

    if (!file.type.startsWith("image/")) {
      return file;
    }

    if (file.size <= maxSize) return file;

    const dataUrl = await fileToDataURL(file);
    const img = document.createElement("img");
    img.src = dataUrl;

    await new Promise((resolve, reject) => {
      img.onload = () => resolve(true);
      img.onerror = (e) => reject(e);
    });

    const canvas = document.createElement("canvas");
    let [width, height] = [img.naturalWidth, img.naturalHeight];

    const maxDim = 1600;
    if (Math.max(width, height) > maxDim) {
      const scale = maxDim / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(img, 0, 0, width, height);

    let quality = 0.92;
    let blob: Blob | null = null;

    for (let i = 0; i < 8; i++) {
      blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(
          (b) => resolve(b),
          file.type === "image/png" ? "image/jpeg" : file.type,
          quality,
        );
      });

      if (!blob) break;
      if (blob.size <= maxSize) break;

      quality = Math.max(0.4, quality - 0.12);

      if (i === 3) {
        width = Math.round(width * 0.8);
        height = Math.round(height * 0.8);
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
      }
    }

    if (blob && blob.size <= file.size) {
      const newFile = new File(
        [blob],
        file.name.replace(/\.[^/.]+$/, "") + ".jpg",
        { type: "image/jpeg" },
      );
      return newFile.size <= maxSize ? newFile : file;
    }

    return file;
  };

  const handleEdit = async () => {
    const cleaned = {
      cropInspectionTypeId: inspectionFields.cropInspectionTypeId
        ?.toString()
        ?.trim(),
      mountId: inspectionFields.mountId?.toString()?.trim(),
      reasonId: inspectionFields.reasonId?.toString()?.trim(),
      cropStatusId: inspectionFields.cropStatusId?.toString()?.trim(),
      date: inspectionFields.date?.toString()?.trim(),
      note: inspectionFields.note?.toString()?.trim(),
    };

    const missingFields = [];
    if (!cleaned.cropInspectionTypeId) missingFields.push("inspection type");
    if (!cleaned.mountId) missingFields.push("mount");
    // reason is optional in this flow (no visible field in UI)
    // if (!cleaned.reasonId) missingFields.push('reason');
    if (!cleaned.cropStatusId) missingFields.push("crop status");
    if (!cleaned.date) missingFields.push("date");
    if (!cleaned.note) missingFields.push("note");

    if (missingFields.length > 0) {
      const missingMsg = missingFields.join(", ");
      console.log(
        "Inspection submit validation failed, missing:",
        missingMsg,
        "state:",
        inspectionFields,
      );
      setMessage(
        `All fields mandatory before submitting. Missing: ${missingMsg}`,
      );
      setIsError(true);
      setShowAlert(true);
      return;
    }

    if (!selectedFile) {
      setMessage("Please capture or upload an image before submitting.");
      setIsError(true);
      setShowAlert(true);
      return;
    }

    if (chowkiDetailId) {
      const api = axios.create({
        baseURL: API_URL_ChowkiManagment,
      });
      let cropInspectionId = null;
      try {
        // Step 1: Proceed with submitting the main data first
        const payload: any = {
          saleAndDisposalId: chowkiDetailId,
          farmerId: farmerId,
          fruitsId: fid,
          cropInspectionTypeId: inspectionFields.cropInspectionTypeId,
          mountId: inspectionFields.mountId,
          cropStatusId: inspectionFields.cropStatusId,
          date: inspectionFields.date,
          note: inspectionFields.note,
          cropInspectionPath: inspectionFields.cropInspectionPath,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          locationCapturedAt: locationData.capturedAt,
        };

        if (inspectionFields.reasonId) {
          payload.reasonId = inspectionFields.reasonId;
        }

        const inspectionResponse = await api.post(
          "cropInspection/add-crop-inspection-info",
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              accept: "*/*",
              Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
            },
          },
        );

        console.log("Inspection Response:", inspectionResponse.data);
        if (inspectionResponse.data.error === 0) {
          cropInspectionId = inspectionResponse.data.cropInspectionId; // Assuming the ID is in the response

          setMessage("Data added successfully!");
          setIsError(false);
          setShowAlert(true);
          clearSearch();
        } else {
          // Show the message from the response if error=1
          setMessage(inspectionResponse.data.message || "Failed to add data.");
          setIsError(true);
          setShowAlert(true);
        }

        // Step 2: Check if a file is selected and handle file upload
        if (selectedFile && cropInspectionId) {
          const formData = new FormData();
          formData.append("multipartFile", selectedFile); // Use the correct key
          formData.append("cropInspectionId", cropInspectionId);

          const fileUploadResponse = await api.post(
            "cropInspection/upload-crop-inspection",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
              },
            },
          );

          // Update the photo path in the state with the new path from the response
          const newPhotoPath =
            fileUploadResponse.data.content.cropInspectionPath; // Adjust based on your response structure
          setInspectionFields((prevData) => ({
            ...prevData,
            cropInspectionPath: newPhotoPath, // Set the new photo path
          }));

          setMessage("Inspection details and photo uploaded successfully");
          setShowAlert(true);
        }
      } catch (error) {
        console.error(
          "Error uploading photo or updating farmer details:",
          error,
        );
        setMessage(
          "Error uploading photo or updating farmer details. Please try again.",
        );
        setIsError(true);
        setShowAlert(true);
      }
    } else {
      setMessage("Chowki ID is not set. Please fetch the data first.");
      setIsError(true);
      setShowAlert(true);
    }
  };

  // Update the state when a file is uploaded
  const handleFileUpload = (file: File) => {
    setImageFile(file);
  };

  const handleDateChange = (e: any) => {
    setSelectedDate(e.detail.value.split("T")[0]); // Only save the date (YYYY-MM-DD format)
    setIsDatePickerOpen(false); // Close date picker after selection
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
          </IonButtons>
          <IonButtons slot="end">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>
            <b>Crop Inspection</b>
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* <div className="search-container">
          <IonLabel className="fruits-id-label">Fruits ID</IonLabel>
          <IonInput
            value={searchText}
            placeholder="Enter Fruits ID"
            onIonChange={e => setSearchText(e.detail.value!)}
          />
          <IonButton size="small" onClick={fetchFarmerDetails}>Search</IonButton>

          
          <IonButton size="small" fill="clear" onClick={clearSearch}>
            <IonIcon color="danger" icon={trash} />
          </IonButton>
        </div> */}

        <IonCard className="details-card">
          <IonCardHeader>
            {/* <IonCardTitle>DFLs Details</IonCardTitle> */}
          </IonCardHeader>
          <IonCardContent>
            <IonCol size="12">
              <div className="details-row">
                <IonLabel>
                  <b>Select Inspection Type:</b>
                </IonLabel>
                {fetchError ? (
                  <p style={{ color: "red" }}>
                    Failed to fetch Tsc list. Please try again later.
                  </p>
                ) : (
                  <IonSelect
                    value={inspectionFields?.cropInspectionTypeId}
                    // disabled={!isEditable}
                    placeholder="Select Crop Inspection Type"
                    onIonChange={(e) => handleChange(e, "cropInspectionTypeId")}
                  >
                    {cropInspectionTypeData?.map((type) => (
                      <IonSelectOption
                        key={type.cropInspectionTypeId}
                        value={type.cropInspectionTypeId}
                      >
                        {type.cropInspectionTypeName}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                )}
              </div>
            </IonCol>

            <IonCol size="12">
              <div className="details-row">
                <IonLabel>
                  <b>Select Moult:</b>
                </IonLabel>
                {fetchError ? (
                  <p style={{ color: "red" }}>
                    Failed to fetch mount list. Please try again later.
                  </p>
                ) : (
                  <IonSelect
                    value={inspectionFields?.mountId}
                    // disabled={!isEditable}
                    placeholder="Select Moult"
                    onIonChange={(e) => handleChange(e, "mountId")}
                  >
                    {mountData?.map((mount) => (
                      <IonSelectOption
                        key={mount.mountId}
                        value={mount.mountId}
                      >
                        {mount.name}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                )}
              </div>
            </IonCol>

            <IonCol size="12">
              <div className="details-row">
                <IonLabel>
                  <b>Select Crop Status:</b>
                </IonLabel>
                {fetchError ? (
                  <p style={{ color: "red" }}>
                    Failed to fetch crop status list. Please try again later.
                  </p>
                ) : (
                  <IonSelect
                    value={inspectionFields?.cropStatusId}
                    // disabled={!isEditable}
                    placeholder="Select Crop Status"
                    onIonChange={(e) => handleChange(e, "cropStatusId")}
                  >
                    {cropStatusData?.map((status) => (
                      <IonSelectOption
                        key={status.cropStatusId}
                        value={status.cropStatusId}
                      >
                        {status.name}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                )}
              </div>
            </IonCol>

            <IonCol size="12">
              <div className="details-row">
                <IonLabel>
                  <b>Inspection Note:</b>
                </IonLabel>
                <IonInput
                  value={inspectionFields.note}
                  onIonChange={(e) => handleChange(e, "note")}
                  // disabled={!isEditable}
                  placeholder="Enter inspection note"
                />
              </div>
            </IonCol>

            {/* 
                    <div className="details-row">
                    <IonLabel>Inspection Date:</IonLabel>
                    <div
                      onClick={() =>
                       setShowHatchingDatePicker(true) // isEditable && setShowHatchingDatePicker(true)
                      }
                      className="date-display"
                      style={{ marginTop: '-20px' }}
                    >
                      {inspectionFields.date
                        ? new Date(inspectionFields.date).toLocaleDateString()
                        : "Select Date"}
                    </div>
                    {showHatchingDatePicker && (
                      <IonDatetime
                        value={inspectionFields.date}
                        onIonChange={(e) => {
                          handleChange(e, "date");
                          setShowHatchingDatePicker(false);
                        }}
                        onIonCancel={() => setShowHatchingDatePicker(false)}
                      />
                    )}
                  </div> */}

            <div className="details-row">
              <IonLabel>Inspection Date:</IonLabel>
              <IonInput
                value={new Date(inspectionFields.date).toLocaleDateString()}
                readonly={true}
                disabled={true}
              />
            </div>

            <div className="file-upload-section">
              <IonLabel>Choose File:</IonLabel>
              <input type="file" onChange={handleFileChange} />
            </div>
            <div>
              <IonButton onClick={handleCaptureImage}>
                <IonIcon icon={camera} slot="icon-only" />
              </IonButton>

              {previewImage && (
                <>
                  <IonButton onClick={() => setIsModalOpen(true)}>
                    <IonIcon icon={eyeSharp} slot="icon-only" />
                  </IonButton>

                  <IonModal
                    isOpen={isModalOpen}
                    onDidDismiss={() => setIsModalOpen(false)}
                  >
                    <IonHeader>
                      <IonToolbar>
                        <IonTitle>View File</IonTitle>
                        <IonButton
                          onClick={() => setIsModalOpen(false)}
                          slot="end"
                          fill="clear"
                        >
                          Close
                        </IonButton>
                      </IonToolbar>
                    </IonHeader>
                    <IonContent>
                      <div style={{ textAlign: "center", padding: "12px" }}>
                        <div
                          style={{
                            position: "relative",
                            display: "inline-block",
                            maxWidth: "100%",
                          }}
                        >
                          <IonImg
                            src={previewImage}
                            alt="Preview"
                            style={{
                              width: "100%",
                              maxHeight: "70vh",
                              objectFit: "contain",
                            }}
                          />
                          {hasCameraCaptureLocation &&
                            locationData.capturedAt && (
                              <div
                                style={{
                                  position: "absolute",
                                  left: "10px",
                                  bottom: "10px",
                                  background: "transparent",
                                  color: "#fff",
                                  padding: "4px 6px",
                                  fontSize: "12px",
                                  textAlign: "left",
                                }}
                              >
                                <div>
                                  <strong>Location:</strong>{" "}
                                  {locationData.latitude
                                    ? locationData.latitude.toFixed(6)
                                    : "N/A"}
                                  ,{" "}
                                  {locationData.longitude
                                    ? locationData.longitude.toFixed(6)
                                    : "N/A"}
                                </div>
                                <div>
                                  <strong>Date/Time:</strong>{" "}
                                  {locationData.capturedAt
                                    ? new Date(
                                        locationData.capturedAt,
                                      ).toLocaleString()
                                    : "N/A"}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    </IonContent>
                  </IonModal>
                </>
              )}

              {selectedFile && (
                <IonButton onClick={handleClearFile}>
                  <IonIcon icon={trashSharp} slot="icon-only" />
                </IonButton>
              )}
            </div>

            <IonButton
              expand="full"
              onClick={handleEdit}
              disabled={!selectedFile}
            >
              Submit
            </IonButton>
            {/* </>
                )} */}
          </IonCardContent>
        </IonCard>
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
export default CropInspectionPage;
