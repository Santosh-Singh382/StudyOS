import { Link } from 'react-router-dom';
import TaskRow from './TaskRow';
import DashboardEmptyState from './DashboardEmptyState';

export default function AttentionTasks({ tasks }) {
  const list = [...(tasks?.overdue ?? []), ...(tasks?.highPriorityPending ?? [])];
  const seen = new Set();
  const merged = list.filter((task) => {
    if (seen.has(task.id)) return false;
    seen.add(task.id);
    return true;
  });

  return (
    <section
      aria-labelledby="important-heading"
      data-testid="important"
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 id="important-heading" className="text-sm font-semibold text-slate-900">
            Needs Attention
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Overdue and high-priority tasks that could use your focus.
          </p>
        </div>
        {merged.length > 0 && (
          <Link
            to="/tasks"
            className="flex-shrink-0 text-sm font-medium text-violet-600 hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 rounded"
          >
            Open tasks &rarr;
          </Link>
        )}
      </div>

      {merged.length === 0 ? (
        <DashboardEmptyState
          icon="🎉"
          title="You're all caught up"
          message="No overdue or high-priority tasks right now."
          to="/tasks"
          cta="View tasks"
        />
      ) : (
        <ul className="mt-1 divide-y divide-slate-100">
          {merged.slice(0, 6).map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </ul>
      )}
    </section>
  );
}