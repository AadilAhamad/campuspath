import React from 'react';
import { useRooms } from '../context/RoomContext';
import { 
  Building2, 
  Database, 
  LogOut,
  GraduationCap,
  UserCheck,
  Navigation,
  Search,
  FileSpreadsheet
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    isEmbedMode, 
    setIsDataManagerOpen,
    setIsSheetsConfigModalOpen,
    sheetsStatus,
    activeNavTab,
    setActiveNavTab,
    setBlockFilter,
    resetFilters,
    filters,
    currentUser,
    logout
  } = useRooms();

  if (isEmbedMode) {
    // Streamlined minimal header for Google Sites iframe embedding on clean white background
    return (
      <header className="bg-white text-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
            N
          </div>
          <span className="font-bold text-[#0B2545] font-display">NECN CampusPath</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-500">Map & Finder</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveNavTab('finder')}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              activeNavTab === 'finder' ? 'font-semibold text-blue-700 bg-blue-50' : 'text-slate-600'
            }`}
          >
            Rooms
          </button>
          <button
            onClick={() => setActiveNavTab('map_routes')}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              activeNavTab === 'map_routes' ? 'font-semibold text-blue-700 bg-blue-50' : 'text-slate-600'
            }`}
          >
            Campus Route
          </button>
          <button
            onClick={() => setIsDataManagerOpen(true)}
            className="text-slate-600 hover:text-[#0B2545] p-1"
            title="Manage Data"
          >
            <Database className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={logout}
            className="text-slate-500 hover:text-red-600 p-1"
            title="Log out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white text-slate-900 border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4 h-15 sm:h-18">
          
          {/* Zone 1: Brand wordmark & college title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shadow-xs shrink-0">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5 sm:gap-2">
                <span className="text-base sm:text-xl font-bold tracking-tight text-[#0B2545] font-display whitespace-nowrap">
                  NECN CampusPath
                </span>
                <span className="text-xs font-semibold text-blue-600 hidden md:inline">
                  Campus Digital Twin
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 tracking-wide font-normal truncate max-w-[130px] sm:max-w-none">
                Narayana Engineering College, Nellore
              </p>
            </div>
          </div>

          {/* Zone 2: Navigation Modes & Block Shortcuts (Desktop / Laptop) */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 text-xs font-medium shrink-0">
            <button
              onClick={() => {
                setActiveNavTab('finder');
                resetFilters();
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeNavTab === 'finder' && filters.block === 'All'
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                  : 'text-slate-600 hover:text-[#0B2545]'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Room Finder</span>
            </button>

            <button
              onClick={() => setActiveNavTab('map_routes')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeNavTab === 'map_routes'
                  ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                  : 'text-slate-600 hover:text-[#0B2545]'
              }`}
            >
              <Navigation className="w-3.5 h-3.5 text-blue-700" />
              <span>Campus Map &amp; Routes</span>
            </button>

            <span className="text-slate-200 hidden lg:inline">|</span>

            <button
              onClick={() => {
                setActiveNavTab('finder');
                setBlockFilter('Block A');
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs transition-colors hidden lg:inline-block ${
                activeNavTab === 'finder' && filters.block === 'Block A'
                  ? 'text-blue-700 font-semibold underline underline-offset-4 decoration-blue-600'
                  : 'text-slate-500 hover:text-[#0B2545]'
              }`}
            >
              Block A
            </button>
            <button
              onClick={() => {
                setActiveNavTab('finder');
                setBlockFilter('Block B');
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs transition-colors hidden lg:inline-block ${
                activeNavTab === 'finder' && filters.block === 'Block B'
                  ? 'text-blue-700 font-semibold underline underline-offset-4 decoration-blue-600'
                  : 'text-slate-500 hover:text-[#0B2545]'
              }`}
            >
              Block B
            </button>
            <button
              onClick={() => {
                setActiveNavTab('finder');
                setBlockFilter('Block C');
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs transition-colors hidden lg:inline-block ${
                activeNavTab === 'finder' && filters.block === 'Block C'
                  ? 'text-blue-700 font-semibold underline underline-offset-4 decoration-blue-600'
                  : 'text-slate-500 hover:text-[#0B2545]'
              }`}
            >
              Block C
            </button>
          </nav>

          {/* Zone 3: Session Status, Google Sheets & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {currentUser && (
              <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                {currentUser.role === 'student' ? (
                  <GraduationCap className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                )}
                <span className="font-semibold text-slate-900 font-mono text-[11px] sm:text-xs truncate max-w-[65px] sm:max-w-none">
                  {currentUser.identifier}
                </span>
                {currentUser.role === 'teacher' && currentUser.status === 'pending_approval' && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded ml-0.5 hidden sm:inline">
                    Pending
                  </span>
                )}
                {currentUser.role === 'teacher' && currentUser.status === 'active' && (
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded ml-0.5 hidden sm:inline">
                    Faculty
                  </span>
                )}
                {currentUser.role === 'student' && (
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded ml-0.5 hidden sm:inline">
                    Student
                  </span>
                )}
              </div>
            )}

            {/* Google Sheets Integration Option */}
            <button
              onClick={() => setIsSheetsConfigModalOpen(true)}
              className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap border min-h-[34px] ${
                sheetsStatus === 'connected'
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 hover:bg-emerald-100/70'
                  : 'bg-white border-slate-200 text-slate-700 hover:text-[#0B2545] hover:bg-slate-50'
              }`}
              title={
                sheetsStatus === 'connected'
                  ? 'Google Sheets: Connected & Synced (Click to view or sync)'
                  : sheetsStatus === 'error'
                  ? 'Google Sheets: Connection Error (Click to troubleshoot)'
                  : sheetsStatus === 'loading'
                  ? 'Google Sheets: Syncing in progress...'
                  : 'Google Sheets: Setup Required (Click to configure spreadsheet sync)'
              }
              aria-label="Google Sheets Configuration"
            >
              <FileSpreadsheet className={`w-3.5 h-3.5 shrink-0 ${sheetsStatus === 'connected' ? 'text-emerald-700' : 'text-blue-700'}`} />
              <span className="hidden md:inline">Google Sheets</span>
              <span className="hidden sm:inline md:hidden">Sheets</span>
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  sheetsStatus === 'connected'
                    ? 'bg-emerald-500'
                    : sheetsStatus === 'error'
                    ? 'bg-red-500'
                    : sheetsStatus === 'loading'
                    ? 'bg-blue-500 animate-pulse'
                    : 'bg-amber-400'
                }`}
              />
            </button>

            {/* Data Manager is restricted to verified faculty only */}
            {currentUser?.role === 'teacher' && currentUser.status === 'active' && (
              <button
                onClick={() => setIsDataManagerOpen(true)}
                className="hidden md:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-[#0B2545] hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap border border-slate-200 min-h-[34px]"
                title="Add, edit, or import room records (Approved Faculty Only)"
              >
                <Database className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                <span className="hidden lg:inline">Manage Data</span>
                <span className="lg:hidden">Data</span>
              </button>
            )}

            {/* Logout / Switch Account */}
            <button
              onClick={logout}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200 shrink-0 min-w-[34px] min-h-[34px] flex items-center justify-center"
              title="Sign out / Switch Login"
              aria-label="Sign out / Switch Login"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
