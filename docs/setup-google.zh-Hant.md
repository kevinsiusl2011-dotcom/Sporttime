# Google 日曆設定

Sporttime 會建立一個叫 **Sporttime** 嘅獨立日曆，再把賽程寫入去。每個自架嘅人要用**自己**嘅 Google Cloud OAuth 用戶端。只係自己或幾個測試用戶用，唔使交 Google 公開驗證。

## 1. 開 Google Cloud 專案

1. 去 [Google Cloud Console](https://console.cloud.google.com/)。
2. 開一個專案，例如 `sporttime-local`。
3. **API 和服務 → 資訊庫**。
4. 啟用 **Google Calendar API**。

## 2. OAuth 同意畫面

1. **API 和服務 → OAuth 同意畫面**。
2. 外部使用者。
3. 應用程式名稱填 `Sporttime`。
4. 開發者電郵填你自己。
5. 範圍：
   - `openid`
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `https://www.googleapis.com/auth/calendar.app.created`
   - `https://www.googleapis.com/auth/calendar.events`
6. 發布狀態可以留 **測試**。
7. **測試使用者**加入會登入嘅 Gmail。

測試模式已夠自架用。Google 可能顯示未驗證警告，撳 **進階 → 前往 Sporttime** 就得。

## 3. 建立 Web 用戶端

1. **憑證 → 建立憑證 → OAuth 用戶端 ID**。
2. 應用程式類型揀 **Web 應用程式**。
3. 授權的 JavaScript 來源：`http://localhost:3000`
4. 授權的重新導向 URI：`http://localhost:3000/api/auth/callback/google`
5. 之後如果用自己域名，一齊加個域名同 `https://你的域名/api/auth/callback/google`。
6. 把用戶端 ID／密鑰填入 `.env.local`。

```
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_URL=http://localhost:3000
AUTH_SECRET=   # openssl rand -base64 32
```

## 4. TheSportsDB

去 [thesportsdb.com](https://www.thesportsdb.com/) 申請自己把 key，填 `THESPORTSDB_API_KEY`。第一次本機試可以用測試 key `3`，但呢把 key 係共用而且容易超額。

## 5. 行

```bash
cp .env.example .env.local
npm install
npm run dev
```

開 http://localhost:3000，登入，追蹤聯賽或球隊，入 **預覽賽程**，再撳 **同步到日曆**。
