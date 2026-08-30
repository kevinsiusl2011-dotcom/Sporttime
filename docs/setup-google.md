# Google Calendar setup

Sporttime writes fixtures into a dedicated Google Calendar named **Sporttime**. Each person who runs an instance must create their own Google Cloud OAuth client. You do not submit this app for public Google verification if you only use it yourself or with a few test users.

## 1. Create a Google Cloud project

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project, for example `sporttime-local`.
3. Open **APIs & Services → Library**.
4. Enable **Google Calendar API**.

## 2. Configure the OAuth consent screen

1. Open **APIs & Services → OAuth consent screen**.
2. User type: **External**.
3. App name: `Sporttime`.
4. Add your email as the developer contact.
5. Scopes:
   - `openid`
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `https://www.googleapis.com/auth/calendar.app.created`
   - `https://www.googleapis.com/auth/calendar.events`
6. Publishing status can stay **Testing**.
7. Under **Test users**, add the Gmail accounts that will sign in.

Testing mode is enough for self-hosting. Google shows an unverified-app warning; click **Advanced → Go to Sporttime**.

## 3. Create a Web client

1. **APIs & Services → Credentials → Create credentials → OAuth client ID**.
2. Application type: **Web application**.
3. Authorized JavaScript origins:
   - `http://localhost:3000`
4. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
5. If you later put the app on your own domain, add that origin and `https://YOUR_DOMAIN/api/auth/callback/google`.
6. Copy the client ID and client secret into `.env.local`:

```
AUTH_GOOGLE_ID=....apps.googleusercontent.com
AUTH_GOOGLE_SECRET=...
AUTH_URL=http://localhost:3000
AUTH_SECRET=   # openssl rand -base64 32
```

## 4. TheSportsDB

Register at [thesportsdb.com](https://www.thesportsdb.com/) and put your key in `THESPORTSDB_API_KEY`. The public test key `3` works for a first local try but is shared and rate-limited.

## 5. Run

```bash
cp .env.example .env.local
# fill the values
npm install
npm run dev
```

Open http://localhost:3000, sign in, follow leagues or teams, open **Preview**, then **Sync to Calendar**.
