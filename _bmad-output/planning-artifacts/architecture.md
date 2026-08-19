# System Architecture Specification: JARVIS Process Result Traceability

**System**: Valeo MOM System (JARVIS Process Result Traceability Recording)  
**Methodology**: AI SDLC Framework (Valeo MOM Standards & VIB July 2026)  
**Document Version**: 2.0 (Refined)  
**Lead Agent**: Architect Agent (Winston)  
**Date**: August 13, 2026  

---

## 1. Architectural Paradigm & System Overview

JARVIS Traceability is designed as an **Edge-Native Containerized Architecture with Dual-Database Sync (Site vs Edge), High-Speed Ingestion Engine (<50ms SLA), and Embedded Grafana Quality Analytics**.

It features:
1. **Site Admin Console UI**: Central management where Process Engineers design master Process Flows (`MATERIAL-1`, `FLOW1`), Process Steps (`11001`), Process Operations (`123021`), and Process Result Definitions (Nominal, LSL, USL, UOM), deploying them to assigned production line Edge PCs.
2. **Edge PC Local Console UI**: Line-level interface running on Edge PCs for local process model viewing/editing, PLC payload simulation, real-time result inspection, and degraded mode audit logging.
3. **Dual Database Architecture**:
   - **Site Central Database (`jarvis_site_db`)**: Master repository storing central process models, line configurations, and cross-line reports.
   - **Edge Line Database (`jarvis_edge_db`)**: Autonomous line-level store for sub-50ms PLC API calls and local line operations.
4. **.NET 8.0 Web API Engine**: High-throughput REST API processing PLC machine cycle calls under < 50ms SLA using non-blocking background channels (`Channel<T>`).
5. **PostgreSQL 17.0 Relational & Audit Database**: Stores relational metadata, process result records, and raw JSON payloads (`jsonb`) for zero-data-loss degraded mode recovery.
6. **Grafana Reporting Engine**: Pre-configured Grafana dashboards connected directly to PostgreSQL 17 to visualize part-level quality trends, torque/angle distribution, cycle times, and degraded mode logs.

```mermaid
C4Component
title Component Diagram - Dual Database JARVIS Traceability Architecture

Container(site_ui, "Site Admin Console UI", "React 18 + Vite", "Central 4-Tier Process Flow Modeler & Edge Deployment Manager")
Container(edge_ui, "Edge PC Local Console & Simulator", "React 18 + Vite", "Line-level Model Inspector, Local Editor & PLC Simulator")
Container(plc, "PLC / Machine Control Device", "Siemens S7 / OPC UA / REST", "Generates machine cycle process result signals")
Container(dotnet_api, ".NET 8.0 Web API Engine", "C# ASP.NET Core 8", "Processes REST requests, handles Site-Edge sync, executes degraded mode fallback")
ContainerDb(site_db, "Site Database (jarvis_site_db)", "PostgreSQL 17.0", "Central Master Store for Process Flows & Line Master Settings")
ContainerDb(edge_db, "Edge Database (jarvis_edge_db)", "PostgreSQL 17.0", "Autonomous Line Store for <50ms Ingestion & Audit Logs")
Container(grafana, "Grafana Report / Dashboards", "Grafana Latest", "Visualizes real-time process results, torque/angle trends, and degraded mode logs")

Rel(site_ui, dotnet_api, "Process Flow Design & Deployment", "REST / HTTP")
Rel(edge_ui, dotnet_api, "Local Model Edits & Bidirectional Sync", "REST / HTTP")
Rel(plc, dotnet_api, "POST /api/v1/traceability/process-results (Handshake ACK)", "REST / HTTP")
Rel(dotnet_api, site_db, "SiteDbContext EF Core Queries", "TCP / Port 5432")
Rel(dotnet_api, edge_db, "EdgeDbContext Dapper & EF Core Queries", "TCP / Port 5432")
Rel(grafana, edge_db, "SQL Queries (Read Replica)", "TCP / Port 5432")
```

---

## 2. Architectural Decisions (ADs)

### `AD-1`: **.NET 8.0 Web API Core Engine** `[ADOPTED]`
* **Binds**: Backend framework selection.
* **Prevents**: Technology fragmentation and latency bottlenecks during PLC API handshakes.
* **Rule**: Backend built with ASP.NET Core Web API on .NET 8.0. Uses EF Core 8.0 for BUC-0 metadata configuration and Dapper for ultra-fast BUC-1/BUC-2 process result array insertions.

### `AD-2`: **Dual Database Synchronization Pattern (Site DB vs Edge DB)** `[ADOPTED]`
* **Binds**: Multi-tier persistence architecture.
* **Prevents**: Central network dependency stalling line-level PLC manufacturing operations.
* **Rule**: Edge PC operates autonomously against `jarvis_edge_db`. Deploying from Site sets `sync_status = SYNCED`. Local Edge PC modifications set `sync_status = EDGE_MODIFIED` and synchronize back to `jarvis_site_db`.
* **Automated Background Sync Worker**: .NET 8 `SiteEdgeSyncBackgroundService` (`BackgroundService`) runs a non-blocking background polling loop every 30 seconds to reconcile `jarvis_site_db` and `jarvis_edge_db` automatically, flushing pending sync queues and updating status to `SYNCED` without requiring manual user intervention.

### `AD-3`: **Zero-Data-Loss Degraded Mode Engine** `[ADOPTED]`
* **Binds**: Payload validation and error recovery rules.
* **Prevents**: Data loss during PLC-Edge communication when context information is incomplete or unlinked.
* **Rule**: All received payloads MUST be persisted. If a station or step ID is missing/unregistered, store under fallback IDs with `storage_mode = DEGRADED_MISSING_CONTEXT` and log a raw JSON snapshot in `recording_audit_logs.raw_payload` (`jsonb`).

### `AD-4`: **Synchronous Latency Protection (< 50ms SLA)** `[ADOPTED]`
* **Binds**: API response pipeline.
* **Prevents**: Physical machine line cycle delays caused by software handshake waiting time.
* **Rule**: Database operations use pre-warmed connection pools and prepared batch statements. Telemetry logging is dispatched asynchronously via non-blocking background channel (`ChannelAuditLogger.cs`) so the HTTP response returns to the PLC within 50ms.

### `AD-5`: **ReactJS Site Admin Console & Edge PC Simulator UI** `[ADOPTED]`
* **Binds**: User interface architecture.
* **Prevents**: Separation between central process configuration and line-level operation.
* **Rule**: SPA built using React 18 with TypeScript providing:
  1. **Site Admin Console UI**: Central 4-tier process modeling (Flow ➔ Step ➔ Operation ➔ Result Definitions), station assignments, and "Deploy to Edge PC" action.
  2. **Edge PC Local UI**: Line-level process inspector, local flow editor, interactive PLC Handshake Simulator, and live database results/audit log viewer.

---

## 3. PostgreSQL 17 Database Schema (4-Tier Hierarchy & Ingestion)

```mermaid
erDiagram
    process_flows ||--o{ process_steps : contains
    process_steps ||--o{ process_operations : contains
    process_steps ||--o{ station_step_mappings : mapped_to
    process_operations ||--o{ process_result_definitions : defines
    process_result_records ||--o{ process_result_values : contains
    
    process_flows {
        uuid id PK
        string product_id
        string flow_code
        string description
        string sync_status
        timestamp created_at
    }
    
    process_steps {
        uuid id PK
        uuid flow_id FK
        integer step_code
        string step_name
        integer step_order
    }
    
    station_step_mappings {
        uuid id PK
        string line_code
        string station_code
        uuid step_id FK
    }
    
    process_operations {
        uuid id PK
        uuid step_id FK
        integer operation_code
        string operation_name
    }
    
    process_result_definitions {
        uuid id PK
        uuid operation_id FK
        integer result_code
        string result_name
        integer result_type
        string uom
        decimal nominal
        decimal lsl
        decimal usl
        boolean is_mandatory
    }
    
    process_result_records {
        uuid id PK
        string serial_number
        string station_code
        integer step_code
        integer station_mode
        integer step_result
        string failure_code
        string wpc_no
        decimal machine_time
        decimal cycle_time
        timestamp device_timestamp
        string storage_mode
        timestamp created_at
    }
    
    process_result_values {
        uuid id PK
        uuid record_id FK
        integer operation_code
        integer result_code
        decimal value_numeric
        string value_text
        string value_file_ref
    }
```

---

## 4. API Endpoints & DTO Contracts

### 1. Ingestion Endpoint
- `POST /api/v1/traceability/process-results`
- Supports both **Nested VIB Format** (`product_context`, `process_context`, `time_context`, `process_results`) and **Flat API Format** (`ProductSerialNo`, `StationId`, `ProcessStepId`, `ProcessResults`).
- Response:
```json
{
  "status": "SUCCESS",
  "storage_mode": "STANDARD",
  "transaction_id": "tx_a1b2c3d4",
  "processed_at": "2026-08-13T22:25:00Z",
  "latency_ms": 12.4,
  "records_inserted": 2,
  "errors": []
}
```

### 2. Process Flow & Edge Sync Endpoints
- `GET /api/v1/process-flows`: Fetch all master process flows from `SiteDbContext`.
- `GET /api/v1/process-flows/edge`: Fetch active process flows on `EdgeDbContext`.
- `PUT /api/v1/process-flows/edge-edit/{flowId}`: Edit process model directly on Edge PC, update status to `EDGE_MODIFIED`, and sync back to `SiteDbContext`.

### 3. AI SDLC Workflow Orchestration API Endpoints
- `GET /api/v1/ai-sdlc/phases`: Returns live 6-phase metadata array with current gate statuses (`APPROVED`, `IN_REVIEW`, `PENDING`), assigned agents, token counts, and cost metrics.
- `GET /api/v1/ai-sdlc/artifacts/{filename}`: Streams raw markdown deliverables directly from server disk (`01_requirements_analyst_report.md` through `05_qa_reviewer_report.md`, `requirements.md`, `architecture.md`, `epics.md`, `AI_ENGINEERING_LOG.md`).
- `POST /api/v1/ai-sdlc/gates/{phaseNumber}/approve`: Approves specified phase gate, appends audit timestamp to `AI_ENGINEERING_LOG.md` on disk, transitions phase $N$ to `APPROVED`, and unlocks phase $N+1$ to `IN_REVIEW`.
- `POST /api/v1/ai-sdlc/reset-gates`: Resets stage-gate state back to Phase 01 (`IN_REVIEW`) for presentation and re-testing.

