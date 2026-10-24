# NECN CampusPath — Campus Digital Twin
## Architectural Maintenance, Data Management & Extension Guide
**Institution**: Narayana Engineering College, Nellore (NECN)  
**System**: CampusPath Digital Twin & Topological Route Finding Engine  
**Version**: 2.0 (Production Architecture)

---

## 1. System Architecture & Data Layer Separation

The application is structured into decoupled architectural layers:

```
┌─────────────────────────────────────────────────────────────────┐
│                       PRESENTATION LAYER                        │
│  CampusSchematicMap · RoomCard · SearchAndFilters · Header      │
│  CampusMapRouteFinder · RoleDashboardBanner · DataManagerModal  │
└────────────────────────────────┬────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────┐
│                        STATE & CONTEXT                          │
│     RoomContext (Filters, Active Nodes, User Session, SOT)      │
└────────────────────────────────┬────────────────────────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
┌───────▼───────────┐ ┌──────────▼──────────┐ ┌───────────▼─────────┐
│   LOCAL CSV SOT   │ │ GOOGLE SHEETS SYNC  │ │  TOPOLOGICAL GRAPH  │
│  Bundled official │ │ Live GVIZ CSV feed  │ │ Coordinates, Edges, │
│    37 locations   │ │  'Rooms' worksheet  │ │  Walking Sim Nodes  │
└───────────────────┘ └─────────────────────┘ └─────────────────────┘
```

---

## 2. Location Data Record Schema

Every campus facility conforms to the `RoomRecord` interface:

| Field | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `id` | string (unique) | Unique identifier for the location | `LOC-AUD-C01` |
| `name` | string | Official display title of the facility | `College Auditorium` |
| `block` | string | Academic wing or outdoor zone | `Block C` |
| `floor` | string | Level or vertical placement | `1st Floor` |
| `roomNumber` | string | Official room number or `Not verified` | `Not verified` |
| `category` | string | High-level classification | `Seminar Halls` |
| `department` | string (optional) | Owning academic branch | `Administration` |
| `purpose` | string (optional) | Educational or operational use | `College assemblies & seminars` |
| `landmarkDirections`| string (optional) | Turn-by-turn physical directions | `Block C, 1st Floor, above Canteen`|
| `verificationStatus`| `'verified_official' \| 'unverified_sample'` | Audit flag | `verified_official` |

---

## 3. How to Update or Add Campus Locations

There are three supported workflows for updating campus facilities:

### Method A — Live Google Sheets Sync (Zero-Code, Recommended)
1. Open or create a Google Spreadsheet shared as **"Anyone with the link can view"**.
2. Name the worksheet tab **`Rooms`**.
3. Include the standard CSV header columns in Row 1:
   ```csv
   Room ID,Block,Floor,Room Number,Room Name,Category,Department,Directions
   ```
4. Add your facilities following the verified format.
5. In the app header, click **Google Sheets** and paste your Spreadsheet URL or ID.
6. Click **Save & Synchronize**. The twin will instantly load and validate the records.

### Method B — Bundled Official CSV (`/public/Campus_Digital_Twin_Important_Locations.csv`)
1. Edit `/public/Campus_Digital_Twin_Important_Locations.csv` directly in the project repository.
2. The format is standard comma-separated values:
   ```csv
   Room ID,Block,Floor,Room Number,Room Name,Category
   LOC-SEM-A01,Block A,1st Floor,Not verified,CSE Seminar Hall,Seminar Halls
   LOC-LAB-A01,Block A,3rd Floor,Not verified,Physics Labs,Labs
   LOC-AUD-C01,Block C,1st Floor,Not verified,College Auditorium,Seminar Halls
   LOC-CAN-C01,Block C,Ground Floor,Not verified,Canteen,Canteen
   ```
3. Commit and deploy. When unconfigured with Google Sheets, this CSV is loaded automatically as the verified baseline database.

### Method C — In-App Data Manager (Verified Faculty Only)
1. Sign in with a verified Faculty ID (e.g., `NECN-FAC-101`).
2. Click **Manage Data** in the header.
3. Switch to **Add New Room** to enter the facility details.
4. Or switch to **JSON Backup / Import** to export or import campus database dumps.

---

## 4. How to Add a New Building, Floor, or Sports Facility

### Adding a New Building or Zone
1. **Data layer**: In `Campus_Digital_Twin_Important_Locations.csv` or your Google Sheet, specify the new block name (e.g., `Block D`, `Mechanical Workshop Annex`, `Indoor Sports Complex`).
2. **Dynamic UI Filtering**: The `SearchAndFilters` component dynamically detects new blocks and floors from the dataset, automatically creating responsive filter buttons without hardcoded code changes.
3. **Schematic Map**:
   - If adding a physical building to the interactive SVG schematic, open `src/components/CampusSchematicMap.tsx`.
   - Add a `<g>` container with rectangular bounds, header banner, and click handler `handleAreaClick('block-d', 'Block D')`.
4. **Topological Graph (Route Finding)**:
   - In `src/data/campusPathNetwork.ts`, add a `CampusNode` for the new location:
     ```typescript
     'block-d-ground': {
       id: 'block-d-ground',
       name: 'Block D Entrance',
       shortCode: 'BLK-D-GF',
       category: 'Academic',
       block: 'Block D',
       floor: 'Ground Floor',
       x: 600,
       y: 400,
       isIndoor: true,
       isVerified: true,
       associatedRoomId: 'LOC-BLK-D01'
     }
     ```
   - Connect it to the nearest walkway node via `CAMPUS_EDGES` with physical distance in metres.

---

## 5. Security & Access Control Model (RBAC)

The application enforces strict separation between Student and Teacher permissions:

1. **Student Role**:
   - Identifier: Student Roll Number (e.g. `21711A0501`).
   - Permissions: Read-only access to Room Finder, map, routes, and personal dashboard.
   - Restrictions: Blocked from adding, editing, deleting, or importing location records.
2. **Teacher Role (Approved Faculty)**:
   - Identifier: Faculty ID (e.g. `NECN-FAC-101`).
   - Permissions: Full data management rights (adding rooms, editing records, JSON imports, cache resetting).
   - Approval Workflow: New faculty registrations are marked `pending_approval`. Privileges remain locked until approved by the Dean/Principal office.
3. **Runtime Authorization Guards**:
   - Role checks are enforced inside `RoomContext.tsx` (`addRoom`, `updateRoom`, `deleteRoom`, `importRoomsJSON`, `resetToDefaultRooms`).
   - If an unauthorized user dispatches a mutation, the operation is blocked and logged.
   - `DataManagerModal.tsx` contains an access-denied screen that prevents unauthorized rendering.
4. **Password Security**:
   - Passwords are never stored in plain-text, CSV files, or Google Sheets.
   - All passwords use cryptographic salting (16 random bytes via `crypto.getRandomValues`) and SHA-256 hashing via the Web Crypto API (`crypto.subtle.digest`).

---

## 6. Backup & Disaster Recovery Procedures

1. **Scheduled Backup**:
   - Faculty members can periodically export a full campus JSON snapshot via **Manage Data > JSON Backup / Export**.
   - Store the JSON file securely in college administrative archives.
2. **Instant Emergency Rollback**:
   - If invalid data is imported or live Google Sheets becomes corrupted, faculty can click **Reset to Official Database** inside the Data Manager.
   - This clears corrupted browser caches and immediately reloads the 37 official records from `Campus_Digital_Twin_Important_Locations.csv`.
3. **Google Sheets Disconnection**:
   - If a Google Spreadsheet becomes inaccessible, private, or deleted, the app automatically transitions `sheetsStatus` to `'error'` and safely falls back to local verified CSV records without crashing.

---

## 7. Future Feature Roadmap

The current architecture is prepared to support future extensions:

- **Laboratory Terminal Availability**: Expand `RoomRecord` with real-time terminal/workstation counts.
- **Campus Announcements & Events**: Hook into existing Google Sheets tabs (e.g., `Events` worksheet) to display college seminars on Auditorium & Seminar Hall cards.
- **Facility Maintenance Reporting**: Add an issue-reporting modal on individual `RoomCard` views for student feedback.
