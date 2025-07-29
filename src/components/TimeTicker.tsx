import React, { useEffect, useState } from 'react';
import { IonText } from '@ionic/react';
import axios from "axios";
// import authService, { API_URL_Master } from '../services/auth.service';
import authService, {  API_URL_Master } from '../services/auth.service';


// const TimeTicker: React.FC = () => {
//   const [currentTime, setCurrentTime] = useState(new Date());
//   const [serverTime, setServerTime] = useState(new Date());
//   const [count, setCount] = useState(0);

//   useEffect(() => {
    
//     // Update the time every second
//     const intervalId = setInterval(() => {
//       //ad one second to current millisecond
//       if(count == 0) {
//         let originalDate = new Date(serverTime);
//         const newDate = new Date(originalDate.getTime() + 1000);
//         setCurrentTime(newDate);
//       } else {
//         const newDate = new Date(currentTime.getTime() + 1000);
//         setCurrentTime(newDate);
//       }
      
//       setCount(prevCount => prevCount + 1);
//     }, 1000);

//     // Cleanup the interval on component unmount
//     return () => clearInterval(intervalId);
//   }, [count]);

//   useEffect(() => {
//     //const apiUrl = 'http://localhost:8001/master-data/v1/util/current-time-millisec'; 
//     const apiUrl = 'https://api.senovagseri.com/master-data/v1/util/current-time-millisec'; 
    
//     const jwtToken = authService.getToken();
    
//     const headers = {
//     'Authorization': `Bearer ${jwtToken}`,
//     'Content-Type': 'application/json',
//     'Access-Control-Allow-Origin': '*'
//     };

//     axios.get(apiUrl, { headers })
//     .then(response => {
//         setServerTime(response.data)
//         console.log(response.data);
//     })
//     .catch(error => {
//         // Handle errors
//         console.error('Error:', error);
//     });
//   }, []);



//   const formattedTime = currentTime.toLocaleTimeString();

//   return (
//     <IonText>
//       <p style={{paddingLeft: '10px', fontWeight: 'bold', color: 'red'}}>{formattedTime}</p>
//     </IonText>
//   );
// };

// export default TimeTicker;

// ... (existing imports)

function TimeTicker({ isActive }: { isActive: boolean; }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [serverTime, setServerTime] = useState(new Date());
  const [count, setCount] = useState(0);
  const [formatedTime, setFormatedTime] = useState<string>("");
  

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (count === 0) {
        let originalDate = new Date(serverTime);
        const newDate = new Date(originalDate.getTime() + 1000);
        setCurrentTime(newDate);
        const formattedTime1 = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
        setFormatedTime(formattedTime1);
      } else {
        const newDate = new Date(currentTime.getTime() + 1000);
        setCurrentTime(newDate);
        const formattedTime1 = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit',hour12: false });
        setFormatedTime(formattedTime1);
      }

      setCount((prevCount) => prevCount + 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [count]);

  // useEffect(() => {
  //   // Fetch server time when component mounts
  //   const apiUrl = 'https://api.senovagseri.com/master-data/v1/util/current-time-millisec';
  //   const jwtToken = authService.getToken();

  //   const headers = {
  //     'Authorization': `Bearer ${jwtToken}`,
  //     'Content-Type': 'application/json',
  //     'Access-Control-Allow-Origin': '*',
  //   };

  //   axios.get(apiUrl, { headers })
  //     .then((response) => {
  //       setServerTime(response.data);
  //     })
  //     .catch((error) => {
  //       console.error('Error:', error);
  //     });
  // }, []);

  useEffect(() => {
    // Update server time when isActive changes (i.e., when BidAccept is resumed)
    if (isActive) {
      // const apiUrl = 'https://api.senovagseri.com/master-data/v1/util/current-time-millisec';
       const apiUrl = API_URL_Master+'master-data/v1/util/current-time-millisec';
    //  const apiUrl = API_URL_Master +'master-data/v1/util/current-time-millisec';
      const jwtToken = authService.getToken();

      const headers = {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      };

      axios.get(apiUrl, { headers })
        .then((response) => {
          setServerTime(response.data);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }
  }, [isActive]);

  const formattedTime = currentTime.toLocaleTimeString();

  return (
    <IonText>
      <p style={{ paddingRight: '30px', fontWeight: 'bold', color: 'red', float: 'right', fontSize: 30 }}>{formatedTime}</p>
    </IonText>
  );
}

export default TimeTicker;
