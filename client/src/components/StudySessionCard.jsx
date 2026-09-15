import Badge from './Badge';
import { formatDuration, formatMinutes } from './TimerDisplay';
import { SESSION_MODE_HEX, SESSION_STATUS_HEX } from '../utils/constants';

export default function StudySessionCard({ session }) {
  const {
    subject,
    topic,
    task,
    mode,
    status,
    durationSeconds,
    liveSeconds,
    totalSeconds,
    startedAt,
    endedAt,
    notes,
  } = session;

  const total = status === 'RUNNING' || status === 'PAUSED' ? totalSeconds : durationSeconds;

  const formatTime = (iso) => {
    if (!iso) return '--';
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--';
    }
  };

  return (
    <li className="rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-wrap items-center gap-2">
        {subject && (
          <span className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: subject.color || '#64748b' }}
            />
            <span className="text-sm font-medium text-slate-800">{subject.name}</span>
          </span>
        )}

        {topic && (
          <span className="text-xs text-slate-500">/ {topic.name}</span>
        )}

        {task && (
          <span className="text-xs text-slate-500">Task: {task.title}</span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Badge
          label={mode.replace('POMODORO_', '').replace('_', ' ').toLowerCase()}
          color={SESSION_MODE_HEX[mode] || '#64748b'}
        />
        <Badge
          label={status}
          color={SESSION_STATUS_HEX[status] || '#64748b'}
        />
        <span className="text-sm font-semibold tabular-nums text-slate-800">
          {formatMinutes(total)}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
        <span>{formatTime(startedAt)} {endedAt ? `– ${formatTime(endedAt)}` : status === 'RUNNING' ? '– now' : ''}</span>
        {notes && <span className="truncate italic text-slate-400">Notes: {notes}</span>}
      </div>
    </li>
  );
}