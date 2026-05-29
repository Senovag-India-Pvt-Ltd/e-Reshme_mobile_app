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
  IonList,
  IonSearchbar,
  IonText,
} from "@ionic/react";
import {
  trash,
  informationCircle,
  camera,
  eyeSharp,
  trashSharp,
  copy,
  searchOutline,
  refreshOutline,
  ribbonOutline,
  documentTextOutline,
} from "ionicons/icons";
import { IonSpinner } from "@ionic/react";
import "./ProfileInfoPage.css";
import "./AddDlfPage.css";
import "./FitnessCert.css";
import "./UpdateDlfPage.css";
import Menu from "./Menu";
import axios from "axios";
import { API_URL_DBT, API_URL_ChowkiManagment } from "../auth.service";
import { API_URL_Master_Data } from "../auth.service";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { useHistory } from "react-router-dom";

const FitnessPage: React.FC = () => {
  const history = useHistory();
  const [searchText, setSearchText] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [dataList, setDataList] = useState<any[]>([]);
  const [data, setData] = useState<any>(null);
  const [farmerData, setFarmerData] = useState<any>(null);
  const [viewAll, setViewAll] = useState<boolean>(false);
  const [isFCIssued, setIsFCIssued] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>(""); // State for selected date
  const [tscMasterId, setTscMasterId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
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
    transactionDate: "",
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
  const [showTransactionDatePicker, setShowTransactionDatePicker] = useState<boolean>(false);

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
  const [searching, setSearching] = useState<boolean>(false);
  // Locks the Submit button while the fitness-certificate API call is in flight
  // so double-clicks don't create duplicate records (same pattern as
  // Profile/Land/Mulberry/DocPage/Crop Inspection).
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Pending list modal state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [listData, setListData] = useState<any[]>([]);
  const [listSearchTerm, setListSearchTerm] = useState<string>("");
  const [showCopyAlert, setShowCopyAlert] = useState<boolean>(false);
  const [copyMessage, setCopyMessage] = useState<string>("");
  const [pendingCount, setPendingCount] = useState<number>(0);

  const handleIconClick = async () => {
    await fetchPendingFitnessCertificates();
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
        },
      )
      .then((res) => {
        const firstFarmer = res.data?.content?.[0]?.farmerResponses?.[0] || null;
        if (firstFarmer) {
          setFarmerData(firstFarmer);
          setFarmerId(firstFarmer.farmerId);
          toggleViewAll(firstFarmer.fruitsId);
        } else {
          setDataList([]);
          setFarmerData(null);
          setMessage("No farmer found for this Fruits ID");
          setIsError(true);
          setShowAlert(true);
        }
        setSearching(false);
      })
      .catch((error) => {
        setMessage("Farmer number does not exist");
        setIsError(true);
        setShowAlert(true);
        setSearching(false);
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
    const api = axios.create({
      baseURL: API_URL_ChowkiManagment,
    });

    api
      .get(
        `chowkimanagement/getInspectioninfoForFarmerForFitnessCertificate/${i}`,
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

          setData({
            dflsSource: chowkiData.dflsSource,
            numbersOfDfls: chowkiData.numbersOfDfls,
            lotNumberRsp: chowkiData.lotNumberRsp,
            receiptNo: chowkiData.receiptNo || "",
            raceName: chowkiData.raceName,
            price: chowkiData.price,
            lotNumberCrc: chowkiData.lotNumberCrc,
            ratePer100Dfls: chowkiData.ratePer100Dfls,
          });

          setChowkiId(chowkiData.saleAndDisposalId);
          setDataList(res.data);
        } else {
          // No DFLs eligible for FC — farmer card still shows
          setDataList([]);
          setMessage(
            "No DFLs pending Fitness Certificate for this farmer. All inspected lots may already have an FC issued.",
          );
          setIsError(false);
          setShowAlert(true);
        }
      })
      .catch((error) => {
        console.error("Error fetching FC-eligible DFLs:", error);
        setDataList([]);
        setMessage("Unable to fetch DFL details. Please try again.");
        setIsError(true);
        setShowAlert(true);
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
    setFarmerData(null);
    setViewAll(false);
  };

  const clearField = () => {
    setFarmerData(null);
    setDataList([]);
    setViewAll(false);
  };

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

  const fetchPendingFitnessCertificates = async (tscIdParam?: string) => {
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
      const response = await axios.get(
        `${API_URL_ChowkiManagment}chowkimanagement/getPendingFitnessCertificateByTsc/${numericTscId}`,
        {
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const payload = response.data;
      const rows = Array.isArray(payload)
        ? payload
        : payload?.list || payload?.data || payload?.content || payload?.pendingList || [];
      const count =
        payload?.pendingCount ??
        (Array.isArray(payload) ? payload.length : rows.length);
      setPendingCount(Number(count) || rows.length || 0);
      setListData(Array.isArray(rows) ? rows : []);
    } catch (error: any) {
      const statusCode = error?.response?.status;
      console.error("Error fetching pending fitness certificates:", error);
      console.error("Error response:", error?.response?.data);
      setPendingCount(0);
      setListData([]);

      if (statusCode === 401 || statusCode === 403) {
        setMessage(
          "Your session is invalid or has expired. Please sign out and sign in again.",
        );
        setIsError(true);
      } else if (statusCode === 404) {
        setMessage("No pending fitness certificates found for your TSC.");
        setIsError(false);
      } else {
        setMessage(
          `Unable to load pending fitness certificates${statusCode ? ` (status ${statusCode})` : ""}. Please try again.`,
        );
        setIsError(true);
      }
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
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
    // Double-click guard — ignore further taps while an API call is in flight.
    // Prevents duplicate fitness records from impatient double-tap users.
    if (submitting) return;
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

      // Validation passed — lock the button so further clicks are ignored.
      setSubmitting(true);

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
          transactionDate: inspectionData.transactionDate,
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
        console.log("API returned error:", fitnessResponse.data);
        setMessage(
          fitnessResponse.data.message || "Failed to add fitness info.",
        );
        setIsError(true);
        setShowAlert(true);
        return;
      }

      console.log("Fitness API response:", fitnessResponse.data);
      fitnessCertificateId = fitnessResponse.data.fitnessCertificateId;
      console.log("Fitness Certificate ID:", fitnessCertificateId);

      // Show success message for fitness info addition
      console.log("Setting success message for fitness info");
      setMessage("Fitness certificate details added successfully!");
      setIsError(false);
      setShowAlert(true);
      
      // Clear all fields after successful submission
      setTimeout(() => {
        setSearchText("");
        setData(null);
        setDataList([]);
        setInspectionData({
          expectedCocoon: "",
          lotTestDetails: "",
          diseaseStatusId: "",
          noOfChandies: "",
          spunFromDate: "",
          spunToDate: "",
          transactionDate: "",
          fitnessCertificatePath: "",
        });
        setSelectedFile(null);
        setPreviewImage(null);
        setShowSpunDatePicker(false);
        setShowDispatchDatePicker(false);
        setShowTransactionDatePicker(false);
      }, 2000);

      // STEP 2 — Upload Image (Only if provided)
      if (selectedFile && fitnessCertificateId) {
        // -------------------------------------------
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

        setMessage("Fitness certificate details and photo uploaded successfully!");
        setIsError(false);
        setShowAlert(true);
        
        // Clear all fields after successful submission
        setTimeout(() => {
          setSearchText("");
          setData(null);
          setDataList([]);
          setInspectionData({
            expectedCocoon: "",
            lotTestDetails: "",
            diseaseStatusId: "",
            noOfChandies: "",
            spunFromDate: "",
            spunToDate: "",
            transactionDate: "",
            fitnessCertificatePath: "",
          });
          setSelectedFile(null);
          setPreviewImage(null);
          setShowSpunDatePicker(false);
          setShowDispatchDatePicker(false);
          setShowTransactionDatePicker(false);
        }, 2000);
      } else {
        // No file selected, but fitness info was added successfully
        // Clear all fields after successful submission
        setTimeout(() => {
          setSearchText("");
          setData(null);
          setDataList([]);
          setInspectionData({
            expectedCocoon: "",
            lotTestDetails: "",
            diseaseStatusId: "",
            noOfChandies: "",
            spunFromDate: "",
            spunToDate: "",
            transactionDate: "",
            fitnessCertificatePath: "",
          });
          setSelectedFile(null);
          setPreviewImage(null);
          setShowSpunDatePicker(false);
          setShowDispatchDatePicker(false);
          setShowTransactionDatePicker(false);
        }, 2000);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Failed to process fitness certificate or upload photo.");
      setIsError(true);
      setShowAlert(true);
    } finally {
      // Always release the submit lock — on success the form clears (so the
      // button naturally becomes "is-disabled-state" again), on failure the
      // user can correct input and retry without a permanent lockout.
      setSubmitting(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="page-toolbar">
          <IonButtons slot="start">
            <IonBackButton text="Back" defaultHref="/cropsub" />
          </IonButtons>
          <IonTitle>Fitness Certificate</IonTitle>
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
                inputRef.current?.blur();
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

        {dataList &&
          dataList.length > 0 &&
          dataList.map((data, index) => (
            <React.Fragment key={index}>
              <div className="result-card">
                <div className="result-head">
                  <div className="result-avatar is-accent-amber">
                    <IonIcon icon={ribbonOutline} />
                  </div>
                  <div className="result-head-text">
                    <span className="result-eyebrow">DFL Details</span>
                    <h3 className="result-title">
                      {index === 0 && data.farmerName
                        ? data.farmerName
                        : `Lot ${data.lotNumberCrc || '—'}`}
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
                    onClick={() => handleFCClick(data.saleAndDisposalId)}
                  >
                    <IonIcon icon={documentTextOutline} slot="start" /> Issue FC
                  </IonButton>
                </div>
              </div>

              {data.issueFCVisible && data.fcData && (
                <div className="result-card">
                  <div className="result-head">
                    <div className="result-avatar is-accent-amber">
                      <IonIcon icon={ribbonOutline} />
                    </div>
                    <div className="result-head-text">
                      <span className="result-eyebrow">Issue FC Details</span>
                      <h3 className="result-title">Inspection Summary</h3>
                    </div>
                  </div>

                  <div className="result-body">
                    <div className="info-row">
                      <label className="info-label">Note</label>
                      <IonInput value={data.fcData.note} readonly={true} />
                    </div>
                    <div className="info-row">
                      <label className="info-label">Crop Date</label>
                      <IonInput value={data.fcData.cropDate} readonly={true} />
                    </div>
                    <div className="info-row">
                      <label className="info-label">Crop Status</label>
                      <IonInput value={data.fcData.cropStatusName} readonly={true} />
                    </div>
                    <div className="info-row">
                      <label className="info-label">Moult</label>
                      <IonInput value={data.fcData.mountName} readonly={true} />
                    </div>

                    <div className="form-section-divider">
                      <span>Add FC Details</span>
                    </div>

                    <div className="info-row">
                      <label className="info-label">Expected Cocoons (in Kgs)</label>
                      <IonInput
                        type="number"
                        value={inspectionData.expectedCocoon}
                        placeholder="0"
                        onIonInput={(e) => handleChange(e as any, "expectedCocoon")}
                      />
                    </div>
                    <div className="info-row">
                      <label className="info-label">Lot Test Details</label>
                      <IonInput
                        value={inspectionData.lotTestDetails}
                        placeholder="Enter lot test details"
                        onIonInput={(e) => handleChange(e as any, "lotTestDetails")}
                      />
                    </div>

                    <div className="info-row">
                      <label className="info-label">Disease Status</label>
                      {fetchError ? (
                        <p className="info-error">Failed to fetch Status list. Please try again later.</p>
                      ) : (
                        <IonSelect
                          value={inspectionData.diseaseStatusId}
                          placeholder="Select Status"
                          interface="action-sheet"
                          onIonChange={(e) => handleChange(e, "diseaseStatusId")}
                        >
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

                    <div className="info-row">
                      <label className="info-label">No. of Chandrika</label>
                      <IonInput
                        type="number"
                        value={inspectionData.noOfChandies}
                        placeholder="0"
                        onIonInput={(e) => handleChange(e as any, "noOfChandies")}
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

                    <div className="info-row">
                      <label className="info-label">Spun From Date</label>
                      <button
                        type="button"
                        className="select-trigger"
                        onClick={() => setShowDispatchDatePicker(true)}
                      >
                        <span className={inspectionData.spunFromDate ? "select-value" : "select-placeholder"}>
                          {inspectionData.spunFromDate
                            ? new Date(inspectionData.spunFromDate).toLocaleDateString()
                            : "Tap to select date"}
                        </span>
                        <IonIcon icon={documentTextOutline} />
                      </button>
                    </div>

                    <div className="info-row">
                      <label className="info-label">Spun To Date</label>
                      <button
                        type="button"
                        className="select-trigger"
                        onClick={() => setShowSpunDatePicker(true)}
                      >
                        <span className={inspectionData.spunToDate ? "select-value" : "select-placeholder"}>
                          {inspectionData.spunToDate
                            ? new Date(inspectionData.spunToDate).toLocaleDateString()
                            : "Tap to select date"}
                        </span>
                        <IonIcon icon={documentTextOutline} />
                      </button>

                      {/* Spun From Date Picker */}
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

                      {/* Spun To Date Picker */}
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

                    <div className="info-row">
                      <label className="info-label">Transaction Date</label>
                      <button
                        type="button"
                        className="select-trigger"
                        onClick={() => setShowTransactionDatePicker(true)}
                      >
                        <span className={inspectionData.transactionDate ? "select-value" : "select-placeholder"}>
                          {inspectionData.transactionDate
                            ? new Date(inspectionData.transactionDate).toLocaleDateString()
                            : "Tap to select date"}
                        </span>
                        <IonIcon icon={documentTextOutline} />
                      </button>

                      {/* Transaction Date Picker */}
                      {showTransactionDatePicker && (
                        <IonModal
                          cssClass="centered-datetime-modal"
                          isOpen={showTransactionDatePicker}
                          onDidDismiss={() => setShowTransactionDatePicker(false)}
                        >
                          <IonHeader>
                            <IonToolbar>
                              <IonTitle>Select Transaction Date</IonTitle>
                            </IonToolbar>
                          </IonHeader>
                          <IonContent className="ion-padding">
                            <IonDatetime
                              presentation="date"
                              showDefaultButtons={true}
                              preferWheel={false}
                              value={
                                inspectionData.transactionDate ||
                                new Date().toISOString()
                              }
                              onIonChange={(e) => {
                                handleChange(e, "transactionDate");
                                setShowTransactionDatePicker(false);
                              }}
                              onIonCancel={() => setShowTransactionDatePicker(false)}
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
                                onClick={() => setShowTransactionDatePicker(false)}
                              >
                                Close
                              </IonButton>
                            </IonToolbar>
                          </IonFooter>
                        </IonModal>
                      )}
                    </div>

                    {/* <div className="file-upload-section">
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
                    </div> */}

                  </div>

                  <div className="result-actions">
                    {(() => {
                      const fcReady =
                        !!inspectionData.spunFromDate &&
                        !!inspectionData.spunToDate &&
                        !!inspectionData.transactionDate &&
                        !!inspectionData.expectedCocoon &&
                        !!inspectionData.lotTestDetails &&
                        !!inspectionData.diseaseStatusId &&
                        !!inspectionData.noOfChandies;
                      return (
                        <IonButton
                          className={`btn-result-primary ${
                            submitting ? "is-loading" : (fcReady ? "is-active" : "is-disabled-state")
                          }`}
                          expand="block"
                          disabled={!fcReady || submitting}
                          onClick={() => handleEdit(data.saleAndDisposalId)}
                        >
                          {submitting ? (
                            <>
                              <IonSpinner name="crescent" className="btn-spinner" />
                              <span style={{ marginLeft: 8 }}>Submitting...</span>
                            </>
                          ) : (
                            <>
                              <IonIcon icon={ribbonOutline} slot="start" /> Submit FC
                            </>
                          )}
                        </IonButton>
                      );
                    })()}
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => {
            console.log("Alert dismissed, showAlert:", showAlert, "message:", message, "isError:", isError);
            setShowAlert(false);
          }}
          header={isError ? "Error" : "Success"}
          message={message}
          buttons={["OK"]}
        />

        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Pending Fitness Certificates</IonTitle>
              <IonButtons slot="end">
                <IonButton
                  style={{ "--background": "#ffffff", "--color": "#000000", color: "#000000", backgroundColor: "#ffffff" } as any}
                  onClick={() => setShowModal(false)}
                >
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
            <div className="list-modal-total" style={{ padding: '0 16px 8px', fontSize: '0.9rem' }}>
              Total pending: {pendingCount}
            </div>
            <IonList>
              {filteredListData.map((item, index) => (
                <IonCard key={index} className="list-card">
                  <IonCardContent>
                    <div className="list-item">
                      <IonText>
                        <b>Fruits ID:</b> {item.fruitsId}
                      </IonText>
                      <IonButton
                        style={{ "--background": "#ffffff", "--color": "#000000", color: "#000000", backgroundColor: "#ffffff", marginLeft: "10px" } as any}
                        fill="clear"
                        onClick={() => copyToClipboard(item.fruitsId)}
                      >
                        <IonIcon icon={copy} />
                      </IonButton>
                    </div>
                    <IonText><b>Farmer Name:</b> {item.farmerName}</IonText>
                    <IonText><b>Race Name:</b> {item.raceName}</IonText>
                    <IonText><b>Lot Number:</b> {item.lotNumber || item.lotNumberCrc}</IonText>
                    <IonText><b>Rate per DFLs:</b> {item.ratePerDfls || item.ratePer100Dfls}</IonText>
                    <IonText><b>Number of DFLs:</b> {item.numbersOfDfls}</IonText>
                    {/* <IonText><b>Crop Inspection Date:</b> {item.cropInspectionDate || "-"}</IonText> */}
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
      </IonContent>
      <Menu />
    </IonPage>
  );
};

export default FitnessPage;
