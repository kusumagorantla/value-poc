---
title: 'Story 1.1: Process Flow & Step Management API & UI'
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

**Problem:** Valeo MOM needs the initial foundation for BUC-0 process modeling to define manufacturing process flows (`MATERIAL-1`, `FLOW1`) and ordered steps (`11001 Housing Screwing`) via REST API and React UI.

**Approach:** Build ASP.NET Core .NET 8 Web API endpoints (`POST /api/v1/process-flows`, `POST /api/v1/process-flows/{id}/steps`, `GET /api/v1/process-flows`) backed by PostgreSQL 17 EF Core models, and connect them to a React 18 Site Admin Console UI component.

## Boundaries & Constraints

**Always:** Follow .NET 8 Web API standards, async/await throughout, FluentValidation DTOs, EF Core 8 for BUC-0 metadata, React functional components with TypeScript and Tailwind CSS.

**Ask First:** Modifying existing database connection strings or altering default port bindings.

**Never:** Use synchronous `.Result` or `.Wait()`, hardcode credentials in source files, or omit error handling middleware.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Create Process Flow | `POST /api/v1/process-flows` `{ "product_id": "MATERIAL-1", "flow_code": "FLOW1", "description": "Housing Screwing Line" }` | HTTP 201 Created with JSON ProcessFlow object | Return HTTP 400 ProblemDetails if `product_id` or `flow_code` is missing |
| Add Step to Flow | `POST /api/v1/process-flows/{id}/steps` `{ "step_code": 11001, "step_name": "Housing Screwing", "step_order": 1 }` | HTTP 201 Created with JSON ProcessStep object | Return HTTP 404 ProblemDetails if `flow_id` does not exist |
| Get Process Flows | `GET /api/v1/process-flows` | HTTP 200 OK with list of process flows and nested steps | Return empty array `[]` if no flows exist |

</frozen-after-approval>

## Code Map

- `src/Jarvis.Traceability.Api/Program.cs` -- ASP.NET Core Web API startup, EF Core DbContext registration, CORS, health check endpoint
- `src/Jarvis.Traceability.Api/Data/JarvisDbContext.cs` -- EF Core 8 DbContext with `ProcessFlows` and `ProcessSteps` DbSets
- `src/Jarvis.Traceability.Api/Models/ProcessFlow.cs` -- Entity model for `process_flows` table
- `src/Jarvis.Traceability.Api/Models/ProcessStep.cs` -- Entity model for `process_steps` table
- `src/Jarvis.Traceability.Api/Controllers/ProcessFlowsController.cs` -- REST API controller for flows and steps
- `frontend/src/components/ProcessFlowBuilder.tsx` -- React UI for creating and viewing process flows & steps
- `frontend/src/services/apiService.ts` -- Axios / Fetch API client service

## Tasks & Acceptance

**Execution:**
- [x] `src/Jarvis.Traceability.Api/Program.cs` -- Initialize .NET 8 Web API project with EF Core PostgreSQL provider, CORS, and health check.
- [x] `src/Jarvis.Traceability.Api/Data/JarvisDbContext.cs` -- Configure EF Core DbContext and entity mappings.
- [x] `src/Jarvis.Traceability.Api/Models/ProcessFlow.cs` -- Implement ProcessFlow entity with navigation property to ProcessSteps.
- [x] `src/Jarvis.Traceability.Api/Models/ProcessStep.cs` -- Implement ProcessStep entity linked to ProcessFlow.
- [x] `src/Jarvis.Traceability.Api/Controllers/ProcessFlowsController.cs` -- Implement REST endpoints with FluentValidation DTOs.
- [x] `frontend/src/components/ProcessFlowBuilder.tsx` -- Build React 18 Site Admin Console component for flow/step modeling.
- [x] `frontend/src/services/apiService.ts` -- Implement frontend HTTP client methods.

**Acceptance Criteria:**
- Given an authenticated engineer in Site Admin Console, when they submit a new flow `MATERIAL-1` / `FLOW1` with step `11001 Housing Screwing`, then the backend persists the records in PostgreSQL 17 and renders them on the UI.

## Verification

**Commands:**
- `dotnet build` -- expected: Build succeeded with 0 errors
- `dotnet test` -- expected: All unit tests pass
