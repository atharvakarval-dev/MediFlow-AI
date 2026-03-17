import { useState, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Activity, Stethoscope, Navigation2, Mic, User, Home } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Layout() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  const handleScroll = () => {
    if (mainRef.current) {
      setIsScrolled(mainRef.current.scrollTop > 20);
    }
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Welcome' },
    { path: '/identify', icon: User, label: 'Identify' },
    { path: '/intake', icon: Mic, label: 'Intake' },
    { path: '/triage', icon: Activity, label: 'Triage' },
    { path: '/navigate', icon: Navigation2, label: 'Navigate' },
    { path: '/dashboard', icon: Stethoscope, label: 'Dashboard' },
  ];

  return (
    <div className="flex flex-col h-screen text-white font-sans relative overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover -z-10 opacity-80 pointer-events-none"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260315_073750_51473149-4350-4920-ae24-c8214286f323.mp4"
      />
      
      {/* Floating Pill Navigation */}
      <div className={cn(
        "fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 w-full max-w-fit px-4 pointer-events-none",
        isScrolled ? "top-4" : "top-8"
      )}>
        <header className={cn(
          "pointer-events-auto flex items-center gap-2 sm:gap-4 rounded-full border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-500 mx-auto",
          isScrolled ? "bg-black/60 py-2 px-3" : "bg-black/40 py-2.5 px-4"
        )}>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                    isActive 
                      ? "bg-white/15 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/10" 
                      : "text-white/60 hover:text-white hover:bg-white/10 border border-transparent"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>
      </div>

      <main 
        ref={mainRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto relative z-10 w-full h-full"
      >
        <div className="pt-24 pb-10 min-h-full flex flex-col">
          <Outlet />
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden liquid-glass-strong m-4 rounded-3xl flex items-center justify-around p-2 pb-safe fixed bottom-0 left-0 right-0 z-50">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-xl transition-colors",
                isActive ? "text-white bg-white/20" : "text-white/50 hover:text-white"
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
