import { getAnalytics, isSupported } from "firebase/analytics";
import type { Analytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyAKYvy32HSuPDmnBnXReqMP-XhH9khBRIU",
  authDomain: "guestpass-79670.firebaseapp.com",
  projectId: "guestpass-79670",
  storageBucket: "guestpass-79670.firebasestorage.app",
  messagingSenderId: "1048859856317",
  appId: "1:1048859856317:web:b813245809a065cc96d6d4",
  measurementId: "G-F4NC86SGB5",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

const functions = getFunctions(app);
export const callCreateInvite = httpsCallable<
  {
    guest: {
      name: string;
      email: string;
      phone?: string;
      notes?: string;
    };
    event?: {
      id?: string;
      name?: string;
      date?: string;
      location?: string;
    };
    plusOnes?: number;
  },
  {
    guestId: string;
    inviteCode: string;
    accessCode: string;
    qrUrl: string;
    pdfUrl: string;
    guest: {
      name: string;
      email: string;
    };
    event: {
      id: string;
      name: string;
      date: string | null;
      location: string | null;
    };
  }
>(functions, "createInvite");

export let analytics: Analytics | undefined;

if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {
      analytics = undefined;
    });
}