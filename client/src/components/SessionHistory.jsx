import { useEffect, useState } from 'react';
import { getTodayStudySessions, getWeeklyStudySessions } from '../services/studySessions';
import StudySessionCard from './StudySessionCard';
import { formatMinutes } from './TimerDisplay';
import { LoadingState, EmptyState, ErrorState } from './States';

function SessionSummary({ label, sublabel, value, sessions, loading, error, onRetry }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{label}</h2>
          <p className="text-xs text-slate-500">{sublabel}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tabular-nums text-violet-700">{value}</p>
          <p className="text-xs text-slate-500">study time</p>
        </div>
      </div>

      {loading && <LoadingState label="Loading sessions…" />}
      {!loading && error && (
        <div className="mt-4">
          <ErrorState message={error} onRetry={onRetry} />
        </div>
      )}
      {!loading && !error && sessions.length === 0 && (
        <div className="mt-4">
          <EmptyState title="No sessions yet" message="Sessions you complete will appear here." />
        </div>
      )}
      {!loading && !error && sessions.length > 0 && (
        <ul className="mt-4 space-y-2">
          {sessions.map((session) => (
            <StudySessionCard key={session.id} session={session} />
          ))}
        </ul>
      )}
    </div>
  );
}

export default function SessionHistory({ refreshKey }) {
  const [today, setToday] = useState({ sessions: [], summary: null, loading: true, error: null });
  const [weekly, setWeekly] = useState({ sessions: [], summary: null, loading: true, error: null });

  const loadToday = async (silent = false) => {
    if (!silent) setToday((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await getTodayStudySessions();
      setToday({ sessions: data.sessions, summary: data.summary, loading: false, error: null });
    } catch (err) {
      setToday((prev) => ({ ...prev, loading: false, error: err.message }));
    }
  };

  const loadWeekly = async (silent = false) => {
    if (!silent) setWeekly((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await getWeeklyStudySessions();
      setWeekly({ sessions: data.sessions, summary: data.summary, loading: false, error: null });
    } catch (err) {
      setWeekly((prev) => ({ ...prev, loading: false, error: err.message }));
    }
  };

  useEffect(() => {
    loadToday();
    loadWeekly();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SessionSummary
        label="Today"
        sublabel={`${today.summary?.sessionCount ?? 0} completed study sessions`}
        value={formatMinutes(today.summary?.studySeconds ?? 0)}
        sessions={today.sessions}
        loading={today.loading}
        error={today.error}
        onRetry={() => loadToday()}
      />
      <SessionSummary
        label="Last 7 days"
        sublabel={`${weekly.summary?.completedSessions ?? 0} completed study sessions`}
        value={formatMinutes(weekly.summary?.studySeconds ?? 0)}
        sessions={weekly.sessions}
        loading={weekly.loading}
        error={weekly.error}
        onRetry={() => loadWeekly()}
      />
    </div>
  );
}