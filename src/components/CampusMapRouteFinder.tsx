import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRooms } from '../context/RoomContext';
import { 
  CAMPUS_NODES, 
  CampusNode, 
  RoutePreference, 
  calculateCampusRoute, 
  CalculatedRouteResult,
  getCampusNodeIdForRoom
} from '../data/campusPathNetwork';
import { CAMPUS_GATES } from '../data/campusRoutes';
import { CampusSchematicMap } from './CampusSchematicMap';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  Footprints, 
  CheckCircle2, 
  Building2, 
  Compass, 
  ArrowRight,
  ArrowUpDown,
  Plus,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  ShieldCheck,
  Umbrella,
  Zap,
  Activity,
  AlertTriangle,
  LocateFixed,
  ChevronDown,
  ChevronUp,
  Layers,
  HelpCircle,
  ExternalLink,
  Sliders,
  Info
} from 'lucide-react';

export const CampusMapRouteFinder: React.FC = () => {
  const { rooms } = useRooms();

  // -------------------------------------------------------------
  // ROUTE SELECTION STATE
  // -------------------------------------------------------------
  const [startNodeId, setStartNodeId] = useState<string>('gate-main');
  const [destNodeId, setDestNodeId] = useState<string>('block-c-canteen');
  const [intermediateNodeIds, setIntermediateNodeIds] = useState<string[]>([]);
  const [preference, setPreference] = useState<RoutePreference>('shortest');
  
  // Walking Speed Configuration (default 1.3 m/s)
  const [walkingSpeedMs, setWalkingSpeedMs] = useState<number>(1.3);
  const [isSpeedCustomOpen, setIsSpeedCustomOpen] = useState<boolean>(false);

  // Active step focus
  const [focusedStepIndex, setFocusedStepIndex] = useState<number | null>(null);

  // -------------------------------------------------------------
  // SIMULATION & LIVE NAVIGATION STATE
  // -------------------------------------------------------------
  type NavMode = 'idle' | 'simulating' | 'live_gps';
  const [navMode, setNavMode] = useState<NavMode>('idle');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [simSpeedMultiplier, setSimSpeedMultiplier] = useState<number>(1);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [distanceTravelledM, setDistanceTravelledM] = useState<number>(0);

  // Live Walker Coordinate in SVG space (0-980, 0-620)
  const [walkerCoords, setWalkerCoords] = useState<{ x: number; y: number } | null>(null);

  // Real GPS State
  interface GpsStatus {
    supported: boolean;
    active: boolean;
    latitude: number | null;
    longitude: number | null;
    accuracyM: number | null;
    timestamp: number | null;
    errorMessage: string | null;
  }
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>({
    supported: typeof window !== 'undefined' && 'geolocation' in navigator,
    active: false,
    latitude: null,
    longitude: null,
    accuracyM: null,
    timestamp: null,
    errorMessage: null
  });
  const gpsWatchIdRef = useRef<number | null>(null);

  // Animation frame ref for simulated walking
  const animFrameRef = useRef<number | null>(null);
  const simStartTimeRef = useRef<number | null>(null);
  const simPausedAtFractionRef = useRef<number>(0);

  // -------------------------------------------------------------
  // CALCULATE ACTIVE ROUTE
  // -------------------------------------------------------------
  const routeResult: CalculatedRouteResult = useMemo(() => {
    return calculateCampusRoute(
      startNodeId,
      destNodeId,
      intermediateNodeIds,
      preference,
      walkingSpeedMs
    );
  }, [startNodeId, destNodeId, intermediateNodeIds, preference, walkingSpeedMs]);

  // Reset simulation when route changes
  useEffect(() => {
    stopNavigation();
  }, [startNodeId, destNodeId, intermediateNodeIds, preference, walkingSpeedMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (gpsWatchIdRef.current !== null) navigator.geolocation.clearWatch(gpsWatchIdRef.current);
    };
  }, []);

  // -------------------------------------------------------------
  // LOCATION DROPDOWN LIST OPTIONS (Categorized)
  // -------------------------------------------------------------
  const locationOptions = useMemo(() => {
    const list = Object.values(CAMPUS_NODES).filter((n) => n.category !== 'Waypoint');
    
    // Group into categories
    const gates = list.filter((n) => n.category === 'Gate');
    const academic = list.filter((n) => n.category === 'Academic');
    const facilities = list.filter((n) => n.category === 'Facility');
    const sports = list.filter((n) => n.category === 'Sports');
    const parking = list.filter((n) => n.category === 'Parking');

    return { gates, academic, facilities, sports, parking };
  }, []);

  // -------------------------------------------------------------
  // SWAP & STOP CONTROLS
  // -------------------------------------------------------------
  const handleSwapStartDest = () => {
    setStartNodeId(destNodeId);
    setDestNodeId(startNodeId);
    stopNavigation();
  };

  const handleAddIntermediateStop = () => {
    if (intermediateNodeIds.length >= 3) return; // Limit to 3 intermediate stops
    // Default to an available node not yet selected
    const available = Object.keys(CAMPUS_NODES).find(
      (k) => k !== startNodeId && k !== destNodeId && !intermediateNodeIds.includes(k) && CAMPUS_NODES[k].category !== 'Waypoint'
    );
    if (available) {
      setIntermediateNodeIds([...intermediateNodeIds, available]);
    }
  };

  const handleRemoveIntermediateStop = (index: number) => {
    const next = [...intermediateNodeIds];
    next.splice(index, 1);
    setIntermediateNodeIds(next);
    stopNavigation();
  };

  const handleUpdateIntermediateStop = (index: number, newNodeId: string) => {
    const next = [...intermediateNodeIds];
    next[index] = newNodeId;
    setIntermediateNodeIds(next);
    stopNavigation();
  };

  // -------------------------------------------------------------
  // SIMULATION ENGINE (Smooth multi-segment path interpolation)
  // -------------------------------------------------------------
  const startSimulation = () => {
    if (!routeResult.isCalculated || routeResult.pathCoordinates.length < 2) return;
    
    // Stop any active GPS watch
    if (gpsWatchIdRef.current !== null) {
      navigator.geolocation.clearWatch(gpsWatchIdRef.current);
      gpsWatchIdRef.current = null;
    }

    setNavMode('simulating');
    setIsPaused(false);
    setProgressPercent(0);
    setDistanceTravelledM(0);
    simPausedAtFractionRef.current = 0;
    simStartTimeRef.current = performance.now();

    const pathCoords = routeResult.pathCoordinates;
    const totalDist = routeResult.totalDistanceM;
    const baseDurationMs = (routeResult.walkingTimeSec * 1000) / simSpeedMultiplier;

    const animate = (now: number) => {
      if (!simStartTimeRef.current) simStartTimeRef.current = now;
      const elapsed = now - simStartTimeRef.current;
      const currentFraction = Math.min(1, simPausedAtFractionRef.current + elapsed / baseDurationMs);

      setProgressPercent(Math.round(currentFraction * 100));
      const distTravelled = currentFraction * totalDist;
      setDistanceTravelledM(Math.round(distTravelled));

      // Interpolate along path segments
      const point = getPointAlongPath(pathCoords, currentFraction);
      if (point) {
        setWalkerCoords({ x: point[0], y: point[1] });
      }

      // Update focused step based on fraction
      if (routeResult.steps.length > 0) {
        const stepIdx = Math.min(
          routeResult.steps.length - 1,
          Math.floor(currentFraction * routeResult.steps.length)
        );
        setFocusedStepIndex(stepIdx);
      }

      if (currentFraction < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Complete
        setNavMode('idle');
        simPausedAtFractionRef.current = 0;
        setFocusedStepIndex(null);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  const togglePauseSimulation = () => {
    if (navMode !== 'simulating') return;

    if (!isPaused) {
      // Pause
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setIsPaused(true);
      simPausedAtFractionRef.current = progressPercent / 100;
      simStartTimeRef.current = null;
    } else {
      // Resume
      setIsPaused(false);
      simStartTimeRef.current = performance.now();
      const pathCoords = routeResult.pathCoordinates;
      const totalDist = routeResult.totalDistanceM;
      const baseDurationMs = (routeResult.walkingTimeSec * 1000) / simSpeedMultiplier;

      const animate = (now: number) => {
        if (!simStartTimeRef.current) simStartTimeRef.current = now;
        const elapsed = now - simStartTimeRef.current;
        const currentFraction = Math.min(1, simPausedAtFractionRef.current + elapsed / baseDurationMs);

        setProgressPercent(Math.round(currentFraction * 100));
        setDistanceTravelledM(Math.round(currentFraction * totalDist));

        const point = getPointAlongPath(pathCoords, currentFraction);
        if (point) {
          setWalkerCoords({ x: point[0], y: point[1] });
        }

        if (routeResult.steps.length > 0) {
          const stepIdx = Math.min(
            routeResult.steps.length - 1,
            Math.floor(currentFraction * routeResult.steps.length)
          );
          setFocusedStepIndex(stepIdx);
        }

        if (currentFraction < 1) {
          animFrameRef.current = requestAnimationFrame(animate);
        } else {
          setNavMode('idle');
          simPausedAtFractionRef.current = 0;
          setFocusedStepIndex(null);
        }
      };

      animFrameRef.current = requestAnimationFrame(animate);
    }
  };

  const stopNavigation = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (gpsWatchIdRef.current !== null) {
      navigator.geolocation.clearWatch(gpsWatchIdRef.current);
      gpsWatchIdRef.current = null;
    }
    setNavMode('idle');
    setIsPaused(false);
    setProgressPercent(0);
    setDistanceTravelledM(0);
    setWalkerCoords(null);
    setFocusedStepIndex(null);
    simPausedAtFractionRef.current = 0;
    setGpsStatus((prev) => ({ ...prev, active: false }));
  };

  // Helper to interpolate coordinate along piecewise line segments
  function getPointAlongPath(coords: [number, number][], fraction: number): [number, number] | null {
    if (coords.length === 0) return null;
    if (coords.length === 1 || fraction <= 0) return coords[0];
    if (fraction >= 1) return coords[coords.length - 1];

    // Compute segment lengths
    const segmentLengths: number[] = [];
    let totalLen = 0;
    for (let i = 0; i < coords.length - 1; i++) {
      const dx = coords[i + 1][0] - coords[i][0];
      const dy = coords[i + 1][1] - coords[i][1];
      const len = Math.hypot(dx, dy);
      segmentLengths.push(len);
      totalLen += len;
    }

    if (totalLen === 0) return coords[0];

    const targetDist = fraction * totalLen;
    let accumulated = 0;

    for (let i = 0; i < segmentLengths.length; i++) {
      const segLen = segmentLengths[i];
      if (accumulated + segLen >= targetDist) {
        const segFraction = (targetDist - accumulated) / (segLen || 1);
        const x = coords[i][0] + segFraction * (coords[i + 1][0] - coords[i][0]);
        const y = coords[i][1] + segFraction * (coords[i + 1][1] - coords[i][1]);
        return [x, y];
      }
      accumulated += segLen;
    }

    return coords[coords.length - 1];
  }

  // -------------------------------------------------------------
  // REAL GPS NAVIGATION ENGINE
  // -------------------------------------------------------------
  const startLiveGpsNavigation = () => {
    if (!navigator.geolocation) {
      setGpsStatus((prev) => ({
        ...prev,
        supported: false,
        errorMessage: 'Geolocation is not supported by your browser.'
      }));
      return;
    }

    // Stop simulation if running
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setNavMode('live_gps');
    setIsPaused(false);

    setGpsStatus((prev) => ({
      ...prev,
      active: true,
      errorMessage: null
    }));

    gpsWatchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setGpsStatus({
          supported: true,
          active: true,
          latitude,
          longitude,
          accuracyM: Math.round(accuracy),
          timestamp: pos.timestamp,
          errorMessage: null
        });

        // Place walker on the starting coordinate or calculate progress
        if (routeResult.pathCoordinates.length > 0) {
          // If walker is not yet placed, place at start
          if (!walkerCoords) {
            setWalkerCoords({
              x: routeResult.pathCoordinates[0][0],
              y: routeResult.pathCoordinates[0][1]
            });
          }
        }
      },
      (err) => {
        let errText = 'Unable to retrieve your location.';
        if (err.code === err.PERMISSION_DENIED) {
          errText = 'Browser GPS permission was denied. You can use Simulation Mode for route demonstration.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          errText = 'GPS signal is currently unavailable. Ensure device location is turned on.';
        } else if (err.code === err.TIMEOUT) {
          errText = 'Location request timed out. Please try again.';
        }

        setGpsStatus((prev) => ({
          ...prev,
          active: false,
          errorMessage: errText
        }));
        setNavMode('idle');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000
      }
    );
  };

  // -------------------------------------------------------------
  // METRICS DISPLAY CALCULATIONS
  // -------------------------------------------------------------
  const remainingDistanceM = Math.max(0, routeResult.totalDistanceM - distanceTravelledM);
  const remainingTimeSec = Math.round(remainingDistanceM / (walkingSpeedMs || 1.3));

  const formatMinutesSeconds = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins} min`;
  };

  const startNode = CAMPUS_NODES[startNodeId];
  const destNode = CAMPUS_NODES[destNodeId];
  const intermediateNodes = intermediateNodeIds.map((id) => CAMPUS_NODES[id]).filter(Boolean);

  return (
    <div className="space-y-6">
      
      {/* --------------------------------------------------------- */}
      {/* 1. INTERACTIVE SCHEMATIC CAMPUS MAP WITH ROUTE OVERLAYS */}
      {/* --------------------------------------------------------- */}
      <CampusSchematicMap 
        routeCoordinates={routeResult.pathCoordinates}
        startPoint={startNode ? { name: startNode.name, x: startNode.x, y: startNode.y } : null}
        destPoint={destNode ? { name: destNode.name, x: destNode.x, y: destNode.y } : null}
        intermediatePoints={intermediateNodes.map((n) => ({ name: n.name, x: n.x, y: n.y }))}
        walkerPosition={walkerCoords}
        isSimulating={navMode === 'simulating'}
        isLiveGpsActive={navMode === 'live_gps'}
        onSelectArea={(areaKey) => {
          // If clicking on a map element, offer quick start/destination assignment
          if (areaKey === 'girls-gate') setStartNodeId('gate-girls');
          if (areaKey === 'main-gate') setStartNodeId('gate-main');
          if (areaKey === 'block-a') setDestNodeId('block-a-ground');
          if (areaKey === 'block-b') setDestNodeId('block-b-ground');
          if (areaKey === 'block-c') setDestNodeId('block-c-canteen');
          if (areaKey === 'sports-cricket') setDestNodeId('sports-cricket');
          if (areaKey === 'sports-basketball') setDestNodeId('sports-basketball');
          if (areaKey === 'sports-volleyball') setDestNodeId('sports-volleyball');
          if (areaKey === 'sports-kabaddi') setDestNodeId('sports-kabaddi');
          if (areaKey === 'sports-shuttle') setDestNodeId('sports-shuttle');
          if (areaKey === 'sports-empty') setDestNodeId('sports-empty');
          if (areaKey === 'parking-ab') setDestNodeId('parking-ab');
          if (areaKey === 'parking-c') setDestNodeId('parking-c');
          if (areaKey === 'parking-sports') setDestNodeId('parking-sports');
        }}
      />

      {/* --------------------------------------------------------- */}
      {/* 2. CAMPUS ROUTE FINDER CONTROLLER CARD                    */}
      {/* --------------------------------------------------------- */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
        
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#0B2545] font-display">
                  Campus Navigation &amp; Walking Route Finder
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Verified Topology
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Ground-surveyed routes for Narayana Engineering College, Nellore. Configurable walking speeds, accessibility, and shade modes.
              </p>
            </div>
          </div>

          {/* Quick Swap Start and Destination */}
          <button
            onClick={handleSwapStartDest}
            title="Swap Start and Destination"
            className="self-start sm:self-auto px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200 flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Swap Start &amp; Destination</span>
          </button>
        </div>

        {/* Route Preferences Bar */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Route Preference:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            
            {/* 1. Shortest Route */}
            <button
              onClick={() => {
                setPreference('shortest');
                stopNavigation();
              }}
              className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                preference === 'shortest'
                  ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600 text-[#0B2545]'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className={`p-1.5 rounded-lg shrink-0 ${
                preference === 'shortest' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-bold font-display">Shortest Route</span>
                <span className="text-[11px] text-slate-500 leading-tight">
                  Direct outdoor paved walkways minimizing total metres.
                </span>
              </div>
            </button>

            {/* 2. Accessible Route */}
            <button
              onClick={() => {
                setPreference('accessible');
                stopNavigation();
              }}
              className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                preference === 'accessible'
                  ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600 text-[#0B2545]'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className={`p-1.5 rounded-lg shrink-0 ${
                preference === 'accessible' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-bold font-display">Accessible Route</span>
                <span className="text-[11px] text-slate-500 leading-tight">
                  Step-free ramps, wide corridors, and elevator foyers.
                </span>
              </div>
            </button>

            {/* 3. Shaded Route */}
            <button
              onClick={() => {
                setPreference('shaded');
                stopNavigation();
              }}
              className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                preference === 'shaded'
                  ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600 text-[#0B2545]'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className={`p-1.5 rounded-lg shrink-0 ${
                preference === 'shaded' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                <Umbrella className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-bold font-display">Shaded Route</span>
                <span className="text-[11px] text-slate-500 leading-tight">
                  Covered verandas, roofed arcades, and tree canopies.
                </span>
              </div>
            </button>

          </div>
        </div>

        {/* Start, Intermediate Stops & Destination Selectors */}
        <div className="space-y-3.5 bg-slate-50/70 border border-slate-200 rounded-xl p-4 sm:p-5">
          
          {/* Start Point */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-emerald-800">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <strong className="font-bold">Start Location:</strong>
              </span>
              <span className="text-[11px] text-slate-500">
                Point A · {startNode?.block}
              </span>
            </label>
            <select
              value={startNodeId}
              onChange={(e) => {
                setStartNodeId(e.target.value);
                stopNavigation();
              }}
              className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
            >
              <optgroup label="Campus Entrances &amp; Gates">
                {locationOptions.gates.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.block})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Academic Blocks &amp; Entrances">
                {locationOptions.academic.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.block} · {a.floor})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Campus Facilities">
                {locationOptions.facilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.block} · {f.floor})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Sports Complex &amp; Grounds">
                {locationOptions.sports.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.floor})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Parking Lots">
                {locationOptions.parking.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Intermediate Stops (Optional) */}
          {intermediateNodeIds.map((stopId, sIdx) => {
            const stopNode = CAMPUS_NODES[stopId];
            return (
              <div key={`stop-selector-${sIdx}`} className="pl-4 border-l-2 border-amber-400 py-1 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-amber-900 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-[10px]">
                      {sIdx + 1}
                    </span>
                    <span>Intermediate Stop {sIdx + 1}</span>
                  </span>
                  <button
                    onClick={() => handleRemoveIntermediateStop(sIdx)}
                    className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Stop</span>
                  </button>
                </div>
                <select
                  value={stopId}
                  onChange={(e) => handleUpdateIntermediateStop(sIdx, e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {Object.values(CAMPUS_NODES)
                    .filter((n) => n.category !== 'Waypoint')
                    .map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.name} ({n.block})
                      </option>
                    ))}
                </select>
              </div>
            );
          })}

          {/* Add Stop Button */}
          {intermediateNodeIds.length < 3 && (
            <div className="flex justify-start">
              <button
                onClick={handleAddIntermediateStop}
                className="px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-amber-700" />
                <span>Add Intermediate Stop (Max 3)</span>
              </button>
            </div>
          )}

          {/* Destination Point */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-rose-800">
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                <strong className="font-bold">Destination:</strong>
              </span>
              <span className="text-[11px] text-slate-500">
                Point B · {destNode?.block}
              </span>
            </label>
            <select
              value={destNodeId}
              onChange={(e) => {
                setDestNodeId(e.target.value);
                stopNavigation();
              }}
              className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
            >
              <optgroup label="Campus Facilities">
                {locationOptions.facilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.block} · {f.floor})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Academic Blocks &amp; Entrances">
                {locationOptions.academic.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.block} · {a.floor})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Sports Complex &amp; Courts">
                {locationOptions.sports.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.floor})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Parking Lots">
                {locationOptions.parking.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Campus Entrances &amp; Gates">
                {locationOptions.gates.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.block})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Action Row: Find Route button & Swap Start and Destination */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              onClick={() => {
                stopNavigation();
                const mapEl = document.querySelector('.route-navigation-layer') || document.querySelector('svg');
                if (mapEl) {
                  mapEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
              }}
              className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer min-h-[42px]"
            >
              <Navigation className="w-4 h-4" />
              <span>Find Route</span>
            </button>

            <button
              onClick={handleSwapStartDest}
              className="py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs min-h-[42px]"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-700" />
              <span>Swap Start &amp; Destination</span>
            </button>

            {startNodeId === destNodeId && intermediateNodeIds.length === 0 && (
              <span className="text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200 flex items-center gap-1 font-medium">
                <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Start and destination are the same location (0 m). Choose another location to calculate a walking route.</span>
              </span>
            )}
          </div>

        </div>

        {/* Walking Speed Assumption Configuration */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-700 shrink-0" />
            <div>
              <span className="font-semibold text-slate-800 block">Walking Speed Configuration:</span>
              <span className="text-[11px] text-slate-500">
                Pace: <strong className="text-blue-700">{walkingSpeedMs.toFixed(1)} m/s</strong> ({Math.round(walkingSpeedMs * 3.6)} km/h) · Stride 0.75m
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setWalkingSpeedMs(1.0)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                walkingSpeedMs === 1.0 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Relaxed (1.0 m/s)
            </button>
            <button
              onClick={() => setWalkingSpeedMs(1.3)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                walkingSpeedMs === 1.3 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Normal (1.3 m/s)
            </button>
            <button
              onClick={() => setWalkingSpeedMs(1.6)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                walkingSpeedMs === 1.6 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Brisk (1.6 m/s)
            </button>
          </div>
        </div>

        {/* --------------------------------------------------------- */}
        {/* 3. WALKING TIME, DISTANCE & METRIC BANNER                 */}
        {/* --------------------------------------------------------- */}
        {routeResult.isCalculated ? (
          <div className="bg-gradient-to-r from-blue-900 to-[#0B2545] text-white rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Distance & Time Hero */}
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wider text-blue-200 font-semibold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-300" />
                  <span>Calculated Route Estimates:</span>
                </span>
                
                <div className="flex items-baseline gap-2.5 sm:gap-4 flex-wrap">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-4xl font-extrabold tracking-tight font-display">
                      {routeResult.totalDistanceM}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-blue-200">metres</span>
                  </div>

                  <span className="text-blue-300 font-light text-xl sm:text-2xl">·</span>

                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-4xl font-extrabold tracking-tight font-display text-emerald-300">
                      {formatMinutesSeconds(routeResult.walkingTimeSec)}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-blue-200">walking</span>
                  </div>

                  <span className="text-blue-300 font-light text-xl sm:text-2xl">·</span>

                  <div className="flex items-baseline gap-1">
                    <span className="text-xl sm:text-3xl font-bold tracking-tight text-amber-200">
                      ~{routeResult.stepsCount}
                    </span>
                    <span className="text-[11px] sm:text-xs font-medium text-blue-200 flex items-center gap-1">
                      <Footprints className="w-3 h-3 text-amber-300" />
                      steps
                    </span>
                  </div>
                </div>
              </div>

              {/* Verified Path Network Badge */}
              <div className="self-start md:self-center w-full md:w-auto">
                <div className="bg-blue-800/60 border border-blue-400/40 rounded-xl px-3.5 py-2 text-left md:text-right">
                  <span className="text-[10px] text-blue-200 uppercase tracking-wider block font-semibold">
                    Calculation Standard
                  </span>
                  <span className="text-xs font-bold text-white flex items-center gap-1 md:justify-end">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Calculated from Verified Paths</span>
                  </span>
                  <span className="text-[10px] text-blue-300 block">
                    Speed: {walkingSpeedMs} m/s · Dijkstra Path Engine
                  </span>
                </div>
              </div>

            </div>

            {/* Navigation Action Buttons (Simulation vs Live GPS) */}
            <div className="pt-3 border-t border-blue-800/80 flex flex-wrap items-center justify-between gap-3">
              
              <div className="flex items-center gap-2 flex-wrap">
                {/* Simulation Mode Button */}
                {navMode !== 'simulating' ? (
                  <button
                    onClick={startSimulation}
                    disabled={!routeResult.isCalculated || routeResult.pathCoordinates.length < 2}
                    title={
                      routeResult.pathCoordinates.length < 2
                        ? 'Select two distinct locations to simulate walking'
                        : 'Demonstrate animated walk along the calculated campus route'
                    }
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Walking (Simulation Mode)</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={togglePauseSimulation}
                      className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
                      <span>{isPaused ? 'Resume' : 'Pause'}</span>
                    </button>
                    
                    <button
                      onClick={stopNavigation}
                      className="px-3 py-2 bg-blue-950/80 hover:bg-blue-950 border border-blue-400/30 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>End Navigation</span>
                    </button>

                    {/* Speed Multiplier */}
                    <div className="flex items-center bg-blue-950/60 rounded-xl p-1 border border-blue-500/30 text-[11px]">
                      <button
                        onClick={() => setSimSpeedMultiplier(1)}
                        className={`px-2 py-0.5 rounded-lg ${simSpeedMultiplier === 1 ? 'bg-blue-600 text-white font-bold' : 'text-blue-200'}`}
                      >
                        1x
                      </button>
                      <button
                        onClick={() => setSimSpeedMultiplier(2)}
                        className={`px-2 py-0.5 rounded-lg ${simSpeedMultiplier === 2 ? 'bg-blue-600 text-white font-bold' : 'text-blue-200'}`}
                      >
                        2x
                      </button>
                      <button
                        onClick={() => setSimSpeedMultiplier(4)}
                        className={`px-2 py-0.5 rounded-lg ${simSpeedMultiplier === 4 ? 'bg-blue-600 text-white font-bold' : 'text-blue-200'}`}
                      >
                        4x
                      </button>
                    </div>
                  </div>
                )}

                {/* Live GPS Navigation Button */}
                {navMode !== 'live_gps' ? (
                  <button
                    onClick={startLiveGpsNavigation}
                    className="px-3.5 py-2 bg-blue-950 hover:bg-blue-900 border border-blue-400/40 text-blue-100 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <LocateFixed className="w-3.5 h-3.5 text-blue-400" />
                    <span>Live GPS Mode (On Campus)</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-400 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>Live GPS Active</span>
                    </span>
                    <button
                      onClick={stopNavigation}
                      className="px-3 py-2 bg-red-950/70 hover:bg-red-900 border border-red-500/40 text-red-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Stop GPS</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Mode Clarification Notice */}
              <div className="text-[11px] text-blue-200/80">
                {navMode === 'simulating' && 'Simulation Mode demonstrates the verified path coordinates.'}
                {navMode === 'live_gps' && 'Live GPS tracks your real physical coordinates on browser.'}
                {navMode === 'idle' && 'Click Simulate Walk to view animated path progression.'}
              </div>

            </div>

            {/* Active Navigation Progress Bar (When Simulating or Live) */}
            {navMode !== 'idle' && (
              <div className="bg-blue-950/80 border border-blue-500/30 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-blue-200 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span>
                      {navMode === 'simulating' ? 'Simulated Walk Progression' : 'Live On-Campus Navigation'}
                    </span>
                  </span>
                  <span className="text-white font-bold">{progressPercent}% Completed</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-blue-900/60 rounded-full h-2.5 overflow-hidden border border-blue-700/50">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-emerald-400 h-2.5 rounded-full transition-all duration-200"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-blue-200">
                  <span>Travelled: <strong>{distanceTravelledM}m</strong></span>
                  <span>Remaining: <strong>{remainingDistanceM}m</strong> (~{formatMinutesSeconds(remainingTimeSec)})</span>
                </div>

                {gpsStatus.active && gpsStatus.accuracyM !== null && (
                  <div className="text-[10px] text-emerald-300 pt-1 border-t border-blue-800/60 flex items-center justify-between">
                    <span>GPS Coordinates: {gpsStatus.latitude?.toFixed(6)}, {gpsStatus.longitude?.toFixed(6)}</span>
                    <span>Accuracy: ±{gpsStatus.accuracyM}m</span>
                  </div>
                )}
              </div>
            )}

            {/* GPS Error Message Alert */}
            {gpsStatus.errorMessage && (
              <div className="bg-amber-900/40 border border-amber-500/50 rounded-xl p-3 text-xs text-amber-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-100 font-semibold">GPS Notice:</strong> {gpsStatus.errorMessage}
                </div>
              </div>
            )}

          </div>
        ) : (
          /* Missing Path Notice */
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-amber-900 space-y-2">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-950 font-display">
                  Route Distance Unavailable — Campus Path Data Required
                </h4>
                <p className="text-xs text-amber-900/90 leading-relaxed mt-1">
                  {routeResult.statusMessage || 'Calculated walking distance and shortest-path routing require surveyed corridor connectivity between these points. Please choose verified academic entrances or external gates.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* --------------------------------------------------------- */}
        {/* 4. TURN-BY-TURN STEP DIRECTIONS                          */}
        {/* --------------------------------------------------------- */}
        {routeResult.isCalculated && routeResult.steps.length > 0 && (
          <div className="space-y-4 pt-2">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-700" />
                <h3 className="text-sm font-bold text-[#0B2545] font-display">
                  Ordered Turn-by-Turn Directions ({routeResult.steps.length} Steps)
                </h3>
              </div>

              {focusedStepIndex !== null && (
                <button
                  onClick={() => setFocusedStepIndex(null)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium underline underline-offset-2 cursor-pointer"
                >
                  Return to full route overview
                </button>
              )}
            </div>

            {/* Step List */}
            <ol className="space-y-2.5 text-xs sm:text-sm">
              {routeResult.steps.map((step, idx) => {
                const isStepActive = focusedStepIndex === idx;
                const isPastStep = focusedStepIndex !== null && idx < focusedStepIndex;

                return (
                  <li
                    key={`step-${idx}`}
                    onClick={() => setFocusedStepIndex(idx)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isStepActive
                        ? 'bg-blue-50/80 border-blue-500 shadow-xs ring-1 ring-blue-500'
                        : isPastStep
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {/* Step Number Badge */}
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      isStepActive
                        ? 'bg-blue-600 text-white'
                        : isPastStep
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {idx + 1}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className={`font-semibold ${isStepActive ? 'text-blue-950 font-bold' : 'text-slate-900'}`}>
                          {step.landmark}
                        </span>
                        
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span>{step.distanceM}m</span>
                          <span>·</span>
                          <span>~{step.durationSec}s</span>
                          {step.isShaded && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-medium border border-blue-200">
                              Shaded
                            </span>
                          )}
                          {step.isAccessible && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-medium border border-emerald-200">
                              Step-Free
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {step.instruction}
                      </p>

                      {step.notice && (
                        <p className="text-[11px] text-amber-800 bg-amber-50/80 p-2 rounded-lg border border-amber-200 mt-1">
                          * {step.notice}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>

            {/* Destination Final Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-emerald-950">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-emerald-900">Arrive at Destination: {destNode?.name}</strong>
                <p className="text-emerald-800 text-[11px] mt-0.5 leading-relaxed">
                  {destNode?.notes || 'Verify physical signage on entrance. Indoor individual office doors subject to departmental updates.'}
                </p>
              </div>
            </div>

          </div>
        )}

        {/* --------------------------------------------------------- */}
        {/* 5. SURVEY DATA STATUS & CAMPUS TRUTH NOTICE               */}
        {/* --------------------------------------------------------- */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-1.5">
          <div className="flex items-center gap-2 text-slate-900 font-semibold">
            <Info className="w-4 h-4 text-blue-700" />
            <span>Navigation Verification &amp; Accuracy Standards</span>
          </div>
          <p className="leading-relaxed text-[11px]">
            Outdoor paths are derived from verified relative positions and building spacing of Narayana Engineering College, Nellore. 
            Walking speeds are calculated via standard formula (<span className="font-mono text-slate-800 font-bold">time = distance / velocity</span>) without fake metric precision. 
            Specific room coordinates inside Block A, B, and C will require high-resolution indoor laser/floorplan surveys before centimeter-accurate corridor routing can be claimed.
          </p>
        </div>

      </div>

    </div>
  );
};
