export function formatStudyTime(totalSeconds) {
  if (totalSeconds == null || totalSeconds <= 0) return '0 min';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  if (totalSeconds < 60) return '< 1 min';
  return `${minutes} min`;
}

export function formatShortTime(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function calendarDayDiff(target, base = new Date()) {
  const start = startOfDay(base);
  const targetStart = startOfDay(new Date(target));
  return Math.round((start - targetStart) / 86400000);
}

// "Today, 10:30 AM" | "Yesterday, 8:15 PM" | "Mon, Sep 14"
export function sessionWhenLabel(iso) {
  if (!iso) return '';
  const diff = calendarDayDiff(iso);
  const time = formatShortTime(iso);
  if (diff === 0) return `Today, ${time}`;
  if (diff === 1) return `Yesterday, ${time}`;
  return `${formatShortDate(iso)}, ${time}`;
}

// "Today" | "Overdue · Yesterday" | "Overdue · 2 days ago" | "Tomorrow" | short date
export function relativeDueLabel(iso) {
  if (!iso) return null;
  const diff = calendarDayDiff(iso);
  const due = new Date(iso);
  const overdue = due.getTime() < Date.now();
  if (diff === 0) return 'Today';
  if (diff === 1) return overdue ? 'Overdue · Yesterday' : 'Yesterday';
  if (diff > 1) return overdue ? `Overdue · ${diff} days ago` : `${diff} days`;
  if (diff === -1) return 'Tomorrow';
  return formatShortDate(iso);
}

export function formatShortDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function dueLabel(iso) {
  if (!iso) return null;
  const due = new Date(iso);
  const todayStart = startOfDay();
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  const dayAgoStart = new Date(todayStart);
  dayAgoStart.setDate(dayAgoStart.getDate() - 1);

  const time = due.getTime();
  if (time >= todayStart && time < tomorrowStart) return 'Today';
  if (time >= dayAgoStart && time < todayStart) return 'Yesterday';
  if (time < todayStart) return 'Overdue';
  return formatShortDate(iso);
}

export function greetingForHour(hour) {
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  return 'Good evening';
}