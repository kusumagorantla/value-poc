# Story 1.1: Process Flow & Step Management API & UI

## Story Overview
* **Epic**: Epic 1 — Foundation, Site Admin Console & 4-Tier Process Modeling (BUC-0)
* **Status**: `ready-for-dev`
* **FRs Covered**: FR1 (Process Flow Creation), FR2 (4-Tier Process Steps & Operations Definition)

---

## User Story
**As a** Process Engineer,  
**I want** to create and manage manufacturing Process Flows and Process Steps for product references (e.g. `MATERIAL-1`, `FLOW1`),  
**So that** the system establishes the digital representation of the production process line.

---

## Acceptance Criteria

### AC1: Create Process Flow API Endpoint
* **Given** an authenticated request to `POST /api/v1/process-flows`,
* **When** a valid request body is sent containing `product_id` ("MATERIAL-1"), `flow_code` ("FLOW1"), and `description`,
* **Then** the .NET 8 API creates a record in `process_flows` table in `jarvis_site_db` via EF Core 8 and returns `201 Created` with the new flow ID.

### AC2: Create Process Step API Endpoint
* **Given** an existing Process Flow,
* **When** a request is sent to `POST /api/v1/process-flows/{flow_id}/steps` with `step_code` (11001), `step_name` ("Housing Screwing"), and `step_order` (1),
* **Then** the API creates the step in `process_steps` table in `jarvis_site_db` and returns `201 Created`.

### AC3: Site Admin Console React UI
* **Given** the Process Engineer opens the Site Admin Console UI,
* **When** they fill out the "New Process Flow" form for `MATERIAL-1` / `FLOW1` and add steps (`11001 Housing Screwing`, `11002 Body Sub Assembly 1`, `11005 Final Test`, `11006 Packing`),
* **Then** the UI submits the API requests and renders the process flow card with ordered step cards.

---

## Technical Tasks
1. [.NET 8 API] Create EF Core entity models for `ProcessFlow` and `ProcessStep`.
2. [.NET 8 API] Implement `ProcessFlowsController` with `POST`, `GET`, and `PUT` endpoints.
3. [PostgreSQL 17] Run EF Core migration to create `process_flows` and `process_steps` tables in `jarvis_site_db` and `jarvis_edge_db`.
4. [React UI] Build `ProcessFlowBuilder.tsx` component with step card list and API integration.
