export const TOPIC_STATUSES = [
  { value: 'NOT_STARTED', label: 'Not started' },
  { value: 'LEARNING', label: 'Learning' },
  { value: 'PRACTICING', label: 'Practicing' },
  { value: 'TESTED', label: 'Tested' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'REVISION', label: 'Revision' },
  { value: 'MASTERED', label: 'Mastered' },
];

export const TOPIC_PRIORITIES = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
];

export const SUBJECT_COLORS = [
  '#7c3aed',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#64748b',
  '#0891b2',
];

export const STATUS_HEX = {
  NOT_STARTED: '#64748b',
  LEARNING: '#0ea5e9',
  PRACTICING: '#f59e0b',
  TESTED: '#7c3aed',
  COMPLETED: '#10b981',
  REVISION: '#0891b2',
  MASTERED: '#ef4444',
};

export const PRIORITY_HEX = {
  LOW: '#64748b',
  MEDIUM: '#0ea5e9',
  HIGH: '#ef4444',
};

export const TASK_PRIORITIES = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

export const TASK_STATUSES = [
  { value: 'TODO', label: 'Todo' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'COMPLETED', label: 'Completed' },
];

export const TASK_STATUS_HEX = {
  TODO: '#64748b',
  IN_PROGRESS: '#0ea5e9',
  COMPLETED: '#10b981',
};

export const TASK_PRIORITY_HEX = {
  LOW: '#64748b',
  MEDIUM: '#0ea5e9',
  HIGH: '#ef4444',
  URGENT: '#dc2626',
};

export const SESSION_MODES = [
  { value: 'STUDY', label: 'Study' },
  { value: 'POMODORO_FOCUS', label: 'Pomodoro Focus' },
  { value: 'POMODORO_SHORT_BREAK', label: 'Short Break' },
  { value: 'POMODORO_LONG_BREAK', label: 'Long Break' },
];

export const SESSION_MODE_HEX = {
  STUDY: '#7c3aed',
  POMODORO_FOCUS: '#dc2626',
  POMODORO_SHORT_BREAK: '#0ea5e9',
  POMODORO_LONG_BREAK: '#10b981',
};

export const SESSION_STATUS_HEX = {
  RUNNING: '#0ea5e9',
  PAUSED: '#f59e0b',
  COMPLETED: '#10b981',
  CANCELLED: '#64748b',
};