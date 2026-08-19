---
title: 'Story 3.2: Grafana Quality Analytics Dashboard & PostgreSQL Integration'
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

**Problem:** Quality Technicians and APU Supervisors require Grafana quality dashboards connected to PostgreSQL 17 to visualize part-level quality trends, torque/angle distribution, and degraded mode log counts as mandated in VIB Page 8.

**Approach:** Provision Grafana container datasource configuration and dashboard JSON models (`jarvis-quality-dashboard.json`) mapping PostgreSQL 17 traceability tables.

## Boundaries & Constraints

**Always:** Connect Grafana directly to PostgreSQL 17 database datasource, provision dashboard via Docker Compose provisioning files.

**Ask First:** Changing default Grafana port (3000).

**Never:** Hardcode database passwords in public repositories.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Grafana Dashboard Query | PostgreSQL 17 process results table | Renders time-series charts for torque/angle measurements and degraded mode log counts | Display empty panel if no records exist |

</frozen-after-approval>

## Code Map

- `grafana/provisioning/datasources/datasource.yaml` -- Grafana automatic PostgreSQL 17 datasource configuration
- `grafana/provisioning/dashboards/dashboards.yaml` -- Grafana automatic dashboard provider configuration
- `grafana/dashboards/jarvis-traceability-dashboard.json` -- Pre-configured quality analytics dashboard JSON model

## Tasks & Acceptance

**Execution:**
- [x] `grafana/provisioning/datasources/datasource.yaml` -- Create Grafana datasource configuration for PostgreSQL 17.
- [x] `grafana/provisioning/dashboards/dashboards.yaml` -- Create Grafana dashboard provider configuration.
- [x] `grafana/dashboards/jarvis-traceability-dashboard.json` -- Create quality analytics dashboard JSON.

**Acceptance Criteria:**
- Given Grafana running on port 3000 connected to PostgreSQL 17, when opened, it automatically loads the JARVIS Traceability Quality Dashboard displaying real-time torque/angle measurement trends and degraded mode log counts.

## Verification

**Commands:**
- `dotnet build` -- expected: Build succeeded with 0 errors
