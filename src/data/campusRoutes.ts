export interface CampusGate {
  id: string;
  name: string;
  code: string;
  location: string;
  description: string;
  bestFor: string;
}

export const CAMPUS_GATES: CampusGate[] = [
  {
    id: 'gate-main',
    name: 'Main Entrance Gate',
    code: 'MAIN-GATE',
    location: 'Front perimeter road, situated directly between Block B and Block C',
    description: 'Primary vehicular and pedestrian entrance with central security checkpost, visitor registry, and access to Block B, Block C, and Sports Grounds.',
    bestFor: 'Direct access to Block C (Canteen, Auditorium), Block B (Admin Office, Principal Room, Exam Cell, Central Library), and Sports Grounds.'
  },
  {
    id: 'gate-girls',
    name: "Girls' Entrance Gate",
    code: 'GIRLS-GATE',
    location: 'Front perimeter walkway, situated directly between Block A and Block B',
    description: 'Dedicated campus entry gate for girls, positioned directly between Block A and Block B.',
    bestFor: 'Direct access to Block A (Labs, Seminar Halls) and Block B.'
  }
];

export interface RouteDetail {
  entryGateName: string;
  destinationBlock: string;
  steps: string[];
  accessibilityNote: string;
  isIndoorUnverified: boolean;
}

/**
 * Provides basic schematic outdoor landmark directions from chosen campus entrance to destination block/area.
 * Adheres strictly to verified relative campus layout without calculating arbitrary metric walking distances or shortest path algorithms.
 */
export function calculateShortestRoute(
  gateId: string,
  destinationBlock: string,
  floor: string = 'Ground Floor'
): RouteDetail {
  const gate = CAMPUS_GATES.find((g) => g.id === gateId) || CAMPUS_GATES[0];
  let steps: string[] = [];
  const isFloorUpper = floor.includes('1st') || floor.includes('2nd') || floor.includes('3rd') || floor.includes('4th');

  if (gate.id === 'gate-main') {
    // Starting at Main Entrance (between Blocks B and C)
    if (destinationBlock.includes('Block C')) {
      steps = [
        'Enter through Main Entrance Gate (between Blocks B and C).',
        'Proceed towards Block C on your right.',
        'Enter Block C via the ground floor entrance.',
        floor.includes('Ground')
          ? 'Ground Floor houses the Canteen (exact size and internal placement unverified / approximate).'
          : floor.includes('1st')
          ? 'Take the staircase/lift to the 1st Floor directly above the Canteen for the College Auditorium.'
          : `Floor: ${floor} (Indoor layout needs physical verification).`
      ];
    } else if (destinationBlock.includes('Block B')) {
      steps = [
        'Enter through Main Entrance Gate (between Blocks B and C).',
        'Turn left along the covered pedestrian walkway towards Block B.',
        'Enter Block B ground floor entrance.',
        floor.includes('Ground')
          ? 'Ground Floor houses Administrative Office (AO), Principal’s Room, and Examination Cell.'
          : floor.includes('1st')
          ? 'Ascend to 1st Floor for Central Library, EEE Labs, and ECE Labs.'
          : floor.includes('2nd')
          ? 'Ascend to 2nd Floor for EEE Seminar Hall and ECE Seminar Hall.'
          : `Ascend to ${floor} (Indoor layout needs physical verification).`
      ];
    } else if (destinationBlock.includes('Block A')) {
      steps = [
        'Enter through Main Entrance Gate.',
        'Walk westward along the connecting walkway past Block B towards Block A.',
        'Enter Block A through the entrance.',
        floor.includes('Ground')
          ? 'Ground Floor contains Mechanical Seminar Hall, Mechanical Labs, Civil Labs, and Electrical Lab.'
          : floor.includes('1st')
          ? 'Ascend to 1st Floor for CSE Seminar Hall and Computer Labs.'
          : floor.includes('3rd')
          ? 'Ascend to 3rd Floor for Physics Labs and Chemistry Labs.'
          : `Floor: ${floor} (Indoor layout needs physical verification).`
      ];
    } else if (destinationBlock.includes('Sports')) {
      steps = [
        'Enter through Main Entrance Gate.',
        'Follow the avenue between the academic blocks and the sports zone boundary.',
        'Arrive at Sports Zone (Cricket pitch, Basketball court, Volleyball court, Kabaddi court, Shuttle courts, and Empty ground).'
      ];
    } else {
      steps = [
        'Enter through Main Entrance Gate.',
        'Access designated parking zones around Block C or transition to the sports parking area.'
      ];
    }
  } else {
    // Starting at Girls' Entrance (between Blocks A and B)
    if (destinationBlock.includes('Block A')) {
      steps = [
        "Enter through Girls' Entrance Gate (between Blocks A and B).",
        'Turn left towards Block A entrance.',
        floor.includes('Ground')
          ? 'Ground Floor contains Mechanical Seminar Hall, Mechanical Labs, Civil Labs, and Electrical Lab.'
          : floor.includes('1st')
          ? 'Ascend to 1st Floor for CSE Seminar Hall and Computer Labs.'
          : floor.includes('3rd')
          ? 'Ascend to 3rd Floor for Physics Labs and Chemistry Labs.'
          : `Floor: ${floor} (Indoor layout needs physical verification).`
      ];
    } else if (destinationBlock.includes('Block B')) {
      steps = [
        "Enter through Girls' Entrance Gate (between Blocks A and B).",
        'Turn right into Block B entrance.',
        floor.includes('Ground')
          ? 'Ground Floor houses Administrative Office (AO), Principal’s Room, and Examination Cell.'
          : floor.includes('1st')
          ? 'Ascend to 1st Floor for Central Library, EEE Labs, and ECE Labs.'
          : floor.includes('2nd')
          ? 'Ascend to 2nd Floor for EEE Seminar Hall and ECE Seminar Hall.'
          : `Ascend to ${floor} (Indoor layout needs physical verification).`
      ];
    } else if (destinationBlock.includes('Block C')) {
      steps = [
        "Enter through Girls' Entrance Gate.",
        'Walk east along the connecting walkway past Block B towards Block C.',
        'Enter Block C.',
        floor.includes('Ground')
          ? 'Ground Floor houses the Canteen (exact size and internal placement unverified / approximate).'
          : floor.includes('1st')
          ? 'Ascend to 1st Floor directly above Canteen for College Auditorium.'
          : `Floor: ${floor} (Indoor layout needs physical verification).`
      ];
    } else if (destinationBlock.includes('Sports')) {
      steps = [
        "Enter through Girls' Entrance Gate.",
        'Walk past Block B towards the open rear sports grounds.',
        'Arrive at Sports Zone (Cricket pitch, Basketball, Volleyball, Kabaddi, Shuttle, and Empty ground).'
      ];
    } else {
      steps = [
        "Enter through Girls' Entrance Gate.",
        'Two-wheeler parking is located around Blocks A and B.'
      ];
    }
  }

  return {
    entryGateName: gate.name,
    destinationBlock,
    steps,
    accessibilityNote: 'Paved walkways provide access between campus blocks. Indoor stairs/elevators lead to upper levels.',
    isIndoorUnverified: isFloorUpper || floor === 'Not verified'
  };
}
