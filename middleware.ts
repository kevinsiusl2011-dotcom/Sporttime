import { NextResponse, type NextRequest } from "next/server";
import { SignJWT, jwtVerify } from "jose";

const COOKIE = "sporttime_session";
const SESSION_HEADER = "x-sporttime-session";
const SESSION_TTL = "400d";
const SESSION_MAX_AGE = 60 * 60 * 24 * 400;
const REFRESH_WITHIN = 60 * 60 * 24 * 30;

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 16) return null;
  return new TextEncoder().encode(value);
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

async function issueToken(
  key: Uint8Array,
  user: { id: unknown; email?: unknown; name?: unknown; image?: unknown },
) {
  return new SignJWT({
    id: user.id,
    email: user.email ?? null,
    name: user.name ?? null,
    image: user.image ?? null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(key);
}

function skipGuestSession(pathname: string) {
  return (
    pathname.startsWith("/api/calendar") ||
    pathname.startsWith("/api/cron") ||
    pathname.startsWith("/api/health")
  );
}

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete(SESSION_HEADER);

  if (skipGuestSession(request.nextUrl.pathname)) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const key = secret();
  if (!key) return NextResponse.next({ request: { headers: requestHeaders } });

  const existing = request.cookies.get(COOKIE)?.value;
  if (existing) {
    try {
      const { payload } = await jwtVerify(existing, key);
      if (payload.id) {
        const exp = typeof payload.exp === "number" ? payload.exp : 0;
        const now = Math.floor(Date.now() / 1000);
        if (exp - now > REFRESH_WITHIN) {
          return NextResponse.next({ request: { headers: requestHeaders } });
        }
        const token = await issueToken(key, {
          id: payload.id,
          email: payload.email,
          name: payload.name,
          image: payload.image,
        });
        requestHeaders.set(SESSION_HEADER, token);
        const response = NextResponse.next({ request: { headers: requestHeaders } });
        response.cookies.set(COOKIE, token, cookieOptions());
        return response;
      }
    } catch {
      // issue a fresh guest session
    }
  }

  const id = crypto.randomUUID();
  const token = await issueToken(key, {
    id,
    email: `guest-${id}@sporttime.local`,
    name: null,
    image: null,
  });
  requestHeaders.set(SESSION_HEADER, token);

  const isApi = request.nextUrl.pathname.startsWith("/api/");
  const response =
    !isApi && request.method === "GET"
      ? NextResponse.redirect(request.nextUrl)
      : NextResponse.next({ request: { headers: requestHeaders } });
  response.cookies.set(COOKIE, token, cookieOptions());
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
