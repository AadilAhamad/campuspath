import React, { useState } from 'react';
import { useRooms } from '../context/RoomContext';
import { 
  X, 
  MapPin, 
  Building, 
  Layers, 
  CheckCircle2, 
  Copy, 
  Check, 
  AlertTriangle,
  Compass,
  FileText,
  Navigation,
  Info
} from 'lucide-react';

export const RoomDetailModal: React.FC = () => {
  const { selectedRoom, setSelectedRoom, setActiveNavTab, setIsCampusOverviewOpen } = useRooms();
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedRoom(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedRoom]);

  if (!selectedRoom) return null;

  const isRoomNumberConfirmed = Boolean(
    selectedRoom.roomNumber &&
    selectedRoom.roomNumber.toLowerCase() !== 'unknown' &&
    selectedRoom.roomNumber.toLowerCase() !== 'n/a' &&
    selectedRoom.roomNumber.toLowerCase() !== 'not verified' &&
    selectedRoom.roomNumber.toLowerCase() !== 'unverified'
  );

  const isFloorConfirmed = Boolean(
    selectedRoom.floor &&
    selectedRoom.floor.toLowerCase() !== 'unknown' &&
    selectedRoom.floor.toLowerCase() !== 'n/a' &&
    selectedRoom.floor.toLowerCase() !== 'not verified' &&
    selectedRoom.floor.toLowerCase() !== 'unverified'
  );

  const handleCopyDetails = () => {
    const text = `NECN Campus Digital Twin - Location Details:
Location: ${selectedRoom.name}
Room Number: ${isRoomNumberConfirmed ? selectedRoom.roomNumber : 'Not verified'}
Area / Block: ${selectedRoom.block}
Floor: ${isFloorConfirmed ? selectedRoom.floor : 'Not verified'}
Category: ${selectedRoom.category}
Notes: ${selectedRoom.notes || selectedRoom.purpose || 'N/A'}
Directions: ${selectedRoom.landmarkDirections || 'N/A'}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop click */}
      <div 
        className="fixed inset-0" 
        onClick={() => setSelectedRoom(null)} 
        aria-hidden="true" 
      />

      <div className="relative bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-xl border border-slate-200 z-10 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header on clean white background with navy-blue headings */}
        <div className="bg-white text-slate-900 p-5 sm:p-6 border-b border-slate-200 relative">
          <button
            onClick={() => setSelectedRoom(null)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            {isRoomNumberConfirmed ? (
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display tabular-nums text-[#0B2545]">
                {selectedRoom.roomNumber}
              </span>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                Room No: Not verified
              </span>
            )}
            <span className="text-xs uppercase tracking-wider font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md">
              {selectedRoom.block}
            </span>
          </div>

          <h2 className="text-lg sm:text-2xl font-bold text-[#0B2545] font-display leading-snug">
            {selectedRoom.name}
          </h2>

          <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 mt-2">
            <span>
              {isFloorConfirmed ? selectedRoom.floor : 'Floor: Not verified'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-medium text-blue-700">{selectedRoom.category}</span>
            {selectedRoom.department && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-slate-600">{selectedRoom.department}</span>
              </>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Notes / Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-700" />
              <span>Location Notes & Description</span>
            </h4>
            <div className="text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              {selectedRoom.notes || selectedRoom.purpose || `${selectedRoom.name} located in ${selectedRoom.block}.`}
            </div>
          </div>

          {/* Location Specifications Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="text-slate-500 font-medium mb-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-700" />
                <span>Block / Area</span>
              </div>
              <div className="text-sm font-semibold text-slate-900">
                {selectedRoom.block}
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="text-slate-500 font-medium mb-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-700" />
                <span>Floor Level</span>
              </div>
              <div className="text-sm font-semibold text-slate-900">
                {isFloorConfirmed ? (
                  selectedRoom.floor
                ) : (
                  <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-xs font-medium">
                    Not verified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Basic Directions */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-blue-700" />
              <span>Basic Directions & Guidance</span>
            </h4>
            <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4 text-xs sm:text-sm text-slate-800 space-y-2">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-950 mb-0.5">
                    {selectedRoom.landmarkDirections || `Locate ${selectedRoom.block}${isFloorConfirmed ? ` and proceed to ${selectedRoom.floor}` : ''}.`}
                  </p>
                  <p className="text-xs text-slate-600">
                    {isFloorConfirmed
                      ? `Target location is on ${selectedRoom.floor} in ${selectedRoom.block}.`
                      : `Target location is in ${selectedRoom.block}. Floor details are not confirmed.`}
                  </p>
                </div>
              </div>

              {/* Unverified indoor route disclaimer as required */}
              <div className="pt-2 border-t border-blue-200/60 flex items-center gap-2 text-[11px] text-amber-800 bg-amber-50/60 px-2.5 py-1.5 rounded-lg">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>
                  <strong>Notice:</strong> Indoor navigation steps and room layouts are schematic. Please verify with physical campus signboards.
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer with Actions */}
        <div className="bg-slate-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <button
            onClick={handleCopyDetails}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors shadow-xs min-h-[36px]"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Details</span>
              </>
            )}
          </button>

          <div className="grid grid-cols-3 sm:flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedRoom(null);
                setIsCampusOverviewOpen(true);
              }}
              className="px-2.5 sm:px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 border border-blue-200 shadow-xs min-h-[36px]"
              title="Visually highlight this floor with dynamic SVG cutaway"
            >
              <Layers className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Floor</span>
            </button>
            <button
              onClick={() => {
                setSelectedRoom(null);
                setActiveNavTab('map_routes');
              }}
              className="px-2.5 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 shadow-xs min-h-[36px]"
            >
              <Navigation className="w-3.5 h-3.5 shrink-0" />
              <span>Map</span>
            </button>
            <button
              onClick={() => setSelectedRoom(null)}
              className="px-2.5 sm:px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-lg transition-colors min-h-[36px] flex items-center justify-center"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
