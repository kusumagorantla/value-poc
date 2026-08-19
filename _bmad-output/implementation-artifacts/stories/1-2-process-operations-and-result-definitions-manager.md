# Story 1.2: 4-Tier Process Operations & Result Definitions Manager

## Story Overview
* **Epic**: Epic 1 — Foundation, Site Admin Console & 4-Tier Process Modeling (BUC-0)
* **Status**: `ready-for-dev`
* **FRs Covered**: FR2 (Operations Definition), FR3 (Process Results Specification & Tolerance Limits)

---

## User Story
**As a** Process Engineer,  
**I want** to define Process Operations and Process Results (with Nominal, LSL, USL, UOM, and Mandatory flags) for each process step in a 4-tier hierarchy,  
**So that** incoming PLC process measurements can be validated against expected parameter specifications.

---

## Acceptance Criteria

### AC1: Add Process Operations API
* **Given** an existing Process Step (e.g. `[11001] Housing Screwing`),
* **When** a request is sent to `POST /api/v1/process-steps/{step_id}/operations` with `operation_code` (123021) and `operation_name` ("Screw 1"),
* **Then** the record is created in `process_operations` table in PostgreSQL 17.

### AC2: Define Process Result Metrics API with Limits
* **Given** a Process Operation (e.g. `[123021] Screw 1`),
* **When** a request is sent to `POST /api/v1/process-operations/{op_id}/result-definitions` with `result_code` (50032), `result_name` ("Angle"), `result_type` (1 = Numeric), `uom` ("DD"), `nominal` (90), `lsl` (80), `usl` (100), and `is_mandatory` (true),
* **Then** the record is persisted in `process_result_definitions` table in PostgreSQL 17.

### AC3: 4-Tier Hierarchy Modeler in Site Admin UI & Edge PC UI
* **Given** the Site Admin Console UI or Edge PC Local Console UI,
* **When** the engineer views the 4-tier tree (Flow ➔ Step ➔ Operation ➔ Result Definitions) and edits operations/result tolerances,
* **Then** the UI displays an interactive modal/data table summarizing Nominal, LSL, USL, UOM, and Mandatory toggle.

---

## Technical Tasks
1. [.NET 8 API] Create EF Core entities for `ProcessOperation` and `ProcessResultDefinition`.
2. [.NET 8 API] Implement endpoints for creating/editing operations and result definitions.
3. [PostgreSQL 17] Ensure schema supports `nominal`, `lsl`, `usl`, `uom`, and `is_mandatory` columns.
4. [React UI] Build 4-tier tree editor component in Site Admin Console and Edge PC UI.
