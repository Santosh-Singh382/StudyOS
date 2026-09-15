import { Link } from 'react-router-dom';

export default function DashboardEmptyState({ title, message, to, cta, icon }) {
  return (
    <div className="mt-3 rounded-xl border border-dashed border-slate-200 px-5 py-8 text-center">
      {icon && (
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-400">
          <span aria-hidden="true">{icon}</span>
        </div>
      )}
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {message && <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">{message}</p>}
      {to && (
        <Link
          to={to}
          className="mt-3 inline-flex rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
        >
          {cta}
        </Link>
      )}
    </div>
  );
}