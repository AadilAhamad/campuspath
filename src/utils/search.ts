import { FilterState, RoomRecord } from '../types/room';

/**
 * Normalizes text for relaxed search matching (strips punctuation, extra spaces, lowercases).
 */
function normalize(str: string | undefined): string {
  if (!str) return '';
  return str.toLowerCase().trim();
}

function cleanAlphanumeric(str: string | undefined): string {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Filter campus directory locations based on search text and active filters without external AI API calls.
 */
export function filterRooms(rooms: RoomRecord[], filters: FilterState): RoomRecord[] {
  const query = normalize(filters.searchQuery);
  const cleanQuery = cleanAlphanumeric(filters.searchQuery);

  return rooms.filter((room) => {
    // 1. Block Filter (e.g. 'Block A', 'Block B', 'Block C')
    if (filters.block !== 'All') {
      const roomBlockLower = (room.block || '').toLowerCase();
      const filterBlockLower = filters.block.toLowerCase();
      const matchesBlock = 
        roomBlockLower === filterBlockLower || 
        roomBlockLower.includes(filterBlockLower);
      if (!matchesBlock) return false;
    }

    // 2. Floor Filter (e.g. 'Ground Floor', '1st Floor', etc.)
    if (filters.floor !== 'All') {
      const roomFloorLower = (room.floor || '').toLowerCase();
      const filterFloorLower = filters.floor.toLowerCase();
      const matchesFloor = 
        roomFloorLower === filterFloorLower || 
        roomFloorLower.includes(filterFloorLower);
      if (!matchesFloor) return false;
    }

    // 3. Category Filter (e.g. 'Labs', 'Seminar Halls', 'Offices', 'Library', 'Canteen', 'Parking', 'Sports')
    if (filters.category !== 'All') {
      const roomCatLower = (room.category || '').toLowerCase();
      const filterCatLower = filters.category.toLowerCase();
      const matchesCategory = 
        roomCatLower === filterCatLower || 
        roomCatLower.includes(filterCatLower) ||
        filterCatLower.includes(roomCatLower);
      if (!matchesCategory) return false;
    }

    // 4. Department Filter
    if (filters.department !== 'All') {
      if (!room.department || room.department.toLowerCase() !== filters.department.toLowerCase()) {
        return false;
      }
    }

    // 5. Search Query matching across:
    // - Name (e.g. "Auditorium", "Canteen", "Kabaddi", "Exam Section")
    // - Category (e.g. "Sports", "Parking", "Labs", "Seminar Halls")
    // - Room Number if available (e.g. confirmed room number or "Not verified")
    // - Block / Area (e.g. "Block A", "Sports Zone", "Between Blocks B and C")
    // - Floor (e.g. "Ground Floor", "1st Floor")
    // - Notes & Purpose
    // - Landmark directions
    if (query) {
      const nameNorm = normalize(room.name);
      const categoryNorm = normalize(room.category);
      const roomNumNorm = normalize(room.roomNumber);
      const roomNumClean = cleanAlphanumeric(room.roomNumber);
      const blockNorm = normalize(room.block);
      const floorNorm = normalize(room.floor);
      const notesNorm = normalize(room.notes);
      const purposeNorm = normalize(room.purpose);
      const deptNorm = normalize(room.department);
      const landmarkNorm = normalize(room.landmarkDirections);

      // Direct substring match
      const directMatch =
        nameNorm.includes(query) ||
        categoryNorm.includes(query) ||
        (roomNumNorm && roomNumNorm.includes(query)) ||
        (roomNumClean && roomNumClean.includes(cleanQuery)) ||
        blockNorm.includes(query) ||
        floorNorm.includes(query) ||
        notesNorm.includes(query) ||
        purposeNorm.includes(query) ||
        deptNorm.includes(query) ||
        landmarkNorm.includes(query);

      if (directMatch) return true;

      // Token-based matching (e.g. user typed "Block C Canteen" or "Sports Cricket")
      const tokens = query.split(/\s+/).filter(Boolean);
      const allTokensMatch = tokens.every(
        (token) =>
          nameNorm.includes(token) ||
          categoryNorm.includes(token) ||
          (roomNumNorm && roomNumNorm.includes(token)) ||
          blockNorm.includes(token) ||
          floorNorm.includes(token) ||
          notesNorm.includes(token) ||
          purposeNorm.includes(token) ||
          deptNorm.includes(token) ||
          landmarkNorm.includes(token)
      );

      return allTokensMatch;
    }

    return true;
  });
}
