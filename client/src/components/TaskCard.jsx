import Badge from './Badge';
import { TASK_STATUS_HEX, TASK_PRIORITY_HEX } from '../utils/constants';

const PRIORITY_LABELS = { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', URGENT: 'Urgent' };

function formatMinutes(minutes) {
  if (!minutes || minutes <= 0) return null;
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `${hours}h ${rest}m` : `${hours}h`;
}

function formatDueDate(iso) {
  if (!iso) return null;
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function TaskCard({ task, onToggleComplete, onEdit, onDelete }) {
  const completed = task.status === 'COMPLETED';
  const timeLabel = formatMinutes(task.estimatedMinutes);
  const dueLabel = task.dueDate ? formatDueDate(task.dueDate) : null;
  const overdue =
    !completed && task.dueDate && new Date(task.dueDate).getTime() < Date.now();

  return (
    <li
      className={`rounded-2xl border bg-white p-5 transition-shadow ${
        completed
          ? 'border-slate-200 bg-slate-50/60'
          : 'border-slate-200 shadow-sm hover:shadow-md'
      }`}
      data-status={task.status}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => onToggleComplete(task)}
          aria-label={completed ? 'Mark task as incomplete' : 'Mark task as complete'}
          className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 ${
            completed
              ? 'border-violet-600 bg-violet-600 text-white'
              : 'border-slate-300 hover:border-violet-500'
          }`}
        >
          {completed && <span className="text-xs font-bold leading-none">&check;</span>}
        </button>

        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-semibold ${
              completed ? 'text-slate-400 line-through' : 'text-slate-900'
            }`}
          >
            {task.title}
          </p>

          {task.description && !completed && (
            <p className="mt-1 line-clamp-2 text-sm text-slate-500">{task.description}</p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge
              label={completed ? 'Completed' : task.status === 'IN_PROGRESS' ? 'In progress' : 'Todo'}
              color={TASK_STATUS_HEX[task.status] || '#64748b'}
            />
            <Badge label={PRIORITY_LABELS[task.priority] || task.priority} color={TASK_PRIORITY_HEX[task.priority] || '#64748b'} />

            {task.subject?.name && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                {task.subject.color && (
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: task.subject.color }}
                  />
                )}
                {task.subject.name}
              </span>
            )}

            {task.topic?.name && (
              <span className="text-xs text-slate-400">· {task.topic.name}</span>
            )}
          </div>

          {(dueLabel || timeLabel) && (
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              {dueLabel && (
                <span className={overdue ? 'font-medium text-red-600' : ''}>
                  {overdue ? 'Overdue · ' : ''}Due {dueLabel}
                </span>
              )}
              {timeLabel && <span>{timeLabel}</span>}
              {task.recurring && <span>Recurring</span>}
            </div>
          )}
        </div>

        <div className="flex flex-shrink-0 gap-1">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="rounded-lg px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(task)}
            className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  );
}