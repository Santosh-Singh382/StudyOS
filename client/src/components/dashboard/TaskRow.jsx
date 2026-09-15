import Badge from '../Badge';
import { TASK_PRIORITY_HEX } from '../../utils/constants';
import { relativeDueLabel } from '../../utils/format';

const PRIORITY_LABELS = { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', URGENT: 'Urgent' };

export default function TaskRow({ task }) {
  const completed = task.status === 'COMPLETED';
  const label = relativeDueLabel(task.dueDate);
  const overdue = label?.startsWith('Overdue') ?? false;

  return (
    <li className="flex items-start gap-3 py-3">
      <span
        aria-hidden="true"
        className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
          completed
            ? 'border-violet-600 bg-violet-600 text-white'
            : 'border-slate-300'
        }`}
      >
        {completed && <span className="text-xs font-bold leading-none">&check;</span>}
      </span>
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-medium ${completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
          {task.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          {task.subject?.name && (
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-500">
              {task.subject.color && (
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: task.subject.color }}
                />
              )}
              {task.subject.name}
            </span>
          )}
          <Badge
            label={PRIORITY_LABELS[task.priority] || task.priority}
            color={TASK_PRIORITY_HEX[task.priority] || '#64748b'}
          />
        </div>
      </div>
      {label && (
        <span
          className={`flex-shrink-0 text-xs font-medium ${
            overdue ? 'text-red-600' : 'text-slate-500'
          }`}
        >
          {label}
        </span>
      )}
    </li>
  );
}