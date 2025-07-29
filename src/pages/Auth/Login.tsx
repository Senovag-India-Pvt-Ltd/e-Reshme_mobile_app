import { BackButtonEvent, IonCard, IonCardContent, IonCardHeader, IonContent, IonHeader, IonImg, IonList, IonPage, IonRouterContext, IonTitle, IonToolbar, isPlatform, useIonRouter, useIonViewDidEnter, useIonViewWillEnter, useIonViewWillLeave } from '@ionic/react';
import React, { useContext, useEffect, useRef, useState } from 'react';
import axios from "axios";
import { IonGrid, IonRow, IonCol } from '@ionic/react';
import { eye, lockClosed, personCircle, phonePortrait, phonePortraitOutline } from "ionicons/icons";
import { useHistory, useLocation } from "react-router-dom";
import { IonItem, IonLabel, IonInput, IonButton, IonIcon, IonAlert } from '@ionic/react';
import './Login.css';


import { Device } from '@capacitor/device';
import { JSX } from 'react/jsx-runtime';
 import authService, { API_URL_Master} from '../../services/auth.service';
//import authService, { API_URL_Master } from '../../services/auth.service';

import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Wave } from '../../components/Wave';

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

  const usernameInputRef = useRef<HTMLIonInputElement>(null);
  const passwordInputRef = useRef<HTMLIonInputElement>(null);
  const otpInputRef = useRef<HTMLIonInputElement>(null);

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
    // api.post("master-data/v1/userMaster/login-without-otp", loginData)
    //   .then(res => {

    //     if (res.data.content.error) {
    //       setMessage(res.data.content.error_description);
    //       setIserror(true)
    //     } else {
    //       // setPhoneNumber(res.data.content.phoneNumber.substring(res.data.content.phoneNumber.length - 4));
    //       // handleStart();
    //       // setShowVerificationSection(false)
    //       // setShowLoginSection(false)
    //       // otpInputRef.current?.setFocus();
    //       setShowLoginSection(true);
    //       setShowVerificationSection(false);
    //       if (localStorage.getItem("userType") == '2') {
    //         history.push("/bid/" + email);
    //       }else if (localStorage.getItem("userType") == '3') {
    //         history.push("/dash");
    //       } else {
    //         history.push("/accept-bid");
    //       }
    //     }
    //   })
    //   .catch(error => {

    //     setMessage("OTP not sent " + error);
    //     setIserror(true)
    //   })
    try {
      const res = await api.post("master-data/v1/userMaster/login-without-otp", loginData);
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
        }else {
          setShowLoginSection(true);
          setShowVerificationSection(false);
          if (localStorage.getItem("userType") == '2') {
            history.push("/bid/" + email);
          }else if (localStorage.getItem("userType") == '3') {
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

  const verifyOtp = async () => {
    let otpText = `${otpNumber1}${otpNumber2}${otpNumber3}${otpNumber4}${otpNumber5}${otpNumber6}`;
    const loginData = {
      "username": email,
      "enteredOtpByUser": otp
    }

    const api = axios.create({
      //  baseURL: API_URL,
      baseURL: API_URL_Master,
    })
  //   try {
  //     const res = await api.post("master-data/v1/userMaster/verify-otp-by-user-name", loginData);
  //     if (res.data.content.otpVerified) {
  //       await authService.login(email, password);
  //       if (localStorage.getItem("jwtToken") == 'null' || localStorage.getItem("jwtToken") == null || localStorage.getItem("jwtToken") == ' ') {
  //         setMessage("Not able to login, please check credentials");
  //         setIserror(true);
  //         setShowLoginSection(true);
  //         setShowVerificationSection(false);
  //         history.push("/login");
  //       } else if (localStorage.getItem("deviceId") != deviceId && localStorage.getItem("userType") == '2') {
  //         setMessage("Please use the registered device");
  //         setIserror(true);
  //         setShowLoginSection(true);
  //         setShowVerificationSection(false);
  //         history.push("/login");
  //       } else {
  //         setShowLoginSection(true);
  //         setShowVerificationSection(false);
  //         if (localStorage.getItem("userType") == '2') {
  //           history.push("/bid/" + email);
  //         } else {
  //           history.push("/accept-bid");
  //         }
  //       }
  //     } else {
  //       setMessage("OTP not verified");
  //       setIserror(true);
  //     }
  //   }
  //   catch (error) {
  //     setMessage("Error while authenticating user credential");
  //     setIserror(true);
  //   }
  // };

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
      }else {
        setShowLoginSection(true);
        setShowVerificationSection(false);
        if (localStorage.getItem("userType") == '0') {
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

  return (
    <IonPage>
      <IonContent fullscreen className="ion-text-center background">
        <div className="trapezoid"></div>
        <IonGrid>
          <IonRow>
            <IonCol>
              <IonAlert
                isOpen={iserror}
                onDidDismiss={() => setIserror(false)}
                cssClass="my-custom-class"
                header={"Error!"}
                message={message}
                buttons={["Dismiss"]}
              />
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <div className='container'>
                <div className="image-container">
                  <IonImg
                    style={{ alignItems: 'center' }}
                    className='logo-round'
                    src="/assets/images/kg_logo.png"
                    alt="Department of Sericulture"
                  ></IonImg>
                </div>
              </div>
              <div style={{ color: '#fff' }}>
                <h2>Department of Sericulture</h2>
                <h2 style={{ marginTop: '-10px' }}>Government of Karnataka</h2>
              </div>
            </IonCol>
          </IonRow>
          <IonRow style={{ marginTop: '50px' }}>
            <IonCol></IonCol>
          </IonRow>

        </IonGrid>

        {showLoginSection && (
          <div style={{ marginTop: '50px' }}>

            <IonList>
              <IonItem>
                <IonIcon color='primary' slot="start" icon={phonePortrait} aria-hidden="true"></IonIcon>
                <IonInput labelPlacement="stacked" label="Device Id" readonly type="text"
                  value={deviceId}
                  onIonInput={(e) => setDeviceId(e.detail.value!)}>
                </IonInput>
              </IonItem>
            </IonList>
            <IonList>
              <IonItem>
                <IonIcon color='primary' slot="start" icon={personCircle} aria-hidden="true"></IonIcon>
                <IonInput labelPlacement="stacked" label="Username" placeholder="" type="email"
                  inputmode="email"
                  value={email}
                  ref={usernameInputRef}
                  onIonInput={(e) => setEmail(e.detail.value!)}>
                </IonInput>
              </IonItem>
              <IonItem>
                <IonIcon color='primary' slot="start" icon={lockClosed} aria-hidden="true"></IonIcon>
                <IonInput labelPlacement="stacked" label="Password" type="password"
                  value={password}
                  ref={passwordInputRef}
                  onIonInput={(e) => setPassword(e.detail.value!)}>
                </IonInput>
              </IonItem>
              <IonRow className="ion-padding">
                <IonCol color='primary' className="ion-padding">
                  <IonButton expand="block" onClick={handleLogin}>Login</IonButton>
                </IonCol>
              </IonRow>
            </IonList>
          </div>
        )}

        {showVerificationSection && (
          <IonCard>
            <IonCardHeader color={'secondary'}>
              Verification
            </IonCardHeader>
            <IonCardContent>
              <IonGrid>
                <IonRow>
                  <IonCol>
                    <IonLabel>Enter the one time password received on your phone ******{phoneNumber}</IonLabel>
                  </IonCol>
                </IonRow>
                <IonRow>
                  <IonCol>
                    <IonInput labelPlacement="stacked" label="OTP" placeholder="" fill='outline'
                      ref={otpInputRef}
                      onIonInput={(e) => setOtp(e.detail.value!)}>
                    </IonInput>
                  </IonCol>
                </IonRow>
                <IonRow>
                  <IonCol size='6' className="ion-text-left">
                    <IonLabel>Valid for {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')} mins</IonLabel>

                  </IonCol>
                  <IonCol size='6' className="ion-text-right">
                    <IonButton expand="block" onClick={resendOtp} disabled={isActive}>Resend OTP</IonButton>
                  </IonCol>
                </IonRow>
                <IonRow>
                  <IonCol>
                    <IonButton expand="block" onClick={verifyOtp}>Verify OTP</IonButton>
                  </IonCol>
                </IonRow>
              </IonGrid>

            </IonCardContent>
          </IonCard>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Login;