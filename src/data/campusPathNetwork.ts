/**
 * Campus Path Network and Route Finding Engine
 * Narayana Engineering College, Nellore (NECN)
 *
 * Implements a verified topological graph model connecting campus entry gates,
 * academic block entrances, vertical hubs (stairs/lifts), outdoor parking lots,
 * and sports facilities based strictly on confirmed campus notes and hand-drawn layout.
 */

export interface CampusNode {
  id: string;
  name: string;
  shortCode: string;
  category: 'Gate' | 'Academic' | 'Facility' | 'Sports' | 'Parking' | 'Waypoint';
  block: string;
  floor: string;
  x: number; // SVG coordinate (viewBox 0 0 980 620)
  y: number; // SVG coordinate
  isIndoor: boolean;
  isVerified: boolean;
  notes?: string;
  associatedRoomId?: string;
}

export interface CampusEdge {
  from: string;
  to: string;
  distanceM: number; // Metric distance in metres
  isAccessible: boolean; // Step-free, wheelchair accessible ramp or level paving
  isShaded: boolean; // Covered veranda, roofed arcade, or tree canopy
  instruction: string; // Navigational direction
  reverseInstruction?: string;
}

export type RoutePreference = 'shortest' | 'accessible' | 'shaded';

export interface RouteStep {
  stepNumber: number;
  instruction: string;
  landmark: string;
  distanceM: number;
  durationSec: number;
  isAccessible: boolean;
  isShaded: boolean;
  fromCoords: [number, number];
  toCoords: [number, number];
  notice?: string;
}

export interface CalculatedRouteResult {
  isCalculated: boolean;
  statusMessage?: string;
  totalDistanceM: number;
  walkingTimeSec: number;
  stepsCount: number;
  walkingSpeedMs: number;
  preference: RoutePreference;
  isFullyAccessible: boolean;
  isFullyShaded: boolean;
  isIndoorUnverified: boolean;
  waypoints: CampusNode[];
  pathCoordinates: [number, number][];
  steps: RouteStep[];
}

// -------------------------------------------------------------
// VERIFIED CAMPUS NODES
// Coordinates matched 1:1 with CampusSchematicMap (980 x 620)
// -------------------------------------------------------------
export const CAMPUS_NODES: Record<string, CampusNode> = {
  // --- Gates & Perimeters ---
  'gate-main': {
    id: 'gate-main',
    name: 'Main Entrance Gate',
    shortCode: 'MAIN-GATE',
    category: 'Gate',
    block: 'Between Blocks B and C',
    floor: 'Outdoor / Ground',
    x: 595,
    y: 535,
    isIndoor: false,
    isVerified: true,
    notes: 'Primary campus gate situated directly between Block B and Block C with visitor reception.',
    associatedRoomId: 'LOC-ENT-01'
  },
  'gate-girls': {
    id: 'gate-girls',
    name: "Girls' Entrance Gate",
    shortCode: 'GIRLS-GATE',
    category: 'Gate',
    block: 'Between Blocks A and B',
    floor: 'Outdoor / Ground',
    x: 290,
    y: 535,
    isIndoor: false,
    isVerified: true,
    notes: "Dedicated campus entrance for girls, situated directly between Block A and Block B.",
    associatedRoomId: 'LOC-ENT-02'
  },

  // --- Outdoor Junctions & Paved Walkways ---
  'junc-front-main': {
    id: 'junc-front-main',
    name: 'Main Gate Promenade Junction',
    shortCode: 'J-MAIN',
    category: 'Waypoint',
    block: 'Front Courtyard',
    floor: 'Outdoor / Ground',
    x: 595,
    y: 470,
    isIndoor: false,
    isVerified: true
  },
  'junc-front-girls': {
    id: 'junc-front-girls',
    name: "Girls' Gate Promenade Junction",
    shortCode: 'J-GIRLS',
    category: 'Waypoint',
    block: 'Front Courtyard',
    floor: 'Outdoor / Ground',
    x: 290,
    y: 470,
    isIndoor: false,
    isVerified: true
  },
  'junc-veranda-ab': {
    id: 'junc-veranda-ab',
    name: 'Covered Veranda Corridor (Between A & B)',
    shortCode: 'VER-AB',
    category: 'Waypoint',
    block: 'Between Blocks A and B',
    floor: 'Ground Floor',
    x: 290,
    y: 345,
    isIndoor: false,
    isVerified: true,
    notes: 'Covered shaded walkway connecting Block A and Block B'
  },
  'junc-veranda-bc': {
    id: 'junc-veranda-bc',
    name: 'Central Plaza & Veranda (Between B & C)',
    shortCode: 'VER-BC',
    category: 'Waypoint',
    block: 'Between Blocks B and C',
    floor: 'Ground Floor',
    x: 595,
    y: 345,
    isIndoor: false,
    isVerified: true,
    notes: 'Covered connecting veranda walkway between Block B and Block C'
  },
  'junc-sports-lane-west': {
    id: 'junc-sports-lane-west',
    name: 'North-West Sports Access Avenue',
    shortCode: 'SPT-W',
    category: 'Waypoint',
    block: 'Sports Zone',
    floor: 'Outdoor / Ground',
    x: 130,
    y: 200,
    isIndoor: false,
    isVerified: true
  },
  'junc-sports-lane-mid': {
    id: 'junc-sports-lane-mid',
    name: 'Central Sports Access Promenade',
    shortCode: 'SPT-MID',
    category: 'Waypoint',
    block: 'Sports Zone',
    floor: 'Outdoor / Ground',
    x: 440,
    y: 200,
    isIndoor: false,
    isVerified: true
  },
  'junc-sports-lane-east': {
    id: 'junc-sports-lane-east',
    name: 'North-East Sports & Parking Lane',
    shortCode: 'SPT-E',
    category: 'Waypoint',
    block: 'Sports Zone',
    floor: 'Outdoor / Ground',
    x: 740,
    y: 200,
    isIndoor: false,
    isVerified: true
  },

  // --- Block Entrances & Academic Hubs ---
  'block-a-ground': {
    id: 'block-a-ground',
    name: 'Block A Ground Entrance',
    shortCode: 'BLK-A-GF',
    category: 'Academic',
    block: 'Block A',
    floor: 'Ground Floor',
    x: 130,
    y: 450,
    isIndoor: true,
    isVerified: true,
    notes: 'Ground Floor entrance: Mechanical Seminar Hall, Mechanical/Civil/Electrical Labs',
    associatedRoomId: 'LOC-SEM-A02'
  },
  'block-a-stairs': {
    id: 'block-a-stairs',
    name: 'Block A Central Vertical Hub (Stairs & Lift)',
    shortCode: 'BLK-A-HUB',
    category: 'Academic',
    block: 'Block A',
    floor: 'Ground Floor',
    x: 130,
    y: 345,
    isIndoor: true,
    isVerified: true,
    notes: 'Central vertical circulation for Block A upper levels'
  },
  'block-a-floor1': {
    id: 'block-a-floor1',
    name: 'Block A 1st Floor (CSE Seminar Hall & Computer Labs)',
    shortCode: 'BLK-A-1F',
    category: 'Academic',
    block: 'Block A',
    floor: '1st Floor',
    x: 130,
    y: 320,
    isIndoor: true,
    isVerified: true,
    notes: 'CSE Seminar Hall & Computer Labs (exact room numbers unverified)',
    associatedRoomId: 'LOC-SEM-A01'
  },
  'block-a-floor3': {
    id: 'block-a-floor3',
    name: 'Block A 3rd Floor (Physics & Chemistry Labs)',
    shortCode: 'BLK-A-3F',
    category: 'Academic',
    block: 'Block A',
    floor: '3rd Floor',
    x: 130,
    y: 280,
    isIndoor: true,
    isVerified: true,
    notes: 'Physics Labs and Chemistry Labs',
    associatedRoomId: 'LOC-LAB-A01'
  },
  'block-a-staff': {
    id: 'block-a-staff',
    name: 'Block A Staff Rooms (CSM, FED, Civ-Mech)',
    shortCode: 'BLK-A-STF',
    category: 'Academic',
    block: 'Block A',
    floor: 'Not verified',
    x: 130,
    y: 400,
    isIndoor: true,
    isVerified: false,
    notes: 'Staff rooms located in Block A; floor and room numbers unverified',
    associatedRoomId: 'LOC-STF-A01'
  },

  // --- Block B Entrances & Hubs ---
  'block-b-ground': {
    id: 'block-b-ground',
    name: 'Block B Ground Entrance (AO, Principal, Exam Cell)',
    shortCode: 'BLK-B-GF',
    category: 'Academic',
    block: 'Block B',
    floor: 'Ground Floor',
    x: 440,
    y: 450,
    isIndoor: true,
    isVerified: true,
    notes: 'Ground floor: Administrative Office (AO), Principal’s Room, Examination Cell',
    associatedRoomId: 'LOC-ADM-B01'
  },
  'block-b-stairs': {
    id: 'block-b-stairs',
    name: 'Block B Vertical Hub (Central Staircase & Lift)',
    shortCode: 'BLK-B-HUB',
    category: 'Academic',
    block: 'Block B',
    floor: 'Ground Floor',
    x: 440,
    y: 345,
    isIndoor: true,
    isVerified: true
  },
  'block-b-floor1': {
    id: 'block-b-floor1',
    name: 'Block B 1st Floor (Central Library, EEE & ECE Labs)',
    shortCode: 'BLK-B-1F',
    category: 'Academic',
    block: 'Block B',
    floor: '1st Floor',
    x: 440,
    y: 320,
    isIndoor: true,
    isVerified: true,
    notes: 'Central Library, EEE Labs, and ECE Labs',
    associatedRoomId: 'LOC-LIB-B01'
  },
  'block-b-floor2': {
    id: 'block-b-floor2',
    name: 'Block B 2nd Floor (EEE & ECE Seminar Halls)',
    shortCode: 'BLK-B-2F',
    category: 'Academic',
    block: 'Block B',
    floor: '2nd Floor',
    x: 440,
    y: 280,
    isIndoor: true,
    isVerified: true,
    notes: 'EEE Seminar Hall and ECE Seminar Hall',
    associatedRoomId: 'LOC-SEM-B01'
  },
  'block-b-staff': {
    id: 'block-b-staff',
    name: 'Block B Staff Rooms (CSE, EEE, ECE Staff)',
    shortCode: 'BLK-B-STF',
    category: 'Academic',
    block: 'Block B',
    floor: 'Not verified',
    x: 440,
    y: 400,
    isIndoor: true,
    isVerified: false,
    notes: 'Staff rooms in Block B; floor and room numbers unverified',
    associatedRoomId: 'LOC-STF-B01'
  },

  // --- Block C Entrances & Hubs ---
  'block-c-canteen': {
    id: 'block-c-canteen',
    name: 'Block C Canteen Entrance (Ground Floor)',
    shortCode: 'BLK-C-CAN',
    category: 'Facility',
    block: 'Block C',
    floor: 'Ground Floor',
    x: 807,
    y: 410,
    isIndoor: true,
    isVerified: true,
    notes: 'Canteen situated on Ground Floor of Block C (exact dimensions unverified)',
    associatedRoomId: 'LOC-CAN-C01'
  },
  'block-c-ground-hub': {
    id: 'block-c-ground-hub',
    name: 'Block C Main Ground Foyer',
    shortCode: 'BLK-C-GF',
    category: 'Academic',
    block: 'Block C',
    floor: 'Ground Floor',
    x: 740,
    y: 450,
    isIndoor: true,
    isVerified: true
  },
  'block-c-auditorium': {
    id: 'block-c-auditorium',
    name: 'College Auditorium (Block C, 1st Floor)',
    shortCode: 'BLK-C-AUD',
    category: 'Facility',
    block: 'Block C',
    floor: '1st Floor',
    x: 745,
    y: 310,
    isIndoor: true,
    isVerified: true,
    notes: 'College Auditorium located on 1st Floor directly above the Canteen',
    associatedRoomId: 'LOC-AUD-C01'
  },
  'block-c-complabs': {
    id: 'block-c-complabs',
    name: 'Computer Labs (Block C, 1st Floor)',
    shortCode: 'BLK-C-LAB',
    category: 'Academic',
    block: 'Block C',
    floor: '1st Floor',
    x: 872,
    y: 310,
    isIndoor: true,
    isVerified: false,
    notes: 'Computer labs listed on 1st floor; exact room locations need verification',
    associatedRoomId: 'LOC-LAB-C01'
  },

  // --- Parking Areas (Strictly 3 Separate Lots from Hand-Drawn Reference) ---
  'parking-ab': {
    id: 'parking-ab',
    name: 'Block A & B Parking',
    shortCode: 'PRK-AB',
    category: 'Parking',
    block: 'Around Blocks A & B',
    floor: 'Outdoor / Ground',
    x: 287,
    y: 504,
    isIndoor: false,
    isVerified: true,
    notes: 'Designated separate parking area around Blocks A and B (Two-Wheelers)',
    associatedRoomId: 'LOC-PRK-01'
  },
  'parking-c': {
    id: 'parking-c',
    name: 'Block C & Canteen Parking',
    shortCode: 'PRK-C',
    category: 'Parking',
    block: 'Around Block C',
    floor: 'Outdoor / Ground',
    x: 745,
    y: 504,
    isIndoor: false,
    isVerified: true,
    notes: 'Designated separate parking area around Block C and Canteen (Four-Wheelers & Visitors)',
    associatedRoomId: 'LOC-PRK-02'
  },
  'parking-sports': {
    id: 'parking-sports',
    name: 'Sports Zone Parking',
    shortCode: 'PRK-SPT',
    category: 'Parking',
    block: 'Sports Grounds',
    floor: 'Outdoor / Ground',
    x: 490,
    y: 225,
    isIndoor: false,
    isVerified: true,
    notes: 'Dedicated separate parking area between academic blocks and sports fields',
    associatedRoomId: 'LOC-PRK-03'
  },

  // --- Sports Facilities (Sequence: Kabaddi, Volleyball, Cricket, Basketball, Empty, Shuttle) ---
  'sports-kabaddi': {
    id: 'sports-kabaddi',
    name: 'Kabaddi Court',
    shortCode: 'SPT-KBD',
    category: 'Sports',
    block: 'Sports Zone',
    floor: 'Outdoor / Ground',
    x: 115,
    y: 115,
    isIndoor: false,
    isVerified: true,
    notes: 'Standard tournament clay kabaddi court with marked baulk lines',
    associatedRoomId: 'LOC-SPT-01'
  },
  'sports-volleyball': {
    id: 'sports-volleyball',
    name: 'Volleyball Court',
    shortCode: 'SPT-VB',
    category: 'Sports',
    block: 'Sports Zone',
    floor: 'Outdoor / Ground',
    x: 245,
    y: 115,
    isIndoor: false,
    isVerified: true,
    notes: 'Standard regulation volleyball court with net',
    associatedRoomId: 'LOC-SPT-02'
  },
  'sports-cricket': {
    id: 'sports-cricket',
    name: 'Cricket Pitch & Ground',
    shortCode: 'SPT-CRK',
    category: 'Sports',
    block: 'Sports Zone',
    floor: 'Outdoor / Ground',
    x: 430,
    y: 115,
    isIndoor: false,
    isVerified: true,
    notes: 'Central turf/matting pitch and cricket practice ground',
    associatedRoomId: 'LOC-SPT-03'
  },
  'sports-basketball': {
    id: 'sports-basketball',
    name: 'Basketball Court',
    shortCode: 'SPT-BB',
    category: 'Sports',
    block: 'Sports Zone',
    floor: 'Outdoor / Ground',
    x: 617,
    y: 115,
    isIndoor: false,
    isVerified: true,
    notes: 'Hard-surfaced basketball court with regulation hoops',
    associatedRoomId: 'LOC-SPT-04'
  },
  'sports-empty': {
    id: 'sports-empty',
    name: 'Empty Ground',
    shortCode: 'SPT-EMP',
    category: 'Sports',
    block: 'Sports Zone',
    floor: 'Outdoor / Ground',
    x: 757,
    y: 115,
    isIndoor: false,
    isVerified: true,
    notes: 'Open athletic empty ground for fitness drills and student gatherings',
    associatedRoomId: 'LOC-SPT-05'
  },
  'sports-shuttle': {
    id: 'sports-shuttle',
    name: 'Shuttle Courts (Badminton)',
    shortCode: 'SPT-SHT',
    category: 'Sports',
    block: 'Sports Zone',
    floor: 'Outdoor / Ground',
    x: 882,
    y: 115,
    isIndoor: false,
    isVerified: true,
    notes: 'Dual outdoor badminton shuttle courts',
    associatedRoomId: 'LOC-SPT-06'
  }
};

// -------------------------------------------------------------
// VERIFIED PATH NETWORK EDGES (Ground Distances in Metres)
// Based on campus block dimensions & verified outdoor spacing
// -------------------------------------------------------------
export const CAMPUS_EDGES: CampusEdge[] = [
  // --- Main Entrance connections ---
  {
    from: 'gate-main',
    to: 'junc-front-main',
    distanceM: 35,
    isAccessible: true,
    isShaded: false,
    instruction: 'Pass through the Main Entrance security gate and follow the central paved walkway north.'
  },
  {
    from: 'junc-front-main',
    to: 'parking-c',
    distanceM: 40,
    isAccessible: true,
    isShaded: false,
    instruction: 'Turn east towards the Block C visitor parking area.'
  },
  {
    from: 'junc-front-main',
    to: 'block-c-ground-hub',
    distanceM: 42,
    isAccessible: true,
    isShaded: true,
    instruction: 'Proceed northeast along the paved walkway to the Block C main entrance.'
  },
  {
    from: 'junc-front-main',
    to: 'block-b-ground',
    distanceM: 45,
    isAccessible: true,
    isShaded: true,
    instruction: 'Turn northwest onto the covered walkway leading directly to Block B ground entrance.'
  },
  {
    from: 'junc-front-main',
    to: 'junc-veranda-bc',
    distanceM: 48,
    isAccessible: true,
    isShaded: true,
    instruction: 'Walk straight along the central plaza avenue towards the Block B–C connecting veranda.'
  },

  // --- Girls' Entrance connections ---
  {
    from: 'gate-girls',
    to: 'junc-front-girls',
    distanceM: 35,
    isAccessible: true,
    isShaded: false,
    instruction: "Enter through the Girls' Entrance Gate and follow the paved walkway north."
  },
  {
    from: 'junc-front-girls',
    to: 'parking-ab',
    distanceM: 15,
    isAccessible: true,
    isShaded: false,
    instruction: 'Access the two-wheeler parking area adjacent to the Girls\' entrance walkway.'
  },
  {
    from: 'junc-front-girls',
    to: 'block-a-ground',
    distanceM: 45,
    isAccessible: true,
    isShaded: true,
    instruction: 'Turn west towards the main entrance of Block A.'
  },
  {
    from: 'junc-front-girls',
    to: 'block-b-ground',
    distanceM: 45,
    isAccessible: true,
    isShaded: true,
    instruction: 'Turn east towards the Block B ground entrance.'
  },
  {
    from: 'junc-front-girls',
    to: 'junc-veranda-ab',
    distanceM: 48,
    isAccessible: true,
    isShaded: true,
    instruction: "Follow the shaded walkway north between Blocks A and B to the central corridor."
  },

  // --- Front Walkway Cross-Connection (Girls' Gate to Main Gate) ---
  {
    from: 'junc-front-girls',
    to: 'junc-front-main',
    distanceM: 90,
    isAccessible: true,
    isShaded: true,
    instruction: 'Follow the covered front veranda promenade eastward in front of Block B.'
  },

  // --- Academic Veranda Connecting Corridors ---
  {
    from: 'block-a-ground',
    to: 'block-a-stairs',
    distanceM: 30,
    isAccessible: true,
    isShaded: true,
    instruction: 'Enter Block A ground corridor and proceed toward the central staircase and elevator foyer.'
  },
  {
    from: 'block-a-stairs',
    to: 'junc-veranda-ab',
    distanceM: 45,
    isAccessible: true,
    isShaded: true,
    instruction: 'Exit Block A via the east covered arcade connecting to Block B.'
  },
  {
    from: 'junc-veranda-ab',
    to: 'block-b-stairs',
    distanceM: 45,
    isAccessible: true,
    isShaded: true,
    instruction: 'Continue east along the covered veranda into the Block B central corridor.'
  },
  {
    from: 'block-b-ground',
    to: 'block-b-stairs',
    distanceM: 30,
    isAccessible: true,
    isShaded: true,
    instruction: 'Enter Block B ground floor foyer (passing Admin Office & Principal Room) toward central stairs/lift.'
  },
  {
    from: 'block-b-stairs',
    to: 'junc-veranda-bc',
    distanceM: 45,
    isAccessible: true,
    isShaded: true,
    instruction: 'Exit Block B east wing through the covered arcade into the central plaza.'
  },
  {
    from: 'junc-veranda-bc',
    to: 'block-c-ground-hub',
    distanceM: 42,
    isAccessible: true,
    isShaded: true,
    instruction: 'Cross the covered plaza corridor into Block C ground foyer.'
  },
  {
    from: 'block-c-ground-hub',
    to: 'block-c-canteen',
    distanceM: 25,
    isAccessible: true,
    isShaded: true,
    instruction: 'Walk east along the ground floor corridor into the Campus Canteen.'
  },

  // --- Block A Vertical Connections ---
  {
    from: 'block-a-stairs',
    to: 'block-a-floor1',
    distanceM: 18, // 1 vertical level equivalent travel
    isAccessible: true, // Elevator available
    isShaded: true,
    instruction: 'Take the central stairs or elevator up to the 1st Floor of Block A (CSE Seminar Hall & Computer Labs).'
  },
  {
    from: 'block-a-floor1',
    to: 'block-a-floor3',
    distanceM: 36, // 2 vertical levels equivalent travel
    isAccessible: true,
    isShaded: true,
    instruction: 'Ascend to the 3rd Floor of Block A (Physics Labs & Chemistry Labs).'
  },
  {
    from: 'block-a-stairs',
    to: 'block-a-staff',
    distanceM: 22,
    isAccessible: true,
    isShaded: true,
    instruction: 'Proceed into Block A staff corridor (exact floor and room unverified; please check physical signboard).'
  },

  // --- Block B Vertical Connections ---
  {
    from: 'block-b-stairs',
    to: 'block-b-floor1',
    distanceM: 18,
    isAccessible: true,
    isShaded: true,
    instruction: 'Take central stairs or lift to 1st Floor of Block B (Central Library, EEE & ECE Labs).'
  },
  {
    from: 'block-b-floor1',
    to: 'block-b-floor2',
    distanceM: 18,
    isAccessible: true,
    isShaded: true,
    instruction: 'Ascend to 2nd Floor of Block B (EEE & ECE Seminar Halls).'
  },
  {
    from: 'block-b-stairs',
    to: 'block-b-staff',
    distanceM: 22,
    isAccessible: true,
    isShaded: true,
    instruction: 'Proceed into Block B staff wing (CSE, EEE, ECE staff rooms; floor unverified).'
  },

  // --- Block C Vertical Connections ---
  {
    from: 'block-c-ground-hub',
    to: 'block-c-auditorium',
    distanceM: 18,
    isAccessible: true,
    isShaded: true,
    instruction: 'Ascend the Block C staircase to the 1st Floor directly above the Canteen for the College Auditorium.'
  },
  {
    from: 'block-c-auditorium',
    to: 'block-c-complabs',
    distanceM: 25,
    isAccessible: true,
    isShaded: true,
    instruction: 'Follow the 1st floor corridor eastward toward the Computer Labs (exact rooms unverified).'
  },

  // --- North Passages to Sports Zone & North Parking Lane ---
  {
    from: 'block-a-stairs',
    to: 'junc-sports-lane-west',
    distanceM: 60,
    isAccessible: true,
    isShaded: false,
    instruction: 'Follow the walkway north past Block A toward the open field avenue.'
  },
  {
    from: 'block-b-stairs',
    to: 'junc-sports-lane-mid',
    distanceM: 60,
    isAccessible: true,
    isShaded: false,
    instruction: 'Exit Block B north entrance toward the central parking lane dividing the sports grounds.'
  },
  {
    from: 'block-c-ground-hub',
    to: 'junc-sports-lane-east',
    distanceM: 65,
    isAccessible: true,
    isShaded: false,
    instruction: 'Walk north along the driveway behind Block C toward the sports lane.'
  },

  // --- Sports Access Lane (Horizontal Divider) ---
  {
    from: 'junc-sports-lane-west',
    to: 'junc-sports-lane-mid',
    distanceM: 85,
    isAccessible: true,
    isShaded: false,
    instruction: 'Walk east along the parking lane separating the academic buildings from sports grounds.'
  },
  {
    from: 'junc-sports-lane-mid',
    to: 'parking-sports',
    distanceM: 10,
    isAccessible: true,
    isShaded: false,
    instruction: 'Access designated vehicle parking between academic blocks and sports fields.'
  },
  {
    from: 'junc-sports-lane-mid',
    to: 'junc-sports-lane-east',
    distanceM: 85,
    isAccessible: true,
    isShaded: false,
    instruction: 'Continue east along the sports boundary avenue.'
  },

  // --- Access to Sports Facilities (Sequence: Kabaddi, Volleyball, Cricket, Basketball, Empty, Shuttle) ---
  {
    from: 'junc-sports-lane-west',
    to: 'sports-kabaddi',
    distanceM: 35,
    isAccessible: false, // Clay/sand
    isShaded: false,
    instruction: 'Walk north onto the standard kabaddi clay court.'
  },
  {
    from: 'junc-sports-lane-west',
    to: 'sports-volleyball',
    distanceM: 35,
    isAccessible: false, // Sand/clay
    isShaded: false,
    instruction: 'Proceed northeast onto the regulation volleyball court.'
  },
  {
    from: 'junc-sports-lane-mid',
    to: 'sports-cricket',
    distanceM: 40,
    isAccessible: false, // Turf outfield
    isShaded: false,
    instruction: 'Walk north onto the central cricket pitch and practice outfield.'
  },
  {
    from: 'junc-sports-lane-mid',
    to: 'sports-basketball',
    distanceM: 35,
    isAccessible: true, // Concrete court surface
    isShaded: false,
    instruction: 'Proceed northeast onto the hard-surfaced regulation basketball court.'
  },
  {
    from: 'junc-sports-lane-east',
    to: 'sports-empty',
    distanceM: 35,
    isAccessible: false, // Grass/dirt terrain
    isShaded: false,
    instruction: 'Step onto the open multi-purpose empty athletic ground.'
  },
  {
    from: 'junc-sports-lane-east',
    to: 'sports-shuttle',
    distanceM: 35,
    isAccessible: true, // Paved dual courts
    isShaded: false,
    instruction: 'Proceed northeast onto the outdoor shuttle badminton courts.'
  }
];

// -------------------------------------------------------------
// ADJACENCY GRAPH GENERATOR
// -------------------------------------------------------------
interface AdjacencyEdge {
  targetId: string;
  distanceM: number;
  isAccessible: boolean;
  isShaded: boolean;
  instruction: string;
}

const buildAdjacencyList = (): Map<string, AdjacencyEdge[]> => {
  const adj = new Map<string, AdjacencyEdge[]>();

  const addEdge = (u: string, v: string, dist: number, acc: boolean, shaded: boolean, inst: string) => {
    if (!adj.has(u)) adj.set(u, []);
    adj.get(u)!.push({
      targetId: v,
      distanceM: dist,
      isAccessible: acc,
      isShaded: shaded,
      instruction: inst
    });
  };

  for (const edge of CAMPUS_EDGES) {
    addEdge(edge.from, edge.to, edge.distanceM, edge.isAccessible, edge.isShaded, edge.instruction);
    const reverseInst = edge.reverseInstruction || `Head towards ${CAMPUS_NODES[edge.from]?.name || edge.from}.`;
    addEdge(edge.to, edge.from, edge.distanceM, edge.isAccessible, edge.isShaded, reverseInst);
  }

  return adj;
};

const ADJACENCY_GRAPH = buildAdjacencyList();

// -------------------------------------------------------------
// DIJKSTRA SHORTEST PATH FINDER (Single Segment)
// -------------------------------------------------------------
function dijkstraSegment(
  startId: string,
  destId: string,
  preference: RoutePreference
): { pathNodeIds: string[]; totalDist: number; steps: RouteStep[] } | null {
  if (startId === destId) {
    return { pathNodeIds: [startId], totalDist: 0, steps: [] };
  }

  const distances = new Map<string, number>();
  const previous = new Map<string, { nodeId: string; edge: AdjacencyEdge }>();
  const visited = new Set<string>();

  for (const nodeId of Object.keys(CAMPUS_NODES)) {
    distances.set(nodeId, Infinity);
  }
  distances.set(startId, 0);

  const getWeight = (edge: AdjacencyEdge): number => {
    let weight = edge.distanceM;
    if (preference === 'accessible') {
      // Penalize non-wheelchair-accessible edges heavily
      if (!edge.isAccessible) {
        weight += 500;
      }
    } else if (preference === 'shaded') {
      // Heavily prefer shaded covered verandas and arcades
      if (edge.isShaded) {
        weight *= 0.6; // 40% cost reduction for shaded paths
      } else {
        weight *= 1.3;
      }
    }
    return weight;
  };

  while (visited.size < Object.keys(CAMPUS_NODES).length) {
    // Find unvisited node with lowest distance
    let closestNode: string | null = null;
    let minDistance = Infinity;

    for (const [nodeId, dist] of distances.entries()) {
      if (!visited.has(nodeId) && dist < minDistance) {
        minDistance = dist;
        closestNode = nodeId;
      }
    }

    if (!closestNode || minDistance === Infinity) break;
    if (closestNode === destId) break;

    visited.add(closestNode);
    const neighbors = ADJACENCY_GRAPH.get(closestNode) || [];

    for (const edge of neighbors) {
      if (visited.has(edge.targetId)) continue;
      const weight = getWeight(edge);
      const newDist = distances.get(closestNode)! + weight;

      if (newDist < distances.get(edge.targetId)!) {
        distances.set(edge.targetId, newDist);
        previous.set(edge.targetId, { nodeId: closestNode, edge });
      }
    }
  }

  if (!previous.has(destId)) {
    return null; // No route found
  }

  // Reconstruct path
  const pathNodeIds: string[] = [];
  const edgesUsed: AdjacencyEdge[] = [];
  let curr = destId;

  while (curr !== startId) {
    pathNodeIds.unshift(curr);
    const prevInfo = previous.get(curr)!;
    edgesUsed.unshift(prevInfo.edge);
    curr = prevInfo.nodeId;
  }
  pathNodeIds.unshift(startId);

  // Compute real ground distance (unweighted) and construct steps
  let totalDist = 0;
  const steps: RouteStep[] = [];

  for (let i = 0; i < edgesUsed.length; i++) {
    const fromId = pathNodeIds[i];
    const toId = pathNodeIds[i + 1];
    const edge = edgesUsed[i];
    const fromNode = CAMPUS_NODES[fromId];
    const toNode = CAMPUS_NODES[toId];

    totalDist += edge.distanceM;

    let notice: string | undefined;
    if (!toNode.isVerified) {
      notice = 'Exact room or floor location unverified; directed to landmark building entrance.';
    }

    steps.push({
      stepNumber: i + 1,
      instruction: edge.instruction,
      landmark: toNode.name,
      distanceM: edge.distanceM,
      durationSec: Math.round(edge.distanceM / 1.3),
      isAccessible: edge.isAccessible,
      isShaded: edge.isShaded,
      fromCoords: [fromNode.x, fromNode.y],
      toCoords: [toNode.x, toNode.y],
      notice
    });
  }

  return { pathNodeIds, totalDist, steps };
}

// -------------------------------------------------------------
// PUBLIC ROUTE CALCULATOR
// Computes multi-stop route with customizable walking speed
// -------------------------------------------------------------
export function calculateCampusRoute(
  startNodeId: string,
  destNodeId: string,
  intermediateNodeIds: string[] = [],
  preference: RoutePreference = 'shortest',
  walkingSpeedMs: number = 1.3
): CalculatedRouteResult {
  // Validate start & destination exist
  const startNode = CAMPUS_NODES[startNodeId];
  const destNode = CAMPUS_NODES[destNodeId];

  if (!startNode || !destNode) {
    return {
      isCalculated: false,
      statusMessage: 'Route distance unavailable — campus path data required for chosen locations.',
      totalDistanceM: 0,
      walkingTimeSec: 0,
      stepsCount: 0,
      walkingSpeedMs,
      preference,
      isFullyAccessible: false,
      isFullyShaded: false,
      isIndoorUnverified: true,
      waypoints: [],
      pathCoordinates: [],
      steps: []
    };
  }

  if (startNodeId === destNodeId && (!intermediateNodeIds || intermediateNodeIds.length === 0)) {
    return {
      isCalculated: true,
      statusMessage: `Start and destination are the same location (${startNode.name}). Distance is 0 metres.`,
      totalDistanceM: 0,
      walkingTimeSec: 0,
      stepsCount: 0,
      walkingSpeedMs,
      preference,
      isFullyAccessible: true,
      isFullyShaded: true,
      isIndoorUnverified: !startNode.isVerified,
      waypoints: [startNode],
      pathCoordinates: [[startNode.x, startNode.y]],
      steps: [
        {
          stepNumber: 1,
          instruction: `You are already at ${startNode.name}. Select a different destination to navigate or simulate walking.`,
          landmark: startNode.name,
          distanceM: 0,
          durationSec: 0,
          isAccessible: true,
          isShaded: true,
          fromCoords: [startNode.x, startNode.y],
          toCoords: [startNode.x, startNode.y]
        }
      ]
    };
  }

  const routeNodeSequence = [startNodeId, ...intermediateNodeIds.filter(id => CAMPUS_NODES[id]), destNodeId];
  let combinedDistanceM = 0;
  const combinedPathNodeIds: string[] = [];
  const combinedSteps: RouteStep[] = [];

  for (let s = 0; s < routeNodeSequence.length - 1; s++) {
    const fromId = routeNodeSequence[s];
    const toId = routeNodeSequence[s + 1];

    if (fromId === toId) continue;

    const segment = dijkstraSegment(fromId, toId, preference);
    if (!segment) {
      return {
        isCalculated: false,
        statusMessage: `Route distance unavailable — no verified campus path connecting ${CAMPUS_NODES[fromId]?.name || fromId} and ${CAMPUS_NODES[toId]?.name || toId}.`,
        totalDistanceM: 0,
        walkingTimeSec: 0,
        stepsCount: 0,
        walkingSpeedMs,
        preference,
        isFullyAccessible: false,
        isFullyShaded: false,
        isIndoorUnverified: true,
        waypoints: [],
        pathCoordinates: [],
        steps: []
      };
    }

    combinedDistanceM += segment.totalDist;

    // Merge node sequence without duplicate join nodes
    if (combinedPathNodeIds.length === 0) {
      combinedPathNodeIds.push(...segment.pathNodeIds);
    } else {
      combinedPathNodeIds.push(...segment.pathNodeIds.slice(1));
    }

    // Merge steps with continuous numbering
    for (const step of segment.steps) {
      combinedSteps.push({
        ...step,
        stepNumber: combinedSteps.length + 1,
        durationSec: Math.max(5, Math.round(step.distanceM / (walkingSpeedMs || 1.3)))
      });
    }
  }

  const waypoints = combinedPathNodeIds.map(id => CAMPUS_NODES[id]).filter(Boolean);
  const pathCoordinates: [number, number][] = waypoints.map(n => [n.x, n.y]);

  const walkingTimeSec = Math.max(10, Math.round(combinedDistanceM / (walkingSpeedMs || 1.3)));
  const stepsCount = Math.round(combinedDistanceM / 0.75); // Standard 0.75m average human stride

  const isFullyAccessible = combinedSteps.every(st => st.isAccessible);
  const isFullyShaded = combinedSteps.every(st => st.isShaded);
  const isIndoorUnverified = waypoints.some(n => !n.isVerified);

  return {
    isCalculated: true,
    totalDistanceM: combinedDistanceM,
    walkingTimeSec,
    stepsCount,
    walkingSpeedMs,
    preference,
    isFullyAccessible,
    isFullyShaded,
    isIndoorUnverified,
    waypoints,
    pathCoordinates,
    steps: combinedSteps
  };
}

/**
 * Maps a RoomRecord ID to the most accurate CampusNode ID
 */
export function getCampusNodeIdForRoom(roomId: string, blockName?: string): string {
  // Direct node association check
  for (const node of Object.values(CAMPUS_NODES)) {
    if (node.associatedRoomId === roomId) {
      return node.id;
    }
  }

  // Fallback to block / facility based on ID patterns
  if (roomId.includes('SEM-A01') || roomId.includes('LAB-A03')) return 'block-a-floor1';
  if (roomId.includes('LAB-A01') || roomId.includes('LAB-A02')) return 'block-a-floor3';
  if (roomId.startsWith('LOC-STF-A')) return 'block-a-staff';
  if (roomId.startsWith('LOC-LAB-A') || roomId.startsWith('LOC-SEM-A')) return 'block-a-ground';

  if (roomId.includes('LIB-B01') || roomId.includes('LAB-B01') || roomId.includes('LAB-B02')) return 'block-b-floor1';
  if (roomId.includes('SEM-B01') || roomId.includes('SEM-B02')) return 'block-b-floor2';
  if (roomId.startsWith('LOC-STF-B')) return 'block-b-staff';
  if (roomId.startsWith('LOC-ADM') || roomId.startsWith('LOC-PRIN') || roomId.startsWith('LOC-EXAM')) return 'block-b-ground';

  if (roomId.includes('CAN-C01')) return 'block-c-canteen';
  if (roomId.includes('AUD-C01')) return 'block-c-auditorium';
  if (roomId.includes('LAB-C01')) return 'block-c-complabs';

  if (roomId.includes('SPT-01')) return 'sports-kabaddi';
  if (roomId.includes('SPT-02')) return 'sports-volleyball';
  if (roomId.includes('SPT-03')) return 'sports-cricket';
  if (roomId.includes('SPT-04')) return 'sports-basketball';
  if (roomId.includes('SPT-05')) return 'sports-empty';
  if (roomId.includes('SPT-06')) return 'sports-shuttle';

  if (roomId.includes('PRK-01')) return 'parking-ab';
  if (roomId.includes('PRK-02')) return 'parking-c';
  if (roomId.includes('PRK-03')) return 'parking-sports';

  if (roomId.includes('ENT-01')) return 'gate-main';
  if (roomId.includes('ENT-02')) return 'gate-girls';

  if (blockName === 'Block A') return 'block-a-ground';
  if (blockName === 'Block B') return 'block-b-ground';
  if (blockName === 'Block C') return 'block-c-ground-hub';

  return 'gate-main';
}
