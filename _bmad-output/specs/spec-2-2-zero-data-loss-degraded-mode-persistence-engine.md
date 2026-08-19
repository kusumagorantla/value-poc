---
title: 'Story 2.2: Zero Data Loss Degraded Mode Persistence Engine'
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

**Problem:** Incomplete, missing, or unregistered PLC context payloads must never be rejected or dropped, enforcing Valeo's 0% data loss mandate.

**Approach:** Implement `RecordingAuditLog` model in PostgreSQL 17 with a `jsonb` column (`raw_payload`) to capture full raw payload snapshots during degraded mode persistence.

## Boundaries & Constraints

**Always:** Persist all received payloads, store raw JSON in `jsonb` column, set `storage_mode = DEGRADED_MISSING_CONTEXT` for incomplete payloads.

**Ask First:** Changing audit log table structure.

**Never:** Throw unhandled exceptions or drop incoming PLC data.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Missing Station ID | Payload with `station_id: ""` | HTTP 200 OK with `storage_mode: "DEGRADED_MISSING_CONTEXT"`, raw JSON stored in `recording_audit_logs` | Fallback station set to `UNKNOWN_STATION` |

</frozen-after-approval>

## Code Map

- `src/Jarvis.Traceability.Api/Models/RecordingAuditLog.cs` -- Entity model for `recording_audit_logs` table
- `src/Jarvis.Traceability.Api/Services/ChannelAuditLogger.cs` -- Non-blocking background worker for raw JSONB audit snapshots
- `src/Jarvis.Traceability.Api/Controllers/TraceabilityIngestionController.cs` -- Extended controller handling degraded mode logging

## Tasks & Acceptance

**Execution:**
- [x] `src/Jarvis.Traceability.Api/Models/RecordingAuditLog.cs` -- Implement RecordingAuditLog model.
- [x] `src/Jarvis.Traceability.Api/Services/ChannelAuditLogger.cs` -- Implement async audit log writer.
- [x] `src/Jarvis.Traceability.Api/Controllers/TraceabilityIngestionController.cs` -- Integrate audit log snapshot writing on degraded mode.

**Acceptance Criteria:**
- Given a PLC payload missing station ID or step code, when submitted to the ingestion API, then the system persists the data with fallback IDs, logs the raw JSON in `recording_audit_logs`, and returns `200 OK` with `storage_mode: "DEGRADED_MISSING_CONTEXT"`.

## Verification

**Commands:**
- `dotnet build` -- expected: Build succeeded with 0 errors
