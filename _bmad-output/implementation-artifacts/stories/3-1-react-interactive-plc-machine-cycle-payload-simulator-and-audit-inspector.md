# Story 3.1: React Interactive PLC Simulator, Handshake Controls & Audit Inspector

## Story Overview
* **Epic**: Epic 3 — Interactive PLC Simulator & Grafana Analytics Reporting (VIB Page 8)
* **Status**: `ready-for-dev`
* **FRs Covered**: FR9 (Interactive React PLC Simulator & Handshake Inspector), UX-DR3

---

## User Story
**As an** Evaluator / Quality Inspector,  
**I want** an interactive React UI simulator with PLC Handshake ACK controls, station mode selectors (`Serial`, `Rework`, `MasterSample`), and step result selectors (`PASS`, `NOK`, `SCRAP`),  
**So that** I can visually verify the system's traceability recording, handshake protocol, and zero-data-loss capabilities live.

---

## Acceptance Criteria

### AC1: PLC Handshake ACK & Parameter Controls
* **Given** the React UI on the Edge PC Console,
* **When** the user configures Handshake ACK toggle, selects Station Mode (`0=Serial`, `4=Rework`, `5=MasterSample`), and chooses Step Result (`1=PASS`, `2=NOK`, `3=SCRAP`),
* **Then** the simulator dynamically constructs the corresponding JSON payload.

### AC2: Preset Triggers & Live Latency Display
* **Given** preset buttons (`Standard Cycle`, `Missing Context Degraded Mode`, `Multi-Result NOK Cycle`),
* **When** clicked,
* **Then** the UI transmits the payload to the API, measures real-time response time in ms, renders a `< 50ms SLA PASS` badge, and refreshes the live database audit log table.

---

## Technical Tasks
1. [React UI] Build `PlcSimulatorConsole.tsx` with handshake ACK toggle, station mode dropdown, and preset trigger buttons.
2. [React UI] Create live latency bar displaying round-trip API time in milliseconds.
3. [React UI] Build `AuditLogInspector.tsx` rendering recorded transactions and raw payload viewer.
