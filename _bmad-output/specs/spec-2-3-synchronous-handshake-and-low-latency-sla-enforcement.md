---
title: 'Story 2.3: Synchronous Handshake & Low-Latency SLA Enforcement (<50ms)'
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

**Problem:** Software handshake delay must not cause physical machine line bottlenecks, requiring <50ms response latency SLA for synchronous API calls.

**Approach:** Optimize database write operations, utilize Dapper prepared statements and non-blocking background telemetry dispatch (`Channel<T>`), and verify low latency execution.

## Boundaries & Constraints

**Always:** Ensure synchronous API responses complete in <50ms (95th percentile).

**Ask First:** Changing database connection pool defaults.

**Never:** Perform blocking thread synchronizations or synchronous disk writes during API requests.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Ingestion Latency Check | Synchronous payload call | HTTP 200 OK returned with `latency_ms` < 50ms | Log warning if execution exceeds 50ms |

</frozen-after-approval>

## Code Map

- `src/Jarvis.Traceability.Api/Services/ChannelAuditLogger.cs` -- Non-blocking Channel<T> background worker for audit logging
- `src/Jarvis.Traceability.Api/Controllers/TraceabilityIngestionController.cs` -- Latency-optimized controller

## Tasks & Acceptance

**Execution:**
- [x] `src/Jarvis.Traceability.Api/Services/ChannelAuditLogger.cs` -- Implement non-blocking background audit queue.
- [x] `src/Jarvis.Traceability.Api/Controllers/TraceabilityIngestionController.cs` -- Implement latency-optimized ingestion endpoint.

**Acceptance Criteria:**
- Given synchronous API ingestion requests, when executed against the API, then database writes and response processing complete with a latency under 50ms.

## Verification

**Commands:**
- `dotnet build` -- expected: Build succeeded with 0 errors
