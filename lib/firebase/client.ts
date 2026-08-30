"use client";

import { FirebaseError, initializeApp, getApps } from "firebase/app";
import {
  GoogleAuthProvider,
  browserPopupRedirectResolver,
  getAuth,
  indexedDBLocalPersistence,
  getRedirectResult,
  initializeAuth,
  signInWithRedirect,
  type Auth,
  type UserCredential,
} from "firebase/auth";
import type { Locale } from "@/lib/i18n/dictionaries";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

let auth: Auth | null = null;

export function getFirebaseAuth() {
  if (auth) return auth;
  const app = getApps()[0] ?? initializeApp(firebaseConfig);
  try {
    auth = initializeAuth(app, {
      persistence: indexedDBLocalPersistence,
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  } catch {
    auth = getAuth(app);
  }
  return auth;
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

export function explainSignInError(err: unknown, locale: Locale = "zh-Hant"): string {
  const code = firebaseErrorCode(err);
  const zh: Record<string, string> = {
    "auth/unauthorized-domain": "呢個網址未獲授權。請用 https://sporttime-delta.vercel.app 再開一次。",
    "auth/popup-blocked": "瀏覽器擋住彈窗。而家會改用整頁跳去 Google，請再撳一次。",
    "auth/popup-closed-by-user": "登入視窗被關閉。請再試一次，並批准日曆權限。",
    "auth/cancelled-popup-request": "登入已取消，請再撳一次。",
    "auth/internal-error": "Google 登入中斷。請關閉擋廣告外掛，用 Chrome 開 https://sporttime-delta.vercel.app 再試。",
    "auth/operation-not-allowed": "呢個專案未開啟 Google 登入。",
    "auth/unauthorized-continue-uri": "回跳網址未授權。請用 https://sporttime-delta.vercel.app",
    "auth/invalid-api-key": "Firebase 金鑰無效，網站設定未完成。",
    "auth/network-request-failed": "網絡中斷，請檢查連線再試。",
    "auth/argument-error": "登入設定有誤，請重新整理頁面再試。",
    "auth/invalid-oauth-client-id": "Google 登入用戶端未授權呢個網站。",
    "auth/invalid-credential": "Google 憑證無效，請再登入一次。",
    "auth/web-storage-unsupported": "瀏覽器封鎖咗儲存空間。請關閉無痕模式或允許 cookie。",
    "auth/user-cancelled": "你取消咗授權。要寫入日曆需要批准日曆權限。",
    "auth/missing-or-invalid-nonce": "登入階段已過期，請再撳一次。",
    "auth/redirect-cancelled-by-user": "登入被取消，請再撳一次。",
    "auth/account-exists-with-different-credential": "呢個電郵已用其他方式註冊。",
  };
  const en: Record<string, string> = {
    "auth/unauthorized-domain": "This address is not authorized. Open https://sporttime-delta.vercel.app and try again.",
    "auth/popup-blocked": "The browser blocked the Google sign-in window. Allow pop-ups and try again.",
    "auth/popup-closed-by-user": "The sign-in window was closed. Try again and approve calendar access.",
    "auth/cancelled-popup-request": "Sign-in was cancelled. Tap the button again.",
    "auth/internal-error": "Google sign-in was interrupted. Disable ad blockers and try Chrome at https://sporttime-delta.vercel.app",
    "auth/operation-not-allowed": "Google sign-in is disabled on this Firebase project.",
    "auth/unauthorized-continue-uri": "The return address is not authorized. Use https://sporttime-delta.vercel.app",
    "auth/invalid-api-key": "The Firebase key is invalid. The site is not fully configured.",
    "auth/network-request-failed": "Network error. Check your connection and try again.",
    "auth/argument-error": "Sign-in is misconfigured. Refresh the page and try again.",
    "auth/invalid-oauth-client-id": "This site is not authorized on the Google OAuth client.",
    "auth/invalid-credential": "The Google credential was rejected. Please sign in again.",
    "auth/web-storage-unsupported": "The browser blocked storage. Disable private mode or allow cookies.",
    "auth/user-cancelled": "Permission was denied. Calendar access is required to write fixtures.",
    "auth/missing-or-invalid-nonce": "The sign-in session expired. Tap the button again.",
    "auth/redirect-cancelled-by-user": "Sign-in was cancelled. Tap the button again.",
    "auth/account-exists-with-different-credential": "This email is already registered another way.",
  };
  const table = locale === "en" ? en : zh;
  if (code && table[code]) return table[code];
  const raw = err instanceof Error ? err.message : "";
  if (raw && !raw.startsWith("Firebase:")) return raw;
  const suffix = code ? `（${code}）` : "";
  return locale === "en"
    ? `Google sign-in failed. Please try again.${suffix}`
    : locale === "zh-Hans"
      ? `Google 登录失败，请再试一次。${suffix}`
      : `Google 登入失敗，請再試一次。${suffix}`;
}

const PENDING_KEY = "sporttime_auth_pending";

export async function startGoogleSignIn() {
  if (!firebaseConfig.apiKey || !firebaseConfig.authDomain) {
    throw new Error("Firebase is not configured");
  }
  sessionStorage.setItem(PENDING_KEY, "1");
  await signInWithRedirect(getFirebaseAuth(), googleProvider(true));
}

let redirectAttempt: Promise<GoogleSignInPayload | null> | undefined;

export function completeGoogleRedirect() {
  if (!redirectAttempt) {
    redirectAttempt = (async () => {
      const result = await getRedirectResult(getFirebaseAuth());
      sessionStorage.removeItem(PENDING_KEY);
      return result ? payloadFromResult(result) : null;
    })().catch((err) => {
      sessionStorage.removeItem(PENDING_KEY);
      redirectAttempt = undefined;
      throw err;
    });
  }
  return redirectAttempt;
}

export function hasPendingGoogleRedirect() {
  try {
    return sessionStorage.getItem(PENDING_KEY) === "1";
  } catch {
    return false;
  }
}

export function reportSignInError(err: unknown) {
  const code = firebaseErrorCode(err);
  const message = err instanceof Error ? err.message : String(err);
  void fetch("/api/auth/client-error", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, message }),
  }).catch(() => undefined);
}
