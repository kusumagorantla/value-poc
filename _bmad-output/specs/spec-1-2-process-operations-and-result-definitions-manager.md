---
title: 'Story 1.2: Process Operations & Result Definitions Manager'
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

**Problem:** Process Engineers need the ability to define Process Operations (`123021 Screw 1`) and Process Result Definitions (`50032 Angle`, `50033 Torque`, LSL/USL/Nominal, UOM, Mandatory) under each Process Step.

**Approach:** Extend .NET 8 Web API with `ProcessOperation` and `ProcessResultDefinition` EF Core models, endpoints (`POST /api/v1/process-steps/{stepId}/operations`, `POST /api/v1/process-operations/{opId}/result-definitions`), and React UI components.

## Boundaries & Constraints

**Always:** Follow .NET 8 Web API standards, EF Core 8 mappings, async/await throughout, and React functional component patterns.

**Ask First:** Changing existing database column names.

**Never:** Hardcode specifications or omit validation for LSL/USL bounds.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Add Operation | `POST /api/v1/process-steps/{stepId}/operations` `{ "operation_code": 123021, "operation_name": "Screw 1" }` | HTTP 201 Created with JSON ProcessOperation object | Return 404 if `stepId` does not exist |
| Define Result Metric | `POST /api/v1/process-operations/{opId}/result-definitions` `{ "result_code": 50032, "result_name": "Angle", "result_type": 1, "uom": "DD", "nominal": 90, "lsl": 80, "usl": 100, "is_mandatory": true }` | HTTP 201 Created with JSON ProcessResultDefinition object | Return 404 if `opId` does not exist |

</frozen-after-approval>

## Code Map

- `src/Jarvis.Traceability.Api/Models/ProcessOperation.cs` -- Entity model for `process_operations` table
- `src/Jarvis.Traceability.Api/Models/ProcessResultDefinition.cs` -- Entity model for `process_result_definitions` table
- `src/Jarvis.Traceability.Api/Dtos/ProcessOperationDtos.cs` -- DTOs for operation and result definition endpoints
- `src/Jarvis.Traceability.Api/Controllers/ProcessOperationsController.cs` -- REST API controller for operations & result definitions
- `frontend/src/components/ResultDefinitionManager.tsx` -- React UI for configuring operations and result metrics

## Tasks & Acceptance

**Execution:**
- [x] `src/Jarvis.Traceability.Api/Models/ProcessOperation.cs` -- Implement ProcessOperation entity linked to ProcessStep.
- [x] `src/Jarvis.Traceability.Api/Models/ProcessResultDefinition.cs` -- Implement ProcessResultDefinition entity with Nominal, LSL, USL, UOM, and ResultType properties.
- [x] `src/Jarvis.Traceability.Api/Controllers/ProcessOperationsController.cs` -- Implement API endpoints for operations and result definitions.
- [x] `frontend/src/components/ResultDefinitionManager.tsx` -- Build React component for operation and result metric configuration.

**Acceptance Criteria:**
- Given a Process Step (`11001 Housing Screwing`), when the engineer configures operation `123021 Screw 1` with result `50032 Angle` (LSL 80, USL 100, Nominal 90), then the backend persists the definition in PostgreSQL 17 and renders it in the UI.

## Verification

**Commands:**
- `dotnet build` -- expected: Build succeeded with 0 errors
