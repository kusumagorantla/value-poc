# Story 3.2: Grafana Quality Analytics Dashboard & PostgreSQL Integration

## Story Overview
* **Epic**: Epic 3 — Interactive PLC Simulator & Grafana Analytics Reporting (VIB Page 8)
* **Status**: `ready-for-dev`
* **FRs Covered**: FR10 (Grafana Analytics & Quality Reporting), UX-DR4

---

## User Story
**As an** APU Supervisor / Quality Engineer,  
**I want** pre-configured Grafana dashboards connected to PostgreSQL 17 to visualize part-level quality measurements, torque/angle distribution, and degraded mode log trends,  
**So that** I can perform real-time root cause analysis and quality monitoring as specified in VIB Page 8.

---

## Acceptance Criteria

### AC1: Provisioned Grafana Container & Datasource
* **Given** `docker-compose up`,
* **When** the `jarvis-grafana-reports` container starts on port 3000,
* **Then** it automatically connects to PostgreSQL 17 (`jarvis_edge_db`) using provisioned datasource configuration (`grafana/provisioning/datasources/`).

### AC2: Quality Metrics & Tolerance Visualization
* **Given** incoming process result records,
* **When** the user accesses the Grafana dashboard,
* **Then** it displays OK/NOK/SCRAP quality ratios, torque/angle measurement histograms plotted against LSL/USL tolerance limits, and degraded mode incident trends.

---

## Technical Tasks
1. [Docker / Grafana] Configure Grafana provisioning files (`datasources.yaml`, `dashboards.yaml`).
2. [Grafana JSON] Build `valeo-quality-dashboard.json` with SQL queries for torque/angle tolerance charts and degraded mode counters.
3. [Documentation] Document Grafana dashboard URL and metrics overview in `README.md`.
