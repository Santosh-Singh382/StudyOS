import { Link } from 'react-router-dom';
import SessionRow from './SessionRow';
import DashboardEmptyState from './DashboardEmptyState';

export default function RecentSessions({ sessions }) {
  return (
    <section
      aria-labelledby="recent-sessions-heading"
      data-testid="recent-study"
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="recent-sessions-heading" className="text-sm font-semibold text-slate-900">
          Recent Study Sessions
        </h2>
        <Link
          to="/timer"
          className="flex-shrink-0 text-sm font-medium text-violet-600 hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 rounded"
        >
          View timer history &rarr;
        </Link>
      </div>

      {sessions?.length === 0 ? (
        <DashboardEmptyState
          icon="◷"
          title="No study sessions yet"
          message="Start your first study session and track real focus time."
          to="/timer"
          cta="Start Studying"
        />
      ) : (
        <ul className="mt-1 divide-y divide-slate-100">
          {(sessions ?? []).slice(0, 8).map((session) => (
            <SessionRow key={session.id} session={session} />
          ))}
        </ul>
      )}
    </section>
  );
}