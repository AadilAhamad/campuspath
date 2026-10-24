import React, { useState, useEffect, useMemo } from 'react';
import { useRooms } from '../context/RoomContext';
import { 
  X, 
  Building2, 
  Compass, 
  MapPin,
  ChevronRight,
  ExternalLink,
  Info,
  Layers,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Maximize2,
  Navigation
} from 'lucide-react';
import { RoomRecord } from '../types/room';

type BlockTab = 'Block A' | 'Block B' | 'Block C' | 'Layout';

interface FloorDefinition {
  id: string;
  name: string;
  levelLabel: string;
  shortDesc: string;
  facilities: string[];
  y: number;
  height: number;
}

const BLOCK_A_FLOORS: FloorDefinition[] = [
  {
    id: '3rd Floor',
    name: '3rd Floor',
    levelLabel: 'Level 3 · Science Wing',
    shortDesc: 'Physics & Chemistry Laboratories',
    facilities: ['Physics Labs', 'Chemistry Labs'],
    y: 35,
    height: 60
  },
  {
    id: '2nd Floor',
    name: '2nd Floor',
    levelLabel: 'Level 2 · Academic Classrooms',
    shortDesc: 'Classrooms & Academic Lecture Rooms',
    facilities: ['Academic Classrooms'],
    y: 105,
    height: 60
  },
  {
    id: '1st Floor',
    name: '1st Floor',
    levelLabel: 'Level 1 · CSE & Computing',
    shortDesc: 'CSE Seminar Hall & Computer Labs',
    facilities: ['CSE Seminar Hall', 'Computer Labs'],
    y: 175,
    height: 60
  },
  {
    id: 'Ground Floor',
    name: 'Ground Floor',
    levelLabel: 'Ground Floor · Heavy Engineering Labs',
    shortDesc: 'Mechanical Seminar Hall, Mechanical, Civil & Electrical Labs',
    facilities: ['Mechanical Seminar Hall', 'Mechanical Labs', 'Civil Labs', 'Electrical Lab'],
    y: 245,
    height: 60
  }
];

const BLOCK_B_FLOORS: FloorDefinition[] = [
  {
    id: '2nd Floor',
    name: '2nd Floor',
    levelLabel: 'Level 2 · Circuit Seminar Halls',
    shortDesc: 'EEE & ECE Department Seminar Halls',
    facilities: ['EEE Seminar Hall', 'ECE Seminar Hall'],
    y: 55,
    height: 75
  },
  {
    id: '1st Floor',
    name: '1st Floor',
    levelLabel: 'Level 1 · Library & Circuit Labs',
    shortDesc: 'Central Library, EEE Labs & ECE Labs',
    facilities: ['Central Library', 'EEE Labs', 'ECE Labs'],
    y: 145,
    height: 75
  },
  {
    id: 'Ground Floor',
    name: 'Ground Floor',
    levelLabel: 'Ground Floor · Executive & Exam Administration',
    shortDesc: 'Examination Cell, Principal’s Room & Administrative Office (AO)',
    facilities: ['Examination Cell / Exam Section', "Principal's Room", 'Administrative Office (AO)'],
    y: 235,
    height: 75
  }
];

const BLOCK_C_FLOORS: FloorDefinition[] = [
  {
    id: '1st Floor',
    name: '1st Floor',
    levelLabel: 'Level 1 · Auditorium Wing (Directly above Canteen)',
    shortDesc: 'College Auditorium & Computer Labs (Block C 1st Floor, exact rooms unverified)',
    facilities: ['Auditorium', 'Computer labs'],
    y: 85,
    height: 105
  },
  {
    id: 'Ground Floor',
    name: 'Ground Floor',
    levelLabel: 'Ground Floor · Campus Canteen (Placement unverified)',
    shortDesc: 'Campus Canteen & Student Refreshments (exact size unverified)',
    facilities: ['Canteen'],
    y: 205,
    height: 105
  }
];

export const CampusOverviewModal: React.FC = () => {
  const { 
    isCampusOverviewOpen, 
    setIsCampusOverviewOpen, 
    selectedRoom,
    setSelectedRoom,
    rooms,
    setBlockFilter,
    resetFilters,
    setActiveNavTab
  } = useRooms();

  const [activeTab, setActiveTab] = useState<BlockTab>('Block A');
  const [activeFloor, setActiveFloor] = useState<string | null>(null);
  const [hoveredFloor, setHoveredFloor] = useState<string | null>(null);

  // Synchronize active tab & floor highlight whenever a room is selected or modal opens
  useEffect(() => {
    if (selectedRoom) {
      if (selectedRoom.block === 'Block A') {
        setActiveTab('Block A');
        setActiveFloor(selectedRoom.floor);
      } else if (selectedRoom.block === 'Block B') {
        setActiveTab('Block B');
        setActiveFloor(selectedRoom.floor);
      } else if (selectedRoom.block === 'Block C') {
        setActiveTab('Block C');
        setActiveFloor(selectedRoom.floor);
      } else if (selectedRoom.block.includes('Between') || selectedRoom.block.includes('Sports')) {
        setActiveTab('Layout');
        setActiveFloor(null);
      }
    } else {
      // Default to ground floor if none selected
      if (!activeFloor) {
        setActiveFloor('Ground Floor');
      }
    }
  }, [selectedRoom, isCampusOverviewOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCampusOverviewOpen) {
        setIsCampusOverviewOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCampusOverviewOpen, setIsCampusOverviewOpen]);

  if (!isCampusOverviewOpen) return null;

  const currentFloors = activeTab === 'Block A' 
    ? BLOCK_A_FLOORS 
    : activeTab === 'Block B' 
    ? BLOCK_B_FLOORS 
    : activeTab === 'Block C' 
    ? BLOCK_C_FLOORS 
    : [];

  // Determine if the selected room matches the current view
  const isTargetInCurrentBlock = Boolean(selectedRoom && selectedRoom.block === activeTab);
  const isTargetFloorUnverified = Boolean(isTargetInCurrentBlock && selectedRoom?.floor === 'Not verified');

  // Facilities belonging to active floor
  const activeFloorRecords = rooms.filter(
    (r) => r.block === activeTab && r.floor === activeFloor
  );

  // Staff rooms with unverified floor in this block
  const unverifiedStaffRecords = rooms.filter(
    (r) => r.block === activeTab && (r.floor === 'Not verified' || r.floor === 'Unknown')
  );

  const handleSelectBlockFilter = (block: string) => {
    resetFilters();
    setBlockFilter(block);
    setIsCampusOverviewOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div 
        className="fixed inset-0" 
        onClick={() => setIsCampusOverviewOpen(false)} 
        aria-hidden="true" 
      />

      <div className="relative bg-white rounded-2xl max-w-5xl w-full overflow-hidden shadow-2xl border border-slate-200 z-10 flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-white text-slate-900 px-5 sm:px-6 py-4 flex items-center justify-between border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-display text-[#0B2545]">
                  Campus Overview &amp; Interactive Floor Cutaway
                </h2>
                <span className="hidden sm:inline-block text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Dynamic SVG Overlays
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Schematic floor elevations &amp; confirmed facilities for Narayana Engineering College, Nellore
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCampusOverviewOpen(false)}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Room Target Banner (if location is selected from search) */}
        {selectedRoom && (
          <div className="bg-gradient-to-r from-blue-900 via-[#0B2545] to-slate-900 text-white px-5 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-xs shrink-0 shadow-inner">
            <div className="flex items-center gap-2.5 flex-wrap min-w-0">
              <span className="flex items-center gap-1.5 text-amber-300 font-bold tracking-wide uppercase text-[10px] bg-amber-400/20 px-2 py-0.5 rounded border border-amber-300/30">
                <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                <span>Active Target</span>
              </span>
              <span className="font-semibold text-white truncate max-w-xs sm:max-w-md">
                {selectedRoom.name}
              </span>
              <span className="text-blue-300 font-mono">
                [{selectedRoom.block}]
              </span>
              <span className="text-slate-300">·</span>
              {selectedRoom.floor === 'Not verified' ? (
                <span className="bg-amber-500/30 text-amber-200 px-2 py-0.5 rounded border border-amber-400/40 font-medium">
                  Floor: Not verified (Block confirmed)
                </span>
              ) : (
                <span className="bg-blue-600/60 text-blue-100 px-2 py-0.5 rounded border border-blue-400/40 font-medium">
                  {selectedRoom.floor}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!isTargetInCurrentBlock && (
                <button
                  onClick={() => {
                    if (selectedRoom.block === 'Block A') setActiveTab('Block A');
                    else if (selectedRoom.block === 'Block B') setActiveTab('Block B');
                    else if (selectedRoom.block === 'Block C') setActiveTab('Block C');
                    else setActiveTab('Layout');
                    setActiveFloor(selectedRoom.floor);
                  }}
                  className="text-[11px] font-semibold text-blue-200 hover:text-white underline underline-offset-2 transition-colors"
                >
                  Switch to {selectedRoom.block}
                </button>
              )}
              <button
                onClick={() => setSelectedRoom(null)}
                className="text-[11px] text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-colors"
              >
                Clear Focus
              </button>
            </div>
          </div>
        )}

        {/* Tab Bar (Block A, Block B, Block C, Campus Layout) */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 sm:px-6 py-2.5 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {(['Block A', 'Block B', 'Block C', 'Layout'] as BlockTab[]).map((tab) => {
              const isSelected = activeTab === tab;
              const hasTarget = selectedRoom && (
                tab === 'Layout' 
                  ? selectedRoom.block.includes('Between') || selectedRoom.block.includes('Sports')
                  : selectedRoom.block === tab
              );

              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    if (tab === 'Block A') setActiveFloor(selectedRoom?.block === 'Block A' ? selectedRoom.floor : 'Ground Floor');
                    if (tab === 'Block B') setActiveFloor(selectedRoom?.block === 'Block B' ? selectedRoom.floor : 'Ground Floor');
                    if (tab === 'Block C') setActiveFloor(selectedRoom?.block === 'Block C' ? selectedRoom.floor : 'Ground Floor');
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all relative flex items-center gap-1.5 whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#0B2545] text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-100/60'
                  }`}
                >
                  <Building2 className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-300' : 'text-slate-400'}`} />
                  <span>{tab === 'Layout' ? 'Campus Layout & Entrances' : tab}</span>
                  {tab === 'Block A' && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isSelected ? 'bg-blue-800 text-blue-200' : 'bg-slate-100 text-slate-500'}`}>
                      4 Floors
                    </span>
                  )}
                  {tab === 'Block B' && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isSelected ? 'bg-blue-800 text-blue-200' : 'bg-slate-100 text-slate-500'}`}>
                      3 Floors
                    </span>
                  )}
                  {tab === 'Block C' && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isSelected ? 'bg-blue-800 text-blue-200' : 'bg-slate-100 text-slate-500'}`}>
                      2 Floors
                    </span>
                  )}
                  {hasTarget && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 ring-2 ring-white animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {activeTab !== 'Layout' && (
            <button
              onClick={() => handleSelectBlockFilter(activeTab)}
              className="text-xs font-medium text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              <span>Filter {activeTab} in Search</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Modal Main Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          
          {activeTab !== 'Layout' ? (
            <>
              {/* Dynamic SVG Elevation Cutaway Section */}
              <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl relative overflow-hidden">
                {/* SVG Visual Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800 text-slate-300 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold text-white font-display text-sm tracking-wide">
                      {activeTab} Elevation Cutaway
                    </span>
                    <span className="text-slate-500">|</span>
                    <span className="text-slate-400">Click any floor level to inspect confirmed facilities</span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-blue-600/80 border border-blue-400" />
                      <span>Target Highlight</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700" />
                      <span>Verified Floor</span>
                    </div>
                  </div>
                </div>

                {/* The Dynamic SVG Architectural Elevation */}
                <div className="relative w-full overflow-x-auto no-scrollbar flex justify-center py-1">
                  <svg
                    viewBox="0 0 760 360"
                    className="w-full max-w-[760px] h-auto select-none font-sans"
                    style={{ minWidth: '580px' }}
                  >
                    <defs>
                      {/* Glow filter for highlighted target floor */}
                      <filter id="target-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
                        <feComponentTransfer in="blur" result="glow">
                          <feFuncA type="linear" slope="0.8" />
                        </feComponentTransfer>
                        <feMerge>
                          <feMergeNode in="glow" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>

                      {/* Beacon pulsing animation gradient */}
                      <radialGradient id="beacon-grad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#60a5fa" stopOpacity="1" />
                        <stop offset="60%" stopColor="#2563eb" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0" />
                      </radialGradient>

                      {/* Diagonal caution stripes for unverified floors */}
                      <pattern id="unverified-stripes" width="12" height="12" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                        <line x1="0" y1="0" x2="0" y2="12" stroke="#f59e0b" strokeWidth="3" opacity="0.45" />
                        <line x1="6" y1="0" x2="6" y2="12" stroke="#0f172a" strokeWidth="3" opacity="0.2" />
                      </pattern>

                      {/* Floor gradient textures */}
                      <linearGradient id="floor-normal-grad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#1e293b" />
                        <stop offset="50%" stopColor="#334155" />
                        <stop offset="100%" stopColor="#1e293b" />
                      </linearGradient>

                      <linearGradient id="floor-highlight-grad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#1e3a8a" />
                        <stop offset="50%" stopColor="#2563eb" />
                        <stop offset="100%" stopColor="#1e3a8a" />
                      </linearGradient>

                      <linearGradient id="ground-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0f172a" />
                        <stop offset="100%" stopColor="#020617" />
                      </linearGradient>
                    </defs>

                    {/* Background Grid & Architectural Ruler Lines */}
                    <g opacity="0.15">
                      <line x1="40" y1="35" x2="40" y2="310" stroke="#94a3b8" strokeDasharray="3 3" />
                      <line x1="720" y1="35" x2="720" y2="310" stroke="#94a3b8" strokeDasharray="3 3" />
                      <line x1="20" y1="310" x2="740" y2="310" stroke="#94a3b8" strokeWidth="1" />
                    </g>

                    {/* Structural Foundation & Ground Base */}
                    <rect x="30" y="310" width="700" height="36" fill="url(#ground-grad)" rx="4" />
                    <line x1="30" y1="310" x2="730" y2="310" stroke="#475569" strokeWidth="2" />
                    
                    {/* Ground Level Footpath / Entrance Labels */}
                    <text x="50" y="332" fill="#94a3b8" fontSize="11" fontWeight="600" letterSpacing="0.05em">
                      GROUND LEVEL ENTRY PLAZA
                    </text>
                    <text x="710" y="332" textAnchor="end" fill="#64748b" fontSize="10">
                      FOUNDATION GRADE 0.00m
                    </text>

                    {/* Building Shell Outer Columns */}
                    <rect x="60" y="25" width="14" height="285" fill="#334155" rx="2" opacity="0.7" />
                    <rect x="686" y="25" width="14" height="285" fill="#334155" rx="2" opacity="0.7" />
                    
                    {/* Roof parapet */}
                    <rect x="54" y="20" width="652" height="10" fill="#475569" rx="2" />

                    {/* UNVERIFIED FLOOR OVERLAY (If selected room is in this block but floor is unverified) */}
                    {isTargetFloorUnverified && (
                      <g>
                        <rect 
                          x="74" 
                          y="35" 
                          width="612" 
                          height="270" 
                          fill="url(#unverified-stripes)" 
                          rx="6" 
                          stroke="#f59e0b" 
                          strokeWidth="2"
                          strokeDasharray="6 4"
                          opacity="0.9"
                        />
                        <g transform="translate(380, 160)">
                          <rect x="-180" y="-30" width="360" height="60" rx="8" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" filter="url(#target-glow)" />
                          <circle cx="-150" cy="0" r="14" fill="#f59e0b" />
                          <text x="-150" y="5" textAnchor="middle" fill="#0f172a" fontSize="16" fontWeight="bold">!</text>
                          <text x="-125" y="-6" fill="#fef3c7" fontSize="12" fontWeight="bold">
                            FLOOR NOT CONFIRMED IN NOTES
                          </text>
                          <text x="-125" y="14" fill="#cbd5e1" fontSize="10">
                            {selectedRoom?.name} is in {activeTab}, but floor is unverified
                          </text>
                        </g>
                      </g>
                    )}

                    {/* Render Each Floor Slab */}
                    {currentFloors.map((floor) => {
                      const isTargetFloor = Boolean(
                        isTargetInCurrentBlock && 
                        selectedRoom?.floor === floor.id
                      );
                      const isCurrentSelected = activeFloor === floor.id;
                      const isHovered = hoveredFloor === floor.id;

                      const floorX = 80;
                      const floorWidth = 600;
                      const floorY = floor.y;
                      const floorH = floor.height;

                      return (
                        <g 
                          key={floor.id} 
                          className="cursor-pointer transition-all duration-200"
                          onClick={() => setActiveFloor(floor.id)}
                          onMouseEnter={() => setHoveredFloor(floor.id)}
                          onMouseLeave={() => setHoveredFloor(null)}
                        >
                          {/* Floor Structural Background Slab */}
                          <rect
                            x={floorX}
                            y={floorY}
                            width={floorWidth}
                            height={floorH}
                            rx="6"
                            fill={
                              isTargetFloor 
                                ? 'url(#floor-highlight-grad)' 
                                : isCurrentSelected
                                ? '#1e293b'
                                : isHovered
                                ? '#334155'
                                : '#1e293b'
                            }
                            stroke={
                              isTargetFloor 
                                ? '#60a5fa' 
                                : isCurrentSelected
                                ? '#3b82f6'
                                : isHovered
                                ? '#94a3b8'
                                : '#475569'
                            }
                            strokeWidth={isTargetFloor ? 3 : isCurrentSelected ? 2 : 1}
                            filter={isTargetFloor ? 'url(#target-glow)' : undefined}
                            opacity={isTargetFloor ? 1 : isCurrentSelected ? 0.95 : 0.75}
                          />

                          {/* Floor Level Left Accent Bar */}
                          <rect
                            x={floorX}
                            y={floorY}
                            width="8"
                            height={floorH}
                            fill={isTargetFloor ? '#38bdf8' : isCurrentSelected ? '#3b82f6' : '#64748b'}
                            rx="2"
                          />

                          {/* Floor Level Label */}
                          <text
                            x={floorX + 20}
                            y={floorY + 22}
                            fill={isTargetFloor ? '#ffffff' : '#f8fafc'}
                            fontSize="13"
                            fontWeight="bold"
                            letterSpacing="0.02em"
                          >
                            {floor.name}
                          </text>

                          <text
                            x={floorX + 20}
                            y={floorY + 38}
                            fill={isTargetFloor ? '#bfdbfe' : '#94a3b8'}
                            fontSize="10"
                          >
                            {floor.levelLabel}
                          </text>

                          {/* Architectural Window / Room zone slots */}
                          <g transform={`translate(${floorX + 210}, ${floorY + 10})`}>
                            {floor.facilities.map((facName, idx) => {
                              const isRoomMatch = Boolean(isTargetInCurrentBlock && selectedRoom?.name === facName);
                              const chipX = idx * 185;

                              return (
                                <g key={facName} transform={`translate(${chipX}, 0)`}>
                                  <rect
                                    x="0"
                                    y="0"
                                    width="175"
                                    height={floorH - 20}
                                    rx="4"
                                    fill={
                                      isRoomMatch
                                        ? '#1d4ed8'
                                        : isTargetFloor
                                        ? 'rgba(30, 58, 138, 0.4)'
                                        : '#0f172a'
                                    }
                                    stroke={
                                      isRoomMatch
                                        ? '#93c5fd'
                                        : isTargetFloor
                                        ? '#60a5fa'
                                        : '#334155'
                                    }
                                    strokeWidth={isRoomMatch ? 2 : 1}
                                  />

                                  {/* Confirmed Facility Label */}
                                  <text
                                    x="10"
                                    y="18"
                                    fill={isRoomMatch ? '#ffffff' : isTargetFloor ? '#f1f5f9' : '#cbd5e1'}
                                    fontSize="11"
                                    fontWeight={isRoomMatch ? 'bold' : '600'}
                                  >
                                    {facName}
                                  </text>

                                  <text
                                    x="10"
                                    y="32"
                                    fill={isRoomMatch ? '#93c5fd' : '#64748b'}
                                    fontSize="9"
                                  >
                                    {isRoomMatch ? '★ SELECTED TARGET' : 'Verified Location'}
                                  </text>
                                </g>
                              );
                            })}
                          </g>

                          {/* TARGET HIGHLIGHT PIN & RADAR BEACON */}
                          {isTargetFloor && (
                            <g transform={`translate(${floorX + floorWidth - 30}, ${floorY + floorH / 2})`}>
                              {/* Pulsing ripple */}
                              <circle cx="0" cy="0" r="16" fill="#3b82f6" opacity="0.25">
                                <animate attributeName="r" values="8;24;8" dur="2s" repeatCount="indefinite" />
                                <animate attributeName="opacity" values="0.7;0;0.7" dur="2s" repeatCount="indefinite" />
                              </circle>
                              <circle cx="0" cy="0" r="7" fill="#60a5fa" stroke="#ffffff" strokeWidth="2" />
                            </g>
                          )}

                          {/* Leader Line Tag if Target */}
                          {isTargetFloor && selectedRoom && (
                            <g transform={`translate(${floorX + floorWidth + 12}, ${floorY + floorH / 2})`}>
                              <line x1="-12" y1="0" x2="10" y2="0" stroke="#60a5fa" strokeWidth="2" strokeDasharray="2 2" />
                              <rect x="10" y="-14" width="45" height="28" rx="4" fill="#2563eb" stroke="#93c5fd" strokeWidth="1" />
                              <text x="32" y="4" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                                HERE
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}

                    {/* Floor Slab Separators */}
                    <line x1="74" y1="310" x2="686" y2="310" stroke="#64748b" strokeWidth="3" />
                  </svg>
                </div>

                {/* SVG Footer Controls / Quick Floor Selector */}
                <div className="pt-3 mt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-slate-400 font-medium">Floor Selection:</span>
                    {currentFloors.map((fl) => {
                      const isTarget = isTargetInCurrentBlock && selectedRoom?.floor === fl.id;
                      const isCurrent = activeFloor === fl.id;

                      return (
                        <button
                          key={fl.id}
                          onClick={() => setActiveFloor(fl.id)}
                          className={`px-2.5 py-1 rounded text-xs font-semibold transition-all flex items-center gap-1 ${
                            isCurrent
                              ? 'bg-blue-600 text-white shadow-xs'
                              : isTarget
                              ? 'bg-blue-950 text-blue-300 border border-blue-500'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          <span>{fl.name}</span>
                          {isTarget && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="text-[11px] text-slate-400">
                    Showing <strong className="text-white">{activeFloor}</strong> of {activeTab}
                  </div>
                </div>
              </div>

              {/* Active Floor Inspector Details Panel */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                      {activeFloor === 'Ground Floor' ? 'G' : activeFloor?.slice(0, 2) || 'FL'}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#0B2545] font-display text-sm">
                        {activeTab} · {activeFloor || 'Select a floor'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Confirmed official facilities recorded on this floor
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-medium text-slate-500">
                    {activeFloorRecords.length} confirmed location{activeFloorRecords.length === 1 ? '' : 's'}
                  </span>
                </div>

                {/* Facility Cards on this floor */}
                {activeFloorRecords.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500">
                    No confirmed facilities listed on this floor in official notes. (Classrooms or unlisted wings).
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {activeFloorRecords.map((room) => {
                      const isTarget = Boolean(selectedRoom && selectedRoom.id === room.id);

                      return (
                        <div
                          key={room.id}
                          onClick={() => setSelectedRoom(room)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left relative ${
                            isTarget
                              ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-500/20 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-xs'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <span className="font-bold text-slate-900 font-display text-sm">
                              {room.name}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 shrink-0">
                              {room.category}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 line-clamp-2 mb-2 leading-relaxed">
                            {room.notes || room.purpose}
                          </p>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-100">
                            <div className="flex items-center gap-1 text-slate-600">
                              <Compass className="w-3 h-3 text-blue-600 shrink-0" />
                              <span className="truncate max-w-[200px]">{room.landmarkDirections || 'See campus map'}</span>
                            </div>

                            {isTarget ? (
                              <span className="text-blue-700 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                                <span>Active Target</span>
                              </span>
                            ) : (
                              <span className="text-blue-600 font-medium hover:underline">
                                Select
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Unverified Staff Rooms in this block (Strict adherence to notes) */}
              {unverifiedStaffRecords.length > 0 && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-950 font-semibold">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Staff Rooms in {activeTab} (Floor assignment not confirmed in handwritten notes):</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    {unverifiedStaffRecords.map((stf) => {
                      const isTarget = Boolean(selectedRoom && selectedRoom.id === stf.id);

                      return (
                        <div
                          key={stf.id}
                          onClick={() => setSelectedRoom(stf)}
                          className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                            isTarget
                              ? 'bg-amber-100 border-amber-400 font-semibold text-amber-950 ring-1 ring-amber-400'
                              : 'bg-white border-amber-200 text-slate-700 hover:border-amber-300'
                          }`}
                        >
                          <div className="font-semibold text-slate-900">{stf.name}</div>
                          <div className="text-[10px] text-amber-800 mt-0.5">
                            {stf.department} Department · Floor Unconfirmed
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-amber-800/80 pt-1">
                    * Confirmed to be situated within {activeTab}. Floor numbers are labeled "Not verified" pending physical on-site verification.
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Spatial Entrances & Campus Ground Layout Tab */
            <div className="space-y-4">
              <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl text-white">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs">
                  <span className="font-bold font-display text-sm">
                    NECN Campus Spatial Layout &amp; Gate Alignments
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Sourced strictly from hand-drawn campus orientation
                  </span>
                </div>

                {/* SVG Campus Relational Map */}
                <div className="relative w-full overflow-x-auto no-scrollbar flex justify-center py-2">
                  <svg
                    viewBox="0 0 760 300"
                    className="w-full max-w-[760px] h-auto select-none font-sans"
                    style={{ minWidth: '580px' }}
                  >
                    <defs>
                      <linearGradient id="road-grad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#1e293b" />
                        <stop offset="100%" stopColor="#0f172a" />
                      </linearGradient>
                    </defs>

                    {/* Perimeter Road at Front */}
                    <rect x="20" y="240" width="720" height="40" rx="4" fill="url(#road-grad)" stroke="#334155" />
                    <line x1="20" y1="260" x2="740" y2="260" stroke="#f59e0b" strokeWidth="2" strokeDasharray="8 6" opacity="0.6" />
                    <text x="380" y="278" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="600" letterSpacing="0.08em">
                      CAMPUS ACCESS ROAD / PERIMETER
                    </text>

                    {/* BLOCK A */}
                    <g 
                      className="cursor-pointer"
                      onClick={() => {
                        setActiveTab('Block A');
                        setActiveFloor('Ground Floor');
                      }}
                    >
                      <rect x="50" y="50" width="160" height="150" rx="8" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
                      <rect x="50" y="50" width="160" height="30" rx="6" fill="#1e3a8a" />
                      <text x="130" y="70" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">
                        BLOCK A
                      </text>
                      <text x="130" y="105" textAnchor="middle" fill="#93c5fd" fontSize="10">
                        4 Floors (Ground to 3rd)
                      </text>
                      <text x="130" y="125" textAnchor="middle" fill="#cbd5e1" fontSize="9">
                        Physics, Chem &amp; CSE
                      </text>
                      <text x="130" y="142" textAnchor="middle" fill="#cbd5e1" fontSize="9">
                        Mech &amp; Civil Labs
                      </text>
                      <rect x="80" y="165" width="100" height="22" rx="4" fill="#2563eb" />
                      <text x="130" y="180" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="600">
                        Click to Inspect
                      </text>
                    </g>

                    {/* GIRLS' ENTRANCE (BETWEEN BLOCK A & BLOCK B) */}
                    <g transform="translate(240, 160)">
                      <rect x="-25" y="0" width="50" height="80" rx="4" fill="#0f172a" stroke="#ec4899" strokeWidth="2" strokeDasharray="4 2" />
                      <line x1="0" y1="0" x2="0" y2="80" stroke="#ec4899" strokeWidth="2" />
                      <circle cx="0" cy="40" r="12" fill="#be185d" />
                      <text x="0" y="44" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">♀</text>
                      <text x="0" y="-10" textAnchor="middle" fill="#f472b6" fontSize="10" fontWeight="bold">
                        GIRLS' ENTRANCE
                      </text>
                      <text x="0" y="98" textAnchor="middle" fill="#cbd5e1" fontSize="8">
                        Between A &amp; B
                      </text>
                    </g>

                    {/* BLOCK B */}
                    <g 
                      className="cursor-pointer"
                      onClick={() => {
                        setActiveTab('Block B');
                        setActiveFloor('Ground Floor');
                      }}
                    >
                      <rect x="295" y="50" width="170" height="150" rx="8" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
                      <rect x="295" y="50" width="170" height="30" rx="6" fill="#1e3a8a" />
                      <text x="380" y="70" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">
                        BLOCK B
                      </text>
                      <text x="380" y="105" textAnchor="middle" fill="#93c5fd" fontSize="10">
                        3 Floors (Ground to 2nd)
                      </text>
                      <text x="380" y="125" textAnchor="middle" fill="#cbd5e1" fontSize="9">
                        Central Library &amp; Admin
                      </text>
                      <text x="380" y="142" textAnchor="middle" fill="#cbd5e1" fontSize="9">
                        EEE &amp; ECE Labs/Seminars
                      </text>
                      <rect x="330" y="165" width="100" height="22" rx="4" fill="#2563eb" />
                      <text x="380" y="180" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="600">
                        Click to Inspect
                      </text>
                    </g>

                    {/* MAIN ENTRANCE (BETWEEN BLOCK B & BLOCK C) */}
                    <g transform="translate(495, 160)">
                      <rect x="-25" y="0" width="50" height="80" rx="4" fill="#0f172a" stroke="#3b82f6" strokeWidth="2" />
                      <line x1="0" y1="0" x2="0" y2="80" stroke="#3b82f6" strokeWidth="2" />
                      <circle cx="0" cy="40" r="12" fill="#1d4ed8" />
                      <text x="0" y="44" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">★</text>
                      <text x="0" y="-10" textAnchor="middle" fill="#60a5fa" fontSize="10" fontWeight="bold">
                        MAIN ENTRANCE
                      </text>
                      <text x="0" y="98" textAnchor="middle" fill="#cbd5e1" fontSize="8">
                        Between B &amp; C
                      </text>
                    </g>

                    {/* BLOCK C */}
                    <g 
                      className="cursor-pointer"
                      onClick={() => {
                        setActiveTab('Block C');
                        setActiveFloor('Ground Floor');
                      }}
                    >
                      <rect x="550" y="50" width="160" height="150" rx="8" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
                      <rect x="550" y="50" width="160" height="30" rx="6" fill="#1e3a8a" />
                      <text x="630" y="70" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">
                        BLOCK C
                      </text>
                      <text x="630" y="105" textAnchor="middle" fill="#93c5fd" fontSize="10">
                        2 Floors (Ground &amp; 1st)
                      </text>
                      <text x="630" y="125" textAnchor="middle" fill="#cbd5e1" fontSize="9">
                        Auditorium (1st Floor)
                      </text>
                      <text x="630" y="142" textAnchor="middle" fill="#cbd5e1" fontSize="9">
                        Canteen (Ground Floor)
                      </text>
                      <rect x="580" y="165" width="100" height="22" rx="4" fill="#2563eb" />
                      <text x="630" y="180" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="600">
                        Click to Inspect
                      </text>
                    </g>
                  </svg>
                </div>
              </div>

              {/* Spatial Layout Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-700" />
                    <span>Campus Entrances Orientation:</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    <li>
                      <strong>Girls' Entrance Gate:</strong> Located directly between <strong>Block A</strong> and <strong>Block B</strong>.
                    </li>
                    <li>
                      <strong>Main Entrance Gate:</strong> Located directly between <strong>Block B</strong> and <strong>Block C</strong>.
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-blue-700" />
                    <span>Three Separate Parking Lots &amp; Sports Zone:</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Maintains 3 distinct parking areas: <strong>Block A &amp; B Parking</strong> (two-wheelers), <strong>Block C &amp; Canteen Parking</strong> (four-wheelers/visitors), and <strong>Sports Zone Parking</strong> (between blocks and sports grounds). The Sports Zone features the <strong>Kabaddi court, Volleyball court, Cricket pitch, Basketball court, Empty ground, and Shuttle courts</strong> according to the hand-drawn layout.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Strict Data Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900">
            * Schematic floor cutaway representation based strictly on official campus notes and <code>Campus_Digital_Twin_Important_Locations.csv</code>. Ordinary classrooms and unconfirmed room numbers are omitted or flagged as "Not verified".
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-5 sm:px-6 py-3.5 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              setIsCampusOverviewOpen(false);
              setActiveNavTab('map_routes');
            }}
            className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1.5"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Switch to Campus Map &amp; Routes View</span>
          </button>

          <button
            onClick={() => setIsCampusOverviewOpen(false)}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            Close Overview
          </button>
        </div>

      </div>
    </div>
  );
};
