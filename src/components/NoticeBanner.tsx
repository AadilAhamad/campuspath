import React, { useState } from 'react';
import { X, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useRooms } from '../context/RoomContext';

export const NoticeBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);
  const { 
    dataSource, 
    sheetsStatus, 
    sheetsConfig, 
    rooms, 
    syncWithGoogleSheets, 
    setIsSheetsConfigModalOpen 
  } = useRooms();

  if (dismissed) return null;

  // 1. Loading State - Silent in background to prevent UI flicker
  if (sheetsStatus === 'loading') {
    return null;
  }

  // 2. Connected State (Successfully synced live data)
  if (dataSource === 'google_sheets' && sheetsStatus === 'connected') {
    return (
      <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-950 text-xs py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Live Google Sheets Connected:</strong> Displaying {rooms.length} campus location records from worksheet <em>"{sheetsConfig.sheetName || 'Rooms'}"</em> (synced at {sheetsConfig.lastSyncedAt || 'recently'}).
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => syncWithGoogleSheets()}
              className="text-emerald-800 hover:text-emerald-950 font-medium underline underline-offset-2 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh Sheet</span>
            </button>
            <button
              onClick={() => setIsSheetsConfigModalOpen(true)}
              className="text-emerald-800 hover:text-emerald-950 font-medium underline underline-offset-2 ml-1"
            >
              Settings
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="text-emerald-700 hover:text-emerald-950 p-1"
              aria-label="Dismiss notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Error or unconfigured state: Return null.
  // Suppresses alarming error messages from student view with zero DOM elements and zero broken spacing.
  // The system seamlessly serves the verified local Campus_Digital_Twin_Important_Locations.csv database.
  return null;
};
