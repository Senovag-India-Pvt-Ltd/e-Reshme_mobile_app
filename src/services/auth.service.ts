import axios from 'axios';
import jwtDecode from 'jwt-decode';

//const API_URL = 'http://localhost:8001/master-data';
// const API_URL = 'https://api.senovagseri.com/master-data';
//const API_URL = 'http://13.200.62.144:8001/master-data/v1';

// export const API_URL_DBT = 'http://13.200.62.144:8013/';
// const API_URL_Master = 'https://api.senovagseri.com/';

  // export const API_URL = 'https://api.senovagseri.com/';

 //export const API_URL_Market = 'http://13.200.62.144:8002/';


//  export const API_URL_Master = 'http://13.200.62.144:8001/';


//  export const API_URL_Inspection = 'https://api.senovagseri.com/';
// export const API_URL_DBT = 'https://api.senovagseri.com/';
// export const API_URL_Market = 'https://api.senovagseri.com/';

// export const API_URL_Master ='https://api.senovagseri.com/';



//  export const API_URL_Market = 'http://13.200.62.144:8010/';
//  export const API_URL_Master = 'http://13.200.62.144:8001/';
// export const API_URL_Inspection = 'http://13.200.62.144:8010/';
// export const API_URL_DBT = 'http://13.200.62.144:8013/';





// export const API_URL_Master = 'http://13.200.62.144:8001/';
// export const API_URL_Market = 'https://api.senovagseri.com/';
// export const API_URL_Master = 'https://api.senovagseri.com/';
// export const API_URL_Master_Data = 'http://localhost:8001/master-data/v1/';
// export const API_URL_Master_Data = 'http://13.200.62.144:8001/master-data/v1/';
// export const API_URL_Master_Data = 'https://api.senovagseri.com/master-data/v1/';
// export const API_URL_Inspection = 'https://api.senovagseri.com/';
// export const API_URL_DBT = 'https://api.senovagseri.com/';
// export const API_URL_DBT = 'http://localhost:8000/farmer-registration/v1/';
// export const API_URL_ChowkiManagment = 'http://localhost:8007/chawki-management/';
// export const API_URL_ChowkiManagment = 'http://13.200.62.144:8007/chawki-management/';
// export const API_URL_ChowkiManagment = 'https://api.senovagseri.com/chawki-management/';
// export const API_URL_DBT = 'http://13.200.62.144:8000/farmer-registration/v1/';
// export const API_URL_DBT = 'https://api.senovagseri.com/farmer-registration/v1/';
// export const API_URL_DBT = 'http://13.200.62.144:8100/farmer-registration/v1/';



//Inspection Link

export const API_URL_DBT = 'https://e-reshme.karnataka.gov.in/farmer-registration/v1/';
export const API_URL_ChowkiManagment = 'https://e-reshme.karnataka.gov.in/chawki-management/';
export const API_URL_Master_Data = 'https://e-reshme.karnataka.gov.in/master-data/v1/';
export const API_URL_Inspection = 'https://e-reshme.karnataka.gov.in/';
export const API_URL_Market = 'https://e-reshme.karnataka.gov.in/';
export const API_URL_Master = 'https://e-reshme.karnataka.gov.in/';

// export const API_URL_DBT = 'http://localhost:8000/farmer-registration/v1/';
// export const API_URL_ChowkiManagment = 'http://localhost:8007/chawki-management/';
// export const API_URL_Master_Data = 'http://localhost:8001/master-data/v1/';
// export const API_URL_Inspection = 'http://localhost:8010/';
// export const API_URL_Market = 'http://localhost:8002/';
// export const API_URL_Master = 'http://localhost:8001/';




// export const API_URL_Market = 'https://e-reshme.karnataka.gov.in/';
// export const API_URL_Master = 'https://e-reshme.karnataka.gov.in/';
// export const API_URL_Inspection = 'https://e-reshme.karnataka.gov.in/';
// export const API_URL_DBT = 'https://e-reshme.karnataka.gov.in/';


// export const API_URL_Market = 'https://api.senovagseri.com/';
// export const API_URL_Master = 'https://api.senovagseri.com/';
// export const API_URL_Master_Data = 'https://api.senovagseri.com/master-data/v1/';
// export const API_URL_Inspection = 'https://api.senovagseri.com/';
// export const API_URL_ChowkiManagment = 'http://13.200.62.144:8007/chawki-management/';
// export const API_URL_DBT = 'https://api.senovagseri.com/farmer-registration/v1/';




// export const API_URL_Inspection = 'https://api.senovagseri.com/';
// export const API_URL_DBT_ = 'https://api.senovagseri.com/';

// export const API_URL_Market = 'http://localhost:8002/';
// export const API_URL_Master = 'http://localhost:8001/';
// export const API_URL_Inspection = 'http://localhost:8010/';
// export const API_URL_DBT_ = 'http://localhost:8013/';


// export const API_URL_Market = 'https://e-reshme.karnataka.gov.in/';
// export const API_URL_Master = 'https://e-reshme.karnataka.gov.in/';
// export const API_URL_Inspection = 'https://e-reshme.karnataka.gov.in/';
export const API_URL_DBT_ = 'https://e-reshme.karnataka.gov.in/';






const authService = {
  login: async (username: string, password: string) => {
     const response = await axios.post(`${API_URL_Master}master-data/auth/login`, { username, password });
   // const response = await axios.post(`${API_URL_Master}master-data/auth/login`, { username, password });
    localStorage.setItem('jwtToken', response.data.token);
    localStorage.setItem('marketId', response.data.marketId);
    localStorage.setItem('roleId', response.data.roleId);
    localStorage.setItem('phoneNumber', response.data.phoneNumber);
    localStorage.setItem('userMasterId', response.data.userMasterId);
    localStorage.setItem('username', response.data.username);
    localStorage.setItem('firstName', response.data.firstName);
    localStorage.setItem('lastName', response.data.lastName);
    localStorage.setItem('email', response.data.emailId);
    localStorage.setItem('marketName', response.data.marketName);
    if(response.data.phoneNumber != null && response.data.phoneNumber != ""){
      localStorage.setItem('phoneNumber', response.data.phoneNumber);
    }else{
      localStorage.setItem('phoneNumber', "");
    }
    if(response.data.username != null && response.data.username != ""){
      localStorage.setItem('username', response.data.username);
    }else{
      localStorage.setItem('username', "");
    }
    if(response.data.firstName != null && response.data.firstName != ""){
      localStorage.setItem('firstName', response.data.firstName);
    }else{
      localStorage.setItem('firstName', "");
    }
    if(response.data.lastName != null && response.data.lastName != ""){
      localStorage.setItem('lastName', response.data.lastName);
    }else{
      localStorage.setItem('lastName', "");
    }
    if(response.data.marketName != null && response.data.marketName != ""){
      localStorage.setItem('marketName', response.data.marketName);
    }else{
      localStorage.setItem('marketName', "");
    }
    if(response.data.emailId != null && response.data.emailId != ""){
      localStorage.setItem('email', response.data.emailId);
    }else{
      localStorage.setItem('email', "");
    }
    if(response.data.godownId != null && response.data.godownId != ""){
      localStorage.setItem('godownId', response.data.godownId);
    }else{
      localStorage.setItem('godownId', "0");
    }
    if(response.data.userType != null && response.data.userType != ""){
      localStorage.setItem('userType', response.data.userType);
    }else{
      localStorage.setItem('userType', "0");
    }
    if(response.data.userTypeId != null && response.data.userTypeId != ""){
      localStorage.setItem('userTypeId', response.data.userTypeId);
    }else{
      localStorage.setItem('userTypeId', "0");
    }
    if(response.data.deviceId != null && response.data.deviceId != ""){
      localStorage.setItem('deviceId', response.data.deviceId);
    }else{
      localStorage.setItem('deviceId', "0");
    }
    localStorage.setItem('radius', response.data.radius);
    localStorage.setItem('marketLat', response.data.marketLat);
    localStorage.setItem('marketLongitude', response.data.marketLongitude);
    console.log(response.data.token)
  },

  logout: () => {
    localStorage.removeItem('jwtToken');
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('jwtToken');
    return token ? true : false;
  },

  getToken: () => {
    const token = localStorage.getItem('jwtToken');
    return token ? token : null;
  },
};

export default authService;
