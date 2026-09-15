import {
  IconHome,
  IconSubjects,
  IconTasks,
  IconTimer,
  IconPlanner,
  IconGoals,
  IconRevision,
  IconMockTests,
  IconAnalytics,
  IconAssistant,
  IconSettings,
} from '../utils/icons';

export const PRIMARY_NAV = [
  { to: '/', label: 'Dashboard', icon: IconHome, end: true },
  { to: '/subjects', label: 'Subjects', icon: IconSubjects },
  { to: '/tasks', label: 'Tasks', icon: IconTasks },
  { to: '/timer', label: 'Timer', icon: IconTimer },
  { to: '/topics', label: 'Planner', icon: IconPlanner, end: false },
];

export const EXPLORE_NAV = [
  { to: '/goals', label: 'Goals', icon: IconGoals },
  { to: '/revision', label: 'Revision', icon: IconRevision },
  { to: '/mock-tests', label: 'Mock Tests', icon: IconMockTests },
  { to: '/analytics', label: 'Analytics', icon: IconAnalytics },
  { to: '/ai-assistant', label: 'AI Assistant', icon: IconAssistant },
  { to: '/settings', label: 'Settings', icon: IconSettings },
];

export const BOTTOM_NAV = [
  { to: '/', label: 'Home', icon: IconHome, end: true },
  { to: '/tasks', label: 'Tasks', icon: IconTasks },
  { to: '/timer', label: 'Timer', icon: IconTimer },
  { to: '/analytics', label: 'Analytics', icon: IconAnalytics },
];