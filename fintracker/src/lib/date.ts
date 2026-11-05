const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const monthName = (d: Date) => MONTHS[d.getMonth()];
export const monthShort = (d: Date) => MONTHS[d.getMonth()].slice(0, 3);

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function addDays(d: Date, days: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
}

export function startOfMonth(d: Date, offset = 0): Date {
  return new Date(d.getFullYear(), d.getMonth() + offset, 1);
}

export function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function daysInMonth(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function shortDate(d: Date): string {
  return `${DAYS[d.getDay()]}, ${monthShort(d)} ${d.getDate()}`;
}

/** "Today", "Yesterday" or "Tue, Nov 3". */
export function dayLabel(d: Date, now = new Date()): string {
  if (isSameDay(d, now)) return 'Today';
  if (isSameDay(d, addDays(now, -1))) return 'Yesterday';
  return shortDate(d);
}

export function timeLabel(d: Date): string {
  const h = d.getHours();
  const m = d.getMinutes();
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

export function fullDateTime(d: Date): string {
  return `${shortDate(d)}, ${d.getFullYear()} · ${timeLabel(d)}`;
}

export function monthYear(d: Date): string {
  return `${monthShort(d)} ${d.getFullYear()}`;
}

/** "2h", "5h", "Nov 3": a compact age for notifications. */
export function ago(d: Date, now = new Date()): string {
  const mins = Math.max(0, Math.round((now.getTime() - d.getTime()) / 60000));
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24 && isSameDay(d, now)) return `${hours}h`;
  return `${monthShort(d)} ${d.getDate()}`;
}

export function greeting(now = new Date()): string {
  const h = now.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/** Months between two dates, at least 1 (used for "save X a month"). */
export function monthsUntil(target: Date, now = new Date()): number {
  const m = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
  return Math.max(1, m);
}
