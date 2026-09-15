import { useTimer } from '../context/TimerContext';

export default function TimerControls() {
  const { activeStatus, busy, start, pause, resume, stop, cancel } = useTimer();

  const isRunning = activeStatus === 'RUNNING';
  const isPaused = activeStatus === 'PAUSED';
  const isActive = isRunning || isPaused;

  return (
    <div className="flex flex-wrap items-center justify-center gap-3" role="group" aria-label="Timer controls">
      {!isActive && (
        <button
          type="button"
          onClick={start}
          disabled={busy}
          data-action="start"
          className="rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 disabled:opacity-50"
        >
          Start
        </button>
      )}

      {isRunning && (
        <button
          type="button"
          onClick={pause}
          disabled={busy}
          data-action="pause"
          className="rounded-lg bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:opacity-50"
        >
          Pause
        </button>
      )}

      {isPaused && (
        <button
          type="button"
          onClick={resume}
          disabled={busy}
          data-action="resume"
          className="rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:opacity-50"
        >
          Resume
        </button>
      )}

      {isActive && (
        <>
          <button
            type="button"
            onClick={stop}
            disabled={busy}
            data-action="stop"
            className="rounded-lg bg-slate-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-50"
          >
            Stop &amp; save
          </button>
          <button
            type="button"
            onClick={cancel}
            disabled={busy}
            data-action="cancel"
            className="rounded-lg border border-red-200 bg-white px-6 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-200 disabled:opacity-50"
          >
            Cancel
          </button>
        </>
      )}
    </div>
  );
}