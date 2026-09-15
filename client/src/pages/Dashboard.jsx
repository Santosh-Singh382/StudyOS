import { Link, useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import SummaryCard from '../components/dashboard/SummaryCard';
import TodayProgress from '../components/dashboard/TodayProgress';
import QuickActions from '../components/dashboard/QuickActions';
import SubjectProgressCard from '../components/dashboard/SubjectProgressCard';
import TodayTasks from '../components/dashboard/TodayTasks';
import RecentSessions from '../components/dashboard/RecentSessions';
import AttentionTasks from '../components/dashboard/AttentionTasks';
import TaskRow from '../components/dashboard/TaskRow';
import DashboardSkeleton from '../components/dashboard/DashboardSkeleton';
import DashboardEmptyState from '../components/dashboard/DashboardEmptyState';
import { ErrorState } from '../components/States';
import { useDashboard } from '../hooks/useDashboard';
import { formatStudyTime } from '../utils/format';
import { IconClock, IconTasks, IconTrendUp, IconFlame } from '../utils/icons';

export default function Dashboard() {
  const { dashboard, loading, error, reload } = useDashboard();
  const navigate = useNavigate();

  if (error) {
    return (
      <div className="mt-8">
        <ErrorState message="Unable to load your dashboard." onRetry={reload} />
      </div>
    );
  }

  const summary = dashboard?.summary ?? {};
  const study = dashboard?.study ?? {};
  const tasks = dashboard?.tasks ?? {};
  const subjects = dashboard?.subjects ?? [];
  const topics = dashboard?.topics ?? {};
  const recentActivity = dashboard?.recentActivity ?? {};

  const todayCompleted = summary.todayCompletedTasks ?? 0;
  const pendingTasks = summary.pendingTasks ?? 0;
  const tasksTotal = todayCompleted + pendingTasks;
  const progressPercent = summary.todayProgressPercent ?? 0;
  const streak = summary.currentStreak ?? 0;
  const needsAttention = topics.needingAttention ?? [];

  return (
    <div>
      <DashboardHeader />

      {loading && <DashboardSkeleton />}

      {!loading && (
        <div className="mt-8 space-y-6">
          <div
            className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
            data-testid="dashboard-stats"
          >
            <SummaryCard
              label="Study Time"
              value={formatStudyTime(summary.todayStudySeconds)}
              sub="Today"
              icon={IconClock}
            />
            <SummaryCard
              label="Tasks"
              value={`${todayCompleted} / ${tasksTotal}`}
              sub="Completed today"
              icon={IconTasks}
            />
            <SummaryCard
              label="Progress"
              value={`${progressPercent}%`}
              sub="Today's target"
              icon={IconTrendUp}
            />
            <SummaryCard
              label="Streak"
              value={`${streak}`}
              sub={streak > 0 ? `${streak} day${streak === 1 ? '' : 's'} in a row` : 'Study each day to build one'}
              icon={IconFlame}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <TodayProgress
                studySeconds={summary.todayStudySeconds ?? 0}
                targetSeconds={study.targetSeconds ?? 0}
                percent={progressPercent}
              />
            </div>
            <QuickActions />
          </div>

          <section
            aria-labelledby="subjects-heading"
            data-testid="subject-progress"
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 id="subjects-heading" className="text-sm font-semibold text-slate-900">
                  Your Subjects
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {topics.completed ?? 0} of {topics.total ?? 0} topics completed
                </p>
              </div>
              <Link
                to="/subjects"
                className="flex-shrink-0 text-sm font-medium text-violet-600 hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 rounded"
              >
                Manage &rarr;
              </Link>
            </div>

            {subjects.length === 0 ? (
              <DashboardEmptyState
                icon="📚"
                title="No subjects yet"
                message="Add your first subject to start tracking your preparation."
                to="/subjects?new=1"
                cta="+ Add Subject"
              />
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {subjects.map((subject) => (
                  <SubjectProgressCard
                    key={subject.id}
                    subject={subject}
                    onOpen={() => navigate(`/subjects/${subject.id}`)}
                  />
                ))}
              </div>
            )}

            {needsAttention.length > 0 && (
              <div className="mt-5 border-t border-slate-100 pt-4" data-testid="needs-attention">
                <h3 className="text-sm font-semibold text-slate-700">Topics needing attention</h3>
                <ul className="mt-2 space-y-2">
                  {needsAttention.map((topic) => (
                    <li key={topic.id} className="flex items-center gap-2 text-sm text-slate-600">
                      {topic.subject?.color && (
                        <span
                          className="h-2 w-2 flex-shrink-0 rounded-full"
                          style={{ backgroundColor: topic.subject.color }}
                          aria-hidden="true"
                        />
                      )}
                      <span className="min-w-0 flex-1 truncate">{topic.name}</span>
                      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        {topic.priority}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <TodayTasks
                tasks={tasks}
                dueToday={tasks.dueToday}
                completedToday={tasks.completedToday}
                totalTasks={summary.todayTotalTasks}
              />
            </div>
            <RecentSessions sessions={study.recentSessions} />
          </div>

          <AttentionTasks tasks={tasks} />

          {recentActivity.completedTasks?.length > 0 && (
            <section
              aria-labelledby="activity-heading"
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h2 id="activity-heading" className="text-sm font-semibold text-slate-900">
                Recently Completed
              </h2>
              <ul className="mt-1 divide-y divide-slate-100">
                {recentActivity.completedTasks.slice(0, 5).map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}