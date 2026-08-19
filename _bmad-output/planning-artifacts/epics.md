---
stepsCompleted: ["step-01-validate-prerequisites", "step-02-design-epics", "step-03-create-stories"]
inputDocuments: ["requirements.md", "architecture.md", "ux_design_spec.md", "AGENTS.md"]
---

# AI-SDLC-BMAD (JARVIS Traceability) — Refined Epics & User Stories

## Overview

This document provides the canonical epic and story breakdown for **JARVIS Process Result Traceability Recording**, decomposing requirements from the VIB Requirements, System Architecture, UX Design Spec, and Engineering Standards into implementable user stories.

---

## Requirements Inventory

### Functional Requirements

* **FR1**: **Process Flow Creation (BUC-0)** — Site Admin Console UI enables Process Engineers to create and edit manufacturing process flows for Part Numbers (`MATERIAL-1`, `FLOW1`).
* **FR2**: **4-Tier Process Steps & Operations Definition (BUC-0)** — Define 4-tier hierarchy: Process Flow ➔ Process Steps (`11001 Housing Screwing`) ➔ Process Operations (`123021 Screw 1`, `123022 Screw 2`).
* **FR3**: **Process Results Specification & Tolerance Limits (BUC-0)** — Define process result metrics per operation with Result Name, Type (Numeric Decimal, Text, File Ref), Specification Limits (LSL, USL, Nominal), UOM (`DD`, `NU`), and Mandatory flag.
* **FR4**: **Station Mapping & Step Assignment (BUC-0)** — Map process steps to physical line stations (`LINE-1`, `ST060.1`, `ST060.2`, `ST070`).
* **FR5**: **Dual Database Site-to-Edge Deployment & Sync (BUC-0)** — Deploy compiled process models from Site Admin Console UI (`jarvis_site_db`) to line Edge PCs (`jarvis_edge_db`), with bidirectional sync for line-level modifications (`SYNCED` ↔ `EDGE_MODIFIED`).
* **FR6**: **Standard Process Results Recording Engine (BUC-1)** — Core Edge .NET 8 API captures process result data containing Process Context, Product Context, Time Context, and Process Results Data Array into `jarvis_edge_db` (PostgreSQL 17).
* **FR7**: **Degraded Mode & Zero Data Loss Fallback (BUC-1)** — Store incomplete/unknown context payloads in degraded mode (`DEGRADED_MISSING_CONTEXT`) with diagnostic warning logs rather than dropping transactions.
* **FR8**: **External REST API Endpoints & Dual JSON Support (BUC-2)** — `POST /api/v1/traceability/process-results` supporting both VIB nested JSON and flat DTO formats, with non-anonymous authentication.
* **FR9**: **Interactive React PLC Simulator & Handshake Inspector** — React UI for simulating PLC machine cycle payload submissions, testing synchronous PLC handshake ACK protocol (`<50ms`), degraded mode, and inspecting recorded database results in real time.
* **FR10**: **Grafana Analytics & Quality Reporting (VIB Page 8)** — Pre-configured Grafana dashboards connected to PostgreSQL 17 to visualize part-level quality trends, LSL/USL tolerance charts, torque/angle distribution, and degraded mode log counts.

### Non-Functional Requirements

* **NFR1**: **Low Latency Synchronous Handshake SLA** — Synchronous API calls must return HTTP feedback in `< 50ms` (95th percentile) to protect machine cycle time.
* **NFR2**: **High Database Throughput** — Edge PostgreSQL 17 database inserts must complete in `< 15ms` per record using Dapper prepared batch statements.
* **NFR3**: **100% Data Integrity Guarantee** — Zero data loss policy under network or context failures.
* **NFR4**: **Authenticated Access Control** — All API calls and administrative UI routes require authenticated access (tokens/badges).
* **NFR5**: **Containerized Portability & Cloud Readiness** — Application services packaged in multi-stage Docker containers (`docker-compose.yml`) ready for Cloud Run / GKE deployment.

---

## Epic List

### Epic 1: Foundation, Site Admin Console & 4-Tier Process Modeling (BUC-0)
Process Engineers can centrally model 4-tier manufacturing process flows (Flow ➔ Step ➔ Operation ➔ Result Definitions with LSL/USL/UOM), assign stations, deploy from `jarvis_site_db` to `jarvis_edge_db`, and synchronize local line modifications bidirectionally (`SYNCED` ↔ `EDGE_MODIFIED`).
**FRs covered:** FR1, FR2, FR3, FR4, FR5

### Epic 2: Core Low-Latency Recording Engine, Handshaking & Degraded Mode (BUC-1 & BUC-2)
PLCs, industrial computers, and external clients can transmit process result payloads via authenticated REST API (`POST /api/v1/traceability/process-results`) with synchronous handshake ACK protocol under <50ms response latency SLA and 0% data loss degraded mode fallback persistence.
**FRs covered:** FR6, FR7, FR8

### Epic 3: Interactive PLC Simulator & Grafana Analytics Reporting (VIB Page 8)
Evaluators can use an interactive React PLC payload trigger simulator with handshake ACK controls, station mode selectors, and live audit inspectors, alongside containerized Grafana dashboards connecting directly to PostgreSQL 17 for real-time quality analytics.
**FRs covered:** FR9, FR10

### Epic 4: Target AI-Enabled Delivery Workflow Orchestration Console
Evaluators and engineering leads can visualize, stream, and govern the 6-phase AI SDLC delivery lifecycle through an interactive React UI console featuring live disk report streaming, token utilization analytics, and persistent human stage-gate approval controls.
**FRs covered:** Delivery Governance Framework

---

## Detailed Stories Breakdown

### Epic 1: Foundation, Site Admin Console & 4-Tier Process Modeling (BUC-0)

#### Story 1.1: Process Flow & Step Management API & UI
As a Process Engineer,  
I want to create and manage manufacturing Process Flows and Process Steps for product references (e.g. `MATERIAL-1`, `FLOW1`),  
So that the system establishes the digital representation of the production process line.

**Acceptance Criteria:**
* **Given** an authenticated Process Engineer in the Site Admin Console UI,
* **When** they create a Process Flow for product `MATERIAL-1` with flow code `FLOW1` and add steps (`11001 Housing Screwing`, `11002 Body Sub Assembly 1`, `11005 Final Test`, `11006 Packing`),
* **Then** the .NET 8 API creates the records in `jarvis_site_db` via EF Core 8 and returns HTTP 201 Created.
* **And** the UI updates to display the ordered process flow hierarchy.

#### Story 1.2: 4-Tier Process Operations & Result Definitions Manager (LSL / USL / UOM)
As a Process Engineer,  
I want to define Process Operations and Process Results (with Nominal, LSL, USL, UOM, and Mandatory flags) for each process step in a 4-tier hierarchy,  
So that incoming PLC process measurements can be validated against expected parameter specifications.

**Acceptance Criteria:**
* **Given** a Process Step (e.g. `[11001] Housing Screwing`),
* **When** the Process Engineer defines operation `[123021] Screw 1` with result `[50032] Angle` (Numeric DD, Nominal 90, LSL 80, USL 100, Mandatory) and `[50033] Torque` (Numeric NU, Nominal 5, LSL 4.5, USL 5.5, Mandatory),
* **Then** the metadata is persisted in `process_operations` and `process_result_definitions` tables in PostgreSQL 17.
* **And** the 4-tier hierarchy (Flow ➔ Step ➔ Operation ➔ Result Definitions) appears in the Site Admin Console UI and Edge PC Local Console UI.

#### Story 1.3: Station Mapping & Dual DB Site-to-Edge Deployment Sync
As a Process Engineer,  
I want to map process steps to physical line stations (e.g. `ST060.1`, `ST070`) and deploy the compiled process model from `jarvis_site_db` to `jarvis_edge_db` with bidirectional sync,  
So that Edge PCs receive active process configurations and local line modifications synchronize back to the Site Server.

**Acceptance Criteria:**
* **Given** a compiled process model for `MATERIAL-1` on `LINE-1`,
* **When** the engineer assigns step `11001` to station `ST060.1` and clicks "Deploy to Edge PC",
* **Then** the API sets the flow `sync_status` to `SYNCED` and pushes the configuration to `jarvis_edge_db`.
* **And** any local edit made on the Edge PC UI updates the status to `EDGE_MODIFIED` and syncs back to `jarvis_site_db`.

#### Story 1.4: Containerized Multi-Stage Build & Docker Compose Infrastructure Provisioning
As a DevOps Engineer / System Evaluator,  
I want multi-stage Dockerfiles and a unified `docker-compose.yml` manifest orchestrating API, UI, PostgreSQL 17, and Grafana,  
So that the entire Valeo MOM solution can be started with a single `docker compose up` command.

**Acceptance Criteria:**
* **Given** a clean deployment environment with Docker installed,
* **When** executing `docker compose up --build -d`,
* **Then** Docker builds the .NET 8 Web API image using multi-stage non-root runtime (`dotnet/aspnet:8.0`) and React UI image using `nginx:alpine`.
* **And** launches `jarvis-postgres` (PostgreSQL 17), `jarvis-backend-api` (Port 5000), `jarvis-react-ui` (Port 80), and `jarvis-grafana-reports` (Port 3000).
* **And** `/healthz` and `/ready` health checks return HTTP 200 OK across all services.

#### Story 1.5: GCP Cloud Infrastructure Deployment & AlloyDB Configuration
As a Cloud & DevOps Engineer,  
I want the application configured to connect securely to provisioned GCP infrastructure (VPC, Subnets, PSA, App Engine, AlloyDB, and Grafana VM),  
So that Valeo MOM runs in GCP production with secure private database connectivity and cloud analytics.

**Acceptance Criteria:**
* **Given** provisioned GCP infrastructure (VPC, Subnet, PSA, App Engine, AlloyDB, and Grafana VM),
* **When** deploying the .NET 8 Web API to App Engine with Serverless VPC Access connector,
* **Then** `app.yaml` passes connection strings pointing to AlloyDB Private IP (`jarvis_site_db` & `jarvis_edge_db`).
* **And** database initialization script `scripts/init-db.sql` creates the database schemas on GCP AlloyDB over Private Service Access (PSA).
* **And** Grafana on VM connects to AlloyDB `jarvis_edge_db` using imported dashboard spec [`valeo_traceability_quality.json`](file:///c:/Valeo/AI-SDLC-BMAD/grafana/dashboards/valeo_traceability_quality.json).

#### Story 1.6: Infrastructure as Code (Terraform) & Automated CI/CD Deployment Pipelines
As a DevOps / Cloud Platform Engineer,  
I want Terraform Infrastructure as Code (IaC) modules and automated CI/CD pipeline workflows (Google Cloud Build / GitHub Actions),  
So that GCP Cloud Infrastructure (VPC, Private Service Access, AlloyDB Cluster, App Engine / Cloud Run, and Grafana VM) and application releases can be declaratively provisioned and continuously deployed without manual steps.

**Acceptance Criteria:**
* **Given** GCP credentials and project configuration,
* **When** executing `terraform apply` or triggering the CI/CD pipeline,
* **Then** Terraform declaratively provisions custom VPC, Subnets, Private Service Access (PSA), Serverless VPC Access connector, AlloyDB cluster, App Engine/Cloud Run service, and Grafana VM.
* **And** CI/CD pipeline (`.github/workflows/deploy.yml` / `cloudbuild.yaml`) automatically runs tests, builds Docker container images, pushes to GCP Artifact Registry, and deploys code releases.

---

### Epic 2: Core Low-Latency Recording Engine, Handshaking & Degraded Mode (BUC-1 & BUC-2)

#### Story 2.1: High-Performance Process Results Ingestion API (`POST /api/v1/traceability/process-results`)
As an external PLC / Industrial Computer,  
I want to transmit process result payloads containing Process Context, Product Context, Time Context, and Process Results Data Arrays via an authenticated REST API,  
So that Valeo MOM records part-level traceability measurements into Edge PostgreSQL 17 storage.

**Acceptance Criteria:**
* **Given** a valid JSON payload from station `ST060.1` for serial `cee348d8-daa0-4730-8d5e-ac59311af94b` containing process result items,
* **When** submitted to `POST /api/v1/traceability/process-results` (supporting both VIB nested JSON and flat DTO formats),
* **Then** the .NET 8 API parses the payload and inserts records into `process_result_records` and `process_result_values` in `jarvis_edge_db`.
* **And** returns HTTP 200 OK with `status: "SUCCESS"`, `storage_mode: "STANDARD"`, and unique `transaction_id`.

#### Story 2.2: Zero Data Loss Degraded Mode Persistence Engine
As a Quality Supervisor,  
I want incoming PLC payloads with missing or unregistered context (e.g. missing station ID or unlinked serial number) to be stored in Degraded Mode rather than dropped,  
So that Valeo MOM enforces a strict 0% data loss policy under all operating conditions.

**Acceptance Criteria:**
* **Given** an incoming PLC payload with missing `station_id` or unregistered `product_serial_no`,
* **When** submitted to the ingestion API endpoint,
* **Then** the system MUST NOT reject the HTTP call, but instead persist the raw payload with fallback IDs, set `storage_mode = DEGRADED_MISSING_CONTEXT`, and write an entry in `recording_audit_logs.raw_payload` (`jsonb`).
* **And** return HTTP 200 OK with `status: "SUCCESS"` and `storage_mode: "DEGRADED_MISSING_CONTEXT"`.

#### Story 2.3: Synchronous Handshake Protocol & Low-Latency SLA Enforcement (<50ms)
As a Line Systems Engineer,  
I want synchronous recording calls to return PLC handshake ACK signals in under 50ms,  
So that software communication delays do not create physical machine cycle bottlenecks.

**Acceptance Criteria:**
* **Given** a synchronous API call with PLC Handshake ACK enabled,
* **When** executing under concurrent load,
* **Then** database insertions complete in <15ms via connection pooling and non-blocking background audit logging (`ChannelAuditLogger.cs`), returning the HTTP response with handshake ACK in <50ms (95th percentile).

---

### Epic 3: Interactive PLC Simulator & Grafana Analytics Reporting (VIB Page 8)

#### Story 3.1: React Interactive PLC Simulator, Handshake Controls & Audit Inspector
As an Evaluator / Quality Inspector,  
I want an interactive React UI simulator with PLC Handshake ACK controls, station mode selectors (`Serial`, `Rework`, `MasterSample`), and step result selectors (`PASS`, `NOK`, `SCRAP`),  
So that I can visually verify the system's traceability recording, handshake protocol, and zero-data-loss capabilities live.

**Acceptance Criteria:**
* **Given** the React UI on the Edge PC Console,
* **When** the user configures handshake ACK, selects station mode/step result, chooses a preset trigger (`Standard Cycle`, `Missing Context Degraded Mode`, `Multi-Result NOK Cycle`), and clicks "Trigger PLC Machine Cycle",
* **Then** the UI transmits the payload to the API, displays response latency in milliseconds with a `< 50ms SLA PASS` badge, and updates the live audit log table in real time.

#### Story 3.2: Grafana Quality Analytics Dashboard & PostgreSQL Integration
As an APU Supervisor / Quality Engineer,  
I want pre-configured Grafana dashboards connected to PostgreSQL 17 to visualize part-level quality measurements, torque/angle distribution, and degraded mode log trends,  
So that I can perform real-time root cause analysis and quality monitoring as specified in VIB Page 8.

**Acceptance Criteria:**
* **Given** the `jarvis-grafana-reports` container running on port 3000,
* **When** connected to PostgreSQL 17,
* **Then** the Grafana dashboard displays real-time part quality metrics for serial numbers, torque/angle tolerance charts against LSL/USL, and degraded mode incident trends.
* **And** updates automatically as new PLC payloads are ingested.

---

### Epic 4: Target AI-Enabled Delivery Workflow Orchestration Console

#### Story 4.1: AI SDLC UI Orchestration Console & Dynamic Stage-Gate Governance
As an Engineering Lead / Evaluator,  
I want an interactive UI console visualizing all 6 AI SDLC stages with live disk artifact streaming, agent token economics metrics, and persistent stage-gate approval controls,  
So that I can govern the delivery lifecycle and verify human-in-the-loop sign-offs dynamically.

**Acceptance Criteria:**
* **Given** an authenticated user on the AI SDLC Workflow Orchestration tab,
* **When** viewing the 6-phase stepper,
* **Then** Phase 01 displays active status (`In Review ⏳`) and Phases 02–06 show locked status (`Locked 🔒`).
* **And** selecting a phase streams the raw markdown report directly from server disk via `GET /api/v1/ai-sdlc/artifacts/{filename}`.
* **When** clicking "Approve Gate", the API posts to `POST /api/v1/ai-sdlc/gates/{phase}/approve`, appends an audit timestamp to `AI_ENGINEERING_LOG.md` on disk, transitions Phase $N$ to `APPROVED`, and unlocks Phase $N+1$ to `IN_REVIEW`.
* **And** clicking "Reset Gate Progression" posts to `POST /api/v1/ai-sdlc/reset-gates` and resets state back to Phase 01 for demo re-testing.

