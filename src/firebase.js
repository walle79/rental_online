import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyBm0mv918PewbLFicGoMlldobKMh-4rtgA',
  authDomain: 'rentalonlinekaito.firebaseapp.com',
  projectId: 'rentalonlinekaito',
  storageBucket: 'rentalonlinekaito.firebasestorage.app',
  messagingSenderId: '370597916297',
  appId: '1:370597916297:web:fe3cd4fb4e6aef549f6058',
  measurementId: 'G-DW9DV4GJSM'
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);

export { app, analytics, db, rtdb };
