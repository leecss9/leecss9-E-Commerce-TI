// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, setDoc, getDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Configuración de Firebase usando variables de entorno
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export default firebaseConfig;

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Aquí van tus funciones exportadas, igual que antes

export const fetchProducts = async () => {
  const querySnapshot = await getDocs(collection(db, "productos"));
  const products = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return products;
};

export const uploadProductImage = async (file, fileName) => {
  const imageRef = ref(storage, `IMG Productos/${fileName}`);
  await uploadBytes(imageRef, file);
  const url = await getDownloadURL(imageRef);
  return url;
};

export const addProduct = async (productData, imageFile) => {
  const imageUrl = await uploadProductImage(imageFile, `${Date.now()}_${imageFile.name}`);
  const newProduct = {
    ...productData,
    imageUrl,
    createdAt: new Date(),
  };
  const docRef = await addDoc(collection(db, "productos"), newProduct);
  return docRef.id;
};

export const updateProduct = async (productId, updatedData, newImageFile = null) => {
  const productRef = doc(db, "productos", productId);

  if (newImageFile) {
    const newImageUrl = await uploadProductImage(newImageFile, `${Date.now()}_${newImageFile.name}`);
    updatedData.imageUrl = newImageUrl;
  }

  await updateDoc(productRef, updatedData);
};

export const deleteProduct = async (productId) => {
  const productRef = doc(db, "productos", productId);
  await deleteDoc(productRef);
};

export const loadKitItemsFromFirebase = async () => {
  const querySnapshot = await getDocs(collection(db, "kits"));
  const kitItems = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return kitItems;
};

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
  setDoc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  storage,
};
