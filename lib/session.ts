import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";

const COOKIE = "sporttime_session";
const SESSION_HEADER = "x-sporttime-session";

export type SessionUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
};

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is required");
  return new TextEncoder().encode(value);
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("400d")
    .sign(secret());

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 400,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function getSession(): Promise<{ user: SessionUser } | null> {
  const token = (await cookies()).get(COOKIE)?.value ?? (await headers()).get(SESSION_HEADER);
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.id) return null;
    return {
      user: {
        id: String(payload.id),
        email: payload.email ? String(payload.email) : null,
        name: payload.name ? String(payload.name) : null,
        image: payload.image ? String(payload.image) : null,
      },
    };
  } catch {
    return null;
  }
}
