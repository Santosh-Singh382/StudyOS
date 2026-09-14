import StatusPill from '../components/StatusPill';
import { useHealth } from '../hooks/useHealth';

const PIPELINE = ['Plan', 'Study', 'Track', 'Analyze', 'Improve'];

export default function Home() {
  const { status, error, checking, retry } = useHealth();

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 text-xl font-bold text-white shadow-sm">
        S
      </div>

      <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
        StudyOS
      </h1>
      <p className="mt-3 text-lg text-slate-600">Personal Study Operating System</p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm font-medium text-slate-500">
        {PIPELINE.map((step, index) => (
          <span key={step} className="flex items-center gap-3">
            <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
              {step}
            </span>
            {index < PIPELINE.length - 1 && (
              <span aria-hidden="true" className="text-slate-300">
                →
              </span>
            )}
          </span>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <StatusPill label="Frontend" status="connected" />
        <StatusPill label="Backend" status={status.backend} />
        <StatusPill label="Database" status={status.database} />
      </div>

      {checking && (
        <p className="mt-6 text-sm text-slate-400">Connecting to backend…</p>
      )}

      {error && (
        <div
          role="alert"
          className="mt-6 w-full max-w-md rounded-xl bg-red-50 px-4 py-4 text-left ring-1 ring-red-200"
        >
          <p className="text-sm font-semibold text-red-700">
            Could not reach the StudyOS API.
          </p>
          <p className="mt-1 text-xs text-red-600/80">{error}</p>
          <button
            type="button"
            onClick={retry}
            className="mt-3 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
          >
            Retry
          </button>
        </div>
      )}
    </section>
  );
}