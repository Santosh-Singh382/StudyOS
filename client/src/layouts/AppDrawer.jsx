import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NavItems } from './Sidebar';
import { IconLogout } from '../utils/icons';

export default function AppDrawer({ open, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
    >
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="relative flex h-full w-80 max-w-[85%] flex-col bg-white shadow-xl">
        <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-slate-200 px-4">
          <Link to="/" onClick={onClose} className="flex items-center gap-2.5 font-semibold text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-sm font-bold text-white">
              S
            </span>
            <span className="text-[15px] tracking-tight">StudyOS</span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
          >
            <span aria-hidden="true" className="block h-5 w-5 text-lg leading-5">
              &times;
            </span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-5">
          <NavItems onNavigate={onClose} />
        </div>

        <div className="border-t border-slate-200 p-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              logout();
              navigate('/');
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
          >
            <IconLogout className="h-[18px] w-[18px]" />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </div>
  );
}