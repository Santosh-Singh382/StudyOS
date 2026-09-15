import { Link } from 'react-router-dom';
import { usePlannerOverview } from '../../hooks/usePlannerOverview';
import { useGoals } from '../../hooks/useGoals';
import { formatStudyTime, formatShortDate } from '../../utils/format';
import { examCountdown } from '../../utils/planner';

function PanelCard({ as: Wrapper = 'div', className = '', children }) {
  return (
    <Wrapper
      className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${className}`}
    >
      {children}
    </Wrapper>
  );
}

export default function DashboardFocusPanel() {
  const { overview, loading: overviewLoading } = usePlannerOverview();
  const { goals } = useGoals({ status: 'ACTIVE' });

  if (overviewLoading) return null;

  const nextExam = overview?.nextExam || null;
  const activeGoal = goals.find((goal) => goal.status === 'ACTIVE') || null;
  const today = overview?.today || null;
  const nextMilestone = overview?.nextMilestone || null;

  const hasContent = nextExam || activeGoal || nextMilestone || today;
  if (!hasContent) return null;

  return (
    <section
      aria-labelledby="focus-heading"
      data-testid="dashboard-focus"
      className="rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 id="focus-heading" className="text-sm font-semibold text-slate-900">
            Today&apos;s Focus
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">Your goals, exams and day at a glance</p>
        </div>
        <Link
          to="/planner"
          className="flex-shrink-0 text-sm font-medium text-violet-600 hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 rounded"
        >
          Planner &rarr;
        </Link>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {nextExam && (
          <PanelCard as={Link} to={`/exams/${nextExam.id}`} className="sm:col-span-1">
            <p className="text-xs uppercase tracking-wide text-slate-400">Next exam</p>
            <p className="mt-1 truncate text-sm font-bold text-slate-900">{nextExam.title}</p>
            <p className="mt-2 text-xs text-slate-500">
              {formatShortDate(nextExam.examDate)}
              {nextExam.examTime ? ` at ${nextExam.examTime}` : ''}
            </p>
            <span
              className="mt-2 inline-flex rounded-full bg-violet-50 px-2 py-0.5 text-xs font-bold text-violet-700"
              data-testid="dashboard-next-exam-countdown"
            >
              {examCountdown(nextExam.daysUntil, nextExam.status).label}
            </span>
          </PanelCard>
        )}

        {activeGoal && (
          <PanelCard as={Link} to={`/goals/${activeGoal.id}`}>
            <p className="text-xs uppercase tracking-wide text-slate-400">Active goal</p>
            <p className="mt-1 truncate text-sm font-bold text-slate-900">{activeGoal.title}</p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-violet-600 transition-all duration-300"
                style={{ width: `${activeGoal.progress}%` }}
                role="progressbar"
                aria-valuenow={activeGoal.progress}
                aria-valuemin="0"
                aria-valuemax="100"
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              {activeGoal.completedMilestones} of {activeGoal.totalMilestones} milestones ·{' '}
              {activeGoal.progress}%
            </p>
          </PanelCard>
        )}

        {today && (
          <PanelCard>
            <p className="text-xs uppercase tracking-wide text-slate-400">Today&apos;s plan</p>
            <div className="mt-1 space-y-1.5">
              <p className="flex items-center justify-between gap-2 text-sm text-slate-600">
                <span>Studied</span>
                <span className="font-bold text-slate-900">
                  {formatStudyTime(today.studySeconds)}
                </span>
              </p>
              <p className="flex items-center justify-between gap-2 text-sm text-slate-600">
                <span>Planned</span>
                <span className="font-bold text-slate-900">{today.plannedMinutes} min</span>
              </p>
              <p className="flex items-center justify-between gap-2 text-sm text-slate-600">
                <span>Tasks done</span>
                <span className="font-bold text-slate-900">
                  {today.completedTasks} / {today.completedTasks + today.pendingTasks}
                </span>
              </p>
            </div>
          </PanelCard>
        )}

        {!activeGoal && nextMilestone && (
          <PanelCard as={Link} to="/goals">
            <p className="text-xs uppercase tracking-wide text-slate-400">Next milestone</p>
            <p className="mt-1 truncate text-sm font-bold text-slate-900">{nextMilestone.title}</p>
            <p className="mt-1.5 text-xs text-slate-500">
              {nextMilestone.goalTitle
                ? `Part of "${nextMilestone.goalTitle}" · ${formatShortDate(nextMilestone.targetDate)}`
                : formatShortDate(nextMilestone.targetDate)}
            </p>
          </PanelCard>
        )}
      </div>
    </section>
  );
}