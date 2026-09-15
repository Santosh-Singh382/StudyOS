import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppShell from './AppShell';

const slimNavClass = ({ isActive }) =>
  `rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-violet-50 text-violet-700'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`;

function SlimHeader() {
  const { isAuthenticated, loading, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-6">
        <Link to="/" className="flex items-center gap-2.5 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-sm font-bold text-white">
            S
          </span>
          <span className="text-slate-900">StudyOS</span>
        </Link>

        {loading && <span className="h-8 w-20 animate-pulse rounded-lg bg-slate-100" />}

        {!loading && (isAuthenticated ? (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-600">{user.name}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              Log out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <NavLink to="/login" className={slimNavClass}>
              Log in
            </NavLink>
            <NavLink to="/register" className={slimNavClass}>
              Sign up
            </NavLink>
          </div>
        ))}
      </nav>
    </header>
  );
}

export default function RootLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (!loading && isAuthenticated) {
    return (
      <AppShell>
        <Outlet />
      </AppShell>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased">
      <SlimHeader />
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
}