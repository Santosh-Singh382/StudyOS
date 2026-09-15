export default function SubjectProgressCard({ subject, onOpen }) {
  const { name, color, totalTopics, completedTopics, progress } = subject;
  const barColor = color || '#7c3aed';

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full flex-col gap-2.5 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-colors hover:border-violet-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex min-w-0 items-center gap-2.5">
          <span
            className="h-8 w-8 flex-shrink-0 rounded-lg"
            style={{ backgroundColor: `${barColor}1f`, boxShadow: `inset 0 0 0 2px ${barColor}` }}
            aria-hidden="true"
          />
          <span className="truncate text-sm font-semibold text-slate-900">{name}</span>
        </span>
        <span className="text-sm font-semibold tabular-nums text-slate-700">{progress}%</span>
      </div>

      <p className="text-xs text-slate-500">
        {completedTopics} of {totalTopics} topics completed
      </p>

      <div className="mt-0.5 h-2 w-full overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${progress}%`, backgroundColor: barColor }}
        />
      </div>
    </button>
  );
}