# Sporttime

Put sports fixtures on your own calendar so you can plan the week around kickoff. Not a live-score app.

Live site: https://sporttime-delta.vercel.app

[繁體中文說明](#sporttime-繁體中文)

## What it does

- Browse a global featured catalogue (football worldwide and Asia, NBA, NFL, MLB, NHL, F1, MotoGP, tennis, cricket, rugby, UFC, and more).
- Search TheSportsDB for any other league, team, or athlete.
- See your week in Hong Kong time — what is on today, what overlaps — then subscribe with one private URL.
- Google and Apple Calendar refresh the feed on their own. No Google sign-in and no app verification.
- Traditional Chinese and English UI.

This calendar is for planning. It does not send live scores or match-progress notifications.

Off-field appearances (ads, signings) are not covered in v1. Official fixtures are.

## Quick start

```bash
cp .env.example .env.local
openssl rand -base64 32   # paste into AUTH_SECRET
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Add leagues or clubs, open Schedule, then add the calendar URL in Google Calendar.

# Sporttime（繁體中文）

公開網站：https://sporttime-delta.vercel.app

比賽入你日曆，幫你排生活。唔係睇波 App，唔提供即時比分。

朋友開條 link，揀賽事，複製日曆網址，喺 Google 日曆用「用網址加入」。唔使 Google 登入。

## 做得到咩

- 全球精選目錄：歐洲同亞洲足球、NBA、NFL、MLB、NHL、F1、MotoGP、網球、板球、欖球、UFC 等。
- 搜尋任何其他聯賽／球隊／運動員。
- 時間表用香港時間睇今個星期有邊場、會唔會撞期，再把專屬網址加入 Google 日曆。
- Google 會自己更新訂閱。唔使驗證 App。
- 介面繁中／英文。

運動員場外宣傳活動第一版未覆蓋。
