import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  signOut, 
  signInAnonymously,
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
// Add Workspace OAuth scopes
googleProvider.addScope('https://www.googleapis.com/auth/spreadsheets');
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');

const githubProvider = new GithubAuthProvider();
githubProvider.addScope('read:user');
githubProvider.addScope('user:email');

// In-memory access token cache for Google Workspace APIs (NEVER store in localStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Clear cached token on sign out
onAuthStateChanged(auth, (user) => {
  if (!user && !isSigningIn) {
    cachedAccessToken = null;
  }
});

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export async function loginWithGoogle(): Promise<{ user: User; accessToken: string | null } | null> {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      cachedAccessToken = credential.accessToken;
    }
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      console.log('Google Sign-in popup closed by user.');
      return null;
    }
    console.error('Google Sign-in failed:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
}

export async function loginWithGithub() {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    return result.user;
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      console.log('GitHub Sign-in popup closed by user.');
      return null;
    }
    console.error('GitHub Sign-in failed:', error);
    throw error;
  }
}

export async function loginAsGuest() {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error: any) {
    console.error('Guest login failed:', error);
    throw error;
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
    cachedAccessToken = null;
  } catch (error) {
    console.error('Sign out error:', error);
  }
}
