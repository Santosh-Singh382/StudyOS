export default function ProgressBar({ value, max = 0, color = '#7c3aed' }) {
  const normalized = Math.max(0, Math.min(100, max > 0 ? (value / max) * 100 : 0));
  const clamped = max > 0 ? value : 0;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-xs text-slate-500">
        <span>
          {clamped} / {max} hr
        </span>
        <span className="font-medium text-slate-600">{Math.round(normalized)}%</span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${normalized}%`, backgroundColor: color }}
          role="progressbar"
          aria-valuenow={Math.round(normalized)}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>
    </div>
  );
}