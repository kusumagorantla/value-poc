---
title: 'Story 1.3: Station Mapping & Site-to-Edge Deployment Sync'
type: 'feature'
created: '2026-08-12'
status: 'done'
review_loop_iteration: 0
context:
  - 'AGENTS.md'
  - '_bmad-output/planning-artifacts/architecture.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Process Engineers need to map Process Steps to physical Line Stations (`LINE-1`, `ST060.1`), deploy the compiled model from the Site Admin Console UI to Edge PCs, and track bidirectional sync status (`SYNCED`, `EDGE_MODIFIED`).

**Approach:** Extend .NET 8 Web API with `StationStepMapping` model, endpoints (`POST /api/v1/process-steps/{stepId}/station-mappings`, `POST /api/v1/process-flows/{id}/deploy`), and React UI components.

## Boundaries & Constraints

**Always:** Follow .NET 8 Web API standards, EF Core 8 mappings, async/await throughout, and React functional component patterns.

**Ask First:** Changing existing database column names.

**Never:** Allow unassigned process steps during Edge PC deployment.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Map Step to Station | `POST /api/v1/process-steps/{stepId}/station-mappings` `{ "line_code": "LINE-1", "station_code": "ST060.1" }` | HTTP 201 Created with JSON StationStepMapping object | Return 404 if `stepId` does not exist |
| Deploy Flow to Edge PC | `POST /api/v1/process-flows/{id}/deploy` | HTTP 200 OK with `sync_status: "SYNCED"` and deployment timestamp | Return 400 if flow has no steps |

</frozen-after-approval>

## Code Map

- `src/Jarvis.Traceability.Api/Models/StationStepMapping.cs` -- Entity model for `station_step_mappings` table
- `src/Jarvis.Traceability.Api/Controllers/StationMappingsController.cs` -- REST API controller for mappings and deployment
- `frontend/src/components/StationMappingManager.tsx` -- React UI component for station assignment & Edge PC deployment

## Tasks & Acceptance

**Execution:**
- [x] `src/Jarvis.Traceability.Api/Models/StationStepMapping.cs` -- Implement StationStepMapping entity.
- [x] `src/Jarvis.Traceability.Api/Controllers/StationMappingsController.cs` -- Implement endpoints for station mapping and deployment.
- [x] `frontend/src/components/StationMappingManager.tsx` -- Build React UI for station mapping and "Deploy to Edge PC" action.

**Acceptance Criteria:**
- Given a Process Step (`11001 Housing Screwing`), when mapped to station `ST060.1` and deployed, then the API sets `sync_status = "SYNCED"` and returns deployment verification.

## Verification

**Commands:**
- `dotnet build` -- expected: Build succeeded with 0 errors
