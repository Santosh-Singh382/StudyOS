import { Link } from 'react-router-dom';
import { NAV_ICONS } from '../utils/icons';
import { useAuth } from '../context/AuthContext';

const MODULES = {
  goals: {
    title: 'Goals',
    description: 'Set weekly goals and milestones, then track how your study time and completed topics move you toward them.',
    icon: 'goals',
  },
  revision: {
    title: 'Revision',
    description: 'Plan spaced revision cycles for topics you have already learned so knowledge sticks.',
    icon: 'revision',
  },
  'mock-tests': {
    title: 'Mock Tests',
    description: 'Log mock test results, track scores over time, and surface weak topics to revisit.',
    icon: 'mock-tests',
  },
  analytics: {
    title: 'Analytics',
    description: 'Long-term trends across study time, task throughput, and topic mastery — beyond the daily dashboard.',
    icon: 'analytics',
  },
  'ai-assistant': {
    title: 'AI Assistant',
    description: 'A study copilot that suggests next actions, summarizes weak areas, and helps you plan.',
    icon: 'assistant',
  },
  settings: {
    title: 'Settings',
    description: 'Manage your profile, study target, notification preferences, and account details.',
    icon: 'settings',
  },
};

export default function PlaceholderPage({ module }) {
  const { user } = useAuth();
  const config = MODULES[module];
  const Icon = config ? NAV_ICONS[config.icon] : NAV_ICONS.home;
  const firstName = user?.name ? user.name.trim().split(/\s+/)[0] : 'there';

  if (!config) {
    return (
      <p className="text-sm text-slate-500">
        This module is not recognised. <Link to="/" className="font-medium text-violet-600">Back to dashboard</Link>
      </p>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col items-center py-10 text-center sm:py-16">
      <span
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600"
        aria-hidden="true"
      >
        <Icon className="h-7 w-7" />
      </span>
      <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">{config.title}</h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">{config.description}</p>

      <div className="mt-8 w-full rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10">
        <p className="text-sm font-medium text-slate-700">
          On the roadmap, {firstName}.
        </p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
          This module is planned for a future phase. Your dashboard is live — keep studying!
        </p>
        <Link
          to="/"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
        >
          Back to dashboard
        </Link>
      </div>
    </section>
  );
}