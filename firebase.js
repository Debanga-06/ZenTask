import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAApPwEi070kUWjYbQgsRQNDezEDMvfBhg",
    authDomain: "zentask-e77e2.firebaseapp.com",
    projectId: "zentask-e77e2",
    storageBucket: "zentask-e77e2.firebasestorage.app",
    messagingSenderId: "805750382480",
    appId: "1:805750382480:web:7cff2db6e202e9608a9d15",
    measurementId: "G-09HNBD5LGH"
  };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);