import { useEffect, useMemo, useState } from 'react';
import { useTimer } from '../context/TimerContext';
import { getSubjects } from '../services/subjects';
import { getTopics } from '../services/topics';
import { getTasks } from '../services/tasks';
import TimerDisplay from '../components/TimerDisplay';
import TimerControls from '../components/TimerControls';
import PomodoroTimer from '../components/PomodoroTimer';
import SessionHistory from '../components/SessionHistory';
import SelectField from '../components/SelectField';

const MODE_TABS = [
  { value: 'STUDY', label: 'Study' },
  { value: 'POMODORO', label: 'Pomodoro' },
];

export default function Timer() {
  const {
    mode,
    setMode,
    selection,
    setSubject,
    setTopic,
    setTask,
    active,
    notice,
    historyVersion,
  } = useTimer();

  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [refsLoading, setRefsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([getSubjects({ sort: 'name' }), getTopics({ sort: 'name' }), getTasks()])
      .then(([subjectData, topicData, taskData]) => {
        if (!mounted) return;
        setSubjects(subjectData.subjects);
        setTopics(topicData.topics);
        setTasks(taskData.tasks);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setRefsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const isActive = Boolean(active);

  const visibleTopics = useMemo(() => {
    if (!selection.subject) return topics;
    return topics.filter((topic) => topic.subject?.id === selection.subject.id);
  }, [topics, selection.subject]);

  const visibleTasks = useMemo(() => {
    if (!selection.subject) return tasks;
    return tasks.filter((task) => !task.subject || task.subject.id === selection.subject.id);
  }, [tasks, selection.subject]);

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Study Timer</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track focused study time. Pauses never count, and your timer survives a refresh.
        </p>
      </div>

      {notice && (
        <div
          role="status"
          data-notice
          className="mt-4 rounded-lg bg-violet-50 px-4 py-3 text-sm text-violet-700 ring-1 ring-violet-200"
        >
          {notice}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {MODE_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setMode(tab.value)}
            disabled={isActive}
            aria-pressed={mode === tab.value}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-60 ${
              mode === tab.value
                ? 'bg-violet-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
        {mode === 'POMODORO' && (
          <div className="mb-6">
            <PomodoroTimer />
          </div>
        )}

        <TimerDisplay />

        <div className="mt-6">
          <TimerControls />
        </div>

        {isActive && (
          <div className="mt-5 text-center text-sm text-slate-500">
            {active.subject && (
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: active.subject.color || '#64748b' }}
                />
                <span className="font-medium text-slate-700">{active.subject.name}</span>
              </span>
            )}
            {active.topic && <span className="ml-2">/ {active.topic.name}</span>}
            {active.task && <span className="ml-2">Task: {active.task.title}</span>}
          </div>
        )}
      </div>

      {!isActive && (
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <SelectField
            label="Subject"
            name="timerSubject"
            value={selection.subject?.id ?? ''}
            onChange={(e) => {
              const subject = subjects.find((item) => item.id === e.target.value) || null;
              setSubject(subject);
            }}
            options={subjects.map((subject) => ({ value: subject.id, label: subject.name }))}
            placeholder={refsLoading ? 'Loading…' : 'Select subject'}
          />
          <SelectField
            label="Topic"
            name="timerTopic"
            value={selection.topic?.id ?? ''}
            onChange={(e) => {
              const topic = visibleTopics.find((item) => item.id === e.target.value) || null;
              setTopic(topic);
            }}
            options={visibleTopics.map((topic) => ({ value: topic.id, label: topic.name }))}
            placeholder="Optional"
            disabled={!selection.subject}
          />
          <SelectField
            label="Task"
            name="timerTask"
            value={selection.task?.id ?? ''}
            onChange={(e) => {
              const task = visibleTasks.find((item) => item.id === e.target.value) || null;
              setTask(task);
            }}
            options={visibleTasks.map((task) => ({ value: task.id, label: task.title }))}
            placeholder="Optional link"
            disabled={!selection.subject}
          />
        </div>
      )}

      <div className="mt-10">
        <SessionHistory refreshKey={historyVersion} />
      </div>
    </section>
  );
}