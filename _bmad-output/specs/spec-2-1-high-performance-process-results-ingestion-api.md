---
title: 'Story 2.1: High-Performance Process Results Ingestion API'
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

**Problem:** External PLCs, industrial computers, and traceability systems need an authenticated, high-performance REST API (`POST /api/v1/traceability/process-results`) to record machine cycle process results into PostgreSQL 17.

**Approach:** Implement `TraceabilityIngestionController` in .NET 8 Web API using Dapper prepared statements for high-speed record and value array insertions, returning execution feedback.

## Boundaries & Constraints

**Always:** Follow .NET 8 Web API standards, Dapper for high-speed inserts, async/await throughout, and non-anonymous authentication.

**Ask First:** Changing payload parameter names or HTTP response codes.

**Never:** Use synchronous `.Result` or block API execution threads.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Valid Process Result Call | `POST /api/v1/traceability/process-results` (Serial `cee348d8...`, Station `ST060.1`, 9 result values) | HTTP 200 OK with `status: "SUCCESS"`, `storage_mode: "STANDARD"`, `transaction_id`, and `records_inserted: 9` | Return HTTP 400 ProblemDetails if payload body fails DTO validation |

</frozen-after-approval>

## Code Map

- `src/Jarvis.Traceability.Api/Models/ProcessResultRecord.cs` -- Entity model for `process_result_records` table
- `src/Jarvis.Traceability.Api/Models/ProcessResultValue.cs` -- Entity model for `process_result_values` table
- `src/Jarvis.Traceability.Api/Dtos/TraceabilityIngestionDtos.cs` -- DTOs for PLC payload context and results array
- `src/Jarvis.Traceability.Api/Controllers/TraceabilityIngestionController.cs` -- REST API controller for high-speed ingestion

## Tasks & Acceptance

**Execution:**
- [x] `src/Jarvis.Traceability.Api/Models/ProcessResultRecord.cs` -- Implement ProcessResultRecord model.
- [x] `src/Jarvis.Traceability.Api/Models/ProcessResultValue.cs` -- Implement ProcessResultValue model.
- [x] `src/Jarvis.Traceability.Api/Dtos/TraceabilityIngestionDtos.cs` -- Implement JSON DTOs matching BUC-1 / BUC-2 specification.
- [x] `src/Jarvis.Traceability.Api/Controllers/TraceabilityIngestionController.cs` -- Implement Dapper-backed high-speed POST endpoint.

**Acceptance Criteria:**
- Given a valid JSON payload for serial `cee348d8-daa0-4730-8d5e-ac59311af94b` at station `ST060.1`, when submitted to `POST /api/v1/traceability/process-results`, then the API inserts the records into PostgreSQL 17 using Dapper and returns `200 OK` with `status: "SUCCESS"`.

## Verification

**Commands:**
- `dotnet build` -- expected: Build succeeded with 0 errors
