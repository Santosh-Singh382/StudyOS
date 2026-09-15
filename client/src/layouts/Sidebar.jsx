import { NavLink } from 'react-router-dom';
import { PRIMARY_NAV, EXPLORE_NAV } from './nav-config';
import { IconLogout } from '../utils/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function navLinkClass({ isActive }) {
  return `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 ${
    isActive
      ? 'bg-violet-50 font-semibold text-violet-700'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`;
}

export function NavItems({ onNavigate, explore = true }) {
  return (
    <>
      <nav aria-label="Primary" className="space-y-0.5">
        {PRIMARY_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} end={item.end} onClick={onNavigate} className={navLinkClass}>
              <Icon className="h-[18px] w-[18px] flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      {explore && (
        <nav aria-label="Explore" className="mt-6 space-y-0.5">
          <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Explore
          </p>
          {EXPLORE_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} onClick={onNavigate} className={navLinkClass}>
                <Icon className="h-[18px] w-[18px] flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      )}
    </>
  );
}

export function Sidebar({ onNavigate }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 flex-shrink-0 flex-col justify-between overflow-y-auto border-r border-slate-200 bg-white px-3 py-5 md:flex">
      <div>
        <NavItems onNavigate={onNavigate} />
      </div>
      <div className="mt-6 border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
        >
          <IconLogout className="h-[18px] w-[18px] flex-shrink-0" />
          <span>Log out</span>
        </button>
        <p className="px-3 pt-3 text-[11px] leading-relaxed text-slate-400">
          StudyOS · Personal Study OS
        </p>
      </div>
    </aside>
  );
}