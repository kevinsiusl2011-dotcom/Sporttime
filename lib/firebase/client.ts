"use client";

import { FirebaseError, initializeApp, getApps } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
  type UserCredential,
} from "firebase/auth";

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

export type GoogleSignInPayload = {
  idToken: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  email: string | null;
  name: string | null;
  image: string | null;
};

function googleProvider(withCalendar: boolean) {
  const provider = new GoogleAuthProvider();
  if (withCalendar) {
    for (const scope of CALENDAR_SCOPES) provider.addScope(scope);
  }
  provider.setCustomParameters({ prompt: "select_account" });
  return provider;
}

async function payloadFromResult(result: UserCredential): Promise<GoogleSignInPayload> {
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const extra = result as typeof result & {
    _tokenResponse?: {
      oauthAccessToken?: string;
      oauthRefreshToken?: string;
      oauthExpireIn?: number;
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

export function firebaseErrorCode(err: unknown): string {
  if (err instanceof FirebaseError) return err.code;
  if (typeof err === "object" && err && "code" in err) return String((err as { code: string }).code);
  return "";
}

const POPUP_FAILURES = new Set([
  "auth/popup-blocked",
  "auth/popup-closed-by-user",
  "auth/cancelled-popup-request",
  "auth/internal-error",
]);

export function explainSignInError(err: unknown, locale: "zh-Hant" | "en" = "zh-Hant"): string {
  const code = firebaseErrorCode(err);
  const zh: Record<string, string> = {
    "auth/unauthorized-domain": "呢個網址未獲授權。請用 https://sporttime-delta.vercel.app 再開一次。",
    "auth/popup-blocked": "瀏覽器擋住咗 Google 登入視窗。請允許彈出視窗，再撳一次。",
    "auth/popup-closed-by-user": "登入視窗被關閉。請再試一次，並批准日曆權限。",
    "auth/cancelled-popup-request": "登入已取消，請再撳一次。",
    "auth/internal-error": "Google 登入失敗。請關閉擋廣告外掛，或改用 Chrome 再開 https://sporttime-delta.vercel.app",
    "auth/operation-not-allowed": "呢個專案未開啟 Google 登入。",
    "auth/unauthorized-continue-uri": "回跳網址未授權。請用 https://sporttime-delta.vercel.app",
    "auth/invalid-api-key": "Firebase 金鑰無效，網站設定未完成。",
    "auth/network-request-failed": "網絡中斷，請檢查連線再試。",
  };
  const en: Record<string, string> = {
    "auth/unauthorized-domain": "This address is not authorized. Open https://sporttime-delta.vercel.app and try again.",
    "auth/popup-blocked": "The browser blocked the Google sign-in window. Allow pop-ups and try again.",
    "auth/popup-closed-by-user": "The sign-in window was closed. Try again and approve calendar access.",
    "auth/cancelled-popup-request": "Sign-in was cancelled. Tap the button again.",
    "auth/internal-error": "Google sign-in failed. Disable ad blockers or try Chrome at https://sporttime-delta.vercel.app",
    "auth/operation-not-allowed": "Google sign-in is disabled on this Firebase project.",
    "auth/unauthorized-continue-uri": "The return address is not authorized. Use https://sporttime-delta.vercel.app",
    "auth/invalid-api-key": "The Firebase key is invalid. The site is not fully configured.",
    "auth/network-request-failed": "Network error. Check your connection and try again.",
  };
  const table = locale === "en" ? en : zh;
  if (code && table[code]) return table[code];
  if (err instanceof Error && err.message && !err.message.startsWith("Firebase:")) return err.message;
  return locale === "en"
    ? "Google sign-in failed. Please try again."
    : "Google 登入失敗，請再試一次。";
}

let redirectResult: Promise<GoogleSignInPayload | null> | null = null;

export function completeRedirectSignIn() {
  if (!redirectResult) {
    redirectResult = getRedirectResult(getFirebaseAuth())
      .then((result) => (result ? payloadFromResult(result) : null))
      .catch((err) => {
        redirectResult = null;
        throw err;
      });
  }
  return redirectResult;
}

export async function signInWithGoogleCalendar(): Promise<GoogleSignInPayload> {
  const auth = getFirebaseAuth();
  const redirected = await completeRedirectSignIn();
  if (redirected) return redirected;

  try {
    return await payloadFromResult(await signInWithPopup(auth, googleProvider(true)));
  } catch (err) {
    const code = firebaseErrorCode(err);
    if (code === "auth/internal-error") {
      try {
        return await payloadFromResult(await signInWithPopup(auth, googleProvider(false)));
      } catch (retryErr) {
        if (POPUP_FAILURES.has(firebaseErrorCode(retryErr))) {
          await signInWithRedirect(auth, googleProvider(true));
          await new Promise(() => undefined);
        }
        throw retryErr;
      }
    }
    if (POPUP_FAILURES.has(code)) {
      await signInWithRedirect(auth, googleProvider(true));
      await new Promise(() => undefined);
    }
    throw err;
  }
}
