import React, { useState } from 'react';
import { useRooms } from '../context/RoomContext';
import { 
  X, 
  FileSpreadsheet, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck,
  Table,
  HelpCircle,
  Database
} from 'lucide-react';

export const GoogleSheetsConfigModal: React.FC = () => {
  const { 
    isSheetsConfigModalOpen, 
    setIsSheetsConfigModalOpen,
    sheetsConfig,
    saveSheetsConfig,
    clearSheetsConfig,
    syncWithGoogleSheets,
    sheetsStatus,
    sheetsError,
    dataSource,
    rooms
  } = useRooms();

  const [inputUrl, setInputUrl] = useState(sheetsConfig.spreadsheetIdOrUrl);
  const [sheetTabName, setSheetTabName] = useState(sheetsConfig.sheetName || 'Rooms');
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSheetsConfigModalOpen) {
        setIsSheetsConfigModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSheetsConfigModalOpen, setIsSheetsConfigModalOpen]);

  if (!isSheetsConfigModalOpen) return null;

  const handleSaveAndSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    saveSheetsConfig({
      spreadsheetIdOrUrl: inputUrl.trim(),
      sheetName: sheetTabName.trim() || 'Rooms',
      lastSyncedAt: sheetsConfig.lastSyncedAt
    });
  };

  const sampleCsvHeader = `Room ID,Block,Floor,Room Number,Room Name,Category
LOC-SEM-A01,Block A,1st Floor,Not verified,CSE Seminar Hall,Seminar Halls
LOC-LAB-A01,Block A,3rd Floor,Not verified,Physics Labs,Labs
LOC-LIB-B01,Block B,1st Floor,Not verified,Central Library,Library
LOC-CAN-C01,Block C,Ground Floor,Not verified,Canteen,Canteen`;

  const copyTemplate = () => {
    navigator.clipboard.writeText(sampleCsvHeader);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="fixed inset-0" 
        onClick={() => setIsSheetsConfigModalOpen(false)} 
        aria-hidden="true" 
      />

      <div className="relative bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-xl border border-slate-200 z-10 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-white text-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-display text-[#0B2545]">
                Google Sheets Campus Data Integration
              </h2>
              <p className="text-xs text-slate-500">
                Sync live college rooms, labs, and block records directly from Google Sheets
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSheetsConfigModalOpen(false)}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-slate-700">
          
          {/* Connection Status Banner */}
          <div className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
            sheetsStatus === 'connected'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : sheetsStatus === 'error'
              ? 'bg-red-50 border-red-200 text-red-950'
              : sheetsStatus === 'loading'
              ? 'bg-blue-50 border-blue-200 text-blue-950'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-start gap-2.5">
              {sheetsStatus === 'connected' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : sheetsStatus === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              ) : sheetsStatus === 'loading' ? (
                <RefreshCw className="w-5 h-5 text-blue-600 animate-spin shrink-0 mt-0.5" />
              ) : (
                <Database className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-semibold text-xs sm:text-sm">
                  {sheetsStatus === 'connected' && `Google Sheets Connected (${rooms.length} Rooms Synced)`}
                  {sheetsStatus === 'loading' && 'Fetching & parsing spreadsheet data...'}
                  {sheetsStatus === 'error' && 'Sync Error — Using Verified Campus CSV Database'}
                  {sheetsStatus === 'unconfigured' && 'Campus CSV Active · Google Sheets Optional'}
                </div>
                <p className="text-xs mt-0.5 opacity-90">
                  {sheetsStatus === 'connected' && `Last synchronized at ${sheetsConfig.lastSyncedAt || 'just now'}. Active worksheet: "${sheetsConfig.sheetName || 'Rooms'}".`}
                  {sheetsStatus === 'error' && `${sheetsError || 'Could not load data from spreadsheet.'} The app safely reverted to verified locations in Campus_Digital_Twin_Important_Locations.csv.`}
                  {sheetsStatus === 'unconfigured' && `Currently displaying ${rooms.length} verified campus locations from Campus_Digital_Twin_Important_Locations.csv. You can optionally connect your live Google Sheet below to sync updates.`}
                </p>
              </div>
            </div>

            {sheetsStatus === 'connected' && (
              <button
                type="button"
                onClick={() => syncWithGoogleSheets()}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync Now</span>
              </button>
            )}
          </div>

          {/* Form to Enter Spreadsheet URL / ID */}
          <form onSubmit={handleSaveAndSync} className="space-y-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Google Spreadsheet URL or Spreadsheet ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                required
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Paste your full Google Sheets browser URL, or just the Spreadsheet ID between <code>/d/</code> and <code>/edit</code>.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Worksheet (Tab) Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={sheetTabName}
                  onChange={(e) => setSheetTabName(e.target.value)}
                  placeholder="Rooms"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Required worksheet name is <strong>Rooms</strong>.
                </p>
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  disabled={sheetsStatus === 'loading'}
                  className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${sheetsStatus === 'loading' ? 'animate-spin' : ''}`} />
                  <span>Connect &amp; Sync</span>
                </button>

                {sheetsConfig.spreadsheetIdOrUrl && (
                  <button
                    type="button"
                    onClick={clearSheetsConfig}
                    className="py-2 px-3 bg-white hover:bg-red-50 text-slate-600 hover:text-red-700 border border-slate-300 rounded-lg text-xs transition-colors"
                    title="Disconnect and restore sample data"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* Required Spreadsheet Structure Guide */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Table className="w-3.5 h-3.5 text-blue-700" />
                <span>Required Spreadsheet Columns (Worksheet: "Rooms")</span>
              </h3>
              <button
                type="button"
                onClick={copyTemplate}
                className="text-[11px] text-blue-700 hover:text-blue-900 flex items-center gap-1"
              >
                {copiedTemplate ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedTemplate ? 'Copied CSV' : 'Copy Sample Template'}</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                  <tr>
                    <th className="py-2 px-3 font-mono">Room ID</th>
                    <th className="py-2 px-3 font-mono">Block</th>
                    <th className="py-2 px-3 font-mono">Floor</th>
                    <th className="py-2 px-3 font-mono">Room Number</th>
                    <th className="py-2 px-3 font-mono">Room Name</th>
                    <th className="py-2 px-3 font-mono">Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr>
                    <td className="py-1.5 px-3 font-mono">LOC-SEM-A01</td>
                    <td className="py-1.5 px-3">Block A</td>
                    <td className="py-1.5 px-3">1st Floor</td>
                    <td className="py-1.5 px-3 font-mono text-slate-500 italic">Not verified</td>
                    <td className="py-1.5 px-3">CSE Seminar Hall</td>
                    <td className="py-1.5 px-3">Seminar Halls</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-mono">LOC-LAB-A01</td>
                    <td className="py-1.5 px-3">Block A</td>
                    <td className="py-1.5 px-3">3rd Floor</td>
                    <td className="py-1.5 px-3 font-mono text-slate-500 italic">Not verified</td>
                    <td className="py-1.5 px-3">Physics Labs</td>
                    <td className="py-1.5 px-3">Labs</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-mono">LOC-LIB-B01</td>
                    <td className="py-1.5 px-3">Block B</td>
                    <td className="py-1.5 px-3">1st Floor</td>
                    <td className="py-1.5 px-3 font-mono text-slate-500 italic">Not verified</td>
                    <td className="py-1.5 px-3">Central Library</td>
                    <td className="py-1.5 px-3">Library</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Setup Instructions for Students / College Staff */}
          <div className="space-y-2 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
            <h4 className="font-semibold text-slate-900 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-blue-700" />
              <span>Recommended Google Sheets Setup Steps:</span>
            </h4>
            <ol className="list-decimal pl-5 space-y-1.5 text-slate-600 text-[11px] leading-relaxed">
              <li>Create a new spreadsheet at <strong>sheets.google.com</strong>.</li>
              <li>Rename the sheet tab at the bottom to <strong>Rooms</strong>.</li>
              <li>In row 1, add the exact columns: <code>Room ID</code>, <code>Block</code>, <code>Floor</code>, <code>Room Number</code>, <code>Room Name</code>, <code>Category</code>.</li>
              <li>Click <strong>Share</strong> in the top-right corner &gt; set General Access to <strong>"Anyone with the link can view"</strong> (Viewer).</li>
              <li>Copy the browser URL and paste it into the field above, then click <strong>Connect &amp; Sync</strong>.</li>
            </ol>
          </div>

          {/* Security & Secret Notice */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-[11px] text-blue-900">
            <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold">Security Best Practice:</strong> This read-only CSV approach requires zero secret API keys or service accounts in the browser code. Do not store sensitive student records or passwords in this public campus directory spreadsheet.
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={() => setIsSheetsConfigModalOpen(false)}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
