const SIZE = 24;

function Svg({ children, strokeWidth = 1.8, className = 'h-5 w-5', ...rest }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function IconHome() {
  return (
    <Svg>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </Svg>
  );
}

export function IconSubjects() {
  return (
    <Svg>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
      <path d="M9 7h7M9 11h5" />
    </Svg>
  );
}

export function IconTasks() {
  return (
    <Svg>
      <rect x="4" y="3.5" width="16" height="17" rx="2.5" />
      <path d="m8 12 2.5 2.5L16 9" />
    </Svg>
  );
}

export function IconTimer() {
  return (
    <Svg>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9.5V13l2.5 1.5" />
      <path d="M9 2h6" />
    </Svg>
  );
}

export function IconPlanner() {
  return (
    <Svg>
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
      <path d="M16 3.5v3M8 3.5v3M3.5 10h17" />
      <path d="m9 15 2 2 4-4" />
    </Svg>
  );
}

export function IconGoals() {
  return (
    <Svg>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
    </Svg>
  );
}

export function IconRevision() {
  return (
    <Svg>
      <path d="M20 11a8 8 0 1 0-2.3 5.7" />
      <path d="M20 4.5V11h-6.5" />
    </Svg>
  );
}

export function IconMockTests() {
  return (
    <Svg>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </Svg>
  );
}

export function IconAnalytics() {
  return (
    <Svg>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20V8" />
    </Svg>
  );
}

export function IconAssistant() {
  return (
    <Svg>
      <path d="M12 3v2M12 19v2M5.6 5.6 7 7M17 17l1.4 1.4M3 12h2M19 12h2" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
    </Svg>
  );
}

export function IconSettings() {
  return (
    <Svg>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h.1a1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </Svg>
  );
}

export function IconBell() {
  return (
    <Svg>
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
      <path d="M10 19a2.5 2.5 0 0 0 4 0" />
    </Svg>
  );
}

export function IconMenu() {
  return (
    <Svg>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Svg>
  );
}

export function IconLogout() {
  return (
    <Svg>
      <path d="M14 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8" />
      <path d="M10 12h10M17 8.5 20.5 12 17 15.5" />
    </Svg>
  );
}

export function IconPlus() {
  return (
    <Svg>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

export function IconPlay() {
  return (
    <Svg>
      <path d="M7 5.5v13l11-6.5Z" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function IconChevronRight() {
  return (
    <Svg>
      <path d="m9 6 6 6-6 6" />
    </Svg>
  );
}

export function IconCalendar() {
  return (
    <Svg>
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
      <path d="M16 3v3M8 3v3M3.5 10h17" />
    </Svg>
  );
}

export function IconClock() {
  return (
    <Svg>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Svg>
  );
}

export function IconExam() {
  return (
    <Svg>
      <path d="M5 4.5h11a2 2 0 0 1 2 2V20H7.5A2.5 2.5 0 0 1 5 17.5Z" />
      <path d="M8 3.5v3M14 3.5v3M18 19.5A2.5 2.5 0 0 1 15.5 17H5" />
      <path d="m9 14 1.6 1.6L13.5 12" />
    </Svg>
  );
}

export function IconFlame() {
  return (
    <Svg>
      <path d="M12 21c4 0 6.5-2.5 6.5-6 0-2.5-1.6-4.6-3-6.5-.9-1.2-1.5-2.8-1.5-4.5 0-1 .2-1.9.2-3-.7.3-1.3.8-1.9 1.4C10.6 4 9.2 5.6 8.4 7.6A6.5 6.5 0 0 0 5.5 15c0 3.5 2.5 6 6.5 6Z" />
      <path d="M12 21c-2.5 0-4-1.8-4-4 0-1.4.7-2.5 1.5-3.6.3-.4.7-1 .8-1.5.6.4 1 .9 1.4 1.5.6-.9.9-2 .9-2.6 1.7 1.4 3.4 2.9 3.4 5.4 0 1.6-.6 4.4-4 4.8Z" />
    </Svg>
  );
}

export function IconTrendUp() {
  return (
    <Svg>
      <path d="m3 17 6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </Svg>
  );
}

export function IconAlert() {
  return (
    <Svg>
      <path d="M12 3.5 2.5 20h19Z" />
      <path d="M12 10v4.5" />
      <path d="M12 17.5v.1" />
    </Svg>
  );
}

export const NAV_ICONS = {
  home: IconHome,
  subjects: IconSubjects,
  tasks: IconTasks,
  timer: IconTimer,
  planner: IconPlanner,
  goals: IconGoals,
  revision: IconRevision,
  'mock-tests': IconMockTests,
  analytics: IconAnalytics,
  assistant: IconAssistant,
  settings: IconSettings,
  exam: IconExam,
};