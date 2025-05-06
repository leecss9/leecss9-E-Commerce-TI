import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore'; // Importar getDoc

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAJdYcewr5fZWjxVZKbHfKhbEmHG7vrrBE",
  authDomain: "store-ti.firebaseapp.com",
  databaseURL: "https://store-ti-default-rtdb.firebaseio.com",
  projectId: "store-ti",
  storageBucket: "store-ti.firebasestorage.app",
  messagingSenderId: "962013358157",
  appId: "1:962013358157:web:4e5953624807f715641404",
  measurementId: "G-Q7K558TNKD"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Función para obtener productos desde Firestore
const fetchProducts = async () => {
  const productsCol = collection(db, "productos"); // Asegúrate de que la colección se llama 'productos'
  const productSnapshot = await getDocs(productsCol);
  const productList = productSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  return productList;
};

// Exportar todas las funciones necesarias en una sola declaración
export {
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup, 
  db, 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc,
  getDoc, // Exportamos getDoc
  fetchProducts // Exportamos fetchProducts una sola vez aquí
};
