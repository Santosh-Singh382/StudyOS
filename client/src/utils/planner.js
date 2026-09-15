export function toDateKey(date) {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function todayKey() {
  return toDateKey(new Date());
}

export function parseDateKey(key) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key || '');
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]) - 1;
  const day = Number(m[3]);
  const date = new Date(year, month, day);
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return null;
  }
  return date;
}

export function addDays(key, amount) {
  const date = parseDateKey(key);
  if (!date) return key;
  date.setDate(date.getDate() + amount);
  return toDateKey(date);
}

export function formatPlannerDate(key) {
  const date = parseDateKey(key);
  if (!date) return '';
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

export function formatShortDateKey(key) {
  const date = parseDateKey(key);
  if (!date) return '';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatWeekdayShort(key) {
  const date = parseDateKey(key);
  if (!date) return '';
  return date.toLocaleDateString(undefined, { weekday: 'short' });
}

export function formatDayNumber(key) {
  const date = parseDateKey(key);
  if (!date) return '';
  return date.toLocaleDateString(undefined, { day: 'numeric' });
}

export function examCountdown(daysUntil, status) {
  if (status === 'COMPLETED') return { label: 'Exam completed', tone: 'neutral' };
  if (status === 'CANCELLED') return { label: 'Cancelled', tone: 'neutral' };
  if (daysUntil > 0) return { label: `${daysUntil} days left`, tone: daysUntil <= 7 ? 'warning' : 'calm' };
  if (daysUntil === 0) return { label: 'Today', tone: 'urgent' };
  return { label: 'Past date', tone: 'neutral' };
}

export function formatHoursMinutes(minutes) {
  if (!minutes || minutes <= 0) return '0 min';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h`;
  return `${mins} min`;
}

export function isoToDateInput(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Send a date chosen from an <input type="date"> as local noon so it always
// stays in the intended calendar day regardless of the server timezone.
export function dateToIsoInput(dateStr) {
  if (!dateStr) return null;
  return `${dateStr}T12:00:00`;
}