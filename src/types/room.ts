export type CampusBlock = 
  | 'Block A' 
  | 'Block B' 
  | 'Block C' 
  | 'Between Blocks A and B' 
  | 'Between Blocks B and C' 
  | 'Around Blocks A & B' 
  | 'Around Block C' 
  | 'Sports Zone' 
  | 'Sports Grounds' 
  | 'Campus Grounds / Outdoor';

export type FloorLevel = 
  | 'Ground Floor'
  | '1st Floor'
  | '2nd Floor'
  | '3rd Floor'
  | '4th Floor'
  | 'Outdoor / Ground'
  | 'Not verified'
  | 'Unknown';

export type RoomCategory =
  | 'Labs'
  | 'Seminar Halls'
  | 'Offices'
  | 'Library'
  | 'Canteen'
  | 'Parking'
  | 'Sports'
  | 'Entrances'
  | 'Classroom'
  | 'Other';

export interface RoomRecord {
  id: string;
  roomNumber?: string;        // Room number or "Not verified" if unconfirmed
  name: string;              // e.g. "College Auditorium", "Computer Science Programming Lab"
  block: string;             // e.g. "Block A", "Block B", "Block C", "Sports Zone", etc.
  floor: string;             // e.g. "Ground Floor", "1st Floor", "Outdoor / Ground", "Unknown"
  category: string;          // e.g. "Labs", "Seminar Halls", "Offices", "Library", "Canteen", "Parking", "Sports"
  purpose?: string;          // Descriptive purpose
  notes?: string;            // Additional location notes
  department?: string;       // e.g. "CSE", "ECE", "EEE", "Mechanical", "Civil", "Administration"
  capacity?: number;
  keyFacilities?: string[];
  landmarkDirections?: string; // Directions / How to reach
  isSampleRecord: boolean;
  verificationStatus: 'unverified_sample' | 'verified_official';
}

export interface FilterState {
  searchQuery: string;
  block: string | 'All';
  floor: string | 'All';
  category: string | 'All';
  department: string | 'All';
}
