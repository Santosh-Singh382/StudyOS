import { Link } from 'react-router-dom';
import { IconTasks, IconPlay, IconPlus, IconCalendar } from '../../utils/icons';

const ACTIONS = [
  { to: '/tasks?new=1', label: 'Add Task', icon: IconTasks },
  { to: '/timer', label: 'Start Studying', icon: IconPlay },
  { to: '/subjects?new=1', label: 'Add Subject', icon: IconPlus },
  { to: '/planner', label: 'Open Planner', icon: IconCalendar },
];

export default function QuickActions() {
  return (
    <section aria-labelledby="quick-actions-heading">
      <h2 id="quick-actions-heading" className="sr-only">
        Quick actions
      </h2>
      <div className="grid grid-cols-2 gap-2.5" data-testid="quick-actions">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              to={action.to}
              className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-violet-200 hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
            >
              <Icon className="h-4 w-4 flex-shrink-0 text-violet-600" />
              <span className="truncate">{action.label}</span>
            </Link>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-slate-400">Shortcuts to your most frequent actions.</p>
    </section>
  );
}