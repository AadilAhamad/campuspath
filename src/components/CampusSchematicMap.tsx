import React, { useState, useRef } from 'react';
import { useRooms } from '../context/RoomContext';
import { 
  Compass, 
  MapPin, 
  Layers, 
  Info, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  MoveHorizontal,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface CampusSchematicMapProps {
  onSelectArea?: (areaName: string) => void;
  routeCoordinates?: [number, number][];
  startPoint?: { name: string; x: number; y: number } | null;
  destPoint?: { name: string; x: number; y: number } | null;
  intermediatePoints?: { name: string; x: number; y: number }[];
  walkerPosition?: { x: number; y: number } | null;
  isSimulating?: boolean;
  isLiveGpsActive?: boolean;
}

export const CampusSchematicMap: React.FC<CampusSchematicMapProps> = ({ 
  onSelectArea,
  routeCoordinates = [],
  startPoint = null,
  destPoint = null,
  intermediatePoints = [],
  walkerPosition = null,
  isSimulating = false,
  isLiveGpsActive = false
}) => {
  const { setBlockFilter, setCategoryFilter, setSelectedRoom, rooms, resetFilters } = useRooms();
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Zoom and viewport state
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [fitToWidth, setFitToWidth] = useState<boolean>(false);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 25, 200));
    setFitToWidth(false);
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 25, 80));
  };

  const handleResetZoom = () => {
    setZoomLevel(100);
    setFitToWidth(false);
    if (viewportRef.current) {
      viewportRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  const scrollToRegion = (region: 'sports' | 'gate' | 'blockA' | 'blockB' | 'blockC' | 'all') => {
    if (!viewportRef.current) return;
    const scrollPositions: Record<string, number> = {
      all: 0,
      sports: 0,
      gate: 260,
      blockA: 380,
      blockB: 560,
      blockC: 720
    };
    const targetLeft = scrollPositions[region] || 0;
    // Scale target position with zoom factor
    const scaledLeft = targetLeft * (zoomLevel / 100);
    viewportRef.current.scrollTo({
      left: scaledLeft,
      behavior: 'smooth'
    });
  };

  const handleAreaClick = (areaKey: string, blockName?: string, categoryName?: string) => {
    setActiveHighlight(areaKey);
    if (onSelectArea) {
      onSelectArea(areaKey);
    }
    // If a room specifically matches this key, highlight or filter
    if (blockName) {
      setBlockFilter(blockName);
    } else if (categoryName) {
      setCategoryFilter(categoryName);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#0B2545] font-display">
              NECN Campus Schematic Layout Map
            </h3>
            <p className="text-xs text-slate-500">
              Interactive architectural schematic based on verified campus reference. Click any block, entrance, or facility to explore.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {activeHighlight && (
            <button
              onClick={() => {
                setActiveHighlight(null);
                resetFilters();
              }}
              className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
            >
              Reset Selection
            </button>
          )}
          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
            Orientation: North ↑
          </span>
        </div>
      </div>

      {/* Interactive Map Toolbar: Quick Jump & Zoom Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 bg-slate-50 p-2 sm:p-2.5 rounded-xl border border-slate-200 text-xs">
        
        {/* Quick Region Shortcuts */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-pan-x pb-0.5 sm:pb-0">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
            Focus:
          </span>
          <button
            onClick={() => scrollToRegion('all')}
            className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors whitespace-nowrap shrink-0"
          >
            Full View
          </button>
          <button
            onClick={() => scrollToRegion('blockA')}
            className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors whitespace-nowrap shrink-0"
          >
            Block A
          </button>
          <button
            onClick={() => scrollToRegion('blockB')}
            className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors whitespace-nowrap shrink-0"
          >
            Block B
          </button>
          <button
            onClick={() => scrollToRegion('blockC')}
            className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors whitespace-nowrap shrink-0"
          >
            Block C
          </button>
          <button
            onClick={() => scrollToRegion('sports')}
            className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors whitespace-nowrap shrink-0"
          >
            Sports Zone
          </button>
          <button
            onClick={() => scrollToRegion('gate')}
            className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors whitespace-nowrap shrink-0"
          >
            Main Gate
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5 self-end lg:self-auto shrink-0">
          <button
            onClick={handleZoomOut}
            disabled={zoomLevel <= 80}
            className="p-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 disabled:opacity-40 transition-colors min-w-[28px] flex items-center justify-center cursor-pointer"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="px-2 py-1 bg-white border border-slate-200 rounded-md font-mono text-[11px] font-semibold text-slate-700 min-w-[48px] text-center">
            {zoomLevel}%
          </span>

          <button
            onClick={handleZoomIn}
            disabled={zoomLevel >= 200}
            className="p-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 disabled:opacity-40 transition-colors min-w-[28px] flex items-center justify-center cursor-pointer"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleResetZoom}
            className="p-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors min-w-[28px] flex items-center justify-center cursor-pointer"
            title="Reset Zoom to 100%"
            aria-label="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setFitToWidth(!fitToWidth)}
            className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors flex items-center gap-1 border cursor-pointer ${
              fitToWidth 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
            title={fitToWidth ? 'Switch to scrollable detailed view' : 'Fit entire map to screen width'}
          >
            {fitToWidth ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            <span className="hidden sm:inline">{fitToWidth ? 'Fit Screen' : 'Auto Fit'}</span>
          </button>
        </div>

      </div>

      {/* Mobile Scroll Hint Banner */}
      {!fitToWidth && (
        <div className="flex items-center justify-between gap-2 bg-blue-50/80 border border-blue-200/70 text-blue-900 px-3.5 py-2 rounded-xl text-xs sm:hidden">
          <div className="flex items-center gap-2">
            <MoveHorizontal className="w-4 h-4 text-blue-600 shrink-0 animate-pulse" />
            <span className="font-medium text-[11px]">
              Scroll map horizontally to explore all academic blocks & sports fields
            </span>
          </div>
          <span className="text-[10px] bg-blue-200/70 text-blue-950 font-bold px-1.5 py-0.5 rounded">
            Swipe ↔
          </span>
        </div>
      )}

      {/* Horizontally Scrollable SVG Viewport */}
      <div 
        ref={viewportRef}
        className="bg-slate-50/50 border border-slate-200 rounded-xl p-2 sm:p-4 overflow-x-auto touch-pan-x shadow-inner relative"
      >
        <svg
          viewBox="0 0 980 620"
          style={{
            width: fitToWidth ? '100%' : `${zoomLevel}%`,
            minWidth: fitToWidth ? '100%' : `${Math.max(820, Math.round((zoomLevel / 100) * 820))}px`,
            transition: 'width 0.15s ease'
          }}
          className="h-auto select-none mx-auto block"
          aria-label="Schematic Campus Map of Narayana Engineering College, Nellore"
        >
          <defs>
            <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.75" />
            </pattern>
          </defs>

          {/* Background Grid */}
          <rect width="980" height="620" fill="#ffffff" />
          <rect x="15" y="15" width="950" height="590" fill="url(#gridPattern)" stroke="#cbd5e1" strokeWidth="1.5" rx="10" />

          {/* ============================================================== */}
          {/* SPORTS ZONE (TOP SECTION: STRICTLY FROM HAND-DRAWN LAYOUT)     */}
          {/* Sequence: Kabaddi, Volleyball, Cricket, Basketball, Empty, Shuttle */}
          {/* ============================================================== */}
          <rect x="35" y="28" width="910" height="150" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" rx="8" />
          <text x="490" y="46" textAnchor="middle" fontSize="11" fill="#0B2545" fontWeight="bold" letterSpacing="1">
            SPORTS ZONE &amp; OUTDOOR FACILITIES (HAND-DRAWN REFERENCE)
          </text>

          {/* 1. KABADDI COURT (West Side) */}
          <g 
            className="cursor-pointer transition-transform group"
            onClick={() => handleAreaClick('sports-kabaddi', undefined, 'Sports')}
          >
            <rect 
              x="45" 
              y="56" 
              width="125" 
              height="112" 
              fill={activeHighlight === 'sports-kabaddi' ? '#fef3c7' : '#ffffff'} 
              stroke={activeHighlight === 'sports-kabaddi' ? '#d97706' : '#94a3b8'} 
              strokeWidth={activeHighlight === 'sports-kabaddi' ? '2' : '1'}
              rx="6" 
            />
            {/* Clay/sand court inner */}
            <rect x="53" y="66" width="109" height="72" fill="#fffbeb" stroke="#d97706" strokeWidth="1" />
            {/* Midline */}
            <line x1="53" y1="102" x2="162" y2="102" stroke="#b45309" strokeWidth="1.5" />
            {/* Baulk lines */}
            <line x1="53" y1="86" x2="162" y2="86" stroke="#d97706" strokeDasharray="2 2" strokeWidth="1" />
            <line x1="53" y1="118" x2="162" y2="118" stroke="#d97706" strokeDasharray="2 2" strokeWidth="1" />
            <text x="107.5" y="80" textAnchor="middle" fontSize="10" fill="#0B2545" fontWeight="bold">
              Kabaddi Court
            </text>
            <text x="107.5" y="149" textAnchor="middle" fontSize="8" fill="#78350f" fontWeight="600">
              Clay Surface Court
            </text>
            <text x="107.5" y="160" textAnchor="middle" fontSize="7.5" fill="#92400e">
              Standard Baulk Lines
            </text>
          </g>

          {/* 2. VOLLEYBALL COURT */}
          <g 
            className="cursor-pointer transition-transform group"
            onClick={() => handleAreaClick('sports-volleyball', undefined, 'Sports')}
          >
            <rect 
              x="180" 
              y="56" 
              width="125" 
              height="112" 
              fill={activeHighlight === 'sports-volleyball' ? '#eff6ff' : '#ffffff'} 
              stroke={activeHighlight === 'sports-volleyball' ? '#2563eb' : '#94a3b8'} 
              strokeWidth={activeHighlight === 'sports-volleyball' ? '2' : '1'}
              rx="6" 
            />
            {/* Court boundary */}
            <rect x="188" y="66" width="109" height="72" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
            {/* Center Net */}
            <line x1="188" y1="102" x2="297" y2="102" stroke="#2563eb" strokeWidth="2" />
            {/* Attack lines */}
            <line x1="188" y1="88" x2="297" y2="88" stroke="#60a5fa" strokeDasharray="2 2" strokeWidth="1" />
            <line x1="188" y1="116" x2="297" y2="116" stroke="#60a5fa" strokeDasharray="2 2" strokeWidth="1" />
            <text x="242.5" y="80" textAnchor="middle" fontSize="10" fill="#0B2545" fontWeight="bold">
              Volleyball Court
            </text>
            <text x="242.5" y="149" textAnchor="middle" fontSize="8" fill="#1e40af" fontWeight="600">
              Regulation Court
            </text>
            <text x="242.5" y="160" textAnchor="middle" fontSize="7.5" fill="#475569">
              Net &amp; Attack Lines
            </text>
          </g>

          {/* 3. CRICKET PITCH & GROUND (Central Major Ground) */}
          <g 
            className="cursor-pointer transition-transform group"
            onClick={() => handleAreaClick('sports-cricket', undefined, 'Sports')}
          >
            <rect 
              x="315" 
              y="56" 
              width="225" 
              height="112" 
              fill={activeHighlight === 'sports-cricket' ? '#ecfdf5' : '#ffffff'} 
              stroke={activeHighlight === 'sports-cricket' ? '#059669' : '#94a3b8'} 
              strokeWidth={activeHighlight === 'sports-cricket' ? '2' : '1'}
              rx="6" 
            />
            {/* Outfield oval */}
            <ellipse cx="427.5" cy="102" rx="94" ry="34" fill="#f0fdf4" stroke="#86efac" strokeWidth="1" />
            {/* 30-yard inner circle */}
            <ellipse cx="427.5" cy="102" rx="54" ry="20" fill="none" stroke="#bbf7d0" strokeDasharray="3 3" strokeWidth="1" />
            {/* Cricket pitch strip in center */}
            <rect x="417.5" y="89" width="20" height="26" fill="#fef3c7" stroke="#d97706" strokeWidth="1" rx="2" />
            {/* Bowling creases */}
            <line x1="414" y1="92" x2="421" y2="92" stroke="#b45309" strokeWidth="1" />
            <line x1="414" y1="112" x2="421" y2="112" stroke="#b45309" strokeWidth="1" />
            <text x="427.5" y="78" textAnchor="middle" fontSize="10.5" fill="#0B2545" fontWeight="bold">
              Cricket Pitch &amp; Ground
            </text>
            <text x="427.5" y="149" textAnchor="middle" fontSize="8" fill="#065f46" fontWeight="600">
              Central Turf / Matting Pitch
            </text>
            <text x="427.5" y="160" textAnchor="middle" fontSize="7.5" fill="#047857">
              Practice Outfield &amp; Creases
            </text>
          </g>

          {/* 4. BASKETBALL COURT */}
          <g 
            className="cursor-pointer transition-transform group"
            onClick={() => handleAreaClick('sports-basketball', undefined, 'Sports')}
          >
            <rect 
              x="550" 
              y="56" 
              width="125" 
              height="112" 
              fill={activeHighlight === 'sports-basketball' ? '#eff6ff' : '#ffffff'} 
              stroke={activeHighlight === 'sports-basketball' ? '#2563eb' : '#94a3b8'} 
              strokeWidth={activeHighlight === 'sports-basketball' ? '2' : '1'}
              rx="6" 
            />
            {/* Court boundary */}
            <rect x="558" y="66" width="109" height="72" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
            {/* Center court line */}
            <line x1="558" y1="102" x2="667" y2="102" stroke="#cbd5e1" strokeWidth="1" />
            {/* Center circle */}
            <circle cx="612.5" cy="102" r="12" fill="none" stroke="#cbd5e1" strokeWidth="1" />
            {/* Key arcs */}
            <path d="M 602 66 A 10 10 0 0 1 622 66" fill="none" stroke="#cbd5e1" strokeWidth="1" />
            <path d="M 602 138 A 10 10 0 0 0 622 138" fill="none" stroke="#cbd5e1" strokeWidth="1" />
            <text x="612.5" y="80" textAnchor="middle" fontSize="10" fill="#0B2545" fontWeight="bold">
              Basketball Court
            </text>
            <text x="612.5" y="149" textAnchor="middle" fontSize="8" fill="#1e40af" fontWeight="600">
              Hard-Surfaced Court
            </text>
            <text x="612.5" y="160" textAnchor="middle" fontSize="7.5" fill="#475569">
              Standard Hoops &amp; Keys
            </text>
          </g>

          {/* 5. EMPTY GROUND (Open Athletics & Drills Field) */}
          <g 
            className="cursor-pointer transition-transform group"
            onClick={() => handleAreaClick('sports-empty', undefined, 'Sports')}
          >
            <rect 
              x="685" 
              y="56" 
              width="130" 
              height="112" 
              fill={activeHighlight === 'sports-empty' ? '#f0fdf4' : '#ffffff'} 
              stroke={activeHighlight === 'sports-empty' ? '#16a34a' : '#94a3b8'} 
              strokeWidth={activeHighlight === 'sports-empty' ? '2' : '1'}
              rx="6" 
            />
            {/* Open grass texture indicators */}
            <rect x="693" y="66" width="114" height="72" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" rx="4" />
            <text x="750" y="80" textAnchor="middle" fontSize="10" fill="#0B2545" fontWeight="bold">
              Empty Ground
            </text>
            <text x="750" y="99" textAnchor="middle" fontSize="8" fill="#64748b">
              Open Multi-purpose Field
            </text>
            <text x="750" y="112" textAnchor="middle" fontSize="8" fill="#64748b">
              For Drills &amp; Assemblies
            </text>
            <text x="750" y="154" textAnchor="middle" fontSize="8" fill="#15803d" fontWeight="600">
              Athletic Gathering Area
            </text>
          </g>

          {/* 6. SHUTTLE COURTS (Badminton Dual Courts) */}
          <g 
            className="cursor-pointer transition-transform group"
            onClick={() => handleAreaClick('sports-shuttle', undefined, 'Sports')}
          >
            <rect 
              x="825" 
              y="56" 
              width="120" 
              height="112" 
              fill={activeHighlight === 'sports-shuttle' ? '#f0fdfa' : '#ffffff'} 
              stroke={activeHighlight === 'sports-shuttle' ? '#0d9488' : '#94a3b8'} 
              strokeWidth={activeHighlight === 'sports-shuttle' ? '2' : '1'}
              rx="6" 
            />
            {/* Court 1 */}
            <rect x="833" y="68" width="48" height="68" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="833" y1="102" x2="881" y2="102" stroke="#0d9488" strokeWidth="1.5" />
            {/* Court 2 */}
            <rect x="889" y="68" width="48" height="68" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="889" y1="102" x2="937" y2="102" stroke="#0d9488" strokeWidth="1.5" />
            <text x="885" y="80" textAnchor="middle" fontSize="10" fill="#0B2545" fontWeight="bold">
              Shuttle Courts
            </text>
            <text x="885" y="149" textAnchor="middle" fontSize="8" fill="#0f766e" fontWeight="600">
              Dual Badminton Courts
            </text>
            <text x="885" y="160" textAnchor="middle" fontSize="7.5" fill="#115e59">
              Non-Slip Marked Floor
            </text>
          </g>

          {/* ============================================================== */}
          {/* CONNECTING ROAD & SPORTS PARKING (MIDDLE TRANSITION ZONE)      */}
          {/* ============================================================== */}
          {/* Connecting Campus Road */}
          <g className="pointer-events-none">
            <rect x="35" y="186" width="910" height="18" fill="#f1f5f9" stroke="#cbd5e1" rx="4" />
            <line x1="35" y1="195" x2="945" y2="195" stroke="#94a3b8" strokeDasharray="6 4" strokeWidth="1.5" />
            <text x="175" y="199" fill="#64748b" fontSize="8" fontWeight="bold" letterSpacing="0.8">
              CONNECTING CAMPUS ROAD (SPORTS ACCESS AVENUE)
            </text>
          </g>

          {/* PARKING LOT 3: Sports Zone Parking (Dedicated lot between blocks and grounds) */}
          <g 
            className="cursor-pointer group"
            onClick={() => handleAreaClick('parking-sports', undefined, 'Parking')}
          >
            <rect 
              x="365" 
              y="209" 
              width="250" 
              height="28" 
              fill={activeHighlight === 'parking-sports' ? '#eff6ff' : '#f8fafc'} 
              stroke={activeHighlight === 'parking-sports' ? '#2563eb' : '#94a3b8'} 
              strokeWidth={activeHighlight === 'parking-sports' ? '2' : '1.5'}
              strokeDasharray="3 3" 
              rx="5" 
            />
            {/* Parking Stall Marks */}
            <line x1="415" y1="210" x2="415" y2="235" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="465" y1="210" x2="465" y2="235" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="515" y1="210" x2="515" y2="235" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="565" y1="210" x2="565" y2="235" stroke="#cbd5e1" strokeWidth="1" />
            <text x="490" y="222" textAnchor="middle" fontSize="9" fill="#0B2545" fontWeight="bold">
              P: Sports Zone Parking
            </text>
            <text x="490" y="233" textAnchor="middle" fontSize="7.5" fill="#64748b">
              Dedicated Sports Complex Lot · Between Blocks &amp; Fields
            </text>
          </g>

          {/* ============================================================== */}
          {/* THREE MAIN ACADEMIC BLOCKS: A, B, and C                       */}
          {/* ============================================================== */}

          {/* BLOCK A (West Wing: Labs, Seminars, Mech/Civil/Electrical) */}
          <g 
            className="cursor-pointer transition-all"
            onClick={() => handleAreaClick('block-a', 'Block A')}
          >
            <rect 
              x="35" 
              y="245" 
              width="200" 
              height="225" 
              fill={activeHighlight === 'block-a' ? '#eff6ff' : '#ffffff'} 
              stroke={activeHighlight === 'block-a' ? '#2563eb' : '#0B2545'} 
              strokeWidth={activeHighlight === 'block-a' ? '3' : '2'}
              rx="8" 
            />
            {/* Header banner */}
            <rect x="35" y="245" width="200" height="32" fill="#0B2545" rx="8" />
            <text x="135" y="266" textAnchor="middle" fontSize="12" fill="#ffffff" fontWeight="bold">
              BLOCK A
            </text>
            
            {/* Ground Floor */}
            <text x="135" y="291" textAnchor="middle" fontSize="9.5" fill="#0B2545" fontWeight="bold">
              Ground Floor (GF)
            </text>
            <text x="135" y="304" textAnchor="middle" fontSize="8.5" fill="#475569">
              • Mechanical Seminar Hall
            </text>
            <text x="135" y="316" textAnchor="middle" fontSize="8.5" fill="#475569">
              • Mech, Civil &amp; Electrical Labs
            </text>

            <line x1="45" y1="324" x2="225" y2="324" stroke="#e2e8f0" strokeWidth="1" />

            {/* 1st & 3rd Floors */}
            <text x="135" y="338" textAnchor="middle" fontSize="9.5" fill="#0B2545" fontWeight="bold">
              1st &amp; 3rd Floors
            </text>
            <text x="135" y="351" textAnchor="middle" fontSize="8.5" fill="#475569">
              • 1st: CSE Seminar Hall
            </text>
            <text x="135" y="363" textAnchor="middle" fontSize="8.5" fill="#475569">
              • 1st: Dept Computer Labs
            </text>
            <text x="135" y="375" textAnchor="middle" fontSize="8.5" fill="#475569">
              • 3rd: Physics &amp; Chemistry Labs
            </text>

            <line x1="45" y1="384" x2="225" y2="384" stroke="#e2e8f0" strokeWidth="1" />

            {/* Staff Unconfirmed */}
            <text x="135" y="398" textAnchor="middle" fontSize="8" fill="#b45309" fontWeight="600">
              Staff Rooms (CSM, FED, Civ-Mech)
            </text>
            <text x="135" y="410" textAnchor="middle" fontSize="7.5" fill="#78350f" fontStyle="italic">
              * Floor unconfirmed · Needs verification
            </text>

            <rect x="45" y="432" width="180" height="24" fill="#f8fafc" stroke="#cbd5e1" rx="4" />
            <text x="135" y="448" textAnchor="middle" fontSize="8.5" fill="#2563eb" fontWeight="600">
              Click to explore Block A
            </text>
          </g>

          {/* Central Courtyard & Covered Arcade between A and B */}
          <line x1="235" y1="360" x2="345" y2="360" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="2" />
          <text x="290" y="354" textAnchor="middle" fontSize="7.5" fill="#64748b">
            Covered Arcade
          </text>

          {/* BLOCK B (Center Academic Wing: Admin, Exam Cell, Principal, Library, EEE, ECE) */}
          <g 
            className="cursor-pointer transition-all"
            onClick={() => handleAreaClick('block-b', 'Block B')}
          >
            <rect 
              x="345" 
              y="245" 
              width="205" 
              height="225" 
              fill={activeHighlight === 'block-b' ? '#eff6ff' : '#ffffff'} 
              stroke={activeHighlight === 'block-b' ? '#2563eb' : '#0B2545'} 
              strokeWidth={activeHighlight === 'block-b' ? '3' : '2'}
              rx="8" 
            />
            {/* Header banner */}
            <rect x="345" y="245" width="205" height="32" fill="#0B2545" rx="8" />
            <text x="447.5" y="266" textAnchor="middle" fontSize="12" fill="#ffffff" fontWeight="bold">
              BLOCK B (ADMIN &amp; CORE)
            </text>

            {/* Ground Floor */}
            <text x="447.5" y="291" textAnchor="middle" fontSize="9.5" fill="#0B2545" fontWeight="bold">
              Ground Floor (GF)
            </text>
            <text x="447.5" y="304" textAnchor="middle" fontSize="8.5" fill="#475569">
              • Administrative Office &amp; Reception
            </text>
            <text x="447.5" y="316" textAnchor="middle" fontSize="8.5" fill="#475569">
              • Principal's Room &amp; Exam Cell
            </text>

            <line x1="355" y1="324" x2="540" y2="324" stroke="#e2e8f0" strokeWidth="1" />

            {/* 1st & 2nd Floors */}
            <text x="447.5" y="338" textAnchor="middle" fontSize="9.5" fill="#0B2545" fontWeight="bold">
              1st &amp; 2nd Floors
            </text>
            <text x="447.5" y="351" textAnchor="middle" fontSize="8.5" fill="#475569">
              • 1st: Central Library &amp; Labs (EEE/ECE)
            </text>
            <text x="447.5" y="363" textAnchor="middle" fontSize="8.5" fill="#475569">
              • 2nd: EEE &amp; ECE Seminar Halls
            </text>

            <line x1="355" y1="373" x2="540" y2="373" stroke="#e2e8f0" strokeWidth="1" />

            {/* Staff Unconfirmed */}
            <text x="447.5" y="388" textAnchor="middle" fontSize="8" fill="#b45309" fontWeight="600">
              Staff Rooms (CSE, EEE, ECE)
            </text>
            <text x="447.5" y="400" textAnchor="middle" fontSize="7.5" fill="#78350f" fontStyle="italic">
              * Floor unconfirmed · Needs verification
            </text>

            <rect x="355" y="432" width="185" height="24" fill="#f8fafc" stroke="#cbd5e1" rx="4" />
            <text x="447.5" y="448" textAnchor="middle" fontSize="8.5" fill="#2563eb" fontWeight="600">
              Click to explore Block B
            </text>
          </g>

          {/* Central Courtyard & Plaza between B and C */}
          <line x1="550" y1="360" x2="665" y2="360" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="2" />
          <text x="607.5" y="354" textAnchor="middle" fontSize="7.5" fill="#64748b">
            Central Plaza
          </text>

          {/* BLOCK C (East Wing: Canteen, Auditorium on 1st, Computer Labs) */}
          <g 
            className="cursor-pointer transition-all"
            onClick={() => handleAreaClick('block-c', 'Block C')}
          >
            <rect 
              x="665" 
              y="245" 
              width="280" 
              height="225" 
              fill={activeHighlight === 'block-c' ? '#eff6ff' : '#ffffff'} 
              stroke={activeHighlight === 'block-c' ? '#2563eb' : '#0B2545'} 
              strokeWidth={activeHighlight === 'block-c' ? '3' : '2'}
              rx="8" 
            />
            {/* Header banner */}
            <rect x="665" y="245" width="280" height="32" fill="#0B2545" rx="8" />
            <text x="805" y="266" textAnchor="middle" fontSize="12" fill="#ffffff" fontWeight="bold">
              BLOCK C (AMENITIES &amp; LABS)
            </text>

            {/* 1st Floor AUDITORIUM directly above Canteen */}
            <rect 
              x="675" 
              y="285" 
              width="130" 
              height="70" 
              fill="#dbeafe" 
              stroke="#2563eb" 
              strokeWidth="1.5" 
              rx="6" 
            />
            <text x="740" y="304" textAnchor="middle" fontSize="10.5" fill="#1e3a8a" fontWeight="bold">
              AUDITORIUM
            </text>
            <text x="740" y="318" textAnchor="middle" fontSize="9" fill="#2563eb" fontWeight="bold">
              (1st Floor)
            </text>
            <text x="740" y="332" textAnchor="middle" fontSize="7.5" fill="#475569">
              Directly above Canteen
            </text>
            <text x="740" y="344" textAnchor="middle" fontSize="7" fill="#15803d" fontWeight="600">
              ✓ Confirmed Location
            </text>

            {/* UPPER RIGHT: Computer Labs (exact rooms unverified) */}
            <rect 
              x="815" 
              y="285" 
              width="120" 
              height="70" 
              fill="#fef3c7" 
              stroke="#d97706" 
              strokeWidth="1" 
              rx="6" 
            />
            <text x="875" y="303" textAnchor="middle" fontSize="9.5" fill="#92400e" fontWeight="bold">
              COMPUTER LABS
            </text>
            <text x="875" y="317" textAnchor="middle" fontSize="8.5" fill="#b45309" fontWeight="bold">
              (1st Floor)
            </text>
            <text x="875" y="330" textAnchor="middle" fontSize="7.5" fill="#78350f">
              Department Labs
            </text>
            <text x="875" y="342" textAnchor="middle" fontSize="7" fill="#b45309" fontStyle="italic">
              * Exact rooms unverified
            </text>

            {/* GROUND FLOOR: CANTEEN (occupies ~half ground floor) */}
            <rect 
              x="675" 
              y="364" 
              width="260" 
              height="66" 
              fill="#fef3c7" 
              stroke="#d97706" 
              strokeWidth="1.5" 
              rx="6" 
            />
            <text x="805" y="382" textAnchor="middle" fontSize="11" fill="#92400e" fontWeight="bold">
              CANTEEN (Ground Floor)
            </text>
            <text x="805" y="396" textAnchor="middle" fontSize="8" fill="#b45309" fontWeight="bold">
              Occupies ~half of ground floor · Relative placement
            </text>
            <text x="805" y="409" textAnchor="middle" fontSize="7.5" fill="#78350f" fontStyle="italic">
              * Exact boundary &amp; internal dimensions unverified
            </text>
            <text x="805" y="421" textAnchor="middle" fontSize="7" fill="#92400e">
              Direct access from East Courtyard
            </text>

            <rect x="675" y="438" width="260" height="24" fill="#f8fafc" stroke="#cbd5e1" rx="4" />
            <text x="805" y="454" textAnchor="middle" fontSize="8.5" fill="#2563eb" fontWeight="600">
              Click to explore Block C
            </text>
          </g>

          {/* ============================================================== */}
          {/* THREE SEPARATE PARKING AREAS (STRICTLY FROM HAND-DRAWN LAYOUT) */}
          {/* ============================================================== */}

          {/* PARKING LOT 1: Block A & B Parking (Around Blocks A & B · Two-Wheelers) */}
          <g 
            className="cursor-pointer group"
            onClick={() => handleAreaClick('parking-ab', undefined, 'Parking')}
          >
            <rect 
              x="238" 
              y="482" 
              width="104" 
              height="42" 
              fill={activeHighlight === 'parking-ab' ? '#eff6ff' : '#f8fafc'} 
              stroke={activeHighlight === 'parking-ab' ? '#2563eb' : '#94a3b8'} 
              strokeWidth={activeHighlight === 'parking-ab' ? '2' : '1.5'}
              strokeDasharray="2 2" 
              rx="6" 
            />
            {/* Parking Stall Lines */}
            <line x1="264" y1="484" x2="264" y2="498" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="290" y1="484" x2="290" y2="498" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="316" y1="484" x2="316" y2="498" stroke="#cbd5e1" strokeWidth="1" />
            <text x="290" y="497" textAnchor="middle" fontSize="8.5" fill="#0B2545" fontWeight="bold">
              P: Blocks A &amp; B
            </text>
            <text x="290" y="508" textAnchor="middle" fontSize="7.5" fill="#64748b">
              Two-Wheeler Facility
            </text>
            <text x="290" y="518" textAnchor="middle" fontSize="7" fill="#94a3b8">
              Paved Parking Area
            </text>
          </g>

          {/* PARKING LOT 2: Block C & Canteen Parking (Around Block C · Four-Wheelers & Visitors) */}
          <g 
            className="cursor-pointer group"
            onClick={() => handleAreaClick('parking-c', undefined, 'Parking')}
          >
            <rect 
              x="665" 
              y="482" 
              width="160" 
              height="42" 
              fill={activeHighlight === 'parking-c' ? '#eff6ff' : '#f8fafc'} 
              stroke={activeHighlight === 'parking-c' ? '#2563eb' : '#94a3b8'} 
              strokeWidth={activeHighlight === 'parking-c' ? '2' : '1.5'}
              strokeDasharray="2 2" 
              rx="6" 
            />
            {/* Parking Stall Lines */}
            <line x1="705" y1="484" x2="705" y2="498" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="745" y1="484" x2="745" y2="498" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="785" y1="484" x2="785" y2="498" stroke="#cbd5e1" strokeWidth="1" />
            <text x="745" y="497" textAnchor="middle" fontSize="8.5" fill="#0B2545" fontWeight="bold">
              P: Block C &amp; Canteen Parking
            </text>
            <text x="745" y="508" textAnchor="middle" fontSize="7.5" fill="#64748b">
              Four-Wheelers &amp; Visitors
            </text>
            <text x="745" y="518" textAnchor="middle" fontSize="7" fill="#94a3b8">
              Designated East Parking Area
            </text>
          </g>

          {/* ============================================================== */}
          {/* FRONT ROAD & CAMPUS ENTRANCES (BOTTOM ZONE)                   */}
          {/* ============================================================== */}
          {/* Front Perimeter Road */}
          <rect x="35" y="545" width="910" height="42" fill="#f1f5f9" stroke="#94a3b8" rx="6" />
          <text x="490" y="572" textAnchor="middle" fontSize="11" fill="#475569" fontWeight="700" letterSpacing="1.5">
            FRONT CAMPUS PERIMETER ROAD
          </text>

          {/* GIRLS' ENTRANCE (Located specifically BETWEEN Block A and Block B) */}
          <g 
            className="cursor-pointer group"
            onClick={() => handleAreaClick('girls-gate', undefined, 'Entrances')}
          >
            <rect 
              x="235" 
              y="532" 
              width="110" 
              height="30" 
              fill={activeHighlight === 'girls-gate' ? '#2563eb' : '#0B2545'} 
              stroke="#ffffff"
              strokeWidth="2"
              rx="6" 
            />
            <text x="290" y="551" textAnchor="middle" fontSize="9.5" fill="#ffffff" fontWeight="bold">
              GIRLS' ENTRANCE
            </text>
            <text x="290" y="526" textAnchor="middle" fontSize="8" fill="#2563eb" fontWeight="bold">
              Between Blocks A &amp; B
            </text>
          </g>

          {/* MAIN ENTRANCE (Located specifically BETWEEN Block B and Block C) */}
          <g 
            className="cursor-pointer group"
            onClick={() => handleAreaClick('main-gate', undefined, 'Entrances')}
          >
            <rect 
              x="550" 
              y="532" 
              width="115" 
              height="30" 
              fill={activeHighlight === 'main-gate' ? '#2563eb' : '#0B2545'} 
              stroke="#ffffff"
              strokeWidth="2"
              rx="6" 
            />
            <text x="607.5" y="551" textAnchor="middle" fontSize="9.5" fill="#ffffff" fontWeight="bold">
              MAIN ENTRANCE
            </text>
            <text x="607.5" y="526" textAnchor="middle" fontSize="8" fill="#2563eb" fontWeight="bold">
              Between Blocks B &amp; C
            </text>
          </g>

          {/* Pathway connections from entrances to promenade */}
          <line x1="290" y1="532" x2="290" y2="465" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth="2" />
          <line x1="607.5" y1="532" x2="607.5" y2="465" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth="2" />

          {/* ============================================================== */}
          {/* ACTIVE ROUTE OVERLAY & TURN-BY-TURN PATH NAVIGATION            */}
          {/* ============================================================== */}
          {routeCoordinates && routeCoordinates.length > 1 && (
            <g className="route-navigation-layer pointer-events-none">
              {/* Route Glow Aura */}
              <polyline
                points={routeCoordinates.map((c) => `${c[0]},${c[1]}`).join(' ')}
                fill="none"
                stroke="#60a5fa"
                strokeWidth="10"
                strokeOpacity="0.35"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Main Directed Walking Line */}
              <polyline
                points={routeCoordinates.map((c) => `${c[0]},${c[1]}`).join(' ')}
                fill="none"
                stroke="#1d4ed8"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={isSimulating ? "8 4" : "none"}
              />

              {/* Waypoint Nodes along the path */}
              {routeCoordinates.map((coord, idx) => (
                <circle
                  key={`waypoint-${idx}`}
                  cx={coord[0]}
                  cy={coord[1]}
                  r="4"
                  fill="#ffffff"
                  stroke="#1d4ed8"
                  strokeWidth="2"
                />
              ))}

              {/* Intermediate Stop Markers */}
              {intermediatePoints && intermediatePoints.map((stop, sIdx) => (
                <g key={`stop-marker-${sIdx}`} transform={`translate(${stop.x}, ${stop.y})`}>
                  <circle cx="0" cy="0" r="14" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                  <text x="0" y="4" textAnchor="middle" fontSize="10" fill="#ffffff" fontWeight="bold">
                    {sIdx + 1}
                  </text>
                  <rect x="-40" y="-30" width="80" height="18" rx="4" fill="#0B2545" fillOpacity="0.85" />
                  <text x="0" y="-18" textAnchor="middle" fontSize="8" fill="#ffffff" fontWeight="600">
                    Stop {sIdx + 1}
                  </text>
                </g>
              ))}

              {/* Start & Destination Location Pins */}
              {startPoint && destPoint && startPoint.x === destPoint.x && startPoint.y === destPoint.y ? (
                /* Combined Start & Destination Marker */
                <g transform={`translate(${startPoint.x}, ${startPoint.y})`}>
                  <circle cx="0" cy="0" r="15" fill="#16a34a" stroke="#dc2626" strokeWidth="3" />
                  <text x="0" y="4" textAnchor="middle" fontSize="9" fill="#ffffff" fontWeight="bold">
                    A=B
                  </text>
                  <rect x="-60" y="-32" width="120" height="20" rx="5" fill="#0B2545" />
                  <text x="0" y="-18" textAnchor="middle" fontSize="8" fill="#ffffff" fontWeight="bold">
                    START &amp; DESTINATION
                  </text>
                </g>
              ) : (
                <>
                  {/* Start Location Pin */}
                  {startPoint && (
                    <g transform={`translate(${startPoint.x}, ${startPoint.y})`}>
                      <circle cx="0" cy="0" r="14" fill="#16a34a" stroke="#ffffff" strokeWidth="2.5" />
                      <text x="0" y="4" textAnchor="middle" fontSize="10" fill="#ffffff" fontWeight="bold">
                        A
                      </text>
                      <rect x="-42" y="-32" width="84" height="20" rx="5" fill="#14532d" />
                      <text x="0" y="-18" textAnchor="middle" fontSize="8.5" fill="#ffffff" fontWeight="bold">
                        START
                      </text>
                    </g>
                  )}

                  {/* Destination Location Pin */}
                  {destPoint && (
                    <g transform={`translate(${destPoint.x}, ${destPoint.y})`}>
                      <circle cx="0" cy="0" r="14" fill="#dc2626" stroke="#ffffff" strokeWidth="2.5" />
                      <text x="0" y="4" textAnchor="middle" fontSize="10" fill="#ffffff" fontWeight="bold">
                        B
                      </text>
                      <rect x="-45" y="-32" width="90" height="20" rx="5" fill="#7f1d1d" />
                      <text x="0" y="-18" textAnchor="middle" fontSize="8.5" fill="#ffffff" fontWeight="bold">
                        DESTINATION
                      </text>
                    </g>
                  )}
                </>
              )}

              {/* Live / Simulated Walking Avatar Indicator */}
              {walkerPosition && (
                <g transform={`translate(${walkerPosition.x}, ${walkerPosition.y})`}>
                  {/* Pulsing outer aura ring */}
                  <circle cx="0" cy="0" r="18" fill="#2563eb" fillOpacity="0.25">
                    <animate attributeName="r" values="12;22;12" dur="1.8s" repeatCount="indefinite" />
                    <animate attributeName="fill-opacity" values="0.4;0.05;0.4" dur="1.8s" repeatCount="indefinite" />
                  </circle>
                  {/* Central Walker Badge */}
                  <circle cx="0" cy="0" r="9" fill="#1d4ed8" stroke="#ffffff" strokeWidth="2.5" />
                  <circle cx="0" cy="0" r="3.5" fill="#60a5fa" />
                  {/* Avatar Label */}
                  <rect x="-35" y="14" width="70" height="17" rx="4" fill="#0B2545" fillOpacity="0.9" />
                  <text x="0" y="26" textAnchor="middle" fontSize="8" fill="#ffffff" fontWeight="bold">
                    {isLiveGpsActive ? 'YOU (GPS)' : 'WALKER'}
                  </text>
                </g>
              )}
            </g>
          )}

        </svg>
      </div>

      {/* Architectural Legend & Spatial Notes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
          <strong className="text-slate-900 font-semibold block mb-1">
            1. Entrances &amp; Academic Wings
          </strong>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            <strong>Girls' Entrance</strong> is between Block A &amp; Block B. <strong>Main Entrance</strong> is between Block B &amp; Block C. Blocks A, B, and C follow the hand-drawn relative arrangement.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
          <strong className="text-slate-900 font-semibold block mb-1">
            2. Three Separate Parking Lots
          </strong>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            Maintains 3 distinct parking areas: <strong>Block A &amp; B Parking</strong> (two-wheelers), <strong>Block C &amp; Canteen Parking</strong> (four-wheelers/visitors), and <strong>Sports Zone Parking</strong> (between blocks and sports grounds).
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
          <strong className="text-slate-900 font-semibold block mb-1">
            3. Sports Area Layout (Hand-Drawn Reference)
          </strong>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            Arranged west to east: <strong>Kabaddi Court</strong>, <strong>Volleyball Court</strong>, <strong>Cricket Pitch &amp; Ground</strong>, <strong>Basketball Court</strong>, <strong>Empty Ground</strong>, and <strong>Shuttle Courts</strong>.
          </p>
        </div>
      </div>

      {/* Schematic Disclaimer Banner */}
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold text-amber-950">Schematic Layout Reference:</strong>{' '}
          This diagram reflects the relative arrangement from the verified hand-drawn campus layout. It is a schematic orientation guide, not a measured architectural plan or GPS blueprint. Canteen placement inside Block C ground floor is approximate.
        </div>
      </div>
    </div>
  );
};
