// // src/pages/ProtectedPage.jsx
// import { useEffect, useState } from 'react';
// import authService from '../services/authService';

// const ProtectedPage = () => {
//   const [data, setData] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const token = localStorage.getItem("jwtToken");
//         const result = await authService.getProtectedData(token);
//         setData(result);
//       } catch (error) {
//         console.error('Failed to fetch protected data:', error.message);
//       }
//     };

//     fetchData();
//   }, []);

//   return <div>{data ? `Protected Data: ${JSON.stringify(data)}` : 'Loading...'}</div>;
// };

// export default ProtectedPage;
