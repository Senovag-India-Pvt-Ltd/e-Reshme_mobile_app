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
  IonIcon,
  IonBackButton,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonCol,
  IonAlert,
  IonImg,
  IonModal,
  IonFooter,
} from "@ionic/react";
import {
  trash,
  informationCircle,
  camera,
  eyeSharp,
  trashSharp,
} from "ionicons/icons";
import "./ProfileInfoPage.css";
import "./AddDlfPage.css";
import "./FitnessCert.css";
import Menu from "./Menu";
import axios from "axios";
import { API_URL_DBT, API_URL_ChowkiManagment } from "../auth.service";
import { API_URL_Master_Data } from "../auth.service";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

const FitnessPage: React.FC = () => {
  const [searchText, setSearchText] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [dataList, setDataList] = useState<any[]>([]);
  const [data, setData] = useState<any>(null);
  const [viewAll, setViewAll] = useState<boolean>(false);
  const [isFCIssued, setIsFCIssued] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>(""); // State for selected date
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false); // State for date picker visibility
  const [diseaseStatusOptions, setDiseaseStatusOptions] = useState<string[]>([
    "Healthy",
    "Infected",
    "Quarantined",
  ]); // Dummy data for disease status options
  const [message, setMessage] = useState<string>("");
  const [farmerId, setFarmerId] = useState<number | null>(null);
  const [isError, setIsError] = useState<boolean>(false);
  const [saleAndDisposalId, setChowkiId] = useState<number | null>(null);
  // const [inspectionData, setInspectionData] = useState<any>(null);
  const [fetchError, setFetchError] = useState<boolean>(false);
  const [showHatchingDatePicker, setShowHatchingDatePicker] =
    useState<boolean>(false);
  const [showDispatchDatePicker, setShowDispatchDatePicker] =
    useState<boolean>(false);
  const [inspectionData, setInspectionData] = useState({
    expectedCocoon: "",
    lotTestDetails: "",
    diseaseStatusId: "",
    noOfChandies: "",
    spunFromDate: "",
    spunToDate: "",
    fitnessCertificatePath: "",
  });

  const inputRef = useRef<HTMLIonInputElement>(null); // Add this line near other state declarations

  const handleInputChange = (e: CustomEvent) => {
    const value = (e.target as HTMLIonInputElement).value!;
    setSearchText(value);
    if (value.length === 16) {
      inputRef.current?.blur(); // Remove focus from input field, but don't trigger fetch
    }
  };

  const [showSpunDatePicker, setShowSpunDatePicker] = useState(false);

  interface FCData {
    note: string;
    cropDate: string;
    cropStatusName: string;
    mountName: string;
    reasonName: string;
  }

  interface DataItem {
    saleAndDisposalId: number;
    raceName: string;
    lotNumberRsp: string;
    lotNumberCrc: string;
    numbersOfDfls: string;
    ratePer100Dfls: string;
    fcData: FCData | null;
    issueFCVisible: boolean;
  }

  const [showAlert, setShowAlert] = useState<boolean>(false);
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
        },
      )
      .then((res) => {
        console.log(res.data.content[0].farmerResponses[0]);
        setDataList([res.data.content[0].farmerResponses[0]]);
        setFarmerId(res.data.content[0].farmerResponses[0].farmerId);
        toggleViewAll(res.data.content[0].farmerResponses[0].fruitsId);
      })
      .catch((error) => {
        setMessage("Farmer number does not exist");
        setIsError(true);
      });
  };

  useEffect(() => {
    if (dataList.length > 0) {
      console.log("DataList updated: ", dataList);
    }
  }, [dataList]);

  const [diseaseListData, setDiseaseListData] = useState<any[]>([]); // List of Tsc options from API
  //  const [fetchError, setFetchError] = useState<boolean>(false); // Fetch error state

  // Function to fetch Tsc data from the API
  const fetchDiseaseList = async () => {
    try {
      const response = await axios.get(
        `${API_URL_Master_Data}diseaseStatus/get-all`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`, // Use token if required
          },
        },
      );

      if (response.data && response.data.content) {
        setDiseaseListData(response.data.content.diseaseStatus); // Set the fetched data
      } else {
        console.error("Unexpected API response format:", response);
        setFetchError(true);
      }
    } catch (error) {
      console.error("Error fetching Tsc list:", error);
      setFetchError(true); // Set error state if fetch fails
    }
  };

  // Fetch Tsc list when component mounts
  useEffect(() => {
    fetchDiseaseList();
  }, []);

  const toggleViewAll = (i: number) => {
    // setViewAll(!viewAll);
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
        if (res.data && res.data.length > 0) {
          const chowkiData = res.data[0];

          // Setting specific fields using setData with the first item for other logic
          setData({
            dflsSource: chowkiData.dflsSource,
            numbersOfDfls: chowkiData.numbersOfDfls,
            lotNumberRsp: chowkiData.lotNumberRsp,
            receiptNo: chowkiData.receiptNo || "",
            raceName: chowkiData.raceName,
            price: chowkiData.price,
            lotNumberCrc: chowkiData.lotNumberCrc,
            ratePer100Dfls: chowkiData.ratePer100Dfls, // Handle missing receiptNo
          });

          setChowkiId(chowkiData.saleAndDisposalId);
          setDataList(res.data); // <-- Update this line to use the entire data array
        } else {
          setMessage("No data found for the given farmer ID");
          setIsError(true);
        }
      })
      .catch((error) => {
        setMessage("Farmer number does not exist");
        setIsError(true);
      });
  };

  const handleChange = (e: any, field: string) => {
    if (inspectionData) {
      setInspectionData({
        ...inspectionData,
        [field]: e.detail.value, // Change here to work with IonSelect
      });
    }
  };

  const clearSearch = () => {
    setSearchText("");
    setDataList([]);
    setViewAll(false);
    // setShowInspectionFields(false);
  };

  const clearField = () => {
    setViewAll(false);
  };

  const handleFCClick = (saleAndDisposalId: number) => {
    const api = axios.create({
      baseURL: API_URL_ChowkiManagment,
    });
    api
      .get(
        `cropInspection/getInspectionDetailsForSaleAndDisposalDFL/${saleAndDisposalId}`,
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
        const updatedDataList = dataList.map((item) => {
          if (item.saleAndDisposalId === saleAndDisposalId) {
            return {
              ...item,
              fcData: {
                note: chowkiData.note,
                cropDate: chowkiData.cropDate,
                cropStatusName: chowkiData.cropStatusName,
                mountName: chowkiData.mountName || "",
                reasonName: chowkiData.reasonName,
              },
              issueFCVisible: true,
            };
          }
          return item;
        });
        setDataList(updatedDataList);
      })
      .catch((error) => {
        setMessage("Failed to fetch FC data");
        setIsError(true);
        setShowAlert(true);
      });
  };

  // const handleEdit = async (saleAndDisposalIdParam: number) => {
  //   const api = axios.create({
  //     baseURL: API_URL_ChowkiManagment,
  //   });

  //   let fitnessCertificateId = null;

  //   try {
  //     // Step 1: Add the fitness info and get the generated fitnessCertificateId
  //     const fitnessResponse = await api.post(
  //       'cropInspection/add-fitness-info',
  //       {
  //         farmerId: farmerId,
  //         fruitsId: searchText,
  //         saleAndDisposalId: saleAndDisposalIdParam,
  //         expectedCocoon: inspectionData.expectedCocoon,
  //         lotTestDetails: inspectionData.lotTestDetails,
  //         diseaseStatusId: inspectionData.diseaseStatusId,
  //         noOfChandies: inspectionData.noOfChandies,
  //         spunFromDate: inspectionData.spunFromDate,
  //         spunToDate:inspectionData.spunToDate,
  //         fitnessCertificatePath: inspectionData.fitnessCertificatePath,
  //       },
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           accept: '*/*',
  //           Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
  //         },
  //       }
  //     );

  //     // Handle response and capture the generated fitnessCertificateId
  //     if (fitnessResponse.data.error === 0) {
  //       fitnessCertificateId = fitnessResponse.data.fitnessCertificateId; // Assuming the ID is in the response
  //       console.log('Fitness Certificate ID:', fitnessCertificateId);
  //       setMessage('Fitness info added successfully!');
  //       setIsError(false);
  //       setShowAlert(true);
  //     } else {
  //       // Show the message from the response if error=1
  //       setMessage(fitnessResponse.data.message || 'Failed to add fitness info.');
  //       setIsError(true);
  //       setShowAlert(true);
  //       return; // Exit if there's an error
  //     }

  //     // Step 2: If a file is selected, upload it using the generated fitnessCertificateId
  //     if (selectedFile && fitnessCertificateId) {
  //       try {
  //         const formData = new FormData();
  //         formData.append('multipartFile', selectedFile); // File key
  //         formData.append('fitnessCertificateId', fitnessCertificateId.toString()); // Use the generated ID

  //         const photoResponse = await api.post('cropInspection/upload-fitness-certificate', formData, {
  //           headers: {
  //             'Content-Type': 'multipart/form-data',
  //             Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
  //           },
  //         });

  //         // Update the photo path in the state with the new path from the response
  //         const newPhotoPath = photoResponse.data.content.fitnessCertificatePath; // Adjust based on your response structure
  //         setInspectionData((prevData) => ({
  //           ...prevData,
  //           fitnessCertificatePath: newPhotoPath, // Set the new photo path
  //         }));

  //         setMessage('Photo uploaded successfully!');
  //       } catch (uploadError) {
  //         console.error('Error uploading photo:', uploadError);
  //         setMessage('Failed to upload photo. Please try again.');
  //       }
  //     } else {
  //       setMessage('Please select or capture an image before uploading.');
  //     }

  //   } catch (error) {
  //     console.error('Error in processing fitness certificate or photo:', error);
  //     setMessage('Failed to process fitness certificate or upload photo. Please try again.');
  //     setIsError(true);
  //   }
  // };

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

      // Compress the captured image to be under 2 MB (if possible)
      const compressed = await compressImageFile(file, 2);

      setSelectedFile(compressed); // Set the (possibly) compressed file
      setPreviewImage(URL.createObjectURL(compressed)); // Use object URL for preview
    } catch (error) {
      console.error("Error capturing image:", error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // Get the first file from the file input
    if (file) {
      (async () => {
        try {
          const compressed = await compressImageFile(file, 2);
          setSelectedFile(compressed);
          setPreviewImage(URL.createObjectURL(compressed));
        } catch (err) {
          console.error("Compression error, using original file:", err);
          setSelectedFile(file);
          setPreviewImage(URL.createObjectURL(file));
        }
      })();
    }
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

  // Helper: compress image File (only images). Tries reducing quality and dimensions until under maxSizeMB.
  const compressImageFile = async (
    file: File,
    maxSizeMB = 2,
  ): Promise<File> => {
    const maxSize = maxSizeMB * 1024 * 1024;

    if (!file.type.startsWith("image/")) {
      return file; // don't attempt to compress non-images
    }

    if (file.size <= maxSize) return file; // already small enough

    const dataUrl = await fileToDataURL(file);
    const img = document.createElement("img");
    img.src = dataUrl;

    await new Promise((resolve, reject) => {
      img.onload = () => resolve(true);
      img.onerror = (e) => reject(e);
    });

    const canvas = document.createElement("canvas");
    let [width, height] = [img.naturalWidth, img.naturalHeight];

    // Start with original dimensions, but limit max dimension for performance
    const maxDim = 1600; // starting max dimension
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

    // Try decreasing quality progressively
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

      // reduce quality and if needed shrink dimensions
      quality = Math.max(0.4, quality - 0.12);

      if (i === 3) {
        // further reduce dimensions after a few attempts
        width = Math.round(width * 0.8);
        height = Math.round(height * 0.8);
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
      }
    }

    if (blob && blob.size <= file.size) {
      // Create a new File from blob
      const newFile = new File(
        [blob],
        file.name.replace(/\.[^/.]+$/, "") + ".jpg",
        { type: "image/jpeg" },
      );
      return newFile.size <= maxSize ? newFile : file;
    }

    // fallback to original file if compression failed
    return file;
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setPreviewImage(null); // Clear the preview image
  };

  const handleEdit = async (saleAndDisposalIdParam: number) => {
    const api = axios.create({
      baseURL: API_URL_ChowkiManagment,
    });

    let fitnessCertificateId = null;

    try {
      // -------------------------------------------
      // 🔴 NEW: File size validation before submitting
      // -------------------------------------------
      if (selectedFile) {
        const maxSizeMB = 2;
        const fileSizeMB = selectedFile.size / (1024 * 1024);

        if (fileSizeMB > maxSizeMB) {
          setMessage("File size cannot exceed 2 MB");
          setIsError(true);
          setShowAlert(true);
          return; // ❌ stop further processing
        }
      }
      // -------------------------------------------

      // STEP 1 — Add Fitness Info
      const fitnessResponse = await api.post(
        "cropInspection/add-fitness-info",
        {
          farmerId: farmerId,
          fruitsId: searchText,
          saleAndDisposalId: saleAndDisposalIdParam,
          expectedCocoon: inspectionData.expectedCocoon,
          lotTestDetails: inspectionData.lotTestDetails,
          diseaseStatusId: inspectionData.diseaseStatusId,
          noOfChandies: inspectionData.noOfChandies,
          spunFromDate: inspectionData.spunFromDate,
          spunToDate: inspectionData.spunToDate,
          fitnessCertificatePath: inspectionData.fitnessCertificatePath,
        },
        {
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        },
      );

      if (fitnessResponse.data.error === 1) {
        setMessage(
          fitnessResponse.data.message || "Failed to add fitness info.",
        );
        setIsError(true);
        setShowAlert(true);
        return;
      }

      fitnessCertificateId = fitnessResponse.data.fitnessCertificateId;

      // STEP 2 — Upload Image (Only if provided)
      if (selectedFile && fitnessCertificateId) {
        // -------------------------------------------
        // 🔴 NEW: Re-check size again before upload
        // -------------------------------------------
        const maxSizeMB = 2;
        const fileSizeMB = selectedFile.size / (1024 * 1024);

        if (fileSizeMB > maxSizeMB) {
          setMessage("File size cannot exceed 2 MB");
          setIsError(true);
          setShowAlert(true);
          return; // ❌ stop upload
        }
        // -------------------------------------------

        const formData = new FormData();
        formData.append("multipartFile", selectedFile);
        formData.append(
          "fitnessCertificateId",
          fitnessCertificateId.toString(),
        );

        const photoResponse = await api.post(
          "cropInspection/upload-fitness-certificate",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
            },
          },
        );

        const newPhotoPath = photoResponse.data.content.fitnessCertificatePath;

        setInspectionData((prevData) => ({
          ...prevData,
          fitnessCertificatePath: newPhotoPath,
        }));

        setMessage("Photo uploaded successfully!");
        setIsError(false);
        setShowAlert(true);
      } else {
        setMessage("Please select or capture an image before uploading.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Failed to process fitness certificate or upload photo.");
      setIsError(true);
      setShowAlert(true);
    }
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
          </IonButtons>
          <IonTitle>
            <b>Fitness Certificate</b>
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent
        className="with-bottom-menu"
        style={{ ["--padding-bottom" as any]: "180px" }}
      >
        <div className="search-container">
          <IonLabel className="fruits-id-label">Fruits ID</IonLabel>
          <IonInput
            ref={inputRef}
            value={searchText}
            placeholder="Enter Fruits ID"
            onIonInput={handleInputChange}
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
            id="searchButton"
            size="small"
            onClick={() => {
              inputRef.current?.blur(); // Blur input on search click
              fetchFarmerDetails();
            }}
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

        {dataList &&
          dataList.length > 0 &&
          dataList.map((data, index) => (
            <>
              <IonCard key={index} className="details-card">
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
                </IonCardContent>
              </IonCard>

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
                onClick={() => handleFCClick(data.saleAndDisposalId)}
              >
                Issue FC
              </IonButton>

              {data.issueFCVisible && data.fcData && (
                <IonCard className="issue-fc-card">
                  <IonCardHeader>
                    <IonCardTitle>Issue FC Details</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <div className="details-row">
                      <IonLabel>Note:</IonLabel>
                      <IonInput value={data.fcData.note} readonly={true} />
                    </div>
                    <div className="details-row">
                      <IonLabel>Crop Date:</IonLabel>
                      <IonInput value={data.fcData.cropDate} readonly={true} />
                    </div>
                    <div className="details-row">
                      <IonLabel>Crop Status:</IonLabel>
                      <IonInput
                        value={data.fcData.cropStatusName}
                        readonly={true}
                      />
                    </div>
                    <div className="details-row">
                      <IonLabel>Moult:</IonLabel>
                      <IonInput value={data.fcData.mountName} readonly={true} />
                    </div>

                    <IonCardHeader>
                      <IonCardTitle>Add FC Details</IonCardTitle>
                    </IonCardHeader>
                    <div className="details-row">
                      <IonLabel>Expected Cocoons (in Kgs):</IonLabel>
                      <IonInput
                        value={inspectionData.expectedCocoon}
                        onIonChange={(e) => handleChange(e, "expectedCocoon")}
                      />
                    </div>
                    <div className="details-row">
                      <IonLabel>Lot Test Details:</IonLabel>
                      <IonInput
                        value={inspectionData.lotTestDetails}
                        onIonChange={(e) => handleChange(e, "lotTestDetails")}
                      />
                    </div>

                    <IonCol size="12">
                      <div className="details-row">
                        <IonLabel>
                          <b>Select Status:</b>
                        </IonLabel>
                        {fetchError ? (
                          <p style={{ color: "red" }}>
                            Failed to fetch Status list. Please try again later.
                          </p>
                        ) : (
                          <IonSelect
                            value={inspectionData.diseaseStatusId}
                            placeholder="Select Status"
                            onIonChange={(e) =>
                              handleChange(e, "diseaseStatusId")
                            }
                          >
                            <IonSelectOption value="">
                              Select Status
                            </IonSelectOption>
                            {diseaseListData?.map((disease) => (
                              <IonSelectOption
                                key={disease.diseaseStatusId}
                                value={disease.diseaseStatusId}
                              >
                                {disease.name}
                              </IonSelectOption>
                            ))}
                          </IonSelect>
                        )}
                      </div>
                    </IonCol>

                    <div className="details-row">
                      <IonLabel>No of Chandrika:</IonLabel>
                      <IonInput
                        value={inspectionData.noOfChandies}
                        onIonChange={(e) => handleChange(e, "noOfChandies")}
                      />
                    </div>

                    {/* <div className="details-row">
                    <IonLabel>Spun on Date:</IonLabel>
                    <div
                      onClick={() => setShowDispatchDatePicker(true)}
                      className="date-display"
                    >
                      {inspectionData.expectedMarkerDate
                        ? new Date(inspectionData.expectedMarkerDate).toLocaleDateString()
                        : "Select Date"}
                    </div>
                    {showDispatchDatePicker && (
                      <IonModal isOpen={showDispatchDatePicker} onDidDismiss={() => setShowDispatchDatePicker(false)}>
                        <IonDatetime
                          value={inspectionData.expectedMarkerDate || new Date().toISOString()}
                          onIonChange={(e) => {
                            handleChange(e, "expectedMarkerDate");
                            setShowDispatchDatePicker(false);
                          }}
                          onIonCancel={() => setShowDispatchDatePicker(false)}
                        />
                        <IonButton onClick={() => setShowDispatchDatePicker(false)}>Close</IonButton>
                      </IonModal>
                    )}
                  </div> */}

                    <div className="details-row">
                      <IonLabel>Spun on Date:</IonLabel>

                      {/* Expected Marker Date */}
                      <div
                        onClick={() => setShowDispatchDatePicker(true)}
                        className="date-display"
                      >
                        {inspectionData.spunFromDate
                          ? new Date(
                              inspectionData.spunFromDate,
                            ).toLocaleDateString()
                          : "Select Date"}
                      </div>

                      {/* Spun Date */}
                      <div
                        onClick={() => setShowSpunDatePicker(true)}
                        className="date-display"
                        style={{ marginLeft: "1rem" }} // space between dates
                      >
                        {inspectionData.spunToDate
                          ? new Date(
                              inspectionData.spunToDate,
                            ).toLocaleDateString()
                          : "Select Date"}
                      </div>

                      {/* Expected Marker Date Picker */}
                      {showDispatchDatePicker && (
                        <IonModal
                          cssClass="centered-datetime-modal"
                          isOpen={showDispatchDatePicker}
                          onDidDismiss={() => setShowDispatchDatePicker(false)}
                        >
                          <IonHeader>
                            <IonToolbar>
                              <IonTitle>Select Spun From Date</IonTitle>
                            </IonToolbar>
                          </IonHeader>
                          <IonContent className="ion-padding">
                            <IonDatetime
                              presentation="date"
                              showDefaultButtons={true}
                              preferWheel={false}
                              value={
                                inspectionData.spunFromDate ||
                                new Date().toISOString()
                              }
                              onIonChange={(e) => {
                                handleChange(e, "spunFromDate");
                                setShowDispatchDatePicker(false);
                              }}
                              onIonCancel={() =>
                                setShowDispatchDatePicker(false)
                              }
                            />
                          </IonContent>
                          <IonFooter>
                            <IonToolbar>
                              <IonButton
                                slot="end"
                                style={
                                  {
                                    "--background": "#ffffff",
                                    "--color": "#000000",
                                    backgroundColor: "#ffffff",
                                    color: "#000000",
                                  } as any
                                }
                                onClick={() => setShowDispatchDatePicker(false)}
                              >
                                Close
                              </IonButton>
                            </IonToolbar>
                          </IonFooter>
                        </IonModal>
                      )}

                      {/* Spun Date Picker */}
                      {showSpunDatePicker && (
                        <IonModal
                          cssClass="centered-datetime-modal"
                          isOpen={showSpunDatePicker}
                          onDidDismiss={() => setShowSpunDatePicker(false)}
                        >
                          <IonHeader>
                            <IonToolbar>
                              <IonTitle>Select Spun To Date</IonTitle>
                            </IonToolbar>
                          </IonHeader>
                          <IonContent className="ion-padding">
                            <IonDatetime
                              presentation="date"
                              showDefaultButtons={true}
                              preferWheel={false}
                              value={
                                inspectionData.spunToDate ||
                                new Date().toISOString()
                              }
                              onIonChange={(e) => {
                                handleChange(e, "spunToDate");
                                setShowSpunDatePicker(false);
                              }}
                              onIonCancel={() => setShowSpunDatePicker(false)}
                            />
                          </IonContent>
                          <IonFooter>
                            <IonToolbar>
                              <IonButton
                                slot="end"
                                style={
                                  {
                                    "--background": "#ffffff",
                                    "--color": "#000000",
                                    color: "#000000",
                                    backgroundColor: "#ffffff",
                                  } as any
                                }
                                onClick={() => setShowSpunDatePicker(false)}
                              >
                                Close
                              </IonButton>
                            </IonToolbar>
                          </IonFooter>
                        </IonModal>
                      )}
                    </div>

                    <div className="file-upload-section">
                      <IonLabel>Choose File:</IonLabel>
                      <input type="file" onChange={handleFileChange} />
                    </div>
                    <div>
                      <IonButton
                        style={
                          {
                            "--background": "#ffffff",
                            "--color": "#000000",
                            color: "#000000",
                            backgroundColor: "#ffffff",
                          } as any
                        }
                        onClick={handleCaptureImage}
                      >
                        <IonIcon icon={camera} slot="icon-only" />
                      </IonButton>

                      {previewImage && (
                        <>
                          <IonButton
                            style={
                              {
                                "--background": "#ffffff",
                                "--color": "#000000",
                                color: "#000000",
                                backgroundColor: "#ffffff",
                              } as any
                            }
                            onClick={() => setIsModalOpen(true)}
                          >
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
                                  style={
                                    {
                                      "--background": "#ffffff",
                                      "--color": "#000000",
                                      color: "#000000",
                                      backgroundColor: "#ffffff",
                                    } as any
                                  }
                                  onClick={() => setIsModalOpen(false)}
                                  slot="end"
                                  fill="clear"
                                >
                                  Close
                                </IonButton>
                              </IonToolbar>
                            </IonHeader>
                            <IonContent>
                              <div
                                className="preview-section"
                                style={{ textAlign: "center", padding: "20px" }}
                              >
                                <IonImg src={previewImage} alt="Preview" />
                              </div>
                            </IonContent>
                          </IonModal>
                        </>
                      )}

                      {selectedFile && (
                        <IonButton
                          style={
                            {
                              "--background": "#ffffff",
                              "--color": "#000000",
                              color: "#000000",
                              backgroundColor: "#ffffff",
                            } as any
                          }
                          onClick={handleClearFile}
                        >
                          <IonIcon icon={trashSharp} slot="icon-only" />
                        </IonButton>
                      )}
                    </div>

                    {/* <IonButton expand="block">Submit</IonButton> */}
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
                      className="submit-button"
                      onClick={() => handleEdit(data.saleAndDisposalId)}
                      disabled={
                        !selectedFile ||
                        !inspectionData.spunFromDate ||
                        !inspectionData.spunToDate ||
                        !inspectionData.expectedCocoon ||
                        !inspectionData.lotTestDetails ||
                        !inspectionData.diseaseStatusId ||
                        !inspectionData.noOfChandies
                      }
                    >
                      Submit
                    </IonButton>
                  </IonCardContent>
                </IonCard>
              )}
            </>
          ))}
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={isError ? "Error" : "Success"}
          message={message}
          buttons={["OK"]}
        />
      </IonContent>
      <Menu />
    </IonPage>
  );
};

export default FitnessPage;
