import React, { useState } from 'react';
import { useRooms } from '../context/RoomContext';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit2, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  Copy, 
  AlertCircle,
  FileCode,
  Save,
  ShieldAlert,
  FileSpreadsheet
} from 'lucide-react';
import { CAMPUS_BLOCKS, FLOOR_LEVELS, ROOM_CATEGORIES, CAMPUS_DEPARTMENTS } from '../data/rooms';
import { RoomRecord, CampusBlock, FloorLevel, RoomCategory } from '../types/room';

export const DataManagerModal: React.FC = () => {
  const { 
    isDataManagerOpen, 
    setIsDataManagerOpen, 
    currentUser,
    rooms, 
    addRoom, 
    updateRoom, 
    deleteRoom, 
    resetToDefaultRooms,
    importRoomsJSON,
    exportRoomsJSON,
    reloadCampusCsv,
    sheetsStatus,
    setIsSheetsConfigModalOpen
  } = useRooms();

  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'json'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isReloadingCsv, setIsReloadingCsv] = useState(false);
  const [csvNotice, setCsvNotice] = useState<string | null>(null);
  
  // New room form state
  const [formNumber, setFormNumber] = useState('');
  const [formName, setFormName] = useState('');
  const [formBlock, setFormBlock] = useState<CampusBlock>('Block A');
  const [formFloor, setFormFloor] = useState<FloorLevel>('1st Floor');
  const [formCategory, setFormCategory] = useState<RoomCategory>('Labs');
  const [formDepartment, setFormDepartment] = useState('CSE');
  const [formPurpose, setFormPurpose] = useState('');
  const [formCapacity, setFormCapacity] = useState('60');
  const [formLandmark, setFormLandmark] = useState('');
  const [formFacilities, setFormFacilities] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Form validation & Confirmation states (safe replacement for window.alert / window.confirm)
  const [formError, setFormError] = useState<string | null>(null);
  const [roomPendingDelete, setRoomPendingDelete] = useState<RoomRecord | null>(null);
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);

  // JSON import/export state
  const [jsonText, setJsonText] = useState('');
  const [jsonMessage, setJsonMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDataManagerOpen) {
        setIsDataManagerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDataManagerOpen, setIsDataManagerOpen]);

  if (!isDataManagerOpen) return null;

  const isAuthorizedFaculty = currentUser?.role === 'teacher' && currentUser.status === 'active';

  if (!isAuthorizedFaculty) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
        <div className="fixed inset-0" onClick={() => setIsDataManagerOpen(false)} aria-hidden="true" />
        <div className="relative bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-xl border border-slate-200 z-10 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#0B2545] font-display">Faculty Authorization Required</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Modifying campus location records, importing datasets, or deleting rooms is strictly restricted to verified faculty members.
            {currentUser?.role === 'teacher' && currentUser.status === 'pending_approval' && (
              <span className="block mt-2 font-semibold text-amber-800">
                Your faculty account is currently awaiting administrative approval from the college Dean / Principal's office.
              </span>
            )}
            {currentUser?.role !== 'teacher' && (
              <span className="block mt-2 font-medium text-slate-500">
                Current account role: <strong className="capitalize">{currentUser?.role || 'Guest'}</strong>.
              </span>
            )}
          </p>
          <button
            onClick={() => setIsDataManagerOpen(false)}
            className="w-full py-2.5 bg-[#0B2545] text-white rounded-xl text-xs font-semibold hover:bg-[#133966] transition-colors shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleStartEdit = (room: RoomRecord) => {
    setEditingId(room.id);
    setFormError(null);
    setFormNumber(room.roomNumber || '');
    setFormName(room.name);
    setFormBlock(room.block as CampusBlock);
    setFormFloor(room.floor as FloorLevel);
    setFormCategory(room.category as RoomCategory);
    setFormDepartment(room.department || 'General');
    setFormPurpose(room.purpose || room.notes || '');
    setFormCapacity(room.capacity ? room.capacity.toString() : '');
    setFormLandmark(room.landmarkDirections || '');
    setFormFacilities(room.keyFacilities ? room.keyFacilities.join(', ') : '');
    setFormNotes(room.notes || '');
    setActiveTab('add');
  };

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formNumber.trim() || !formName.trim() || !formPurpose.trim()) {
      setFormError('Please fill in room number, location name, and purpose.');
      return;
    }

    const facilitiesArray = formFacilities
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const roomPayload: Omit<RoomRecord, 'id'> = {
      roomNumber: formNumber.trim(),
      name: formName.trim(),
      block: formBlock,
      floor: formFloor,
      category: formCategory,
      department: formDepartment,
      purpose: formPurpose.trim(),
      capacity: formCapacity ? parseInt(formCapacity, 10) : undefined,
      landmarkDirections: formLandmark.trim() || undefined,
      keyFacilities: facilitiesArray.length > 0 ? facilitiesArray : undefined,
      notes: formNotes.trim() || undefined,
      isSampleRecord: true,
      verificationStatus: 'unverified_sample'
    };

    if (editingId) {
      updateRoom(editingId, roomPayload);
      setEditingId(null);
    } else {
      addRoom(roomPayload);
    }

    // Reset form
    setFormNumber('');
    setFormName('');
    setFormPurpose('');
    setFormLandmark('');
    setFormFacilities('');
    setFormNotes('');
    setActiveTab('list');
  };

  const handleExportJSON = () => {
    const json = exportRoomsJSON();
    setJsonText(json);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `necn-rooms-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = () => {
    if (!jsonText.trim()) {
      setJsonMessage({ text: 'Please paste JSON content first.', error: true });
      return;
    }
    const res = importRoomsJSON(jsonText);
    if (res.success) {
      setJsonMessage({ text: 'Room dataset imported successfully!', error: false });
      setTimeout(() => {
        setActiveTab('list');
        setJsonMessage(null);
      }, 1200);
    } else {
      setJsonMessage({ text: res.error || 'Failed to import JSON', error: true });
    }
  };

  const handleCopyCodeSnippet = () => {
    const code = `export const INITIAL_SAMPLE_ROOMS: RoomRecord[] = ${exportRoomsJSON()};`;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="fixed inset-0" 
        onClick={() => setIsDataManagerOpen(false)} 
        aria-hidden="true" 
      />

      <div className="relative bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-200 z-10 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-white text-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-200 shrink-0">
          <div>
            <h2 className="text-lg font-bold font-display text-[#0B2545]">
              Campus Room Data Manager
            </h2>
            <p className="text-xs text-slate-500">
              Edit, add, export, or import college room records directly
            </p>
          </div>
          <button
            onClick={() => setIsDataManagerOpen(false)}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 flex items-center gap-2 shrink-0 text-xs font-medium">
          <button
            onClick={() => {
              setActiveTab('list');
              setEditingId(null);
            }}
            className={`py-3 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'list'
                ? 'border-[#0B2545] text-[#0B2545]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Current Records ({rooms.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('add');
              setEditingId(null);
              setFormNumber('');
              setFormName('');
              setFormPurpose('');
              setFormLandmark('');
              setFormFacilities('');
              setFormNotes('');
            }}
            className={`py-3 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'add'
                ? 'border-[#0B2545] text-[#0B2545]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {editingId ? 'Edit Room' : 'Add New Room'}
          </button>
          <button
            onClick={() => {
              setActiveTab('json');
              setJsonText(exportRoomsJSON());
            }}
            className={`py-3 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'json'
                ? 'border-[#0B2545] text-[#0B2545]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Import / Export JSON
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* TAB 1: LIST VIEW */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              {/* Non-intrusive indicator for authorized faculty when Google Sheets is unreachable */}
              {sheetsStatus === 'error' && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 px-3.5 py-2.5 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-start sm:items-center gap-2 min-w-0">
                    <FileSpreadsheet className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 sm:mt-0" />
                    <div>
                      <span className="font-semibold text-amber-950">Remote Google Sheet Offline:</span>{' '}
                      <span className="text-amber-900">
                        Spreadsheet unreachable (404/permissions). Room Finder is actively serving from verified local database (<code>Campus_Digital_Twin_Important_Locations.csv</code>).
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsDataManagerOpen(false);
                      setIsSheetsConfigModalOpen(true);
                    }}
                    className="text-amber-800 hover:text-amber-950 font-semibold underline underline-offset-2 shrink-0 text-xs self-end sm:self-center"
                  >
                    Configure Sheet
                  </button>
                </div>
              )}

              {csvNotice && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-3.5 py-2 rounded-lg text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{csvNotice}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <span className="text-slate-500">
                  Campus Location Database: {rooms.length} locations loaded.
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={async () => {
                      setIsReloadingCsv(true);
                      const ok = await reloadCampusCsv();
                      setIsReloadingCsv(false);
                      if (ok) {
                        setCsvNotice('Successfully reloaded database from Campus_Digital_Twin_Important_Locations.csv!');
                        setTimeout(() => setCsvNotice(null), 3000);
                      }
                    }}
                    disabled={isReloadingCsv}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isReloadingCsv ? 'animate-spin' : ''}`} />
                    <span>Reload CSV File</span>
                  </button>
                  <button
                    onClick={() => setIsConfirmResetOpen(true)}
                    className="flex items-center gap-1 text-slate-500 hover:text-red-700 hover:underline transition-colors shrink-0"
                  >
                    <span>Restore Defaults</span>
                  </button>
                </div>
              </div>

              {/* Confirmation Banner for Restore Defaults */}
              {isConfirmResetOpen && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-center justify-between gap-3 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Reset all locations back to default verified dataset? Custom edits will be cleared.</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        resetToDefaultRooms();
                        setIsConfirmResetOpen(false);
                      }}
                      className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-[11px]"
                    >
                      Yes, Reset
                    </button>
                    <button
                      onClick={() => setIsConfirmResetOpen(false)}
                      className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-[11px]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Confirmation Banner for Deleting Room */}
              {roomPendingDelete && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between gap-3 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Delete location <strong>{roomPendingDelete.name}</strong> ({roomPendingDelete.block})?</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        deleteRoom(roomPendingDelete.id);
                        setRoomPendingDelete(null);
                      }}
                      className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-[11px]"
                    >
                      Confirm Delete
                    </button>
                    <button
                      onClick={() => setRoomPendingDelete(null)}
                      className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-[11px]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-[50vh] overflow-y-auto text-xs">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className="p-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#0B2545] tabular-nums">
                          {room.roomNumber && room.roomNumber.toLowerCase() !== 'unknown' && room.roomNumber.toLowerCase() !== 'n/a'
                            ? room.roomNumber
                            : 'Not verified'}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="font-medium text-slate-900 truncate">
                          {room.name}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {room.block} · {room.floor} · {room.category}
                        {room.department ? ` · ${room.department}` : ''}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleStartEdit(room)}
                        className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                        title="Edit room"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setRoomPendingDelete(room)}
                        className="p-1.5 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        title="Delete room"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ADD / EDIT ROOM FORM */}
          {activeTab === 'add' && (
            <form onSubmit={handleSaveRoom} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Room Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formNumber}
                    onChange={(e) => setFormNumber(e.target.value)}
                    placeholder="e.g. A-101, B-204, C-G01"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Room or Lab Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Computer Networks Lab"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Campus Block <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formBlock}
                    onChange={(e) => setFormBlock(e.target.value as CampusBlock)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-800"
                  >
                    {CAMPUS_BLOCKS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Floor Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formFloor}
                    onChange={(e) => setFormFloor(e.target.value as FloorLevel)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-800"
                  >
                    {FLOOR_LEVELS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as RoomCategory)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-800"
                  >
                    {ROOM_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Department
                  </label>
                  <select
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-800"
                  >
                    {CAMPUS_DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Purpose & Academic Usage <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formPurpose}
                  onChange={(e) => setFormPurpose(e.target.value)}
                  rows={2}
                  placeholder="Describe what this room is used for (e.g. Student practicals, theory classes, faculty consultation)..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-800"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Capacity (Number of desks/seats)
                  </label>
                  <input
                    type="number"
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(e.target.value)}
                    placeholder="e.g. 60"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Key Facilities (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formFacilities}
                    onChange={(e) => setFormFacilities(e.target.value)}
                    placeholder="e.g. 60 Workstations, Projector, AC"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Landmark & Walking Directions
                </label>
                <input
                  type="text"
                  value={formLandmark}
                  onChange={(e) => setFormLandmark(e.target.value)}
                  placeholder="e.g. Second floor, near East Staircase, opposite HOD cabin"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Additional Notes
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Prior permission required from lab technician"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-800"
                />
              </div>

              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('list');
                    setEditingId(null);
                  }}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingId ? 'Save Changes' : 'Add Room to Finder'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: JSON IMPORT / EXPORT */}
          {activeTab === 'json' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between gap-3">
                <p className="text-slate-600">
                  Export room data as JSON for backup, or paste updated room JSON from the college administration.
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleExportJSON}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg border border-slate-300 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download JSON</span>
                  </button>
                  <button
                    onClick={handleCopyCodeSnippet}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg border border-slate-300 transition-colors"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <FileCode className="w-3.5 h-3.5" />
                        <span>Copy Code for src/data/rooms.ts</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {jsonMessage && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                    jsonMessage.error
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{jsonMessage.text}</span>
                </div>
              )}

              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                rows={12}
                className="w-full p-3 font-mono text-[11px] bg-slate-50 border border-slate-300 text-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600"
                placeholder="[ { id: '...', roomNumber: 'A-101', ... } ]"
              />

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Tip: Keep the array structure with valid JSON syntax.
                </span>
                <button
                  onClick={handleImportJSON}
                  className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import Pasted JSON</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
