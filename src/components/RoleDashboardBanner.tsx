import React from 'react';
import { useRooms } from '../context/RoomContext';
import { 
  GraduationCap, 
  UserCheck, 
  BookOpen, 
  FileCheck2, 
  Search, 
  Navigation, 
  Database,
  Building,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { authService } from '../services/authService';

export const RoleDashboardBanner: React.FC = () => {
  const { 
    currentUser, 
    setCategoryFilter, 
    setSearchQuery, 
    setActiveNavTab,
    setIsDataManagerOpen,
    resetFilters,
    login
  } = useRooms();

  if (!currentUser) return null;

  // Student Dashboard
  if (currentUser.role === 'student') {
    return (
      <div className="bg-white border-b border-slate-200 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-xs font-bold text-[#0B2545] uppercase tracking-wide">
                  Student Dashboard
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs font-semibold text-blue-700 font-mono">
                  {currentUser.identifier}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-600 font-medium truncate max-w-[150px] sm:max-w-none">
                  {currentUser.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Welcome to NECN Campus Digital Twin. Search your lecture halls, lab terminals, and route pathways.
              </p>
            </div>
          </div>

          {/* Student Quick Shortcuts */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-slate-400 text-[11px] mr-1 hidden sm:inline">Student Shortcuts:</span>
            <button
              onClick={() => {
                resetFilters();
                setCategoryFilter('Labs');
                setActiveNavTab('finder');
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-900 text-slate-700 rounded-md border border-slate-200 transition-colors text-[11px]"
            >
              Academic Labs
            </button>
            <button
              onClick={() => {
                resetFilters();
                setSearchQuery('Library');
                setActiveNavTab('finder');
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-900 text-slate-700 rounded-md border border-slate-200 transition-colors text-[11px]"
            >
              Central Library
            </button>
            <button
              onClick={() => {
                resetFilters();
                setSearchQuery('Exam');
                setActiveNavTab('finder');
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-900 text-slate-700 rounded-md border border-slate-200 transition-colors text-[11px]"
            >
              Exam Cell
            </button>
            <button
              onClick={() => setActiveNavTab('map_routes')}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors text-[11px] flex items-center gap-1"
            >
              <Navigation className="w-3 h-3" />
              <span>Campus Map & Routes</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Teacher Account Pending Approval
  const isPendingTeacher = currentUser.role === 'teacher' && (currentUser.status === 'pending_approval' || currentUser.isPendingApproval);

  if (isPendingTeacher) {
    const handleApproveCurrentTeacher = () => {
      authService.approveTeacher(currentUser.identifier);
      login({
        ...currentUser,
        status: 'active',
        isPendingApproval: false
      });
    };

    return (
      <div className="bg-amber-50/70 border-b border-amber-200 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                  Faculty Account Under Verification
                </span>
                <span className="text-amber-300">·</span>
                <span className="text-xs font-semibold text-amber-900 font-mono">
                  {currentUser.identifier}
                </span>
                <span className="text-[10px] bg-amber-200 text-amber-900 font-semibold px-2 py-0.5 rounded">
                  Pending Principal Approval
                </span>
              </div>
              <p className="text-[11px] text-amber-800">
                Teacher privileges (room editing, custom data imports) are locked until your faculty identity is verified by college administration.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleApproveCurrentTeacher}
              className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-xs"
              title="Test approval flow: simulates administrator approving this faculty member"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Simulate Admin Approval</span>
            </button>
            <button
              onClick={() => setActiveNavTab('map_routes')}
              className="px-2.5 py-1.5 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 rounded-lg text-xs transition-colors flex items-center gap-1"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Campus Map</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Teacher / Faculty Dashboard (Approved)
  return (
    <div className="bg-white border-b border-slate-200 py-3.5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#0B2545] uppercase tracking-wide">
                Faculty & Staff Dashboard
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs font-semibold text-blue-700 font-mono">
                {currentUser.identifier}
              </span>
              <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 font-semibold px-2 py-0.5 rounded">
                Verified Faculty
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Welcome {currentUser.name}. Explore department cabins, supervise laboratories, and manage campus room data.
            </p>
          </div>
        </div>

        {/* Faculty Quick Shortcuts */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-slate-400 text-[11px] mr-1 hidden sm:inline">Faculty Actions:</span>
          <button
            onClick={() => {
              resetFilters();
              setCategoryFilter('Offices');
              setActiveNavTab('finder');
            }}
            className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-900 text-slate-700 rounded-md border border-slate-200 transition-colors text-[11px]"
          >
            HOD &amp; Staff Offices
          </button>
          <button
            onClick={() => {
              resetFilters();
              setCategoryFilter('Seminar Halls');
              setActiveNavTab('finder');
            }}
            className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-900 text-slate-700 rounded-md border border-slate-200 transition-colors text-[11px]"
          >
            Auditorium &amp; Seminar Halls
          </button>
          <button
            onClick={() => setIsDataManagerOpen(true)}
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors text-[11px] flex items-center gap-1"
          >
            <Database className="w-3 h-3" />
            <span>Manage Records</span>
          </button>
        </div>
      </div>
    </div>
  );
};
