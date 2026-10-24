import React, { useRef, useEffect, useMemo } from 'react';
import { 
  Search, 
  X, 
  RotateCcw, 
  LayoutGrid, 
  List, 
  Building,
  Layers,
  Sparkles,
  MapPin
} from 'lucide-react';
import { useRooms } from '../context/RoomContext';
import { CAMPUS_BLOCKS, FLOOR_LEVELS, QUICK_CATEGORIES } from '../data/rooms';

export const SearchAndFilters: React.FC = () => {
  const {
    filters,
    setSearchQuery,
    setBlockFilter,
    setFloorFilter,
    setCategoryFilter,
    resetFilters,
    filteredRooms,
    rooms,
    viewMode,
    setViewMode,
    dataSource
  } = useRooms();

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Dynamic blocks: default blocks first, then any extra blocks in current dataset
  const availableBlocks = useMemo(() => {
    const list: string[] = [...CAMPUS_BLOCKS];
    const uniqueBlocks = Array.from(new Set(rooms.map((r) => r.block).filter(Boolean)));
    uniqueBlocks.forEach((b) => {
      if (!list.includes(b)) {
        list.push(b);
      }
    });
    return list;
  }, [rooms]);

  // Dynamic floors: default floors first, then any extra floors in current dataset
  const availableFloors = useMemo(() => {
    const list: string[] = [...FLOOR_LEVELS];
    const uniqueFloors = Array.from(new Set(rooms.map((r) => r.floor).filter(Boolean)));
    uniqueFloors.forEach((f) => {
      if (!list.includes(f)) {
        list.push(f);
      }
    });
    return list;
  }, [rooms]);

  // Keyboard shortcut '/' to quickly focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.block !== 'All' ||
    filters.floor !== 'All' ||
    filters.category !== 'All' ||
    filters.department !== 'All';

  return (
    <div className="bg-white border-b border-slate-200 py-4 sm:py-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3.5">
        
        {/* Main Search Input & View Toggles */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by location name (e.g. Auditorium, Canteen), category, or room number..."
              className="w-full pl-10 pr-10 py-3 text-sm sm:text-base bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B2545] focus:bg-white text-slate-900 placeholder:text-slate-400 shadow-xs transition-colors"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {!filters.searchQuery && (
              <span className="hidden sm:flex absolute inset-y-0 right-0 pr-3 items-center pointer-events-none text-[11px] text-slate-400">
                <kbd className="px-1.5 py-0.5 border border-slate-300 rounded bg-white text-slate-500 font-mono">
                  /
                </kbd>
              </span>
            )}
          </div>

          {/* View Mode Toggle & Reset Button */}
          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-red-700 hover:bg-red-50 rounded-lg border border-slate-300 transition-colors"
                title="Clear all active filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}

            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#0B2545] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Card grid view"
                aria-label="Card grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-[#0B2545] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Compact list view"
                aria-label="Compact list view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Category Buttons: Labs, Seminar Halls, Offices, Library, Canteen, Parking, Sports */}
        <div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar touch-pan-x">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span>Category:</span>
            </span>

            <button
              onClick={() => setCategoryFilter('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 border min-h-[32px] ${
                filters.category === 'All'
                  ? 'bg-[#0B2545] text-white border-[#0B2545] shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              All Categories
            </button>

            {QUICK_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(filters.category === cat ? 'All' : cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 border min-h-[32px] ${
                  filters.category === cat
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:text-blue-900 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Block and Floor Filters */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          
          {/* Block Selection */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5 shrink-0">
              <Building className="w-3.5 h-3.5 text-blue-700" />
              <span>Filter Block:</span>
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setBlockFilter('All')}
                className={`px-2.5 py-1.5 rounded-md font-medium transition-colors min-h-[30px] ${
                  filters.block === 'All'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Blocks
              </button>
              {availableBlocks.map((block: string) => (
                <button
                  key={block}
                  onClick={() => setBlockFilter(filters.block === block ? 'All' : block)}
                  className={`px-2.5 py-1.5 rounded-md font-medium transition-colors min-h-[30px] ${
                    filters.block === block
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {block}
                </button>
              ))}
            </div>
          </div>

          {/* Floor Selection */}
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <label htmlFor="floor-filter" className="font-semibold text-slate-700 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-blue-700" />
              <span>Floor:</span>
            </label>
            <select
              id="floor-filter"
              value={filters.floor}
              onChange={(e) => setFloorFilter(e.target.value)}
              className="py-1.5 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B2545] text-xs min-h-[32px]"
            >
              <option value="All">All Floors</option>
              {availableFloors.map((floor: string) => (
                <option key={floor} value={floor}>
                  {floor}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Results summary bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 pt-1 gap-1.5">
          <div className="font-medium flex items-center flex-wrap gap-2">
            <span>
              Showing <strong className="text-slate-900 font-semibold tabular-nums">{filteredRooms.length}</strong> of{' '}
              <strong className="text-slate-900 font-semibold tabular-nums">{rooms.length}</strong> locations
            </span>
            <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded border bg-blue-50 text-blue-800 border-blue-200">
              {dataSource === 'google_sheets' ? 'Google Sheets Data' : 'Campus Locations Database'}
            </span>
            {hasActiveFilters && (
              <span className="text-slate-400">· Filtered</span>
            )}
          </div>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-blue-700 hover:text-blue-900 hover:underline transition-colors font-medium shrink-0 self-start sm:self-auto"
            >
              Clear filters
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
