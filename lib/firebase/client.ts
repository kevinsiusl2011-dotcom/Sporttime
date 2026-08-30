"use client";

import { initializeApp, getApps } from "firebase/app";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

export function getFirebaseAuth() {
  const app = getApps()[0] ?? initializeApp(firebaseConfig);
  return getAuth(app);
}

export const CALENDAR_SCOPES = [
  "https://www.googleapis.com/auth/calendar.app.created",
  "https://www.googleapis.com/auth/calendar.events",
];

export async function signInWithGoogleCalendar() {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  for (const scope of CALENDAR_SCOPES) provider.addScope(scope);
  provider.setCustomParameters({ access_type: "offline", prompt: "consent" });

  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const extra = result as typeof result & {
    _tokenResponse?: {
      oauthAccessToken?: string;
      oauthRefreshToken?: string;
      oauthExpireIn?: number;
      refreshToken?: string;
    };
  };

  return {
    idToken: await result.user.getIdToken(),
    accessToken: extra._tokenResponse?.oauthAccessToken || credential?.accessToken || "",
    refreshToken: extra._tokenResponse?.oauthRefreshToken || "",
    expiresIn: extra._tokenResponse?.oauthExpireIn ?? 3600,
    email: result.user.email,
    name: result.user.displayName,
    image: result.user.photoURL,
  };
}
