import { NavLink } from 'react-router-dom';
import { BOTTOM_NAV } from './nav-config';
import { IconMenu } from '../utils/icons';

function bottomClass({ isActive }) {
  return `flex min-w-0 flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-300 ${
    isActive ? 'text-violet-700' : 'text-slate-500 hover:text-slate-800'
  }`;
}

export default function BottomNav({ onMore }) {
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {BOTTOM_NAV.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink key={item.to} to={item.to} end={item.end} className={bottomClass}>
            <Icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
      <button
        type="button"
        onClick={onMore}
        aria-label="Open navigation menu"
        className="flex min-w-0 flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium text-slate-500 transition-colors hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-300"
      >
        <IconMenu className="h-5 w-5" />
        <span>More</span>
      </button>
    </nav>
  );
}