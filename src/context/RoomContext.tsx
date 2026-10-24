import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { FilterState, RoomRecord, CampusBlock, FloorLevel, RoomCategory } from '../types/room';
import { UserSession } from '../types/auth';
import { INITIAL_SAMPLE_ROOMS } from '../data/rooms';
import { filterRooms } from '../utils/search';
import { 
  GoogleSheetsConfig, 
  SHEETS_STORAGE_CONFIG_KEY, 
  fetchRoomsFromGoogleSheets,
  fetchInitialCampusCsv
} from '../services/googleSheets';

export type AppStage = 'splash' | 'login' | 'app';
export type SheetsStatus = 'unconfigured' | 'loading' | 'connected' | 'error';
export type DataSourceType = 'google_sheets' | 'campus_csv' | 'local_storage';

interface RoomContextType {
  rooms: RoomRecord[];
  filters: FilterState;
  filteredRooms: RoomRecord[];
  selectedRoom: RoomRecord | null;
  viewMode: 'grid' | 'table';
  isEmbedMode: boolean;
  isGoogleSitesGuideOpen: boolean;
  isDataManagerOpen: boolean;
  isCampusOverviewOpen: boolean;
  reloadCampusCsv: () => Promise<boolean>;
  
  // Google Sheets Integration State
  sheetsConfig: GoogleSheetsConfig;
  sheetsStatus: SheetsStatus;
  sheetsError: string | null;
  dataSource: DataSourceType;
  isSheetsConfigModalOpen: boolean;
  setIsSheetsConfigModalOpen: (open: boolean) => void;
  syncWithGoogleSheets: (configOverride?: GoogleSheetsConfig) => Promise<boolean>;
  saveSheetsConfig: (config: GoogleSheetsConfig) => void;
  clearSheetsConfig: () => void;
  
  // Auth and Navigation Stage
  appStage: AppStage;
  currentUser: UserSession | null;
  activeNavTab: 'finder' | 'map_routes';
  setActiveNavTab: (tab: 'finder' | 'map_routes') => void;
  setAppStage: (stage: AppStage) => void;
  login: (session: UserSession) => void;
  logout: () => void;
  skipToApp: () => void;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setBlockFilter: (block: string | 'All') => void;
  setFloorFilter: (floor: string | 'All') => void;
  setCategoryFilter: (category: string | 'All') => void;
  setDepartmentFilter: (department: string | 'All') => void;
  resetFilters: () => void;
  setSelectedRoom: (room: RoomRecord | null) => void;
  setViewMode: (mode: 'grid' | 'table') => void;
  setIsEmbedMode: (embed: boolean) => void;
  setIsGoogleSitesGuideOpen: (open: boolean) => void;
  setIsDataManagerOpen: (open: boolean) => void;
  setIsCampusOverviewOpen: (open: boolean) => void;
  
  // Data modification actions
  addRoom: (newRoom: Omit<RoomRecord, 'id'>) => void;
  updateRoom: (id: string, updatedRoom: Partial<RoomRecord>) => void;
  deleteRoom: (id: string) => void;
  resetToDefaultRooms: () => void;
  importRoomsJSON: (jsonString: string) => { success: boolean; error?: string };
  exportRoomsJSON: () => string;
}

const LOCAL_STORAGE_KEY = 'necn_campus_locations_db_v3';
const USER_SESSION_KEY = 'necn_campuspath_session_v1';

const defaultFilters: FilterState = {
  searchQuery: '',
  block: 'All',
  floor: 'All',
  category: 'All',
  department: 'All'
};

const defaultSheetsConfig: GoogleSheetsConfig = {
  spreadsheetIdOrUrl: '',
  sheetName: 'Rooms',
  lastSyncedAt: null
};

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // App Stage: starts with 'splash', transitions to 'login', then 'app'
  const [appStage, setAppStage] = useState<AppStage>('splash');
  const [activeNavTab, setActiveNavTab] = useState<'finder' | 'map_routes'>('finder');

  // Google Sheets Integration state
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(SHEETS_STORAGE_CONFIG_KEY);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse sheets config', e);
      }
    }
    return defaultSheetsConfig;
  });

  const [sheetsStatus, setSheetsStatus] = useState<SheetsStatus>('unconfigured');
  const [sheetsError, setSheetsError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<DataSourceType>('campus_csv');
  const [isSheetsConfigModalOpen, setIsSheetsConfigModalOpen] = useState(false);

  // User session
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(USER_SESSION_KEY);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse user session', e);
      }
    }
    return null;
  });

  // Initialize rooms: start with localStorage or fallback sample data
  const [rooms, setRooms] = useState<RoomRecord[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn('Failed to parse saved room data from localStorage', e);
      }
    }
    return INITIAL_SAMPLE_ROOMS;
  });

  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [selectedRoom, setSelectedRoom] = useState<RoomRecord | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isGoogleSitesGuideOpen, setIsGoogleSitesGuideOpen] = useState(false);
  const [isDataManagerOpen, setIsDataManagerOpen] = useState(false);
  const [isCampusOverviewOpen, setIsCampusOverviewOpen] = useState(false);

  // Check URL query param for ?embed=true
  const [isEmbedMode, setIsEmbedMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('embed') === 'true';
    }
    return false;
  });

  // Function to reload Campus_Digital_Twin_Important_Locations.csv
  const reloadCampusCsv = async (): Promise<boolean> => {
    const result = await fetchInitialCampusCsv();
    if (result.success && result.rooms.length > 0) {
      setRooms(result.rooms);
      setDataSource('campus_csv');
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(result.rooms));
      } catch (e) {
        console.warn('Failed to cache rooms in localStorage', e);
      }
      return true;
    }
    return false;
  };

  // Function to sync with Google Sheets
  const syncWithGoogleSheets = async (configOverride?: GoogleSheetsConfig): Promise<boolean> => {
    const configToUse = configOverride || sheetsConfig;
    if (!configToUse.spreadsheetIdOrUrl.trim()) {
      setSheetsStatus('unconfigured');
      setSheetsError(null);
      setDataSource('campus_csv');
      return false;
    }

    setSheetsStatus('loading');
    setSheetsError(null);

    const result = await fetchRoomsFromGoogleSheets(
      configToUse.spreadsheetIdOrUrl,
      configToUse.sheetName || 'Rooms'
    );

    if (result.success && result.rooms.length > 0) {
      setRooms(result.rooms);
      setDataSource('google_sheets');
      setSheetsStatus('connected');
      const updatedConfig: GoogleSheetsConfig = {
        ...configToUse,
        lastSyncedAt: new Date().toLocaleTimeString()
      };
      setSheetsConfig(updatedConfig);
      try {
        localStorage.setItem(SHEETS_STORAGE_CONFIG_KEY, JSON.stringify(updatedConfig));
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(result.rooms));
      } catch (e) {
        console.warn('Failed to save to localStorage', e);
      }
      return true;
    } else {
      setSheetsStatus('error');
      setSheetsError(result.error || 'Failed to parse rooms from worksheet "Rooms".');
      setDataSource('campus_csv');

      // Developer diagnostic logging without exposing credentials or sensitive tokens
      console.info('[NECN CampusPath] Remote Google Sheets sync unavailable; reverting cleanly to verified local campus CSV:', {
        sheetName: configToUse.sheetName || 'Rooms',
        reason: result.error || 'Spreadsheet unreachable or 404',
        fallback: 'Campus_Digital_Twin_Important_Locations.csv'
      });

      // Ensure local campus CSV records are cleanly reloaded into state
      await reloadCampusCsv();
      return false;
    }
  };

  // On mount: if Google Sheets was configured, sync it; otherwise attempt fresh fetch of Campus CSV
  useEffect(() => {
    if (sheetsConfig.spreadsheetIdOrUrl.trim()) {
      syncWithGoogleSheets(sheetsConfig);
    } else {
      // Fetch latest Campus_Digital_Twin_Important_Locations.csv if available
      reloadCampusCsv();
    }
  }, []);

  const saveSheetsConfig = (newConfig: GoogleSheetsConfig) => {
    setSheetsConfig(newConfig);
    try {
      localStorage.setItem(SHEETS_STORAGE_CONFIG_KEY, JSON.stringify(newConfig));
    } catch (e) {
      console.warn('Failed to save sheets config', e);
    }
    syncWithGoogleSheets(newConfig);
  };

  const clearSheetsConfig = () => {
    const resetConfig = { spreadsheetIdOrUrl: '', sheetName: 'Rooms', lastSyncedAt: null };
    setSheetsConfig(resetConfig);
    setSheetsStatus('unconfigured');
    setSheetsError(null);
    setDataSource('campus_csv');
    setRooms(INITIAL_SAMPLE_ROOMS);
    try {
      localStorage.removeItem(SHEETS_STORAGE_CONFIG_KEY);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_ROOMS));
    } catch (e) {
      console.warn('Failed to clear config from localStorage', e);
    }
  };

  // Save to localStorage when rooms change manually
  useEffect(() => {
    if (typeof window !== 'undefined' && dataSource !== 'google_sheets') {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rooms));
      } catch (e) {
        console.warn('Failed to save room data to localStorage', e);
      }
    }
  }, [rooms, dataSource]);

  const login = (session: UserSession) => {
    setCurrentUser(session);
    try {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(session));
    } catch (e) {
      console.warn('Failed to persist session', e);
    }
    setAppStage('app');
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(USER_SESSION_KEY);
    } catch (e) {
      console.warn('Failed to remove session', e);
    }
    setAppStage('login');
  };

  const skipToApp = () => {
    setCurrentUser({
      role: 'guest',
      identifier: 'Guest Visitor',
      name: 'Campus Visitor',
      loginTime: new Date().toISOString(),
      status: 'active',
      authProvider: 'local_secure_vault'
    });
    setAppStage('app');
  };

  const filteredRooms = useMemo(() => {
    return filterRooms(rooms, filters);
  }, [rooms, filters]);

  const setSearchQuery = (searchQuery: string) => {
    setFilters((prev) => ({ ...prev, searchQuery }));
  };

  const setBlockFilter = (block: string | 'All') => {
    setFilters((prev) => ({ ...prev, block }));
  };

  const setFloorFilter = (floor: string | 'All') => {
    setFilters((prev) => ({ ...prev, floor }));
  };

  const setCategoryFilter = (category: string | 'All') => {
    setFilters((prev) => ({ ...prev, category }));
  };

  const setDepartmentFilter = (department: string | 'All') => {
    setFilters((prev) => ({ ...prev, department }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const isAuthorizedFaculty = currentUser?.role === 'teacher' && currentUser.status === 'active';

  const addRoom = (newRoomData: Omit<RoomRecord, 'id'>) => {
    if (!isAuthorizedFaculty) {
      console.warn('Unauthorized operation: Only verified faculty members can add rooms.');
      return;
    }
    const newRoom: RoomRecord = {
      ...newRoomData,
      id: `necn-custom-${Date.now()}`
    };
    setRooms((prev) => [newRoom, ...prev]);
  };

  const updateRoom = (id: string, updatedRoom: Partial<RoomRecord>) => {
    if (!isAuthorizedFaculty) {
      console.warn('Unauthorized operation: Only verified faculty members can edit rooms.');
      return;
    }
    setRooms((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updatedRoom } : r))
    );
  };

  const deleteRoom = (id: string) => {
    if (!isAuthorizedFaculty) {
      console.warn('Unauthorized operation: Only verified faculty members can delete rooms.');
      return;
    }
    setRooms((prev) => prev.filter((r) => r.id !== id));
    if (selectedRoom?.id === id) {
      setSelectedRoom(null);
    }
  };

  const resetToDefaultRooms = () => {
    if (!isAuthorizedFaculty) {
      console.warn('Unauthorized operation: Only verified faculty members can reset campus records.');
      return;
    }
    setRooms(INITIAL_SAMPLE_ROOMS);
    setDataSource('campus_csv');
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  const exportRoomsJSON = (): string => {
    return JSON.stringify(rooms, null, 2);
  };

  const importRoomsJSON = (jsonString: string): { success: boolean; error?: string } => {
    if (!isAuthorizedFaculty) {
      return { success: false, error: 'Unauthorized: Verified faculty authorization required to import records.' };
    }
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) {
        return { success: false, error: 'JSON content must be an array of room objects' };
      }
      const isValid = parsed.every(
        (item) => item.roomNumber && item.name && item.block && item.floor && item.category
      );
      if (!isValid) {
        return {
          success: false,
          error: 'Some rooms are missing mandatory fields (roomNumber, name, block, floor, category)'
        };
      }
      setRooms(parsed);
      setDataSource('local_storage');
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Invalid JSON format' };
    }
  };

  return (
    <RoomContext.Provider
      value={{
        rooms,
        filters,
        filteredRooms,
        selectedRoom,
        viewMode,
        isEmbedMode,
        isGoogleSitesGuideOpen,
        isDataManagerOpen,
        isCampusOverviewOpen,
        reloadCampusCsv,
        sheetsConfig,
        sheetsStatus,
        sheetsError,
        dataSource,
        isSheetsConfigModalOpen,
        setIsSheetsConfigModalOpen,
        syncWithGoogleSheets,
        saveSheetsConfig,
        clearSheetsConfig,
        appStage,
        currentUser,
        activeNavTab,
        setActiveNavTab,
        setAppStage,
        login,
        logout,
        skipToApp,
        setSearchQuery,
        setBlockFilter,
        setFloorFilter,
        setCategoryFilter,
        setDepartmentFilter,
        resetFilters,
        setSelectedRoom,
        setViewMode,
        setIsEmbedMode,
        setIsGoogleSitesGuideOpen,
        setIsDataManagerOpen,
        setIsCampusOverviewOpen,
        addRoom,
        updateRoom,
        deleteRoom,
        resetToDefaultRooms,
        importRoomsJSON,
        exportRoomsJSON
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const useRooms = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRooms must be used within a RoomProvider');
  }
  return context;
};
