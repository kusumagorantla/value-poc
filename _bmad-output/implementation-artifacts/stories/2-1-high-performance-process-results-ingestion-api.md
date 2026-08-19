# Story 2.1: High-Performance Process Results Ingestion API (`POST /api/v1/traceability/process-results`)

## Story Overview
* **Epic**: Epic 2 — Core Low-Latency Recording Engine, Handshaking & Degraded Mode (BUC-1 & BUC-2)
* **Status**: `ready-for-dev`
* **FRs Covered**: FR6 (Standard Process Results Recording Engine), FR8 (External REST API Endpoints & Dual JSON Support)

---

## User Story
**As an** external PLC / Industrial Computer,  
**I want** to transmit process result payloads containing Process Context, Product Context, Time Context, and Process Results Data Arrays via an authenticated REST API,  
**So that** Valeo MOM records part-level traceability measurements into Edge PostgreSQL 17 storage.

---

## Acceptance Criteria

### AC1: Ingestion API Endpoint & Dual Payload Deserialization
* **Given** an incoming JSON request to `POST /api/v1/traceability/process-results`,
* **When** submitted in either **VIB Nested JSON format** (`product_context`, `process_context`, `process_results`) or **Flat DTO format** (`ProductSerialNo`, `StationId`, `ProcessStepId`),
* **Then** the .NET 8 API parses the payload using `JsonElement` dynamic deserialization without throwing model validation errors.

### AC2: Standard Mode Database Insertion
* **Given** a valid payload with registered station and step IDs,
* **When** ingested by the API,
* **Then** the record is persisted into `process_result_records` and `process_result_values` in `jarvis_edge_db`.
* **And** the API returns HTTP 200 OK with `status: "SUCCESS"`, `storage_mode: "STANDARD"`, and a unique `transaction_id`.

---

## Technical Tasks
1. [.NET 8 API] Update `TraceabilityIngestionController.cs` to accept `JsonElement` and extract nested or flat fields.
2. [.NET 8 API] Optimize Dapper batch statement insertion into `jarvis_edge_db`.
3. [xUnit Tests] Maintain tests verifying both VIB nested JSON and flat DTO formats return `STANDARD` mode.
