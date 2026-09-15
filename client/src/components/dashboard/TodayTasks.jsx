import { Link } from 'react-router-dom';
import TaskRow from './TaskRow';
import DashboardEmptyState from './DashboardEmptyState';

export default function TodayTasks({ tasks, dueToday, completedToday, totalTasks }) {
  const all = [...(dueToday ?? [])];
  const seen = new Set(all.map((t) => t.id));
  for (const task of completedToday ?? []) {
    if (!seen.has(task.id)) all.push(task);
  }

  return (
    <section
      aria-labelledby="today-tasks-heading"
      data-testid="today-tasks"
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 id="today-tasks-heading" className="text-sm font-semibold text-slate-900">
            Today's Tasks
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {totalTasks ?? 0} scheduled today · {completedToday?.length ?? 0} completed
          </p>
        </div>
        <Link
          to="/tasks"
          className="flex-shrink-0 text-sm font-medium text-violet-600 hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 rounded"
        >
          View all &rarr;
        </Link>
      </div>

      {all.length === 0 ? (
        tasks?.total === 0 ? (
          <DashboardEmptyState
            icon="✦"
            title="No tasks for today"
            message="Create a task to organize your study session."
            to="/tasks?new=1"
            cta="+ Add Task"
          />
        ) : (
          <DashboardEmptyState
            icon="✓"
            title="Nothing due today"
            message="No tasks are scheduled for today. Plan ahead or enjoy the open time."
            to="/tasks"
            cta="Open tasks"
          />
        )
      ) : (
        <ul className="mt-1 divide-y divide-slate-100">
          {all.slice(0, 8).map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </ul>
      )}
    </section>
  );
}