import { NextResponse, type NextRequest } from "next/server";
import { SignJWT, jwtVerify } from "jose";

const COOKIE = "sporttime_session";

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 16) return null;
  return new TextEncoder().encode(value);
}

export async function middleware(request: NextRequest) {
  const key = secret();
  if (!key) return NextResponse.next();

  const existing = request.cookies.get(COOKIE)?.value;
  if (existing) {
    try {
      const { payload } = await jwtVerify(existing, key);
      if (payload.id) return NextResponse.next();
    } catch {
      // issue a fresh guest session
    }
  }

  const id = crypto.randomUUID();
  const token = await new SignJWT({
    id,
    email: `guest-${id}@sporttime.local`,
    name: null,
    image: null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("400d")
    .sign(key);

  const response = request.method === "GET"
    ? NextResponse.redirect(request.nextUrl)
    : NextResponse.next();
  response.cookies.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 400,
  });
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
