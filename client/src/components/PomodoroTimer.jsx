import { useTimer, POMODORO_PHASES } from '../context/TimerContext';
import { SESSION_MODE_HEX } from '../utils/constants';

export default function PomodoroTimer() {
  const { mode, active, config, remainingSeconds, elapsedSeconds, phaseSeconds } = useTimer();

  if (mode !== 'POMODORO' && !active) return null;

  const currentMode = active?.mode || 'POMODORO_FOCUS';
  const phase =
    currentMode === 'POMODORO_SHORT_BREAK'
      ? 'short'
      : currentMode === 'POMODORO_LONG_BREAK'
        ? 'long'
        : 'focus';

  const cycles = active?.pomodoro?.focusCycles || 0;
  const totalBeforeLong = config.cyclesBeforeLongBreak;
  const phaseSec = phaseSeconds || (phase === 'focus' ? config.focusSeconds : phase === 'long' ? config.longBreakSeconds : config.shortBreakSeconds);

  const completedInSet = phase === 'long' ? totalBeforeLong : cycles % totalBeforeLong;
  const displayCycle = phase === 'long' ? totalBeforeLong : (cycles % totalBeforeLong) + 1;
  const progress = phaseSec > 0 && remainingSeconds != null ? Math.max(0, Math.min(1, 1 - remainingSeconds / phaseSec)) : 0;

  const phaseColor = SESSION_MODE_HEX[currentMode] || '#7c3aed';
  const label = POMODORO_PHASES[phase]?.label || 'Focus';

  return (
    <div
      className="flex flex-col items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200"
      aria-label={`Pomodoro timer: ${label}`}
    >
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>

      <div
        className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label} progress`}
      >
        <div
          className="h-full rounded-full transition-[width] duration-300 ease-linear"
          style={{ width: `${progress * 100}%`, backgroundColor: phaseColor }}
        />
      </div>

      <div className="flex items-center gap-1.5" aria-hidden="true">
        {Array.from({ length: totalBeforeLong }).map((_, i) => (
          <span
            key={i}
            className="h-2.5 w-2.5 rounded-full transition-colors"
            style={{
              backgroundColor:
                i < completedInSet ? '#7c3aed' : '#e2e8f0',
            }}
          />
        ))}
      </div>

      <p className="text-xs text-slate-500">
        Cycle {displayCycle} / {totalBeforeLong}
      </p>
    </div>
  );
}