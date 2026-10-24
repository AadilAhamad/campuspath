import { RoomRecord } from '../types/room';

export const CAMPUS_BLOCKS = [
  'Block A',
  'Block B',
  'Block C'
] as const;

export const FLOOR_LEVELS = [
  'Ground Floor',
  '1st Floor',
  '2nd Floor',
  '3rd Floor',
  'Outdoor / Ground',
  'Not verified'
] as const;

export const QUICK_CATEGORIES = [
  'Labs',
  'Seminar Halls',
  'Offices',
  'Library',
  'Canteen',
  'Parking',
  'Sports'
] as const;

export const ROOM_CATEGORIES = [
  'Labs',
  'Seminar Halls',
  'Offices',
  'Library',
  'Canteen',
  'Parking',
  'Sports',
  'Entrances'
] as const;

export const CAMPUS_DEPARTMENTS = [
  'Administration',
  'Examinations',
  'CSE',
  'ECE',
  'EEE',
  'Mechanical',
  'Civil',
  'FED',
  'Library Services',
  'Sports & Physical Education',
  'General'
] as const;

/**
 * Initial campus location dataset sourced strictly from Campus_Digital_Twin_Important_Locations.csv
 * and official notes for Narayana Engineering College, Nellore.
 * All invented classrooms and sample room numbers have been removed.
 * Unconfirmed room numbers and floors are explicitly set to "Not verified".
 */
export const INITIAL_SAMPLE_ROOMS: RoomRecord[] = [
  // ==========================================
  // BLOCK A
  // ==========================================
  {
    id: 'LOC-SEM-A01',
    name: 'CSE Seminar Hall',
    category: 'Seminar Halls',
    block: 'Block A',
    floor: '1st Floor',
    roomNumber: 'Not verified',
    purpose: 'CSE department seminars, technical paper presentations, and guest lectures.',
    notes: 'CSE Seminar Hall, located on the 1st Floor of Block A.',
    landmarkDirections: 'Enter Block A, proceed to 1st Floor.',
    department: 'CSE',
    isSampleRecord: false,
    verificationStatus: 'verified_official'
  },
  {
    id: 'LOC-SEM-A02',
    name: 'Mechanical Seminar Hall',
    category: 'Seminar Halls',
    block: 'Block A',
    floor: 'Ground Floor',
    roomNumber: 'Not verified',
    purpose: 'Mechanical engineering department seminars, guest lectures, and presentations.',
    notes: 'Mechanical Seminar Hall, located on the Ground Floor of Block A.',
    landmarkDirections: 'Enter Block A ground floor corridor.',
    department: 'Mechanical',
    isSampleRecord: false,
    verificationStatus: 'verified_official'
  },
  {
    id: 'LOC-LAB-A01',
    name: 'Physics Labs',
    category: 'Labs',
    block: 'Block A',
    floor: '3rd Floor',
    roomNumber: 'Not verified',
    purpose: 'Physics practical laboratory work and experimental setups.',
    notes: 'Physics Laboratories, located on the 3rd Floor of Block A.',
    landmarkDirections: 'Enter Block A, take central stairs/lift to 3rd Floor.',
    department: 'FED',
    isSampleRecord: false,
    verificationStatus: 'verified_official'
  },
  {
    id: 'LOC-LAB-A02',
    name: 'Chemistry Labs',
    category: 'Labs',
    block: 'Block A',
    floor: '3rd Floor',
    roomNumber: 'Not verified',
    purpose: 'Chemistry practical laboratory experiments and analysis.',
    notes: 'Chemistry Laboratories, located on the 3rd Floor of Block A.',
    landmarkDirections: 'Enter Block A, take central stairs/lift to 3rd Floor.',
    department: 'FED',
    isSampleRecord: false,
    verificationStatus: 'verified_official'
  },
  {
    id: 'LOC-LAB-A03',
    name: 'Computer Labs',
    category: 'Labs',
    block: 'Block A',
    floor: '1st Floor',
    roomNumber: 'Not verified',
    purpose: 'Computing facilities, programming practice, and laboratory sessions.',
    notes: 'Computer Laboratories, located on the 1st Floor of Block A (exact rooms unverified).',
    landmarkDirections: 'Enter Block A, proceed to 1st Floor (exact room numbers unverified).',
    department: 'CSE',
    isSampleRecord: false,
    verificationStatus: 'verified_official'
  },
  {
    id: 'LOC-LAB-A04',
    name: 'Mechanical Labs',
    category: 'Labs',
    block: 'Block A',
    floor: 'Ground Floor',
    roomNumber: 'Not verified',
    purpose: 'Mechanical engineering machinery, experiments, and workshop testing.',
    notes: 'Mechanical Engineering Laboratories, located on the Ground Floor of Block A.',
    landmarkDirections: 'Enter Block A ground floor corridor.',
    department: 'Mechanical',
    isSampleRecord: false,
    verificationStatus: 'verified_official'
  },
  {
    id: 'LOC-LAB-A05',
    name: 'Civil Labs',
    category: 'Labs',
    block: 'Block A',
    floor: 'Ground Floor',
    roomNumber: 'Not verified',
    purpose: 'Civil engineering structural, material testing, and surveying equipment.',
    notes: 'Civil Engineering Laboratories, located on the Ground Floor of Block A.',
    landmarkDirections: 'Enter Block A ground floor corridor.',
    department: 'Civil',
    isSampleRecord: false,
    verificationStatus: 'verified_official'
  },
  {
    id: 'LOC-LAB-A06',
    name: 'Electrical Lab',
    category: 'Labs',
    block: 'Block A',
    floor: 'Ground Floor',
    roomNumber: 'Not verified',
    purpose: 'Electrical circuits and fundamental equipment laboratory testing.',
    notes: 'Electrical Laboratory, located on the Ground Floor of Block A.',
    landmarkDirections: 'Enter Block A ground floor corridor.',
    department: 'EEE',
    isSampleRecord: false,
    verificationStatus: 'verified_official'
  },
  {
    id: 'LOC-STF-A01',
    name: 'CSM staff',
    category: 'Offices',
    block: 'Block A',
    floor: 'Not verified',
    roomNumber: 'Not verified',
    purpose: 'CSM (Computer Science & Engineering - AI/ML) faculty staff room and workstations.',
    notes: 'CSM faculty staff room in Block A; exact floor and room number unverified.',
    landmarkDirections: 'Block A (exact floor and room unverified).',
    department: 'CSE',
    isSampleRecord: false,
    verificationStatus: 'unverified_sample'
  },
  {
    id: 'LOC-STF-A02',
    name: 'FED staff',
    category: 'Offices',
    block: 'Block A',
    floor: 'Not verified',
    roomNumber: 'Not verified',
    purpose: 'Freshman Engineering Department (FED) faculty staff room.',
    notes: 'Freshman Engineering Department (FED) faculty staff room in Block A; exact floor and room number unverified.',
    landmarkDirections: 'Block A (exact floor and room unverified).',
    department: 'FED',
    isSampleRecord: false,
    verificationStatus: 'unverified_sample'
  },
  {
    id: 'LOC-STF-A03',
    name: 'Civil and Mechanical staff',
    category: 'Offices',
    block: 'Block A',
    floor: 'Not verified',
    roomNumber: 'Not verified',
    purpose: 'Faculty staff room for Civil and Mechanical engineering departments.',
    notes: 'Civil and Mechanical engineering faculty staff room in Block A; exact floor and room number unverified.',
    landmarkDirections: 'Block A (exact floor and room unverified).',
    department: 'Mechanical',
    isSampleRecord: false,
    verificationStatus: 'unverified_sample'
  },

  // ==========================================
  // BLOCK B
  // ==========================================
  {
    id: 'LOC-LAB-B01',
    name: 'EEE Labs',
    category: 'Labs',
    block: 'Block B',
    floor: '1st Floor',
    roomNumber: 'Not verified',
    purpose: 'Electrical and Electronics Engineering laboratories and testing benches.',
    notes: 'Electrical & Electronics Engineering Laboratories, located on the 1st Floor of Block B.',
    landmarkDirections: 'Enter Block B, proceed to 1st Floor.',
    department: 'EEE',
    isSampleRecord: false,
    verificationStatus: 'verified_official'
  },
  {
    id: 'LOC-LAB-B02',
    name: 'ECE Labs',
    category: 'Labs',
    block: 'Block B',
    floor: '1st Floor',
    roomNumber: 'Not verified',
    purpose: 'Electronics and Communication Engineering laboratories and circuits.',
    notes: 'Electronics & Communication Engineering Laboratories, located on the 1st Floor of Block B.',
    landmarkDirections: 'Enter Block B, proceed to 1st Floor.',
    department: 'ECE',
    isSampleRecord: false,
    verificationStatus: 'verified_official'
  },
  {
    id: 'LOC-SEM-B01',
    name: 'EEE Seminar Hall',
    category: 'Seminar Halls',
    block: 'Block B',
    floor: '2nd Floor',
    roomNumber: 'Not verified',
    purpose: 'EEE department technical seminars, workshops, and student presentations.',
    notes: 'EEE Seminar Hall, located on the 2nd Floor of Block B.',
    landmarkDirections: 'Enter Block B, take stairs to 2nd Floor.',
    department: 'EEE',
    isSampleRecord: false,
    verificationStatus: 'verified_official'
  },
  {
    id: 'LOC-SEM-B02',
    name: 'ECE Seminar Hall',
    category: 'Seminar Halls',
    block: 'Block B',
    floor: '2nd Floor',
    roomNumber: 'Not verified',
    purpose: 'ECE department technical symposiums, guest talks, and seminars.',
    notes: 'ECE Seminar Hall, located on the 2nd Floor of Block B.',
    landmarkDirections: 'Enter Block B, take stairs to 2nd Floor.',
    department: 'ECE',
    isSampleRecord: false,
    verificationStatus: 'verified_official'
  },
  {
    id: 'LOC-EXAM-B01',
    name: 'Examination Cell / Exam Section',
    category: 'Offices',
    block: 'Block B',
    floor: 'Ground Floor',
    roomNumber: 'Not verified',
    purpose: 'College examination scheduling, student hall tickets, marks records, and university exam administration.',
    notes: 'Examination Cell / Exam Section, located on the Ground Floor of Block B.',
    landmarkDirections: 'Enter Block B ground floor.',
    department: 'Examinations',
    isSampleRecord: false,
    verificationStatus: 'verified_official'
  },
  {
    id: 'LOC-PRIN-B01',
    name: "Principal's Room",
    category: 'Offices',
    block: 'Block B',
    floor: 'Ground Floor',
    roomNumber: 'Not verified',
    purpose: 'Principal’s office, executive chamber, and academic leadership meetings.',
    notes: "Principal's Office / Executive Chamber, located on the Ground Floor of Block B.",
    landmarkDirections: 'Enter Block B ground floor.',
    department: 'Administration',
    isSampleRecord: false,
    verificationStatus: 'verified_official'
  },
  {
    id: 'LOC-ADM-B01',
    name: 'Administrative Office (AO)',
    category: 'Offices',
    block: 'Block B',
    floor: 'Ground Floor',
    roomNumber: 'Not verified',
    purpose: 'College administration, student certificates, admissions, fee payments, and official enquiries.',
    notes: 'Administrative Office (AO), located on the Ground Floor of Block B.',
    landmarkDirections: 'Enter Block B ground floor.',
    department: 'Administration',
    isSampleRecord: false,
    verificationStatus: 'verified_official'
  },
  {
    id: 'LOC-LIB-B01',
    name: 'Central Library',
    category: 'Library',
    block: 'Block B',
    floor: '1st Floor',
    roomNumber: 'Not verified',
    purpose: 'Textbook lending, reference volumes, research journals, digital library, and study desks.',
    notes: 'Central Library, located on the 1st Floor of Block B.',
    landmarkDirections: 'Enter Block B, proceed to 1st Floor.',
    department: 'Library Services',
    isSampleRecord: false,
    verificationStatus: 'verified_official'
  },
  {
    id: 'LOC-STF-B01',
    name: 'CSE staff',
    category: 'Offices',
    block: 'Block B',
    floor: 'Not verified',
    roomNumber: 'Not verified',
    purpose: 'CSE faculty workstations and academic counselling desks.',
    notes: 'CSE faculty staff room in Block B; exact floor and room number unverified.',
    landmarkDirections: 'Block B (exact floor and room unverified).',
    department: 'CSE',
    isSampleRecord: false,
    verificationStatus: 'unverified_sample'
  },
  {
    id: 'LOC-STF-B02',
    name: 'EEE staff',
    category: 'Offices',
    block: 'Block B',
    floor: 'Not verified',
    roomNumber: 'Not verified',
    purpose: 'EEE department faculty staff room.',
    notes: 'EEE faculty staff room in Block B; exact floor and room number unverified.',
    landmarkDirections: 'Block B (exact floor and room unverified).',
    department: 'EEE',
    isSampleRecord: false,
    verificationStatus: 'unverified_sample'
  },
  {
    id: 'LOC-STF-B03',
    name: 'ECE staff',
    category: 'Offices',
    block: 'Block B',
    floor: 'Not verified',
    roomNumber: 'Not verified',
    purpose: 'ECE department faculty staff room.',
    notes: 'ECE faculty staff room in Block B; exact floor and room number unverified.',
    landmarkDirections: 'Block B (exact floor and room unverified).',
    department: 'ECE',
    isSampleRecord: false,
    verificationStatus: 'unverified_sample'
  },

  // ==========================================
  // BLOCK C
  // ==========================================
  {
    id: 'LOC-CAN-C01',
    name: 'Canteen',
    category: 'Canteen',
    block: 'Block C',
    floor: 'Ground Floor',
    roomNumber: 'Not verified',
    purpose: 'Campus cafeteria, student dining, and refreshments.',
    notes: 'Campus Canteen, located on the Ground Floor of Block C. Exact size and internal position are unverified / approximate.',
    landmarkDirections: 'Ground Floor of Block C, facing central walkway.',
    department: 'General',
    isSampleRecord: false,
    verificationStatus: 'verified_official'
  },
  {
    id: 'LOC-AUD-C01',
    name: 'Auditorium',
    category: 'Seminar Halls',
    block: 'Block C',
    floor: '1st Floor',
    roomNumber: 'Not verified',
    purpose: 'Main college auditorium for major gatherings, symposiums, and cultural events.',
    notes: 'College Auditorium, located on the 1st Floor of Block C, directly above the canteen.',
    landmarkDirections: 'Block C, 1st Floor directly above Canteen.',
    department: 'Administration',
    isSampleRecord: false,
    verificationStatus: 'verified_official'
  },
  {
    id: 'LOC-LAB-C01',
    name: 'Computer labs',
    category: 'Labs',
    block: 'Block C',
    floor: '1st Floor',
    roomNumber: 'Not verified',
    purpose: 'Computer laboratory facilities in Block C.',
    notes: 'Listed in notes as Block C, 1st floor; exact rooms unverified (needs verification).',
    landmarkDirections: 'Block C, 1st Floor (exact rooms unverified).',
    department: 'CSE',
    isSampleRecord: false,
    verificationStatus: 'unverified_sample'
  },

  // ==========================================
  // ENTRANCES (LAYOUT)
  // ==========================================
  {
    id: 'LOC-ENT-01',
    name: 'Main Entrance Gate',
    category: 'Entrances',
    block: 'Between Blocks B and C',
    floor: 'Outdoor / Ground',
    roomNumber: 'Not verified',
    purpose: 'Primary campus entrance gate with security checkpost and vehicle entry.',
    notes: 'Primary campus entrance gate, positioned between Block B and Block C.',
    landmarkDirections: 'Front perimeter road, situated directly between Block B and Block C.',
    department: 'General',
    isSampleRecord: false,
    verificationStatus: 'verified_official'
  },
  {
    id: 'LOC-ENT-02',
    name: "Girls' Entrance Gate",
    category: 'Entrances',
    block: 'Between Blocks A and B',
    floor: 'Outdoor / Ground',
    roomNumber: 'Not verified',
    purpose: 'Dedicated campus entry gate for girls.',
    notes: "Dedicated campus entry gate, positioned between Block A and Block B.",
    landmarkDirections: 'Front perimeter walkway, situated directly between Block A and Block B.',
    department: 'General',
    isSampleRecord: false,
    verificationStatus: 'verified_official'
  },

  // ==========================================
  // PARKING AREAS
  // ==========================================
  {
    id: 'LOC-PRK-01',
    name: 'Block A & B Parking',
    category: 'Parking',
    block: 'Around Blocks A & B',
    floor: 'Outdoor / Ground',
    roomNumber: 'Not verified',
    purpose: 'Vehicle parking area around Blocks A and B.',
    notes: 'Designated parking area around Blocks A and B.',
    landmarkDirections: 'Driveway surrounding Blocks A & B.',
    department: 'General',
    isSampleRecord: false,
    verificationStatus: 'verified_official'
  },
  {
    id: 'LOC-PRK-02',
    name: 'Block C & Canteen Parking',
    category: 'Parking',
    block: 'Around Block C',
    floor: 'Outdoor / Ground',
    roomNumber: 'Not verified',
    purpose: 'Vehicle and visitor parking adjacent to Block C and the Canteen.',
    notes: 'Designated parking area around Block C and Canteen.',
    landmarkDirections: 'Driveway alongside Block C.',
    department: 'General',
    isSampleRecord: false,
    verificationStatus: 'verified_official'
  },
  {
    id: 'LOC-PRK-03',
    name: 'Sports Zone Parking',
    category: 'Parking',
    block: 'Sports Grounds',
    floor: 'Outdoor / Ground',
    roomNumber: 'Not verified',
    purpose: 'Parking area between academic blocks and sports grounds.',
    notes: 'Parking area positioned between academic blocks and sports fields.',
    landmarkDirections: 'Area between academic blocks and sports grounds.',
    department: 'Sports & Physical Education',
    isSampleRecord: false,
    verificationStatus: 'verified_official'
  },

  // ==========================================
  // SPORTS FACILITIES
  // ==========================================
  {
    id: 'LOC-SPT-01',
    name: 'Kabaddi Court',
    category: 'Sports',
    block: 'Sports Zone',
    floor: 'Outdoor / Ground',
    roomNumber: 'Not verified',
    purpose: 'Kabaddi practice and collegiate tournament matches.',
    notes: 'Kabaddi court in the campus sports complex.',
    landmarkDirections: 'Sports complex area.',
    department: 'Sports & Physical Education',
    isSampleRecord: false,
    verificationStatus: 'verified_official'
  },
  {
    id: 'LOC-SPT-02',
    name: 'Volleyball Court',
    category: 'Sports',
    block: 'Sports Zone',
    floor: 'Outdoor / Ground',
    roomNumber: 'Not verified',
    purpose: 'Volleyball practice and competition matches.',
    notes: 'Volleyball court in the campus sports complex.',
    landmarkDirections: 'Sports complex area.',
    department: 'Sports & Physical Education',
    isSampleRecord: false,
    verificationStatus: 'verified_official'
  },
  {
    id: 'LOC-SPT-03',
    name: 'Cricket Pitch',
    category: 'Sports',
    block: 'Sports Zone',
    floor: 'Outdoor / Ground',
    roomNumber: 'Not verified',
    purpose: 'Cricket net practice and matches.',
    notes: 'Cricket pitch located in the sports grounds.',
    landmarkDirections: 'Sports grounds central field.',
    department: 'Sports & Physical Education',
    isSampleRecord: false,
    verificationStatus: 'verified_official'
  },
  {
    id: 'LOC-SPT-04',
    name: 'Basketball Court',
    category: 'Sports',
    block: 'Sports Zone',
    floor: 'Outdoor / Ground',
    roomNumber: 'Not verified',
    purpose: 'Basketball practice and matches.',
    notes: 'Basketball court in the campus sports complex.',
    landmarkDirections: 'Sports complex central section.',
    department: 'Sports & Physical Education',
    isSampleRecord: false,
    verificationStatus: 'verified_official'
  },
  {
    id: 'LOC-SPT-05',
    name: 'Empty Ground',
    category: 'Sports',
    block: 'Sports Zone',
    floor: 'Outdoor / Ground',
    roomNumber: 'Not verified',
    purpose: 'Open empty ground for athletics, physical fitness drills, and gatherings.',
    notes: 'Open empty ground for athletics, physical fitness drills, and gatherings.',
    landmarkDirections: 'Sports zone open field.',
    department: 'Sports & Physical Education',
    isSampleRecord: false,
    verificationStatus: 'verified_official'
  },
  {
    id: 'LOC-SPT-06',
    name: 'Shuttle Courts',
    category: 'Sports',
    block: 'Sports Zone',
    floor: 'Outdoor / Ground',
    roomNumber: 'Not verified',
    purpose: 'Badminton and shuttle recreation.',
    notes: 'Outdoor shuttle badminton courts.',
    landmarkDirections: 'Sports complex area.',
    department: 'Sports & Physical Education',
    isSampleRecord: false,
    verificationStatus: 'verified_official'
  }
];
