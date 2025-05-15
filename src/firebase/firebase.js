import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, setDoc, getDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// ✅ Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB3PdJVaf-BJzFKEcKa5eIwU6x8rxFgOqk",
  authDomain: "e-comerceti.firebaseapp.com",
  projectId: "e-comerceti",
  storageBucket: "e-comerceti.firebasestorage.app",
  databaseURL: "https://e-comerceti-default-rtdb.firebaseio.com",
  messagingSenderId: "758710169146",
  appId: "1:758710169146:web:024362d2458fd82370cf03",
  measurementId: "G-2WR9T5DNDV"
};

// ✅ Inicializar Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ✅ Obtener productos
export const fetchProducts = async () => {
  const querySnapshot = await getDocs(collection(db, 'productos'));
  const products = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  return products;
};

// ✅ Subir imagen al Storage
export const uploadProductImage = async (file, fileName) => {
  const imageRef = ref(storage, `IMG Productos/${fileName}`);
  await uploadBytes(imageRef, file);
  const url = await getDownloadURL(imageRef);
  return url;
};

// ✅ Agregar producto con imagen
export const addProduct = async (productData, imageFile) => {
  const imageUrl = await uploadProductImage(imageFile, `${Date.now()}_${imageFile.name}`);
  const newProduct = {
    ...productData,
    imageUrl,
    createdAt: new Date()
  };
  const docRef = await addDoc(collection(db, 'productos'), newProduct);
  return docRef.id;
};

// ✅ Actualizar producto (con o sin nueva imagen)
export const updateProduct = async (productId, updatedData, newImageFile = null) => {
  const productRef = doc(db, 'productos', productId);

  if (newImageFile) {
    const newImageUrl = await uploadProductImage(newImageFile, `${Date.now()}_${newImageFile.name}`);
    updatedData.imageUrl = newImageUrl;
  }

  await updateDoc(productRef, updatedData);
};

// ✅ Eliminar producto
export const deleteProduct = async (productId) => {
  const productRef = doc(db, 'productos', productId);
  await deleteDoc(productRef);
};

// ✅ Obtener los ítems del kit desde Firebase
export const loadKitItemsFromFirebase = async () => {
  const querySnapshot = await getDocs(collection(db, 'kits')); // Cambia 'kits' por el nombre real de tu colección
  const kitItems = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  return kitItems;
};


// ✅ Exportar todo lo necesario
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
  storage
};
