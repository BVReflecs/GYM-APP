/** Shared date helpers. */

/** Timestamp for the Monday 00:00 of the week containing `from` (default: now). */
export function startOfWeek(from: number = Date.now()): number {
  const d = new Date(from);
  const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d.getTime();
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Consecutive weeks (counting back from the current week) with at least one
 * workout. The current week counts if it already has a workout; otherwise the
 * streak starts at the previous week so it doesn't reset mid-week.
 */
export function weeklyStreak(dates: number[]): number {
  if (dates.length === 0) return 0;
  const weeks = new Set(dates.map((d) => startOfWeek(d)));
  let cursor = startOfWeek();
  if (!weeks.has(cursor)) cursor -= WEEK_MS; // current week not trained yet
  let streak = 0;
  while (weeks.has(cursor)) {
    streak += 1;
    cursor -= WEEK_MS;
  }
  return streak;
}

/** 65 -> "1:05", 3921 -> "1:05:21". */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
  const ss = String(sec).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
