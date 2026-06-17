// firebase/firebase-config.js

import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import { getAuth }
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import { getFirestore }
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAigRPsSqSrp2VGczliTdDZOu67nB4eblw",
  authDomain: "rmims-7c156.firebaseapp.com",
  projectId: "rmims-7c156",
  storageBucket: "rmims-7c156.firebasestorage.app",
  messagingSenderId: "45025697331",
  appId: "1:45025697331:web:f12ab86158691a17aa4d46"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;