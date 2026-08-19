---
title: 'Story 3.1: React Interactive PLC Machine Cycle Payload Simulator & Audit Inspector'
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

**Problem:** Evaluators and quality inspectors need an interactive web simulator to trigger sample PLC machine cycles, test degraded mode scenarios, and inspect recorded process results and audit logs in real time.

**Approach:** Build `PlcSimulator.tsx` component in React 18 providing preset machine cycle triggers, raw JSON payload editor, API response latency indicator, and audit log table inspector.

## Boundaries & Constraints

**Always:** Follow React 18 functional component patterns, TypeScript types, and responsive Tailwind styling.

**Ask First:** Modifying default API endpoint URLs.

**Never:** Use static un-interactive mock tables; connect to live API endpoints.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Trigger PLC Machine Cycle | Click "Trigger Housing Screwing Cycle" | Transmits JSON payload to API, displays latency badge (e.g. `18ms`), and updates audit table | Display error alert if API is unreachable |

</frozen-after-approval>

## Code Map

- `frontend/src/components/PlcSimulator.tsx` -- React UI component for triggering PLC machine cycles and inspecting audit logs
- `frontend/src/App.tsx` -- Main React container hosting Site Admin Console & PLC Simulator tabs

## Tasks & Acceptance

**Execution:**
- [x] `frontend/src/components/PlcSimulator.tsx` -- Build PLC simulator with preset triggers, JSON editor, and audit log viewer.
- [x] `frontend/src/App.tsx` -- Integrate tabbed navigation between Site Admin Console (BUC-0) and Edge PLC Simulator (BUC-1/BUC-2).

**Acceptance Criteria:**
- Given the Edge PLC Simulator UI, when the user triggers a sample machine cycle for serial `cee348d8-daa0-4730-8d5e-ac59311af94b`, then the UI transmits the payload, displays response latency in ms, and updates recorded DB rows and audit logs live.

## Verification

**Commands:**
- `dotnet build` -- expected: Build succeeded with 0 errors
