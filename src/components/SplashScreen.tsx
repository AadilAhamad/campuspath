import React, { useEffect } from 'react';
import { useRooms } from '../context/RoomContext';
import { Building2, Compass, ArrowRight } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  const { setAppStage, currentUser } = useRooms();

  useEffect(() => {
    // Automatically transition to login (or app if already authenticated) after 2.4 seconds
    const timer = setTimeout(() => {
      setAppStage('login');
    }, 2400);

    return () => clearTimeout(timer);
  }, [setAppStage]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-300">
      <div className="max-w-md w-full flex flex-col items-center space-y-6">
        
        {/* Logo Emblem on clean white background */}
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center shadow-xs">
            <Building2 className="w-10 h-10 text-blue-700" />
          </div>
          <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Compass className="w-4 h-4" />
          </div>
        </div>

        {/* College & Brand Titles */}
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B2545] font-display">
            NECN CampusPath
          </h1>
          <p className="text-sm font-semibold text-blue-900 tracking-wide uppercase">
            Narayana Engineering College, Nellore
          </p>
          <p className="text-xs text-slate-500 pt-1">
            Campus Digital Twin & Room Finder
          </p>
        </div>

        {/* Minimal Progress Bar */}
        <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full animate-[pulse_1.2s_ease-in-out_infinite]" style={{ width: '70%' }} />
        </div>

        {/* Skip / Continue Button */}
        <div className="pt-4">
          <button
            onClick={() => setAppStage('login')}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
          >
            <span>Proceed to Login</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* College Footnote */}
      <div className="absolute bottom-6 text-[11px] text-slate-400">
        An Autonomous Institution · Muthukur Road, Nellore
      </div>
    </div>
  );
};
