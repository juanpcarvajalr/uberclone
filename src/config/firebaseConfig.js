// AI-assisted: see docs/AI_LOG.md #29
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBlaWZGJep5lYeoKSWFiwbCRg3QVOP7IpE',
  authDomain: 'uberclone-70134.firebaseapp.com',
  projectId: 'uberclone-70134',
  storageBucket: 'uberclone-70134.firebasestorage.app',
  messagingSenderId: '710945507680',
  appId: '1:710945507680:web:f767c6b1a9b8bc15ec7605',
  measurementId: 'G-WKG4PK5JHW',
};

const app = initializeApp(firebaseConfig);

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);
