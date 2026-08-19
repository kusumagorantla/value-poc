# Story 1.3: Station Mapping & Dual DB Site-to-Edge Deployment Sync

## Story Overview
* **Epic**: Epic 1 — Foundation, Site Admin Console & 4-Tier Process Modeling (BUC-0)
* **Status**: `ready-for-dev`
* **FRs Covered**: FR4 (Station Mapping & Step Assignment), FR5 (Dual Database Site-to-Edge Deployment & Sync)

---

## User Story
**As a** Process Engineer,  
**I want** to map process steps to physical line stations (e.g. `ST060.1`, `ST070`) and deploy the compiled process model from `jarvis_site_db` to `jarvis_edge_db` with bidirectional sync,  
**So that** Edge PCs receive active process configurations and local line modifications synchronize back to the Site Server.

---

## Acceptance Criteria

### AC1: Station Mapping API
* **Given** a Process Step (e.g. `11001`),
* **When** assigned to station `ST060.1` on line `LINE-1`,
* **Then** the API persists the mapping in `station_step_mappings` table.

### AC2: Site-to-Edge Model Deployment
* **Given** a master process model in `jarvis_site_db`,
* **When** the engineer clicks "Deploy to Edge PC",
* **Then** the system copies the active flow configuration to `jarvis_edge_db` and sets `sync_status = "SYNCED"`.

### AC3: Bidirectional Sync & Badge
* **Given** an active flow on Edge PC Local Console UI,
* **When** a local modification is made directly on the Edge PC UI,
* **Then** the system updates `sync_status = "EDGE_MODIFIED"`, renders the amber `EDGE_MODIFIED` badge, and syncs changes back to `jarvis_site_db`.

### AC4: Automatic Background Synchronization Worker
* **Given** local `EDGE_MODIFIED` or un-synchronized process models in `jarvis_edge_db`,
* **When** the .NET 8 Web API `SiteEdgeSyncBackgroundService` (`IHostedService`) executes its periodic background loop (every 30 seconds),
* **Then** it automatically reconciles differences between `jarvis_edge_db` and `jarvis_site_db`, updates `sync_status` to `"SYNCED"`, and emits live heartbeat status events to the Edge PC UI without manual user triggers.

---

## Technical Tasks
1. [.NET 8 API] Implement station mapping endpoints and dual DB sync service (`SiteDbContext` ↔ `EdgeDbContext`).
2. [.NET 8 API] Create `PUT /api/v1/process-flows/edge-edit/{flowId}` endpoint for Edge PC local modifications.
3. [.NET 8 API] Implement `SiteEdgeSyncBackgroundService.cs` (`IHostedService`) for automated background reconciliation every 30 seconds.
4. [React UI] Add "Deploy to Edge PC" action button, dynamic `SYNCED` / `EDGE_MODIFIED` status badge, and background auto-sync heartbeat indicator.
