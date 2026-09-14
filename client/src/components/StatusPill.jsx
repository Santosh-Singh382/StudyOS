const STATES = {
  connected: {
    dot: 'bg-emerald-500',
    text: 'text-emerald-700',
    ring: 'ring-emerald-200',
    label: 'Connected',
  },
  disconnected: {
    dot: 'bg-red-500',
    text: 'text-red-700',
    ring: 'ring-red-200',
    label: 'Disconnected',
  },
  checking: {
    dot: 'bg-slate-400 animate-pulse',
    text: 'text-slate-500',
    ring: 'ring-slate-200',
    label: 'Checking…',
  },
};

export default function StatusPill({ label, status }) {
  const state = STATES[status] ?? STATES.checking;

  return (
    <div
      role="status"
      className={`flex items-center gap-2 rounded-full bg-white px-4 py-2 ring-1 ${state.ring}`}
    >
      <span className={`h-2 w-2 rounded-full ${state.dot}`} aria-hidden="true" />
      <span className={`text-sm font-medium ${state.text}`}>
        {label}: {state.label}
      </span>
    </div>
  );
}