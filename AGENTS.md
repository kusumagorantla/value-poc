<!-- AGENTS-BLOCK-BEGIN -->
<!-- Provenance: 2026-08-13 | Scope: AI-SDLC-BMAD | Verified: true -->

# Agent Guidelines & Shared Engineering Standards: JARVIS Traceability

> **Standing Instructions**: All AI agents (Orchestrator, PM/Analyst, Architect, UX Designer, Senior Developer, QA/Reviewer) operating in this repository MUST strictly follow the guidelines below, derived from the core project standards in [`standard/`](file:///c:/Valeo/AI-SDLC-BMAD/standard/).

---

## Project Overview & Core Architecture
* **Name**: JARVIS Process Result Traceability Recording (Valeo MOM)
* **Stack**: .NET 8.0 Web API (Backend), React 18 + TypeScript + Vite (Frontend), PostgreSQL 17 (Database), Docker & Docker Compose (Infra/GCP).
* **Dual Database Architecture**:
  * **Site Central Database (`jarvis_site_db`)**: Stores Master Process Flows (`MATERIAL-1`, `FLOW1`), Result Definitions, and Central Station Mappings.
  * **Edge Line Database (`jarvis_edge_db`)**: Autonomous line-level store for sub-50ms API calls, local process flows, and degraded mode audit logs.
  * **Bidirectional Sync**: Pushing from Site Admin Console sets `sync_status = SYNCED`. Local Edge PC modifications update status to `EDGE_MODIFIED` and sync back to Site DB.

---

## Core Engineering & Coding Guardrails

### 1. .NET 8.0 Backend Standards ([`dotnet-best-practices.md`](file:///c:/Valeo/AI-SDLC-BMAD/standard/dotnet-best-practices.md))
* **Target Framework**: .NET 8.0 with `<Nullable>enable</Nullable>` and `<TreatWarningsAsErrors>true</TreatWarningsAsErrors>`.
* **Async Non-Blocking**: All I/O operations MUST use `async`/`await` with `CancellationToken`. NEVER use `.Result` or `.Wait()`.
* **Low Latency SLA (< 50ms)**: Synchronous API calls (`POST /api/v1/traceability/process-results`) must complete under 50ms SLA. Telemetry logging dispatched via non-blocking background queue (`Channel<T>`).
* **Resilience & Exceptions**: Catch, log raw payload in `recording_failure_log`, persist in `DEGRADED_MISSING_CONTEXT` mode, and return RFC 7807 `ProblemDetails` or structured `RecordResult` status.
* **Testing**: xUnit unit and integration tests (`WebApplicationFactory`) covering Full, Degraded, and Rejected paths.

### 2. ReactJS & UX Standards ([`react-best-practices.md`](file:///c:/Valeo/AI-SDLC-BMAD/standard/react-best-practices.md))
* **Stack**: React 18 + TypeScript + Vite + Tailwind CSS.
* **Strict TypeScript**: `"strict": true`, no `any` types. Explicit domain unions (e.g. `StationMode`, `StepResult`).
* **UI Architecture**: Feature-first folder structure (`src/features/process-model/`, `src/features/results/`, `src/api/`). Separate Site Admin Console UI and Edge PC Local Console UI.
* **State & Forms**: Local state or TanStack Query for server state; Zod form schema validation before submit.
* **Badged Visuals & Accessibility**: Explicit visual badges for `FULL` vs. `DEGRADED_MISSING_CONTEXT` vs. `EDGE_MODIFIED`. Keyboard accessible with semantic HTML.

### 3. Data & PostgreSQL 17 Standards ([`data-best-practices.md`](file:///c:/Valeo/AI-SDLC-BMAD/standard/data-best-practices.md))
* **Zero Data Loss Guarantee**: Incomplete or unlinked payloads MUST be stored in `DEGRADED_MISSING_CONTEXT` mode. Raw JSON payloads saved in `recording_audit_logs.raw_payload` (`jsonb`).
* **Schema Flexibility**: `extra` / `payload_jsonb` (`jsonb`) column to accept unmodeled/unforeseen PLC fields without schema migrations.
* **Repetitive Manufacturing Model**: No discrete Production Orders. Anchor data to **Part Number + Line/Station + Serial or Batch Number**.
* **Time Context**: Store `device_ts` as-is (`TIMESTAMPTZ`), plus server system time (`system_ts`).

### 4. Infrastructure & Containerization Standards ([`infra-best-practises.md`](file:///c:/Valeo/AI-SDLC-BMAD/standard/infra-best-practises.md))
* **One-Command Execution**: `docker compose up` starts API, UI, Dual PostgreSQL, and Grafana.
* **Multi-Stage Dockerfiles**: Non-root user in lightweight runtime images (`dotnet/aspnet:8.0` and `nginx:alpine`).
* **Grafana Provisioning**: Provisioned as code (`grafana/provisioning/`) with dashboard panels for latency (<50ms SLA) and Full/Degraded/Failed payload counts.
* **Health Checks**: `/healthz` liveness and `/ready` readiness endpoints returning 200 OK.

---

## Commands Reference
* **Backend Build & Test**: `dotnet build` | `dotnet test`
* **Backend Run**: `dotnet run --project src/Jarvis.Traceability.Api`
* **Frontend Dev**: `npm run dev` (in `frontend/`)
* **Docker Compose**: `docker-compose up --build -d`

<!-- AGENTS-BLOCK-END -->
