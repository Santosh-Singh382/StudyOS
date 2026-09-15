import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconBell, IconMenu, IconLogout } from '../utils/icons';

function initialsOf(name) {
  return (name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default function TopBar({ onOpenMenu }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [panel, setPanel] = useState(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setPanel(null);
    };
    const onClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setPanel(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClickOutside);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setPanel(null);
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Open navigation menu"
            className="-ml-1 rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 md:hidden"
          >
            <IconMenu className="h-5 w-5" />
          </button>
          <Link to="/" className="flex items-center gap-2.5 font-semibold text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-sm font-bold text-white">
              S
            </span>
            <span className="text-[15px] tracking-tight">StudyOS</span>
          </Link>
        </div>

        <div className="flex items-center gap-1 sm:gap-2" ref={wrapRef}>
          <button
            type="button"
            onClick={() => setPanel(panel === 'bell' ? null : 'bell')}
            aria-label="Notifications"
            aria-expanded={panel === 'bell'}
            aria-haspopup="true"
            className="relative rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
          >
            <IconBell className="h-5 w-5" />
            <span
              className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-violet-500"
              aria-hidden="true"
            />
          </button>

          {panel === 'bell' && (
            <div
              role="menu"
              className="absolute right-2 top-12 z-50 w-64 rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-lg sm:right-4"
            >
              <p className="font-semibold text-slate-900">Notifications</p>
              <p className="mt-1 text-xs text-slate-500">No new notifications yet.</p>
            </div>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setPanel(panel === 'avatar' ? null : 'avatar')}
              aria-haspopup="true"
              aria-expanded={panel === 'avatar'}
              className="flex items-center gap-2 rounded-lg p-1.5 pr-2 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700"
                aria-hidden="true"
              >
                {initialsOf(user?.name)}
              </span>
              <span className="hidden max-w-[9rem] truncate text-sm font-medium text-slate-700 lg:block">
                {user?.name}
              </span>
            </button>

            {panel === 'avatar' && (
              <div
                role="menu"
                className="absolute right-0 top-12 z-50 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-lg"
              >
                <div className="border-b border-slate-100 px-3 pb-2.5 pt-2">
                  <p className="truncate text-sm font-semibold text-slate-900">{user?.name}</p>
                  <p className="truncate text-xs text-slate-500">{user?.email}</p>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
                >
                  <IconLogout className="h-4 w-4" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}