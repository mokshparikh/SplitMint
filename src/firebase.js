// Firebase core
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA4kc9Y3HfMs8SJUfg5rzPyLV1sWlHThbs",
  authDomain: "splitmint-c3674.firebaseapp.com",
  projectId: "splitmint-c3674",
  storageBucket: "splitmint-c3674.firebasestorage.app",
  messagingSenderId: "377477533418",
  appId: "1:377477533418:web:3ffb1e8bc4044f1ca59193",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);