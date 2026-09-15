import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import TopBar from './TopBar';
import { Sidebar } from './Sidebar';
import BottomNav from './BottomNav';
import AppDrawer from './AppDrawer';

export default function AppShell({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased">
      <TopBar onOpenMenu={() => setDrawerOpen(true)} />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-[1600px] px-4 pb-24 pt-6 sm:px-6 sm:pt-8 md:pb-12 lg:px-8">
            {children}
          </div>
        </main>
      </div>
      <BottomNav onMore={() => setDrawerOpen(true)} />
      <AppDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}