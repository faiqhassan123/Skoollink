import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA7h8y8iBwhsUV36HBGbQr3-ujpVpBih50",
  authDomain: "skoollink-9f947.firebaseapp.com",
  databaseURL: "https://skoollink-9f947-default-rtdb.firebaseio.com",
  projectId: "skoollink-9f947",
  storageBucket: "skoollink-9f947.appspot.com",
  messagingSenderId: "897815604173",
  appId: "1:897815604173:web:45cd560d05169b8618f284"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

export default app;
