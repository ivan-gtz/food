// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// ATENCIÓN: REEMPLAZA ESTO CON TU PROPIA CONFIGURACIÓN DE FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyBjAdvMGwJZBxmlfL4l04iwHAvkcntYKi4",
  authDomain: "fastfoodvis.firebaseapp.com",
  projectId: "fastfoodvis",
  storageBucket: "fastfoodvis.firebasestorage.app",
  messagingSenderId: "781122392528",
  appId: "1:781122392528:web:5291e9a693ddcf70df29d5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the database service and auth service
const db = getFirestore(app);
const auth = getAuth(app);

// Export the instances to be used in other scripts
export { db, auth, signInWithEmailAndPassword, onAuthStateChanged, signOut };