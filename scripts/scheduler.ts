export {};

const base = process.env.AUTH_URL ?? "http://localhost:3000";
const secret = process.env.CRON_SECRET;

if (!secret) {
  console.error("CRON_SECRET is required");
  process.exit(1);
}

const intervalMs = Number(process.env.SYNC_INTERVAL_MS ?? 6 * 60 * 60 * 1000);

async function tick() {
  const response = await fetch(`${base}/api/cron/refresh`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}` },
  });
  const body = await response.text();
  console.log(new Date().toISOString(), response.status, body);
}

await tick();
setInterval(() => {
  void tick();
}, intervalMs);
