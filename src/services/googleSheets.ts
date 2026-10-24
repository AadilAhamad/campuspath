import { RoomRecord } from '../types/room';

export interface GoogleSheetsConfig {
  spreadsheetIdOrUrl: string;
  sheetName: string; // Defaults to 'Rooms'
  lastSyncedAt: string | null;
}

export interface FetchSheetsResult {
  success: boolean;
  rooms: RoomRecord[];
  error?: string;
  rowCount?: number;
  sheetUrlUsed?: string;
}

export const SHEETS_STORAGE_CONFIG_KEY = 'necn_campus_google_sheets_config_v1';

/**
 * Normalizes a Google Sheets URL or ID into a clean CSV export URL.
 * Works with:
 * 1. Full edit URL: https://docs.google.com/spreadsheets/d/1BxiMVs.../edit
 * 2. Published URL: https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?output=csv
 * 3. Raw Spreadsheet ID: 1BxiMVs...
 */
export function buildGoogleSheetsCsvUrl(input: string, sheetName = 'Rooms'): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  // Case 1: Already a direct CSV link or published CSV link
  if (trimmed.includes('output=csv') || trimmed.endsWith('.csv')) {
    return trimmed;
  }

  // Case 2: Extract Spreadsheet ID from standard Google Sheets URL
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  const spreadsheetId = match ? match[1] : trimmed;

  // Use Google Visualization API endpoint to fetch public read-only CSV of the specific worksheet
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
}

/**
 * Parses a single CSV line with support for quoted strings and commas inside quotes.
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Normalizes block string to standard or custom area description
 */
export function normalizeBlock(raw: string): string {
  const trimmed = (raw || '').trim();
  if (!trimmed) return 'Block A';
  if (/^block\s*a$/i.test(trimmed)) return 'Block A';
  if (/^block\s*b$/i.test(trimmed)) return 'Block B';
  if (/^block\s*c$/i.test(trimmed)) return 'Block C';
  return trimmed;
}

/**
 * Normalizes floor string to standard FloorLevel or outdoor/unknown label
 */
export function normalizeFloor(raw: string): string {
  const trimmed = (raw || '').trim();
  const lower = trimmed.toLowerCase();
  if (lower.includes('outdoor')) return 'Outdoor / Ground';
  if (lower.includes('ground') || lower === '0' || lower === 'g') return 'Ground Floor';
  if (lower.includes('1') || lower.includes('first')) return '1st Floor';
  if (lower.includes('2') || lower.includes('second')) return '2nd Floor';
  if (lower.includes('3') || lower.includes('third')) return '3rd Floor';
  if (lower.includes('4') || lower.includes('fourth')) return '4th Floor';
  if (lower.includes('not verified') || lower.includes('unverified') || lower.includes('not confirmed') || lower.includes('unknown') || lower.includes('n/a')) return 'Not verified';
  return trimmed || 'Not verified';
}

/**
 * Normalizes room category to standard quick categories
 */
export function normalizeCategory(raw: string): string {
  const trimmed = (raw || '').trim();
  const lower = trimmed.toLowerCase();
  if (lower === 'labs' || lower.includes('laboratory') || lower.includes('lab')) return 'Labs';
  if (lower === 'seminar halls' || lower.includes('seminar') || lower.includes('auditorium')) return 'Seminar Halls';
  if (lower === 'offices' || lower.includes('office') || lower.includes('admin') || lower.includes('exam') || lower.includes('principal') || lower.includes('staff')) return 'Offices';
  if (lower === 'library' || lower.includes('book')) return 'Library';
  if (lower === 'canteen' || lower.includes('cafeteria')) return 'Canteen';
  if (lower === 'parking' || lower.includes('vehicle')) return 'Parking';
  if (lower === 'sports' || lower.includes('court') || lower.includes('pitch') || lower.includes('ground')) return 'Sports';
  if (lower === 'entrances' || lower.includes('entrance') || lower.includes('gate')) return 'Entrances';
  return trimmed || 'Classroom';
}

/**
 * Parses CSV text containing location/room records.
 * Supports both standard Rooms schema and Campus_Digital_Twin_Important_Locations.csv
 */
export function parseRoomsCsv(csvText: string): { rooms: RoomRecord[]; errors?: string[] } {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error('Spreadsheet/CSV has no data rows. Found only ' + lines.length + ' line(s).');
  }

  // Parse Header row
  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

  // Column matching with broad aliases
  const idIdx = headers.findIndex((h) => h.includes('id') || h === 'roomid' || h === 'locationid');
  const nameIdx = headers.findIndex((h) => h.includes('name') || h === 'roomname' || h === 'locationname' || h === 'title');
  const categoryIdx = headers.findIndex((h) => h.includes('category') || h.includes('type'));
  const blockIdx = headers.findIndex((h) => h.includes('block') || h.includes('area') || h.includes('zone'));
  const floorIdx = headers.findIndex((h) => h.includes('floor') || h.includes('level'));
  const roomNumIdx = headers.findIndex((h) => h.includes('number') || h.includes('roomno') || h === 'roomnumber');
  const notesIdx = headers.findIndex((h) => h.includes('note') || h.includes('desc') || h.includes('purpose'));
  const deptIdx = headers.findIndex((h) => h.includes('dept') || h.includes('department'));
  const directionsIdx = headers.findIndex((h) => h.includes('direction') || h.includes('landmark') || h.includes('location'));

  // Ensure minimum critical identification columns exist
  if (nameIdx === -1 && roomNumIdx === -1) {
    throw new Error(
      `Required name or room number column missing in CSV. Found headers: ${lines[0]}`
    );
  }

  const rooms: RoomRecord[] = [];
  const parsingErrors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    try {
      const cols = parseCsvLine(lines[i]);
      if (cols.length === 0 || cols.every((c) => !c)) continue; // skip blank rows

      const rawId = idIdx !== -1 && cols[idIdx] ? cols[idIdx] : `loc-${i}`;
      const rawName = nameIdx !== -1 && cols[nameIdx] ? cols[nameIdx] : `Location ${i}`;
      const rawCategory = categoryIdx !== -1 && cols[categoryIdx] ? cols[categoryIdx] : 'Offices';
      const rawBlock = blockIdx !== -1 && cols[blockIdx] ? cols[blockIdx] : 'Block A';
      const rawFloor = floorIdx !== -1 && cols[floorIdx] ? cols[floorIdx] : 'Ground Floor';
      const rawRoomNum = roomNumIdx !== -1 && cols[roomNumIdx] ? cols[roomNumIdx].trim() : '';
      const rawNotes = notesIdx !== -1 && cols[notesIdx] ? cols[notesIdx].trim() : '';
      const rawDept = deptIdx !== -1 && cols[deptIdx] ? cols[deptIdx].trim() : undefined;
      const rawDirections = directionsIdx !== -1 && cols[directionsIdx] ? cols[directionsIdx].trim() : undefined;

      const isRoomNumUnknown = !rawRoomNum || 
        rawRoomNum.toLowerCase() === 'unknown' || 
        rawRoomNum.toLowerCase() === 'n/a' || 
        rawRoomNum.toLowerCase() === 'not verified' || 
        rawRoomNum.toLowerCase() === 'unverified';

      const block = normalizeBlock(rawBlock);
      const floor = normalizeFloor(rawFloor);
      const category = normalizeCategory(rawCategory);

      rooms.push({
        id: rawId.trim(),
        name: rawName.trim(),
        category,
        block,
        floor,
        roomNumber: isRoomNumUnknown ? 'Not verified' : rawRoomNum,
        notes: rawNotes,
        purpose: rawNotes || `${category} situated in ${block}, ${floor}.`,
        department: rawDept,
        landmarkDirections: rawDirections || `${block}, ${floor}`,
        isSampleRecord: false,
        verificationStatus: (floor === 'Not verified' || rawNotes.includes('Needs verification') || rawNotes.includes('needs verification')) 
          ? 'unverified_sample' 
          : 'verified_official'
      });
    } catch (err: any) {
      parsingErrors.push(`Row ${i + 1}: ${err.message}`);
    }
  }

  if (rooms.length === 0) {
    throw new Error('Spreadsheet/CSV contains no valid location rows.');
  }

  return { rooms, errors: parsingErrors };
}

/**
 * Fetches initial Campus_Digital_Twin_Important_Locations.csv bundled with the application
 */
export async function fetchInitialCampusCsv(): Promise<FetchSheetsResult> {
  try {
    const response = await fetch('/Campus_Digital_Twin_Important_Locations.csv');
    if (!response.ok) {
      return {
        success: false,
        rooms: [],
        error: `Could not load Campus_Digital_Twin_Important_Locations.csv (HTTP status ${response.status})`
      };
    }
    const text = await response.text();
    const { rooms } = parseRoomsCsv(text);
    return {
      success: true,
      rooms,
      rowCount: rooms.length
    };
  } catch (err: any) {
    return {
      success: false,
      rooms: [],
      error: err.message || 'Error fetching Campus_Digital_Twin_Important_Locations.csv'
    };
  }
}

/**
 * Fetches Google Sheet data as CSV using public read-only access (no API keys needed)
 */
export async function fetchRoomsFromGoogleSheets(
  spreadsheetIdOrUrl: string,
  sheetName = 'Rooms'
): Promise<FetchSheetsResult> {
  const trimmed = spreadsheetIdOrUrl.trim();
  if (!trimmed) {
    return {
      success: false,
      rooms: [],
      error: 'Please enter a Google Spreadsheet ID or shareable URL.'
    };
  }

  const csvUrl = buildGoogleSheetsCsvUrl(trimmed, sheetName);

  try {
    const response = await fetch(csvUrl, {
      method: 'GET',
      headers: {
        Accept: 'text/csv, text/plain, */*'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          rooms: [],
          error: `Spreadsheet not found (404). Please check the Spreadsheet ID or verify that the worksheet is named "${sheetName}".`,
          sheetUrlUsed: csvUrl
        };
      }
      return {
        success: false,
        rooms: [],
        error: `Google Sheets returned HTTP error status ${response.status} (${response.statusText}).`,
        sheetUrlUsed: csvUrl
      };
    }

    const text = await response.text();

    // Check if Google returned an HTML login page instead of CSV
    if (text.includes('<!DOCTYPE html>') || text.includes('accounts.google.com')) {
      return {
        success: false,
        rooms: [],
        error: 'Google Sheet is private. Please update sharing settings to "Anyone with the link can view" or use File > Share > Publish to web.',
        sheetUrlUsed: csvUrl
      };
    }

    const { rooms } = parseRoomsCsv(text);

    return {
      success: true,
      rooms,
      rowCount: rooms.length,
      sheetUrlUsed: csvUrl
    };
  } catch (err: any) {
    return {
      success: false,
      rooms: [],
      error: err.message || 'Network error fetching Google Spreadsheet data. Please verify your internet connection and sharing permissions.',
      sheetUrlUsed: csvUrl
    };
  }
}
