import { Outlet } from 'react-router-dom';

export default function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased">
      <header className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2.5 font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-sm font-bold text-white">
              S
            </span>
            <span className="text-slate-900">StudyOS</span>
          </a>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
            Phase 1 · Foundation
          </span>
        </nav>
      </header>

      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-1 px-6 py-4 text-xs text-slate-400 sm:flex-row">
          <span>StudyOS · Personal Study Operating System</span>
          <span>MERN Foundation</span>
        </div>
      </footer>
    </div>
  );
}