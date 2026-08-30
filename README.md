# Sporttime

Sports calendar you can open in a browser. Follow leagues, clubs, or athletes, then sync upcoming fixtures into a dedicated **Sporttime** calendar on your own Google account.

Hosted for anyone with the link. Each person signs in with their own Google account. The source is also on GitHub if you want to run your own copy.

[繁體中文說明](#sporttime-繁體中文)

## What it does

- Browse a global featured catalogue (football worldwide and Asia, NBA, NFL, MLB, NHL, F1, MotoGP, tennis, cricket, rugby, UFC, and more).
- Search TheSportsDB for any other league, team, or athlete.
- Preview kickoff, venue, and TBA times before writing anything.
- Create or update events on a dedicated calendar. Reschedules overwrite in place. Unfollowed events are removed.
- Encrypted Google refresh tokens in local SQLite.
- Traditional Chinese and English UI.

Off-field appearances (ads, signings) are not covered in v1. Official fixtures are.

## Quick start

```bash
cp .env.example .env.local
openssl rand -base64 32   # paste into AUTH_SECRET
```

Fill Google keys using [docs/setup-google.md](docs/setup-google.md), then:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). If that port is taken, Next.js will pick another (for example 3002) — set `AUTH_URL` to the same origin before you sign in with Google.

### Docker

```bash
cp .env.example .env
docker compose up --build
```

The `scheduler` service calls `/api/cron/refresh` every six hours so calendars stay current.

## Environment

| Variable | Purpose |
| --- | --- |
| `AUTH_SECRET` | Encrypts sessions and stored tokens |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Your OAuth Web client |
| `AUTH_URL` | Public URL of this instance |
| `THESPORTSDB_API_KEY` | Sports data. `3` is the shared test key |
| `CRON_SECRET` | Bearer token for the refresh endpoint |
| `DATABASE_PATH` | Optional SQLite path |

## Safety notes

- Tokens never leave the machine that runs this instance.
- Calendar writes use the least-privilege scopes we can: create an app calendar and manage events.
- Fixture times come from a community database and can be wrong or missing. Sporttime marks TBA kickoffs as all-day events.
- League artwork and names belong to their rights holders. This project is a personal calendar helper, not an official product of any league.

## License

MIT. See [LICENSE](LICENSE).

---

# Sporttime（繁體中文）

開源自架運動日曆。追蹤聯賽、球隊或運動員，未來賽程會寫入你自己 Google 帳號入面一個叫 **Sporttime** 嘅獨立日曆。

你行自己嘅實例，用自己把 Google OAuth 同 TheSportsDB key。冇中央伺服器，亦唔會代人保管日曆授權。

## 做得到咩

- 全球精選目錄：歐洲同亞洲足球、NBA、NFL、MLB、NHL、F1、MotoGP、網球、板球、欖球、UFC 等。
- 搜尋任何其他聯賽／球隊／運動員。
- 預覽先，確認先同步。
- 改期會更新同一項活動；唔再追蹤就刪走。
- Google token 加密存本地 SQLite。
- 介面繁中／英文。

運動員場外宣傳活動第一版未覆蓋。

## 開始

跟 [docs/setup-google.zh-Hant.md](docs/setup-google.zh-Hant.md) 開 Google Cloud，然後：

```bash
cp .env.example .env.local
npm install
npm run dev
```
