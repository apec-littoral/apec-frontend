import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

export const firebaseConfig = {
  apiKey: 'AIzaSyARK78b5pL0k3i5ZZciqZkNWzuNUtt7eNk',
  authDomain: 'apec-lit.firebaseapp.com',
  projectId: 'apec-lit',
  storageBucket: 'apec-lit.firebasestorage.app',
  messagingSenderId: '83333587360',
  appId: '1:83333587360:web:30363f68c89510fa6ec4c5',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
auth.languageCode = 'fr';
