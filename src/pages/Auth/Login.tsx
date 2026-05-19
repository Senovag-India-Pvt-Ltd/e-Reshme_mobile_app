import { BackButtonEvent, IonCard, IonCardContent, IonCardHeader, IonContent, IonHeader, IonImg, IonList, IonPage, IonRouterContext, IonTitle, IonToolbar, isPlatform, useIonRouter, useIonViewDidEnter, useIonViewWillEnter, useIonViewWillLeave } from '@ionic/react';
import React, { useContext, useEffect, useRef, useState } from 'react';
import axios from "axios";
import { IonGrid, IonRow, IonCol } from '@ionic/react';
import { eye, eyeSharp, lockClosed, personCircle, phonePortrait, phonePortraitOutline, cloudDownloadOutline, images, trashSharp, shieldCheckmarkOutline, callOutline, timeOutline } from "ionicons/icons";
import { useHistory, useLocation } from "react-router-dom";
import { IonItem, IonLabel, IonInput, IonButton, IonIcon, IonAlert } from '@ionic/react';
import './Login.mod.css';


import { Device } from '@capacitor/device';
import { JSX } from 'react/jsx-runtime';
 import authService, { API_URL_Master} from '../../services/auth.service';
//import authService, { API_URL_Master } from '../../services/auth.service';

import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Wave } from '../../components/Wave';
import { IonModal, IonButton as IonBtn, IonToast as IonTst } from '@ionic/react';
import { saveImageWithLocation, getSavedImages, readImageDataUrl, deleteImage, SavedImageMeta } from '../../services/imageStorage';

const Login: React.FC = () => {

  const logDeviceInfo = async () => {
    const info = await Device.getInfo();
    const deviceIdObj = await Device.getId();

    // setDeviceId(deviceIdObj.identifier);
    const deviceModel = info.manufacturer+info.model;
    setDeviceId(btoa(deviceModel));

    console.log(info);
    console.log(deviceIdObj.identifier);

    // if(info.platform === 'android') {
    //   const androidId = await this.androidId
    // } else if(info.platform === 'ios') {
    //   // TODO
    // }
    
  };  

  const history = useHistory();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [deviceId, setDeviceId] = useState<string>("");
  const [iserror, setIserror] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const initialMinutes = 10; // Initial minutes
  const initialSeconds = 0; // Initial seconds

  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const [showLoginSection, setShowLoginSection] = useState(true);
  const [showVerificationSection, setShowVerificationSection] = useState(false);
  const [otp, setOtp] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  const [otpNumber1, setOtpNumber1] = useState<string>("");
  const [otpNumber2, setOtpNumber2] = useState<string>("");
  const [otpNumber3, setOtpNumber3] = useState<string>("");
  const [otpNumber4, setOtpNumber4] = useState<string>("");
  const [otpNumber5, setOtpNumber5] = useState<string>("");
  const [otpNumber6, setOtpNumber6] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showSavedModal, setShowSavedModal] = useState<boolean>(false);
  const [savedImages, setSavedImages] = useState<SavedImageMeta[]>([]);
  const [imageDataUrls, setImageDataUrls] = useState<Record<string, string>>({});
  const [toastMsg, setToastMsg] = useState<string>('');
  const [toastOpen, setToastOpen] = useState<boolean>(false);
  const [viewImageUrl, setViewImageUrl] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);
  const [gpsAlertOpen, setGpsAlertOpen] = useState<boolean>(false);
  const [gpsAlertMsg, setGpsAlertMsg] = useState<string>('');

  const usernameInputRef = useRef<HTMLIonInputElement>(null);
  const passwordInputRef = useRef<HTMLIonInputElement>(null);
  const otpInputRef = useRef<HTMLIonInputElement>(null);
  const otpRef1 = useRef<HTMLInputElement | null>(null);
  const otpRef2 = useRef<HTMLInputElement | null>(null);
  const otpRef3 = useRef<HTMLInputElement | null>(null);
  const otpRef4 = useRef<HTMLInputElement | null>(null);
  const otpRef5 = useRef<HTMLInputElement | null>(null);
  const otpRef6 = useRef<HTMLInputElement | null>(null);

  const location = useLocation();

  if (Capacitor.isNative) {
    App.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack || location.pathname === '/login') {
        App.exitApp();
      } else {
        history.goBack();
      }
    });
  }

  useIonViewDidEnter(() => {
    usernameInputRef.current?.setFocus();
  });


  useIonViewWillEnter(() => {
    usernameInputRef.current?.setFocus();
  });

  useEffect(() => {

    let interval: string | number | NodeJS.Timeout | undefined;

    if (isActive && (minutes > 0 || seconds > 0)) {
      interval = setInterval(() => {
        if (seconds === 0) {
          setMinutes((prevMinutes) => prevMinutes - 1);
          setSeconds(59);
        } else {
          setSeconds((prevSeconds) => prevSeconds - 1);
        }
      }, 1000);
    } else if (minutes === 0 && seconds === 0) {
      setIsActive(false);
    }

    return () => {
      clearInterval(interval);
    };
  }, [isActive, minutes, seconds]);

  useEffect(() => {
    logDeviceInfo();
    let usrname = "";
    if(localStorage.getItem("username")!= null){
      usrname = localStorage.getItem("username")!;
      passwordInputRef.current?.setFocus();
    }
    setEmail(usrname);
   
  }, []);

  const handleCaptureClick = async () => {
    try {
      const meta = await saveImageWithLocation();
      if (meta) {
        setToastMsg('Image saved to app storage');
        setToastOpen(true);
        // refresh list
        const list = await getSavedImages();
        setSavedImages(list);
      } else {
        setToastMsg('Failed to Capture Image, Try Again');
        setToastOpen(true);
      }
    } catch (error: any) {
      console.error('Capture error:', error);
      if (error.message === 'GPS_DISABLED') {
        setGpsAlertMsg('GPS is disabled. Please enable Location Services to capture images with location data.');
        setGpsAlertOpen(true);
      } else if (error.message === 'GPS_ERROR' || error.message === 'GPS_UNAVAILABLE') {
        setGpsAlertMsg('Unable to get GPS location. Please enable Location Services and try again.');
        setGpsAlertOpen(true);
      } else {
        setToastMsg('Failed to Capture Image, Try Again');
        setToastOpen(true);
      }
    }
  };

  const openSavedImages = async () => {
    const list = await getSavedImages();
    setSavedImages(list);
    const map: Record<string, string> = {};
    await Promise.all(list.map(async (m) => {
      try {
        const dataUrl = await readImageDataUrl(m.fileName);
        if (dataUrl) {
          map[m.fileName] = dataUrl;
        } else {
          console.warn(`Failed to load image: ${m.fileName}`);
        }
      } catch (err) {
        console.error(`Error loading image ${m.fileName}:`, err);
      }
    }));
    setImageDataUrls(map);
    setShowSavedModal(true);
  };

  const handleDeleteSaved = async (fileName: string) => {
    await deleteImage(fileName);
    const list = await getSavedImages();
    setSavedImages(list);
    const newMap = { ...imageDataUrls };
    delete newMap[fileName];
    setImageDataUrls(newMap);
  };

  const handleStart = () => {
    setIsActive(true);
  };

  const padTime = (time: number) => {
    return String(time).length === 1 ? `0${time}` : `${time}`;
  };

  const format = (time: number) => {
    // Convert seconds into minutes and take the whole part
    const minutes = Math.floor(time / 60);

    // Get the seconds left after converting minutes
    const seconds = time % 60;

    //Return combined values as string in format mm:ss
    return `${minutes}:${padTime(seconds)}`;
  };

  const resendOtp = () => {
    setIsActive(false);
    setMinutes(initialMinutes);
    setSeconds(initialSeconds);
    setTimeout(() => {
      setIsActive(true);
    }, 1);
    generateOtp();
  }

  const handleLogin = async () => {
    generateOtp();
    if (!password || password.length < 1) {
      setMessage("Please enter your password");
      setIserror(true);
      return;
    }
  };

  const generateOtp = async() => {
    const loginData = {
      "username": email,
      "password": password
    }

    const api = axios.create({
      // baseURL: API_URL,
      baseURL: API_URL_Master,
    })
    try {
      console.log("Sending OTP request with data:", loginData);
      console.log("API baseURL:", API_URL_Master);
      const res = await api.post("master-data/v1/userMaster/generate-otp-by-user-name-and-password", loginData);
      console.log("OTP API Response:", res);
      
      if (res.data.content.error) {
        setMessage("Invalid Username or Password");
        setIserror(true)
      } else {
        console.log("Phone number from response:", res.data.content.phoneNumber);
        setPhoneNumber(res.data.content.phoneNumber.substring(res.data.content.phoneNumber.length - 4));
        // start OTP timer
        setMinutes(initialMinutes);
        setSeconds(initialSeconds);
        setIsActive(true);
        setShowVerificationSection(true);
        setShowLoginSection(false);
        otpInputRef.current?.setFocus();
      }
    }
    catch (error: any) {
      console.error("OTP API Error:", error);
      console.error("Error details:", error.response?.data || error.message);
      setMessage("Error While Authenticating User Credentials,Please check your network connection and try again");
      setIserror(true)
    }
  };

  const verifyOtp = async () => {
    let otpText = `${otpNumber1}${otpNumber2}${otpNumber3}${otpNumber4}${otpNumber5}${otpNumber6}`;
    const loginData = {
      "username": email,
      "enteredOtpByUser": otpText
    }

    const api = axios.create({
      //  baseURL: API_URL,
      baseURL: API_URL_Master,
    })
    try {
      const res = await api.post("master-data/v1/userMaster/verify-otp-by-user-name", loginData);
      if (res.data.content.otpVerified) {
        await authService.login(email, password);
        if (localStorage.getItem("jwtToken") == 'null' || localStorage.getItem("jwtToken") == null || localStorage.getItem("jwtToken") == ' ') {
          setMessage("Not able to login, please check credentials");
          setIserror(true);
          setShowLoginSection(true);
          setShowVerificationSection(false);
          history.push("/login");
        } else if (localStorage.getItem("deviceId") != deviceId && localStorage.getItem("userType") == '2') {
          setMessage("Please use the registered device");
          setIserror(true);
          setShowLoginSection(true);
          setShowVerificationSection(false);
          history.push("/login");
        } else {
          setShowLoginSection(true);
          setShowVerificationSection(false);
          if (localStorage.getItem("userType") == '2') {
            history.push("/bid/" + email);
          } else if (localStorage.getItem("userType") == '3') {
            history.push("/dash");
          } else {
            history.push("/homepage");
          }
        }
      } else {
        setMessage("OTP not verified");
        setIserror(true);
      }
    }
    catch (error) {
      setMessage("Error while authenticating user credential");
      setIserror(true);
    }
  };

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  }

  const handleOtpInput = (e: any, setter: (v: string) => void, currentValue: string, nextRef?: HTMLInputElement | null, prevRef?: HTMLInputElement | null) => {
    const val = (e.detail?.value ?? e.target?.value ?? '') as string;
    const char = val?.toString().slice(-1) ?? '';
    
    // Handle backspace - only when field is being cleared
    if (currentValue !== '' && val === '') {
      setter('');
      if (prevRef) {
        prevRef.focus();
      }
      return;
    }
    
    // Handle new input
    setter(char);
    if (char && nextRef) {
      nextRef.focus();
    }
  }

  return (
    <IonPage className="login-page">
      <IonContent fullscreen>
        <div className="login-bg">
          <span className="orb orb-1" aria-hidden="true"></span>
          <span className="orb orb-2" aria-hidden="true"></span>
          <span className="orb orb-3" aria-hidden="true"></span>

          <IonAlert
            isOpen={iserror}
            onDidDismiss={() => setIserror(false)}
            cssClass="my-custom-class"
            header={"Error"}
            message={message}
            buttons={["Dismiss"]}
          />
          <IonAlert
            isOpen={gpsAlertOpen}
            onDidDismiss={() => setGpsAlertOpen(false)}
            cssClass="gps-alert"
            header={"Enable GPS"}
            message={gpsAlertMsg}
            buttons={[
              {
                text: 'OK',
                role: 'cancel',
                handler: () => {
                  setGpsAlertOpen(false);
                },
              },
              {
                text: 'Open Settings',
                handler: () => {
                  if (Capacitor.isNative) {
                    console.log('Please open Settings > Location to enable GPS');
                  }
                  setGpsAlertOpen(false);
                },
              },
            ]}
          />

          <div className="brand-block">
            <div className="brand-logo-wrap">
              <IonImg
                className="logo-round"
                src="/assets/images/kg_logo.png"
                alt="Department of Sericulture"
              />
            </div>
            <h1 className="brand-title">Department of Sericulture</h1>
            <p className="brand-subtitle">Government of Karnataka</p>
          </div>

          {showLoginSection && (
            <>
              <div className="auth-card login-form">
                <h2 className="auth-heading">Login</h2>

                <IonList lines="none">
                  <IonItem>
                    <IonIcon slot="start" icon={personCircle} aria-hidden="true" />
                    <IonInput
                      labelPlacement="stacked"
                      label="Username"
                      placeholder="Enter username"
                      type="email"
                      inputmode="email"
                      value={email}
                      ref={usernameInputRef}
                      onIonInput={(e) => setEmail(e.detail.value!)}
                    />
                  </IonItem>

                  <IonItem>
                    <IonIcon slot="start" icon={lockClosed} aria-hidden="true" />
                    <IonInput
                      labelPlacement="stacked"
                      label="Password"
                      placeholder="Enter password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      ref={passwordInputRef}
                      onIonInput={(e) => setPassword(e.detail.value!)}
                    >
                      <IonButton
                        slot="end"
                        fill="clear"
                        className="password-toggle"
                        onClick={handlePasswordToggle}
                        aria-label="Toggle password visibility"
                      >
                        <IonIcon icon={showPassword ? eyeSharp : eye} />
                      </IonButton>
                    </IonInput>
                  </IonItem>
                </IonList>

                <div className="actions">
                  <IonButton
                    expand="block"
                    className="btn-primary-gradient"
                    onClick={handleLogin}
                  >
                    Sign in
                  </IonButton>
                </div>
              </div>

              <div className="secondary-actions">
                <button
                  type="button"
                  className="action-tile"
                  onClick={handleCaptureClick}
                  aria-label="Capture offline image"
                >
                  <span className="action-icon">
                    <IonIcon icon={cloudDownloadOutline} />
                  </span>
                  <span className="action-label">Capture</span>
                </button>
                <button
                  type="button"
                  className="action-tile"
                  onClick={openSavedImages}
                  aria-label="View saved images"
                >
                  <span className="action-icon">
                    <IonIcon icon={images} />
                  </span>
                  <span className="action-label">Saved</span>
                </button>
              </div>
            </>
          )}

          {showVerificationSection && (
            <div className="auth-card verification-card">
              <div className="otp-shield">
                <IonIcon icon={shieldCheckmarkOutline} />
              </div>

              <h2 className="auth-heading otp-title">Verify OTP</h2>
              <p className="otp-sub">A 6-digit code was sent to</p>

              <div className="otp-phone-chip">
                <IonIcon icon={callOutline} />
                <span>+91 •• •••• {phoneNumber}</span>
              </div>

              <div className="otp-inputs">
                <input ref={otpRef1} className="otp-input" inputMode="numeric" maxLength={1} value={otpNumber1}
                  onChange={(e) => handleOtpInput(e, setOtpNumber1, otpNumber1, otpRef2.current, undefined)} />
                <input ref={otpRef2} className="otp-input" inputMode="numeric" maxLength={1} value={otpNumber2}
                  onChange={(e) => handleOtpInput(e, setOtpNumber2, otpNumber2, otpRef3.current, otpRef1.current)} />
                <input ref={otpRef3} className="otp-input" inputMode="numeric" maxLength={1} value={otpNumber3}
                  onChange={(e) => handleOtpInput(e, setOtpNumber3, otpNumber3, otpRef4.current, otpRef2.current)} />
                <input ref={otpRef4} className="otp-input" inputMode="numeric" maxLength={1} value={otpNumber4}
                  onChange={(e) => handleOtpInput(e, setOtpNumber4, otpNumber4, otpRef5.current, otpRef3.current)} />
                <input ref={otpRef5} className="otp-input" inputMode="numeric" maxLength={1} value={otpNumber5}
                  onChange={(e) => handleOtpInput(e, setOtpNumber5, otpNumber5, otpRef6.current, otpRef4.current)} />
                <input ref={otpRef6} className="otp-input" inputMode="numeric" maxLength={1} value={otpNumber6}
                  onChange={(e) => handleOtpInput(e, setOtpNumber6, otpNumber6, null, otpRef5.current)} />
              </div>

              <div className="otp-helper-row">
                <span className="otp-timer">
                  <IonIcon icon={timeOutline} />
                  Valid for {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
                <IonButton
                  fill="clear"
                  size="small"
                  className="otp-resend-btn"
                  onClick={resendOtp}
                  disabled={isActive}
                >
                  Resend OTP
                </IonButton>
              </div>

              <div className="actions">
                <IonButton
                  expand="block"
                  className="btn-primary-gradient"
                  onClick={verifyOtp}
                >
                  Verify OTP
                </IonButton>
              </div>
            </div>
          )}
        </div>

        <IonModal isOpen={showSavedModal} onDidDismiss={() => setShowSavedModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Saved Location Images</IonTitle>
              <IonBtn slot="end" fill="clear" onClick={() => setShowSavedModal(false)}>Close</IonBtn>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            {savedImages.length === 0 ? (
              <div className="saved-empty">
                <div className="empty-icon">
                  <IonIcon icon={images} />
                </div>
                <p>No saved images yet</p>
              </div>
            ) : (
              <div className="saved-modal-grid">
                {savedImages.map((m) => (
                  <div key={m.fileName} className="saved-tile">
                    {imageDataUrls[m.fileName] ? (
                      <IonImg
                        className="tile-img"
                        src={imageDataUrls[m.fileName]}
                        onClick={() => {
                          const url = imageDataUrls[m.fileName];
                          if (url) {
                            setViewImageUrl(url);
                            setViewModalOpen(true);
                          }
                        }}
                      />
                    ) : (
                      <div className="tile-placeholder">
                        <IonIcon icon={images} />
                      </div>
                    )}
                    <div className="tile-actions">
                      <IonBtn title="Delete" size="small" fill="clear" color="danger" onClick={() => handleDeleteSaved(m.fileName)}>
                        <IonIcon icon={trashSharp} />
                      </IonBtn>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </IonContent>
        </IonModal>

        <IonModal isOpen={viewModalOpen} onDidDismiss={() => { setViewModalOpen(false); setViewImageUrl(null); }}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>View Image</IonTitle>
              <IonBtn slot="end" fill="clear" onClick={() => { setViewModalOpen(false); setViewImageUrl(null); }}>Close</IonBtn>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {viewImageUrl ? (
              <IonImg src={viewImageUrl} style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }} />
            ) : (
              <p>No image</p>
            )}
          </IonContent>
        </IonModal>

        <IonTst isOpen={toastOpen} onDidDismiss={() => setToastOpen(false)} message={toastMsg} duration={2500} position="top" />
      </IonContent>
    </IonPage>
  );
};

export default Login;