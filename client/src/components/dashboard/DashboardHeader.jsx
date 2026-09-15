import StatusPill from '../StatusPill';
import { useAuth } from '../../context/AuthContext';
import { useHealth } from '../../hooks/useHealth';
import { greetingForHour } from '../../utils/format';

export default function DashboardHeader() {
  const { user } = useAuth();
  const { status } = useHealth();
  const firstName = user?.name ? user.name.trim().split(/\s+/)[0] : 'there';

  return (
    <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {greetingForHour(new Date().getHours())}, {firstName}{' '}
          <span aria-hidden="true">👋</span>
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">Here's your study overview for today.</p>
        <p className="mt-1 text-xs text-slate-400">
          Signed in as <span className="font-medium text-slate-500">{user?.name}</span>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2" aria-label="System status">
        <StatusPill label="Frontend" status="connected" />
        <StatusPill label="Backend" status={status.backend} />
        <StatusPill label="Database" status={status.database} />
      </div>
    </header>
  );
}