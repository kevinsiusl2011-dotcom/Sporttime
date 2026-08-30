import { completeGoogleLogin } from "@/lib/auth/account";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    idToken?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  };

  if (!body.idToken) {
    return Response.json({ error: "Missing id token" }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const lookup = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: body.idToken }),
  });
  const data = (await lookup.json()) as {
    users?: Array<{ email?: string; displayName?: string; photoUrl?: string }>;
    error?: { message?: string };
  };
  const profile = data.users?.[0];
  const email = profile?.email || body.email;
  if (!lookup.ok || !email) {
    return Response.json({ error: data.error?.message ?? "Invalid Google session" }, { status: 401 });
  }

  const guest = await getSession();
  await completeGoogleLogin({
    email,
    name: body.name || profile?.displayName || null,
    image: body.image || profile?.photoUrl || null,
    accessToken: body.accessToken,
    refreshToken: body.refreshToken,
    expiresIn: body.expiresIn,
    guestUserId: guest?.user?.id,
  });

  return Response.json({ ok: true });
}
