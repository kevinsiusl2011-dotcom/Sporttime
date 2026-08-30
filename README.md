# Sporttime

Sports calendar you can open in a browser. Follow leagues, clubs, or athletes, then subscribe to a private calendar URL in Google Calendar.

Live site: https://sporttime-delta.vercel.app

[繁體中文說明](#sporttime-繁體中文)

## What it does

- Browse a global featured catalogue (football worldwide and Asia, NBA, NFL, MLB, NHL, F1, MotoGP, tennis, cricket, rugby, UFC, and more).
- Search TheSportsDB for any other league, team, or athlete.
- Preview upcoming fixtures, then add one URL in Google Calendar.
- Google Calendar refreshes the feed on its own. No Google sign-in and no app verification.
- Traditional Chinese and English UI.

Off-field appearances (ads, signings) are not covered in v1. Official fixtures are.

## Quick start

```bash
cp .env.example .env.local
openssl rand -base64 32   # paste into AUTH_SECRET
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Follow what you want, open Preview, then add the calendar URL in Google Calendar.

# Sporttime（繁體中文）

公開網站：https://sporttime-delta.vercel.app

朋友開條 link，揀喜好，複製日曆網址，喺 Google 日曆用「用網址加入」。唔使 Google 登入。

## 做得到咩

- 全球精選目錄：歐洲同亞洲足球、NBA、NFL、MLB、NHL、F1、MotoGP、網球、板球、欖球、UFC 等。
- 搜尋任何其他聯賽／球隊／運動員。
- 預覽未來賽事，再把專屬網址加入 Google 日曆。
- Google 會自己更新訂閱。唔使驗證 App。
- 介面繁中／英文。

運動員場外宣傳活動第一版未覆蓋。
