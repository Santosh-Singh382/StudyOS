import { useTimer } from '../context/TimerContext';
import { SESSION_STATUS_HEX } from '../utils/constants';

export function formatDuration(seconds) {
  if (seconds == null || seconds < 0) seconds = 0;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatMinutes(totalSeconds) {
  if (!totalSeconds || totalSeconds <= 0) return '0 min';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m} min`;
}

export default function TimerDisplay() {
  const { active, elapsedSeconds, remainingSeconds, activeIsPomodoro, activeStatus, mode } =
    useTimer();

  const isActive = Boolean(active);
  const isPaused = activeStatus === 'PAUSED';

  if (!isActive) {
    return (
      <div className="flex flex-col items-center gap-2" aria-live="polite">
        <span className="font-mono text-6xl font-bold tracking-wider text-slate-300 sm:text-7xl" aria-label="Timer display: 00:00:00">
          00:00:00
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
          Idle
        </span>
      </div>
    );
  }

  const displaySeconds = mode === 'POMODORO' || activeIsPomodoro
    ? (remainingSeconds ?? 0)
    : elapsedSeconds;

  const displayLabel =
    mode === 'POMODORO' || activeIsPomodoro ? 'Remaining' : 'Elapsed';

  return (
    <div
      className="flex flex-col items-center gap-2"
      data-status={activeStatus?.toLowerCase()}
      data-mode={active?.mode?.toLowerCase()}
      aria-live="polite"
    >
      <span
        className="font-mono text-6xl font-bold tracking-wider sm:text-7xl"
        style={{ color: isPaused ? '#f59e0b' : '#7c3aed' }}
        aria-label={`${displayLabel}: ${formatDuration(displaySeconds)}`}
      >
        {formatDuration(displaySeconds)}
      </span>

      <div className="flex items-center gap-2">
        <span
          className="rounded-full px-3 py-1 text-xs font-medium"
          style={{
            backgroundColor: `${SESSION_STATUS_HEX[activeStatus] || '#64748b'}1a`,
            color: SESSION_STATUS_HEX[activeStatus] || '#64748b',
          }}
        >
          {activeStatus === 'RUNNING' ? 'Running' : isPaused ? 'Paused' : activeStatus}
        </span>
        <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-600">
          {active?.mode?.replace('POMODORO_', '').replace('_', ' ').toLowerCase() || 'Study'}
        </span>
      </div>
    </div>
  );
}