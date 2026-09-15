export default function SummaryCard({ label, value, sub, icon: Icon }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13px] font-medium text-slate-500">{label}</p>
        <span
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500"
          aria-hidden="true"
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2.5 truncate text-xl font-semibold tabular-nums tracking-tight text-slate-900 sm:text-2xl">
        {value}
      </p>
      {sub && <p className="mt-1.5 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}