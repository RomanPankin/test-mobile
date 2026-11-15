import { dateInWords } from "./calendarNames";

/**
 * "3 days ago", in the app's language - how long ago reads faster than a date - and the plain
 * date once it is older than a few weeks, where "7 months ago" says less than "12 Mar".
 * Without `Intl.RelativeTimeFormat` (an old engine) the date is said instead.
 */
const STEPS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
];

const FOUR_WEEKS = 4 * 604800;

export function commentDate(iso: string, language: string | null): string {
  const date = new Date(iso);
  const seconds = (date.getTime() - Date.now()) / 1000;
  const locale = language ?? undefined;

  try {
    if (Math.abs(seconds) < FOUR_WEEKS) {
      const format = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

      for (const [unit, size] of STEPS) {
        if (Math.abs(seconds) >= size) {
          return format.format(Math.round(seconds / size), unit);
        }
      }

      return format.format(0, "second");
    }
  } catch {
    // No relative words here: the date below says it.
  }

  const otherYear = date.getFullYear() !== new Date().getFullYear();

  try {
    return (
      dateInWords(date, language, { year: otherYear }) ??
      date.toLocaleDateString(locale, {
        day: "numeric",
        month: "short",
        ...(otherYear ? { year: "numeric" } : {}),
      })
    );
  } catch {
    return date.toISOString().slice(0, 10);
  }
}
