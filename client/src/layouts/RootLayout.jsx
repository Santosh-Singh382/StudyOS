import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinkClass = ({ isActive }) =>
  `rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-violet-50 text-violet-700'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`;

export default function RootLayout() {
  const { isAuthenticated, loading, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased">
      <header className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5 font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-sm font-bold text-white">
              S
            </span>
            <span className="text-slate-900">StudyOS</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="mr-2 hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200 sm:inline">
              Phase 4 · Tasks
            </span>

            {loading ? (
              <span className="h-8 w-20 animate-pulse rounded-lg bg-slate-100" />
            ) : isAuthenticated ? (
              <>
                <nav className="hidden items-center gap-1 md:flex">
                  <NavLink to="/subjects" className={navLinkClass}>
                    Subjects
                  </NavLink>
                  <NavLink to="/topics" className={navLinkClass}>
                    Topics
                  </NavLink>
                  <NavLink to="/tasks" className={navLinkClass}>
                    Tasks
                  </NavLink>
                </nav>
                <span className="text-sm font-medium text-slate-600">
                  {user.name}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg bg-transparent px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navLinkClass}>
                  Log in
                </NavLink>
                <NavLink to="/register" className={navLinkClass}>
                  Sign up
                </NavLink>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-1 px-6 py-4 text-xs text-slate-400 sm:flex-row">
          <span>StudyOS · Personal Study Operating System</span>
          <span>Tasks · Phase 4</span>
        </div>
      </footer>
    </div>
  );
}