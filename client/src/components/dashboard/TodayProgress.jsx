import { formatStudyTime } from '../../utils/format';

export default function TodayProgress({ studySeconds, targetSeconds, percent }) {
  const pct = Math.max(0, Math.min(100, Number(percent) || 0));
  const targetLabel = formatStudyTime(targetSeconds);
  const actualLabel = formatStudyTime(studySeconds);

  return (
    <section
      aria-labelledby="today-progress-heading"
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="today-progress-heading" className="text-sm font-semibold text-slate-900">
          Today's Progress
        </h2>
        <span className="text-sm font-semibold tabular-nums text-slate-900">{pct}%</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-slate-500">Study Target</p>
          <p className="mt-1 text-lg font-semibold tabular-nums tracking-tight text-slate-900">
            {targetLabel}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Actual Study</p>
          <p className="mt-1 text-lg font-semibold tabular-nums tracking-tight text-slate-900">
            {actualLabel}
          </p>
        </div>
      </div>

      <div
        className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="Today's study progress"
      >
        <div
          className="h-full rounded-full bg-violet-600 transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="mt-2 text-xs text-slate-500">
        {pct >= 100
          ? 'Target reached — great work today.'
          : `${pct}% of today's ${targetLabel} target`}
      </p>
    </section>
  );
}