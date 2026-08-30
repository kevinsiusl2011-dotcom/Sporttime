import { joinedNameLines, nameLines } from "@/lib/i18n/localize";
import type { Locale } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

export function BilingualName({
  value,
  values,
  locale,
  className,
  secondaryClassName,
}: {
  value?: string | null;
  values?: Array<string | null | undefined>;
  locale: Locale;
  className?: string;
  secondaryClassName?: string;
}) {
  const lines = values ? joinedNameLines(values, locale) : nameLines(value, locale);
  if (!lines.primary) return null;
  return (
    <span className={cn("block leading-snug", className)}>
      <span className="block">{lines.primary}</span>
      {lines.secondary ? (
        <span
          className={cn(
            "mt-0.5 block text-[0.78em] font-normal normal-case tracking-normal text-[var(--muted)]",
            secondaryClassName,
          )}
        >
          {lines.secondary}
        </span>
      ) : null}
    </span>
  );
}
