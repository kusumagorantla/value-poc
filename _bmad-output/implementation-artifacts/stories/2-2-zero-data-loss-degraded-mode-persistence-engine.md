# Story 2.2: Zero Data Loss Degraded Mode Persistence Engine

## Story Overview
* **Epic**: Epic 2 — Core Low-Latency Recording Engine, Handshaking & Degraded Mode (BUC-1 & BUC-2)
* **Status**: `ready-for-dev`
* **FRs Covered**: FR7 (Degraded Mode & Zero Data Loss Fallback)

---

## User Story
**As a** Quality Supervisor,  
**I want** incoming PLC payloads with missing or unregistered context (e.g. missing station ID or unlinked serial number) to be stored in Degraded Mode rather than dropped,  
**So that** Valeo MOM enforces a strict 0% data loss policy under all operating conditions.

---

## Acceptance Criteria

### AC1: Missing Context Fallback Ingestion
* **Given** an incoming PLC payload missing `station_id` or unregistered `process_step_id`,
* **When** submitted to `POST /api/v1/traceability/process-results`,
* **Then** the system MUST NOT reject the HTTP request, but instead save fallback records with `storage_mode = DEGRADED_MISSING_CONTEXT`.

### AC2: Raw JSON Payload Audit Logging
* **Given** a degraded mode transaction,
* **When** persisted,
* **Then** the raw JSON snapshot is saved into `recording_audit_logs.raw_payload` (`jsonb`) in `jarvis_edge_db`.
* **And** the API returns HTTP 200 OK with `status: "SUCCESS"` and `storage_mode: "DEGRADED_MISSING_CONTEXT"`.

---

## Technical Tasks
1. [.NET 8 API] Verify fallback ID resolution in `ProcessResultsRecorder.cs`.
2. [PostgreSQL 17] Ensure `recording_audit_logs` table contains `raw_payload` `jsonb` column.
3. [xUnit Tests] Maintain unit tests verifying missing station context produces `DEGRADED_MISSING_CONTEXT`.
