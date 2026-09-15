import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePlanner } from '../hooks/usePlanner';
import { LoadingState, ErrorState } from '../components/States';
import { formatStudyTime, formatShortTime } from '../utils/format';
import {
  addDays,
  todayKey,
  parseDateKey,
  toDateKey,
  formatPlannerDate,
  formatWeekdayShort,
  formatDayNumber,
  formatShortDateKey,
  examCountdown,
  formatHoursMinutes,
} from '../utils/planner';

const PRIORITY_WEIGHT = { LOW: 1, MEDIUM: 2, HIGH: 3, URGENT: 4 };

function weekStartKeyOf(dateKey) {
  const date = parseDateKey(dateKey);
  if (!date) return dateKey;
  const day = date.getDay();
  const offset = day === 0 ? -6 : -(day - 1);
  date.setDate(date.getDate() + offset);
  return toDateKey(date);
}

function PriorityDots({ priority }) {
  const weight = PRIORITY_WEIGHT[priority] ?? 2;
  return (
    <span className="flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4].map((level) => (
        <span
          key={level}
          className={`h-1.5 w-1.5 rounded-full ${level <= weight ? 'bg-violet-500' : 'bg-slate-200'}`}
        />
      ))}
    </span>
  );
}

function SubjectChip({ subject }) {
  if (!subject) return null;
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
      {subject.color && (
        <span
          className="h-2 w-2 flex-shrink-0 rounded-full"
          style={{ backgroundColor: subject.color }}
          aria-hidden="true"
        />
      )}
      <span className="truncate">{subject.name}</span>
    </span>
  );
}

function SectionCard({ title, count, children, testid }) {
  return (
    <section
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      data-testid={testid}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {typeof count === 'number' && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
            {count}
          </span>
        )}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function EmptyPill({ children }) {
  return (
    <p className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-400">
      {children}
    </p>
  );
}

export default function Planner() {
  const { dayData, weekData, loading, error, load } = usePlanner();
  const [view, setView] = useState('day');
  const [anchor, setAnchor] = useState(() => todayKey());

  useEffect(() => {
    const key = view === 'week' ? weekStartKeyOf(anchor) : anchor;
    load({ view, dateKey: key });
  }, [view, anchor, load]);

  const shift = (amount) => {
    setAnchor((prev) => (view === 'week' ? addDays(prev, amount * 7) : addDays(prev, amount)));
  };

  const goToday = () => {
    setAnchor(todayKey());
  };

  const openDay = (dateKey) => {
    setAnchor(dateKey);
    setView('day');
  };

  const day = dayData;
  const week = view === 'week' ? weekData : null;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Planner</h1>
          <p className="mt-1 text-sm text-slate-500">
            Your schedule — tasks, study sessions, exams and goals, day by day.
          </p>
        </div>
        <button
          type="button"
          onClick={goToday}
          data-testid="planner-today"
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
        >
          Today
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Planner view"
          className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5"
        >
          <button
            type="button"
            role="tab"
            aria-selected={view === 'day'}
            onClick={() => setView('day')}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 ${
              view === 'day' ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Day
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'week'}
            onClick={() => setView('week')}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 ${
              view === 'week' ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Week
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => shift(-1)}
            aria-label="Previous"
            data-testid="planner-prev"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
          >
            &lsaquo;
          </button>
          <span
            className="min-w-[9rem] text-center text-sm font-semibold text-slate-800"
            data-testid="planner-range"
          >
            {view === 'day'
              ? formatPlannerDate(anchor)
              : week
                ? `${formatShortDateKey(week.startDate)} — ${formatShortDateKey(addDays(week.startDate, 6))}`
                : ''}
          </span>
          <button
            type="button"
            onClick={() => shift(1)}
            aria-label="Next"
            data-testid="planner-next"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
          >
            &rsaquo;
          </button>
        </div>
      </div>

      {loading && <LoadingState label="Loading planner…" />}
      {!loading && error && (
        <div className="mt-8">
          <ErrorState message={error} onRetry={() => load({ view, dateKey: anchor })} />
        </div>
      )}

      {!loading && !error && view === 'day' && day && <DayView day={day} />}
      {!loading && !error && view === 'week' && week && (
        <WeekView week={week} anchor={anchor} onOpenDay={openDay} />
      )}
    </section>
  );
}

function DayView({ day }) {
  const isToday = day.isToday;
  const statusColor =
    day.completedTasks >= day.totalTasks && day.totalTasks > 0
      ? 'text-emerald-600'
      : 'text-slate-900';

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-bold text-slate-900" data-testid="planner-day-title">
          {formatPlannerDate(day.date)}
        </h2>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            isToday
              ? 'bg-violet-100 text-violet-700'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {day.dayLabel}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Studied</p>
          <p className="mt-1 text-base font-bold text-slate-900 sm:text-lg">
            {formatStudyTime(day.studySeconds)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Planned</p>
          <p className="mt-1 text-base font-bold text-slate-900 sm:text-lg">
            {formatHoursMinutes(day.plannedMinutes)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Tasks done</p>
          <p className={`mt-1 text-base font-bold sm:text-lg ${statusColor}`}>
            {day.completedTasks} / {day.totalTasks}
          </p>
        </div>
      </div>

      <SectionCard title="Tasks" count={day.totalTasks} testid="planner-tasks">
        {day.tasks.length === 0 ? (
          <EmptyPill>No tasks scheduled for this day.</EmptyPill>
        ) : (
          <ul className="divide-y divide-slate-100">
            {[...day.tasks]
              .sort((a, b) => (PRIORITY_WEIGHT[b.priority] ?? 0) - (PRIORITY_WEIGHT[a.priority] ?? 0))
              .map((task) => (
                <li key={task.id} className="flex items-center gap-3 py-2.5">
                  <PriorityDots priority={task.priority} />
                  <span
                    className={`min-w-0 flex-1 truncate text-sm ${
                      task.status === 'COMPLETED'
                        ? 'text-slate-400 line-through'
                        : 'text-slate-800'
                    }`}
                  >
                    {task.title}
                  </span>
                  <SubjectChip subject={task.subject} />
                  <span
                    className={`text-xs font-medium ${
                      task.status === 'COMPLETED'
                        ? 'text-emerald-600'
                        : 'text-slate-500'
                    }`}
                  >
                    {task.status === 'COMPLETED' ? 'Done' : 'Due'}
                  </span>
                </li>
              ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard title="Study sessions" count={day.sessionsCount} testid="planner-sessions">
        {day.sessions.length === 0 ? (
          <EmptyPill>No study sessions started this day.</EmptyPill>
        ) : (
          <ul className="divide-y divide-slate-100">
            {day.sessions.map((session) => (
              <li key={session.id} className="flex items-center gap-3 py-2.5">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-violet-50 text-xs font-bold text-violet-700">
                  {formatStudyTime(session.durationSeconds).replace(/\s*min$/, 'm').replace(/\s*h$/, 'h')}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-slate-800">
                  {session.subject?.name || 'Focus session'}
                  {session.topic ? ` — ${session.topic.name}` : ''}
                </span>
                <span className="text-xs text-slate-500">
                  {formatShortTime(session.startedAt)} · {session.mode === 'POMODORO_FOCUS' ? 'Pomodoro' : 'Study'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard title="Exams" count={day.exams.length} testid="planner-exams">
        {day.exams.length === 0 ? (
          <EmptyPill>No exams on this day.</EmptyPill>
        ) : (
          <ul className="divide-y divide-slate-100">
            {day.exams.map((exam) => {
              const { label, tone } = examCountdown(exam.daysUntil, exam.status);
              return (
                <li key={exam.id} className="flex items-center gap-3 py-2.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      tone === 'urgent'
                        ? 'bg-red-50 text-red-700'
                        : tone === 'warning'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {label}
                  </span>
                  <Link
                    to={`/exams/${exam.id}`}
                    className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800 hover:text-violet-700"
                  >
                    {exam.title}
                  </Link>
                  {exam.examTime && <span className="text-xs text-slate-500">{exam.examTime}</span>}
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>

      <SectionCard
        title="Goals & milestones"
        count={day.goals.length + day.milestonesDue.length}
        testid="planner-goals"
      >
        {day.goals.length === 0 && day.milestonesDue.length === 0 ? (
          <EmptyPill>Nothing due for a goal this day.</EmptyPill>
        ) : (
          <ul className="divide-y divide-slate-100">
            {day.goals.map((goal) => (
              <li key={`goal-${goal.id}`} className="flex items-center gap-3 py-2.5">
                <span className="h-2 w-2 flex-shrink-0 rounded-full bg-violet-500" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate text-sm text-slate-800">{goal.title}</span>
                <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Goal due</span>
              </li>
            ))}
            {day.milestonesDue.map((milestone) => (
              <li key={`ms-${milestone.id}`} className="flex items-center gap-3 py-2.5">
                <span className="h-2 w-2 flex-shrink-0 rounded-full bg-amber-400" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate text-sm text-slate-800">{milestone.title}</span>
                <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Milestone due</span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}

function WeekView({ week, anchor, onOpenDay }) {
  const today = todayKey();
  const totalPlanned = week.days.reduce((sum, day) => sum + day.plannedMinutes, 0);

  return (
    <div className="mt-6">
      <div className="mb-4 grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Week study</p>
          <p className="mt-1 text-base font-bold text-slate-900 sm:text-lg">
            {formatStudyTime(week.totalStudySeconds)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Week planned</p>
          <p className="mt-1 text-base font-bold text-slate-900 sm:text-lg">
            {formatHoursMinutes(totalPlanned)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Active day</p>
          <p className="mt-1 text-base font-bold text-violet-700 sm:text-lg">{formatWeekdayShort(anchor)}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="grid min-w-[648px] grid-cols-7 divide-x divide-slate-100">
          {week.days.map((day) => {
            const isToday = day.date === today;
            const isAnchor = day.date === anchor;
            return (
              <button
                type="button"
                key={day.date}
                onClick={() => onOpenDay(day.date)}
                data-testid="planner-week-day"
                aria-current={isToday ? 'date' : undefined}
                className={`flex flex-col gap-1.5 p-2.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-300 sm:p-3 ${
                  isAnchor ? 'bg-violet-50/70' : 'hover:bg-slate-50'
                } ${isToday ? '' : ''}`}
              >
                <span className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold uppercase tracking-wide ${
                      isToday ? 'text-violet-700' : 'text-slate-500'
                    }`}
                  >
                    {formatWeekdayShort(day.date)}
                  </span>
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold ${
                      isToday
                        ? 'bg-violet-600 text-white'
                        : 'text-slate-700'
                    }`}
                  >
                    {formatDayNumber(day.date)}
                  </span>
                </span>

                <span className="text-sm font-medium text-slate-800">
                  {formatStudyTime(day.studySeconds)}
                </span>

                {day.totalTasks > 0 && (
                  <span className="text-xs text-slate-500">
                    {day.completedTasks}/{day.totalTasks} tasks
                  </span>
                )}
                {day.exams.length > 0 && (
                  <span className="truncate rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                    {day.exams.length} exam{day.exams.length === 1 ? '' : 's'}
                  </span>
                )}
                {day.milestonesDue.length + day.goals.length > 0 && (
                  <span className="text-xs font-medium text-violet-600">
                    {day.milestonesDue.length + day.goals.length} due
                  </span>
                )}
                {day.totalTasks === 0 && day.exams.length === 0 && day.milestonesDue.length === 0 && day.goals.length === 0 && (
                  <span className="text-xs text-slate-300">—</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-slate-400">
        Tap a day to open its full schedule.
      </p>
    </div>
  );
}