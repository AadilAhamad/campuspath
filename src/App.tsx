import React from 'react';
import { RoomProvider, useRooms } from './context/RoomContext';
import { Header } from './components/Header';
import { NoticeBanner } from './components/NoticeBanner';
import { SearchAndFilters } from './components/SearchAndFilters';
import { RoomCard } from './components/RoomCard';
import { RoomTable } from './components/RoomTable';
import { EmptyState } from './components/EmptyState';
import { RoomDetailModal } from './components/RoomDetailModal';
import { GoogleSitesEmbedModal } from './components/GoogleSitesEmbedModal';
import { DataManagerModal } from './components/DataManagerModal';
import { CampusOverviewModal } from './components/CampusOverviewModal';
import { CampusMapRouteFinder } from './components/CampusMapRouteFinder';
import { SplashScreen } from './components/SplashScreen';
import { LoginScreen } from './components/LoginScreen';
import { RoleDashboardBanner } from './components/RoleDashboardBanner';
import { GoogleSheetsConfigModal } from './components/GoogleSheetsConfigModal';
import { Search, Navigation, Layers } from 'lucide-react';

const MainContent: React.FC = () => {
  const { 
    filteredRooms, 
    viewMode, 
    isEmbedMode, 
    activeNavTab,
    setActiveNavTab,
    setIsGoogleSitesGuideOpen,
    setIsDataManagerOpen,
    setIsCampusOverviewOpen,
    currentUser,
    logout
  } = useRooms();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Header */}
      <Header />

      {/* Role-Specific Dashboard Banner (Student vs Faculty) */}
      <RoleDashboardBanner />

      {/* Unverified Sample Data Disclaimer */}
      <NoticeBanner />

      {/* Mobile Tab Switcher */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-center">
        <div className="flex bg-slate-100 p-1 rounded-xl w-full max-w-sm">
          <button
            onClick={() => setActiveNavTab('finder')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeNavTab === 'finder'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Room Finder</span>
          </button>
          <button
            onClick={() => setActiveNavTab('map_routes')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeNavTab === 'map_routes'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Map & Routes</span>
          </button>
        </div>
      </div>

      {/* Conditional View: Room Finder OR Campus Map & Routes */}
      {activeNavTab === 'finder' ? (
        <>
          {/* Search and Filters Hub */}
          <SearchAndFilters />

          {/* Main Results Viewport */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {filteredRooms.length === 0 ? (
              <EmptyState />
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filteredRooms.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            ) : (
              <RoomTable rooms={filteredRooms} />
            )}
          </main>
        </>
      ) : (
        /* Campus Map & Shortest Route Finder View */
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <CampusMapRouteFinder />
        </main>
      )}

      {/* Footer on plain, clean white background */}
      {!isEmbedMode ? (
        <footer className="bg-white text-slate-600 border-t border-slate-200 py-8 text-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="font-bold text-[#0B2545] tracking-tight font-display text-sm">
                  NECN CampusPath
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-blue-600 font-medium">Campus Map & Room Finder</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Narayana Engineering College, Muthukur Road, Nellore, Andhra Pradesh - 524004
              </p>
              <p className="text-amber-800 text-[11px] mt-1">
                Note: Prototype sample records labeled as unverified. Data can be modified in the data manager.
              </p>
            </div>

            <div className="flex items-center gap-4 text-slate-600 text-xs">
              <button
                onClick={() => {
                  setActiveNavTab('map_routes');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-[#0B2545] transition-colors underline underline-offset-2"
              >
                Campus Map & Routes
              </button>
              <button
                onClick={() => setIsCampusOverviewOpen(true)}
                className="hover:text-[#0B2545] transition-colors underline underline-offset-2"
              >
                Block Guide
              </button>
              {currentUser?.role === 'teacher' && currentUser.status === 'active' && (
                <button
                  onClick={() => setIsDataManagerOpen(true)}
                  className="hover:text-[#0B2545] transition-colors underline underline-offset-2"
                >
                  Manage Records
                </button>
              )}
              <button
                onClick={() => setIsGoogleSitesGuideOpen(true)}
                className="hover:text-[#0B2545] transition-colors underline underline-offset-2"
              >
                Google Sites Embed
              </button>
              <button
                onClick={logout}
                className="hover:text-red-600 transition-colors underline underline-offset-2"
              >
                Switch Login
              </button>
            </div>
          </div>
        </footer>
      ) : (
        <footer className="py-2.5 px-4 text-center text-[10px] text-slate-400 border-t border-slate-200 bg-white">
          <span>NECN CampusPath · Narayana Engineering College, Nellore · Sample Records Unverified</span>
        </footer>
      )}

      {/* Interactive Modals */}
      <RoomDetailModal />
      <GoogleSitesEmbedModal />
      <DataManagerModal />
      <CampusOverviewModal />
      <GoogleSheetsConfigModal />
    </div>
  );
};

const AppNavigator: React.FC = () => {
  const { appStage } = useRooms();

  if (appStage === 'splash') {
    return <SplashScreen />;
  }

  if (appStage === 'login') {
    return <LoginScreen />;
  }

  return <MainContent />;
};

export default function App() {
  return (
    <RoomProvider>
      <AppNavigator />
    </RoomProvider>
  );
}
