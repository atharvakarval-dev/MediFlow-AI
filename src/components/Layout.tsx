import { Outlet, Link, useLocation } from 'react-router-dom';
import { Activity, Stethoscope, Navigation2, Mic, User, Home } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Layout() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Welcome' },
    { path: '/identify', icon: User, label: 'Identify' },
    { path: '/intake', icon: Mic, label: 'Intake' },
    { path: '/triage', icon: Activity, label: 'Triage' },
    { path: '/navigate', icon: Navigation2, label: 'Navigate' },
    { path: '/dashboard', icon: Stethoscope, label: 'Dashboard' },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">MedFlow AI</h1>
        </div>
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-indigo-50 text-indigo-700" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="flex-1 overflow-y-auto relative">
        <Outlet />
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-white border-t border-slate-200 flex items-center justify-around p-2 pb-safe sticky bottom-0 z-10">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg transition-colors",
                isActive ? "text-indigo-600" : "text-slate-500"
              )}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
