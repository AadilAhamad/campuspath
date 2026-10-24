import React from 'react';
import { SearchX, RotateCcw, HelpCircle } from 'lucide-react';
import { useRooms } from '../context/RoomContext';

export const EmptyState: React.FC = () => {
  const { filters, resetFilters, setSearchQuery, setBlockFilter, rooms } = useRooms();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xs">
      <div className="w-16 h-16 bg-slate-100 border border-slate-200 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <SearchX className="w-8 h-8 text-slate-500" />
      </div>

      <h3 className="text-xl font-bold text-[#0B2545] mb-2 font-display">
        No Matching Campus Rooms Found
      </h3>

      <p className="text-sm text-slate-600 mb-6 leading-relaxed">
        {filters.searchQuery ? (
          <>
            We couldn't find any rooms matching{' '}
            <strong className="text-slate-900 font-semibold">"{filters.searchQuery}"</strong>
            {filters.block !== 'All' && <span> in {filters.block}</span>}
            {filters.floor !== 'All' && <span> on {filters.floor}</span>}
            {filters.category !== 'All' && <span> under {filters.category}</span>}.
          </>
        ) : (
          <>
            No sample rooms match the currently selected combination of block, floor, or category filters.
          </>
        )}
      </p>

      {/* Helpful Search Tips */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs text-slate-600 mb-6 space-y-2">
        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-blue-700" />
          <span>Suggestions to locate your room:</span>
        </div>
        <ul className="list-disc pl-5 space-y-1 text-slate-600">
          <li>Try searching with just the number portion (e.g., search <span className="font-mono text-slate-900">101</span> instead of <span className="font-mono text-slate-900">A-101</span>).</li>
          <li>Search by lab name or department (e.g., <span className="font-mono text-slate-900">CSE</span>, <span className="font-mono text-slate-900">Physics</span>, <span className="font-mono text-slate-900">Programming</span>).</li>
          <li>Set block and floor filters back to "All" to search across the entire campus.</li>
          <li>If you know a room that is missing, you can add it via the <strong className="text-slate-800">Manage Data</strong> tool above.</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={resetFilters}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset All Filters</span>
        </button>
        <button
          onClick={() => {
            resetFilters();
            setSearchQuery('Lab');
          }}
          className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
        >
          View All Labs
        </button>
      </div>
    </div>
  );
};
