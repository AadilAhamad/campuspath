import React from 'react';
import { RoomRecord } from '../types/room';
import { useRooms } from '../context/RoomContext';
import { ChevronRight, MapPin, Layers } from 'lucide-react';

interface RoomTableProps {
  rooms: RoomRecord[];
}

export const RoomTable: React.FC<RoomTableProps> = ({ rooms }) => {
  const { setSelectedRoom, setIsCampusOverviewOpen } = useRooms();

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      
      {/* Mobile-Friendly Adaptive List (< md screens) */}
      <div className="md:hidden divide-y divide-slate-100">
        {rooms.map((room) => {
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
              key={room.id}
              onClick={() => setSelectedRoom(room)}
              className="p-3.5 hover:bg-blue-50/50 cursor-pointer transition-colors flex items-center justify-between gap-3 text-left"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className="font-mono font-bold text-[#0B2545] text-xs sm:text-sm tabular-nums">
                    {isRoomNumberConfirmed ? room.roomNumber : 'No. Unverified'}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-[11px] font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                    {room.block}
                  </span>
                  <span className="text-[11px] text-slate-500 truncate">
                    {isFloorConfirmed ? room.floor : 'Floor Unverified'}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {room.name}
                </h4>
                {room.landmarkDirections && (
                  <p className="text-[11px] text-slate-500 truncate mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{room.landmarkDirections}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRoom(room);
                    setIsCampusOverviewOpen(true);
                  }}
                  className="p-2 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                  title="Inspect floor in Block Guide"
                  aria-label="Inspect floor"
                >
                  <Layers className="w-3.5 h-3.5" />
                </button>
                <div className="p-1 text-slate-400">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop / Laptop Table Layout (>= md screens) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
              <th className="py-3 px-4">Room No.</th>
              <th className="py-3 px-4">Location Name</th>
              <th className="py-3 px-4">Block / Area</th>
              <th className="py-3 px-4">Floor</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Notes / Purpose</th>
              <th className="py-3 px-4 text-center">Data Source</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rooms.map((room) => {
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
                <tr
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0B2545] tabular-nums whitespace-nowrap">
                    {isRoomNumberConfirmed ? (
                      room.roomNumber
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        Not verified
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-900 group-hover:text-blue-900">
                    <div>{room.name}</div>
                    {room.landmarkDirections && (
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-normal">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-xs">{room.landmarkDirections}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap font-medium">
                    {room.block}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                    {isFloorConfirmed ? (
                      room.floor
                    ) : (
                      <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-medium border border-amber-200">
                        Not verified
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-xs">
                      {room.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                    {room.notes || room.purpose}
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span className="text-[10px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Campus DB
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRoom(room);
                          setIsCampusOverviewOpen(true);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-1 rounded transition-colors"
                        title="Highlight floor in Campus Overview"
                      >
                        <Layers className="w-3 h-3 text-blue-600" />
                        <span>Floor</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRoom(room);
                        }}
                        className="inline-flex items-center gap-0.5 text-xs font-semibold text-slate-700 hover:text-blue-900 hover:underline px-1.5 py-1"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
