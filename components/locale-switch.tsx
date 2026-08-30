"use client";

export function LocaleSwitch({ locale, label }: { locale: string; label: string }) {
  async function setLocale(next: string) {
    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: next }),
    });
    window.location.reload();
  }

  return (
    <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
      <span>{label}</span>
      <select
        className="rounded-full border border-[var(--line)] bg-[var(--bg-elevated)] px-3 py-1 text-[var(--text)]"
        value={locale}
        onChange={(event) => setLocale(event.target.value)}
      >
        <option value="zh-Hant">繁體中文</option>
        <option value="zh-Hans">简体中文</option>
        <option value="en">English</option>
      </select>
    </label>
  );
}
