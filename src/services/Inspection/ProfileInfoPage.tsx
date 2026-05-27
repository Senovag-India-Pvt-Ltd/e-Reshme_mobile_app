import React, { useState, useEffect, useRef } from 'react';
import {
  IonContent, IonCol, IonPage, IonCard, IonCardContent, IonCardHeader,
  IonCardTitle, IonInput, IonLabel, IonButton, IonHeader,
  IonToolbar, IonTitle, IonButtons, IonMenuButton, IonIcon, IonSelect, IonSelectOption, IonBackButton, IonAlert, IonSpinner, IonToast
} from '@ionic/react';
import { trash, searchOutline, checkmarkCircle, refreshOutline, cameraOutline, imageOutline, alertCircleOutline, cloudOfflineOutline, timeOutline, closeCircle, eyeOutline, createOutline } from 'ionicons/icons';
import SearchableSelect from '../../components/SearchableSelect';
import './ProfileInfoPage.css';
import axios from 'axios';
import { API_URL_DBT } from '../auth.service';
import { API_URL_Master_Data } from '../auth.service';

const ProfileInfoPage: React.FC = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [data, setData] = useState<any>(null);
  const [farmerOtherData, setFarmerOtherData] = useState<any>({});
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const [viewAll, setViewAll] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);
  const [farmerId, setFarmerId] = useState<number | null>(null);
  const [tscMasterId, setTscMasterId] = useState<string>(''); 
  const [tscListData, setTscListData] = useState<any[]>([]);
  const [fetchError, setFetchError] = useState<boolean>(false);
  
  const [showAlert, setShowAlert] = useState<boolean>(false); // For alert
  const [searching, setSearching] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  // New UX state
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('recentFruitsIds_profile');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [searchAttempted, setSearchAttempted] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<'notFound' | 'network' | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);

  const inputRef = useRef<HTMLIonInputElement>(null); // Add useRef for input field

  const FRUITS_ID_LENGTH = 16;

  const handleInputChange = (e: CustomEvent) => {
    const raw = (e.target as HTMLIonInputElement).value;
    const value = (typeof raw === 'string' ? raw : raw == null ? '' : String(raw)).toUpperCase();
    setSearchText(value);
    // Clear stale error feedback as soon as user edits the input
    if (searchError) setSearchError(null);
    if (searchAttempted) setSearchAttempted(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLIonInputElement>) => {
    if (e.key === 'Enter' && searchText.trim() && !searching) {
      inputRef.current?.blur();
      fetchFarmerDetails();
    }
  };

  const saveRecent = (id: string) => {
    const trimmed = id.trim().toUpperCase();
    if (!trimmed) return;
    setRecentSearches(prev => {
      const next = [trimmed, ...prev.filter(x => x !== trimmed)].slice(0, 5);
      try { localStorage.setItem('recentFruitsIds_profile', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const removeRecent = (id: string) => {
    setRecentSearches(prev => {
      const next = prev.filter(x => x !== id);
      try { localStorage.setItem('recentFruitsIds_profile', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const handleRecentClick = (id: string) => {
    setSearchText(id);
    setSearchError(null);
    setSearchAttempted(false);
    setTimeout(() => fetchFarmerDetails(id), 0);
  };

  const fetchFarmerDetails = (overrideId?: string) => {
    if (searching) return;
    const idToSearch = (overrideId ?? searchText).trim().toUpperCase();
    if (!idToSearch) return;
    clearField();  // Clear previous data
    setData(null);
    setSearchAttempted(true);
    setSearchError(null);
    setSearching(true);
    const api = axios.create({
      baseURL: API_URL_DBT
    });

    api.post("farmer-details/getInspectionFarmerDetailsByFruitsId", { fruitsId: idToSearch }, {
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
      },
    })
    .then(res => {
      const farmerResponse = res.data?.content?.[0]?.farmerResponses?.[0];
      if (farmerResponse) {
        setData(farmerResponse);
        setFarmerId(farmerResponse?.farmerId);
        saveRecent(idToSearch);
      } else {
        setSearchError('notFound');
      }
      setSearching(false);
    })
    .catch(error => {
      console.error("Error fetching farmer details:", error);
      const isNetwork = !error?.response;
      setSearchError(isNetwork ? 'network' : 'notFound');
      setSearching(false);
    });
  };
  


  const fetchTscList = async () => {
    try {
      const response = await axios.get(`${API_URL_Master_Data}tscMaster/get-all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
        },
      });
      if (response.data && response.data.content) {
        setTscListData(response.data.content.tscMaster);
      } else {
        console.error('Unexpected API response format:', response);
        setFetchError(true);
      }
    } catch (error) {
      console.error('Error fetching Tsc list:', error);
      setFetchError(true);
    }
  };

  const handleTscChange = (value: string) => {
    setTscMasterId(value);
    setFarmerOtherData(prev => ({
      ...prev,
      tscMasterId: value,
    }));
  };

  useEffect(() => {
    fetchTscList();
    // Auto-focus the Fruits ID input so the keyboard opens on page entry
    const t = setTimeout(() => {
      inputRef.current?.setFocus().catch(() => { /* ignore */ });
    }, 250);
    return () => clearTimeout(t);
  }, []);

  // const handleEdit = () => {
  //   if (isEditable) {
  //     const api = axios.create({
  //       baseURL: API_URL_DBT
  //     });
  //     api.post("farmer/edit-farmer-profile", {
  //       mobileNumber: farmerOtherData.mobileNumber,
  //       tscMasterId: farmerOtherData.tscMasterId,
  //       farmerId: farmerId
  //     }, {
  //       headers: {
  //         "Content-Type": "application/json",
  //         accept: "*/*",
  //         Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
  //       },
  //     })
  //     .then(res => {
  //       console.log("Farmer details updated successfully", res.data);
  //       setMessage("Farmer details updated successfully");
  //       setIsError(false);
  //       setShowAlert(true);
  //       clearFields(); // Clear fields upon successful insertion
  //     })
  //     .catch(error => {
  //       console.error("Error updating farmer details", error);
  //       setMessage("Error updating farmer details");
  //       setIsError(true);
  //       setShowAlert(true);
  //     });
  //   }
  //   setIsEditable(!isEditable);
  // };

  // const handleEdit = async () => {
  //   if (isEditable) {
  //     try {
  //       // Save the farmer details
  //       const api = axios.create({
  //         baseURL: API_URL_DBT
  //       });
  //       await api.post("farmer/edit-farmer-profile", {
  //         mobileNumber: farmerOtherData.mobileNumber,
  //         tscMasterId: farmerOtherData.tscMasterId,
  //         farmerId: farmerId
  //       }, {
  //         headers: {
  //           "Content-Type": "application/json",
  //           accept: "*/*",
  //           Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
  //         },
  //       });

  //       // If a file is selected, upload it
  //       if (selectedFile) {
  //         const formData = new FormData();
  //         formData.append('file', selectedFile);
  //         formData.append('farmerId', farmerId?.toString() || '');

  //         await api.post('farmer/upload-photo', formData, {
  //           headers: {
  //             'Content-Type': 'multipart/form-data',
  //             Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
  //           },
  //         });

  //         setMessage("Farmer details and photo uploaded successfully");
  //       } else {
  //         setMessage("Farmer details updated successfully");
  //       }

  //       setIsError(false);
  //       setShowAlert(true);
  //       clearFields(); // Clear fields upon successful upload
  //     } catch (error) {
  //       console.error("Error updating farmer details or uploading photo", error);
  //       setMessage("Error updating farmer details or uploading photo");
  //       setIsError(true);
  //       setShowAlert(true);
  //     }
  //   }

  //   setIsEditable(!isEditable);
  // };

  const handleEdit = async () => {
    if (isEditable) {
      if (submitting) return;
      setSubmitting(true);
      try {
        const api = axios.create({
          baseURL: API_URL_DBT
        });
        await api.post("farmer/edit-farmer-profile", {
          mobileNumber: farmerOtherData.mobileNumber,
          tscMasterId: farmerOtherData.tscMasterId,
          photoPath: farmerOtherData.photoPath,
          farmerId: farmerId
        }, {
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        });

        if (selectedFile) {
          const formData = new FormData();
          formData.append('multipartFile', selectedFile);
          formData.append('farmerId', farmerId?.toString() || '');

          const response = await api.post('farmer/upload-photo', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
            },
          });

          const newPhotoPath = response.data.content.photoPath;
          setFarmerOtherData((prevData) => ({
            ...prevData,
            photoPath: newPhotoPath
          }));

          setMessage("Farmer details and photo uploaded successfully");
        } else {
          setMessage("Farmer details updated successfully");
        }

        setIsError(false);
        setShowSuccessToast(true);
        clearFields();
        setIsEditable(false);
      } catch (error) {
        console.error("Error updating farmer details or uploading photo", error);
        setMessage("Error updating farmer details or uploading photo");
        setIsError(true);
        setShowAlert(true);
      } finally {
        setSubmitting(false);
      }
    } else {
      setIsEditable(true);
    }
  };
  

  const clearFields = () => {
    setFarmerOtherData({});
    setSearchText('');
    setData(null);
    setTscMasterId('');
    setSelectedFile(null);
    setFarmerId(null);
    setViewAll(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setFarmerOtherData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  

  const toggleViewAll = (i: number) => {
    setViewAll(!viewAll);
    const api = axios.create({
      baseURL: API_URL_DBT
    });
    api.get(`farmer/get-by-farmer-id-join/${i}`, {
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
      },
    })
    .then(res => {
      console.log("singleData", res.data.content);
      setFarmerOtherData(prev => ({ ...prev, ...res.data.content }));
      setFarmerId(res.data.content[0].farmerId);
      setTscMasterId(res.data.content.tscName);
    })
    .catch(error => {
      setMessage("Farmer number does not exist");
      setIsError(true);
    });
  };
  // Hide button logic extracted here
  const handleHide = () => {
    if (viewAll) {
      setViewAll(false); // Automatically hide when necessary
    }
  }; 
  const clearSearch = () => {
    setSearchText('');
    setData(null);
    setIsEditable(false);
    setViewAll(false);
    setSearchAttempted(false);
    setSearchError(null);
  };

  const requestClear = () => {
    // Only ask for confirmation if there's actually data to lose
    if (searchText.trim() || data) {
      setShowClearConfirm(true);
    } else {
      clearSearch();
    }
  };
  const clearField=()=>{
    setViewAll(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        (async () => {
          try {
            const compressed = await compressImageFile(file, 2);
            setSelectedFile(compressed);
          } catch (err) {
            console.error('Compression error, using original file:', err);
            setSelectedFile(file);
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

  // Helper: compress image File to max 2 MB
  const compressImageFile = async (file: File, maxSizeMB = 2): Promise<File> => {
      const maxSize = maxSizeMB * 1024 * 1024;

      if (!file.type.startsWith('image/')) {
        return file;
      }

      if (file.size <= maxSize) return file;

      const dataUrl = await fileToDataURL(file);
      const img = document.createElement('img');
      img.src = dataUrl;

      await new Promise((resolve, reject) => {
        img.onload = () => resolve(true);
        img.onerror = (e) => reject(e);
      });

      const canvas = document.createElement('canvas');
      let [width, height] = [img.naturalWidth, img.naturalHeight];

      const maxDim = 1600;
      if (Math.max(width, height) > maxDim) {
        const scale = maxDim / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return file;

      ctx.drawImage(img, 0, 0, width, height);

      let quality = 0.92;
      let blob: Blob | null = null;

      for (let i = 0; i < 8; i++) {
        blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((b) => resolve(b), file.type === 'image/png' ? 'image/jpeg' : file.type, quality);
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
        const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, '') + '.jpg', { type: 'image/jpeg' });
        return newFile.size <= maxSize ? newFile : file;
      }

      return file;
    };

    return (
      <IonPage>
      <IonHeader>
        <IonToolbar className="page-toolbar">
          <IonButtons slot="start">
            <IonBackButton text="Back" defaultHref="/subsubmenu" />
          </IonButtons>
          <IonTitle>Farmer Profile Info</IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={clearSearch} aria-label="Refresh" disabled={searching || submitting}>
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
              placeholder="e.g. FID2802000042820"
              autocapitalize="characters"
              maxlength={FRUITS_ID_LENGTH}
              onIonInput={handleInputChange}
              onKeyDown={handleInputKeyDown}
            />
          </div>
          {searchText.length > 0 && searchText.length < FRUITS_ID_LENGTH && (
            <span className="input-warning">
              <IonIcon icon={alertCircleOutline} />
              Fruits ID must be {FRUITS_ID_LENGTH} characters ({FRUITS_ID_LENGTH - searchText.length} more)
            </span>
          )}
          <div className="search-action-row">
            <IonButton
              className={`btn-primary ${searching ? "is-loading" : (searchText.trim() ? "is-active" : "is-disabled-state")}`}
              disabled={searching || !searchText.trim()}
              onClick={() => { if (searchText.trim()) fetchFarmerDetails(); }}
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
              onClick={requestClear}
              aria-label="Clear"
              disabled={searching || submitting || loadingDetails}
            >
              <IonIcon icon={trash} />
            </IonButton>
          </div>

          {recentSearches.length > 0 && !data && !searching && (
            <div className="recent-searches">
              <div className="recent-searches-label">
                <IonIcon icon={timeOutline} />
                <span>Recent</span>
              </div>
              <div className="recent-chips">
                {recentSearches.map((id) => (
                  <div key={id} className="recent-chip">
                    <button
                      type="button"
                      className="recent-chip-text"
                      onClick={() => handleRecentClick(id)}
                    >
                      {id}
                    </button>
                    <button
                      type="button"
                      className="recent-chip-remove"
                      aria-label={`Remove ${id} from recents`}
                      onClick={() => removeRecent(id)}
                    >
                      <IonIcon icon={closeCircle} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {!searching && !data && searchAttempted && searchError && (
          <div className={`empty-state-card ${searchError === 'network' ? 'is-network' : 'is-not-found'}`}>
            <div className="empty-state-icon">
              <IonIcon icon={searchError === 'network' ? cloudOfflineOutline : alertCircleOutline} />
            </div>
            <h4 className="empty-state-title">
              {searchError === 'network' ? 'Network error' : 'No farmer found'}
            </h4>
            <p className="empty-state-text">
              {searchError === 'network'
                ? 'Could not reach the server. Check your internet connection and try again.'
                : `No farmer found for "${searchText.trim().toUpperCase()}". Please check the Fruits ID and try again.`}
            </p>
            <IonButton
              className="btn-primary is-active"
              onClick={() => fetchFarmerDetails()}
              disabled={!searchText.trim() || searching}
            >
              <IonIcon icon={refreshOutline} slot="start" /> Retry
            </IonButton>
          </div>
        )}

        {data && (
          <div className="result-card">
            <div className="result-head">
              <div className="result-avatar">
                {(data.fullName?.[0] || 'F').toUpperCase()}
              </div>
              <div className="result-head-text">
                <span className="result-eyebrow">Farmer Profile</span>
                <h3 className="result-title">{data.fullName}</h3>
              </div>
            </div>

            <div className="result-body">
              <div className="info-row">
                <label className="info-label">Farmer Name</label>
                <IonInput value={data.fullName} readonly={true} />
              </div>
              <div className="info-row">
                <label className="info-label">Address</label>
                <IonInput value={data.address} readonly={true} />
              </div>

              {viewAll && (
                <>
                  <div className="info-row">
                    <label className="info-label">Father's / Husband's Name</label>
                    <IonInput value={farmerOtherData?.fatherName} readonly={true} />
                  </div>
                  <div className="info-row">
                    <label className="info-label">Father's / Husband's Name (Kannada)</label>
                    <IonInput value={farmerOtherData?.fatherNameKan} readonly={true} />
                  </div>
                  <div className="info-row">
                    <label className="info-label">Caste</label>
                    <IonInput value={farmerOtherData?.title} readonly={true} />
                  </div>

                  <div className="info-row">
                    <label className="info-label">Select TSC</label>
                    {fetchError ? (
                      <p className="info-error">Failed to fetch TSC list. Please try again later.</p>
                    ) : (
                      <SearchableSelect
                        value={String(farmerOtherData?.tscMasterId ?? '')}
                        disabled={!isEditable}
                        placeholder="Select TSC"
                        modalTitle="Select TSC"
                        options={tscListData.map((tsc) => ({
                          value: String(tsc.tscMasterId),
                          label: tsc.name,
                        }))}
                        onChange={(val) => handleTscChange(val)}
                      />
                    )}
                  </div>

                  <div className="info-row">
                    <label className="info-label">Mobile Number</label>
                    <IonInput
                      value={farmerOtherData?.mobileNumber}
                      readonly={!isEditable}
                      onIonChange={(e) => handleChange(e, 'mobileNumber')}
                    />
                  </div>

                  <div className="info-row">
                    <label className="info-label">
                      Farmer Photo <span className="info-hint">(max 5 MB)</span>
                    </label>

                    <input
                      id="farmer-photo-camera"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                    <input
                      id="farmer-photo-gallery"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />

                    <div className="photo-picker-row">
                      <button
                        type="button"
                        className="photo-picker-btn photo-picker-btn--camera"
                        onClick={() => document.getElementById('farmer-photo-camera')?.click()}
                      >
                        <IonIcon icon={cameraOutline} />
                        <span>Camera</span>
                      </button>
                      <button
                        type="button"
                        className="photo-picker-btn photo-picker-btn--file"
                        onClick={() => document.getElementById('farmer-photo-gallery')?.click()}
                      >
                        <IonIcon icon={imageOutline} />
                        <span>Choose File</span>
                      </button>
                    </div>

                    {selectedFile && (
                      <div className="info-file-preview">
                        {selectedFile.type.startsWith('image/') && (
                          <img src={URL.createObjectURL(selectedFile)} alt="Preview" />
                        )}
                        <span className="info-file-name">{selectedFile.name}</span>
                        <button
                          type="button"
                          className="recent-chip-remove"
                          aria-label="Remove selected photo"
                          title="Remove photo"
                          onClick={() => {
                            setSelectedFile(null);
                            // Also clear the file input so re-selecting the same
                            // file fires the change event again.
                            const cam = document.getElementById('farmer-photo-camera') as HTMLInputElement | null;
                            const gal = document.getElementById('farmer-photo-gallery') as HTMLInputElement | null;
                            if (cam) cam.value = '';
                            if (gal) gal.value = '';
                          }}
                        >
                          <IonIcon icon={trash} />
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="result-actions">
              {!viewAll ? (
                <IonButton
                  className={`btn-result-primary ${loadingDetails ? "is-loading" : "is-active"}`}
                  expand="block"
                  disabled={loadingDetails || submitting}
                  onClick={() => farmerId !== null && toggleViewAll(farmerId)}
                >
                  {loadingDetails ? (
                    <>
                      <IonSpinner name="crescent" className="btn-spinner" />
                      <span style={{ marginLeft: 6 }}>Loading</span>
                    </>
                  ) : (
                    <>
                      <IonIcon icon={eyeOutline} slot="start" />
                      View All Details
                    </>
                  )}
                </IonButton>
              ) : (
                <IonButton
                  className={`btn-result-primary ${isEditable ? "is-save-active" : "is-active"} ${submitting && isEditable ? "is-loading" : ""}`}
                  expand="block"
                  disabled={submitting}
                  onClick={handleEdit}
                >
                  {submitting && isEditable ? (
                    <>
                      <IonSpinner name="crescent" className="btn-spinner" />
                      <span style={{ marginLeft: 6 }}>Saving</span>
                    </>
                  ) : isEditable ? (
                    <>
                      <IonIcon icon={checkmarkCircle} slot="start" /> Save Changes
                    </>
                  ) : (
                    <>
                      <IonIcon icon={createOutline} slot="start" /> Edit Details
                    </>
                  )}
                </IonButton>
              )}
            </div>
          </div>
        )}

        {/* Alert for ERROR messages only — success now uses a non-blocking toast */}
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={isError ? "Error" : "Success"}
          message={message}
          buttons={['OK']}
          cssClass={`app-alert ${isError ? 'app-alert--error' : 'app-alert--success'}`}
        />

        {/* Success toast — non-blocking, auto-dismiss. Top-positioned so it never
            sits behind the floating bottom home button. */}
        <IonToast
          isOpen={showSuccessToast}
          onDidDismiss={() => setShowSuccessToast(false)}
          message={message || 'Saved successfully'}
          duration={2800}
          position="top"
          icon={checkmarkCircle}
          color="success"
          cssClass="app-toast app-toast--success"
        />

        {/* Confirm before clearing the form to avoid accidental data loss */}
        <IonAlert
          isOpen={showClearConfirm}
          onDidDismiss={() => setShowClearConfirm(false)}
          header="Clear data?"
          message="This will clear the Fruits ID and any unsaved details. Continue?"
          buttons={[
            { text: 'Cancel', role: 'cancel' },
            { text: 'Clear', role: 'destructive', handler: () => clearSearch() },
          ]}
          cssClass="app-alert app-alert--warning"
        />
      </IonContent>
    </IonPage>
  );
}

export default ProfileInfoPage;




