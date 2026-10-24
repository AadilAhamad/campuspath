import React from 'react';
import { RoomRecord } from '../types/room';
import { useRooms } from '../context/RoomContext';
import { MapPin, ChevronRight, Compass, AlertCircle, Sparkles } from 'lucide-react';

interface RoomCardProps {
  room: RoomRecord;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
  const { setSelectedRoom, setIsCampusOverviewOpen } = useRooms();

  const isRoomNumberConfirmed = Boolean(
    room.roomNumber &&
    room.roomNumber.toLowerCase() !== 'unknown' &&
    room.roomNumber.toLowerCase() !== 'n/a' &&
    room.roomNumber.toLowerCase() !== 'not verified' &&
    room.roomNumber.toLowerCase() !== 'unverified'
  );

  const isFloorConfirmed = Boolean(
    room.floor &&
    room.floor.toLowerCase() !== 'unknown' &&
    room.floor.toLowerCase() !== 'n/a' &&
    room.floor.toLowerCase() !== 'not verified' &&
    room.floor.toLowerCase() !== 'unverified'
  );

  return (
    <div
      onClick={() => setSelectedRoom(room)}
      className="group relative bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md rounded-xl p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between text-left"
    >
      <div>
        {/* Top bar with Room Number status & Category */}
        <div className="flex items-start justify-between gap-2.5 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            {isRoomNumberConfirmed ? (
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#0B2545] font-display tabular-nums">
                {room.roomNumber}
              </span>
            ) : (
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                Room No: Not verified
              </span>
            )}
            <span className="text-xs font-medium text-slate-500 font-mono">
              [{room.block}]
            </span>
          </div>

          {/* Category Tag */}
          <span className="text-[11px] font-semibold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 shrink-0">
            {room.category}
          </span>
        </div>

        {/* Location Name */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-900 transition-colors leading-snug mb-2 font-display">
          {room.name}
        </h3>

        {/* Location Metadata with Block/Area & Floor */}
        <div className="flex items-center flex-wrap gap-1.5 text-xs text-slate-600 mb-3">
          <span className="font-semibold text-slate-800">{room.block}</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          {isFloorConfirmed ? (
            <span className="font-medium text-slate-700">{room.floor}</span>
          ) : (
            <span className="text-amber-800 font-medium bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[11px]">
              Floor: Not verified
            </span>
          )}
          {room.department && (
            <>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-slate-500">{room.department}</span>
            </>
          )}
        </div>

        {/* Notes / Description */}
        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-3">
          {room.notes || room.purpose || `${room.name} located in ${room.block}.`}
        </p>

        {/* Basic Directions Preview */}
        {room.landmarkDirections && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 mb-3 text-xs text-slate-700 flex items-start gap-2">
            <Compass className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
            <div className="line-clamp-2">
              <strong className="text-slate-900 font-medium">Directions: </strong>
              <span>{room.landmarkDirections}</span>
            </div>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mt-auto gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedRoom(room);
            setIsCampusOverviewOpen(true);
          }}
          className="flex items-center gap-1.5 text-blue-700 hover:text-blue-900 font-medium px-2 py-1 rounded bg-blue-50/90 hover:bg-blue-100 border border-blue-200 transition-colors text-[11px]"
          title="Visually highlight floor in Campus Overview"
        >
          <Compass className="w-3.5 h-3.5 text-blue-600" />
          <span>Floor Cutaway</span>
        </button>

        <div className="flex items-center gap-1 font-semibold text-slate-700 group-hover:text-blue-700 shrink-0">
          <span>Details</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
};
