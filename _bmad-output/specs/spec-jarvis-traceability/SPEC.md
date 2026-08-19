---
title: JARVIS Process Result Traceability Recording (VIB BUC-0, BUC-1, BUC-2)
slug: spec-jarvis-traceability
companions:
  - stack.md
  - process-model-schema.md
  - plc-data-exchange-spec.md
  - degraded-mode-and-resilience.md
sources:
  - VIB-JARVIS-Basic-Process-Result-Traceability-v1.0.pdf
---

# SPEC: JARVIS Process Result Traceability Recording

## 1. Why

Traceability data recording is a strategic capability within the Valeo MOM (JARVIS) system. Manufacturing plants globally require standardized, low-latency, zero-data-loss process result recording for individual parts (identified by serial or batch numbers) to:
1. Satisfy customer requests for detailed production process data for each part.
2. Enable root cause analysis during quality investigations and support AI projects.
3. Accelerate the decommission and transition of 71 legacy Barflow MES sites (1,130 production lines, >12M rows/day) to the Valeo MOM platform.

## 2. Capabilities

### `CAP-1`: Manufacturing Process Basic Modeling & Site-to-Edge Sync (BUC-0)
* **Intent**: Provide Site Admin Console UI tools to model manufacturing process flows, steps, operations, process results, and station assignments, with distribution to line Edge PCs and bidirectional synchronization.
* **Success**: Process engineers can define process flows for a part number (e.g. `MATERIAL-1`, `FLOW1`) in the Site Admin Console, deploy to target line Edge PCs, and verify local edits on Edge PCs synchronize back to the Site Server.

### `CAP-2`: Standard Process Results Data Saving Function (BUC-1)
* **Intent**: Provide a core .NET 8 Web API Edge recording engine that captures process result data containing process context, product context, result payload, and time context from PLCs, industrial computers, or third-party systems into PostgreSQL 17.
* **Success**: Incoming result arrays are validated against process model definitions and persisted in PostgreSQL 17 with execution feedback returned to caller.

### `CAP-3`: Degraded Mode & Zero Data Loss Recording (BUC-1)
* **Intent**: Enforce a strict zero-data-loss policy by recording incomplete, missing, or unknown context payloads in degraded mode rather than rejecting transactions.
* **Success**: 0% data loss under missing station/step context or unlinked serial numbers; raw payloads are stored with diagnostic flags and warning logs.

### `CAP-4`: Synchronous Latency & Cycle Time Protection (BUC-1)
* **Intent**: Execute .NET 8 synchronous API recording handshakes with ultra-low latency response times to ensure PLC communication does not create physical line bottlenecks.
* **Success**: Synchronous API handshakes complete in `< 50ms` (95th percentile) for critical machine signals without blocking machine cycle.

### `CAP-5`: API Endpoints for External Traceability Integration (BUC-2)
* **Intent**: Provide authenticated REST API endpoints supporting synchronous and asynchronous modes for PLCs, industrial PCs, and third-party systems to submit process results.
* **Success**: External callers can submit process results via HTTP POST using Bearer token authentication and receive immediate HTTP status (200 OK / 202 Accepted / 207 Multi-Status) and transaction IDs.

### `CAP-6`: Interactive Demo UI: Site Admin Console & Edge PC Simulator
* **Intent**: Provide a React web interface featuring both the Site Admin Console (Process Flow Modeler & Edge Deployment Manager) and Edge PC Console (Local Process Inspector, PLC Trigger Simulator, and Real-Time Audit Viewer).
* **Success**: Evaluators can model process flows in Site Admin Console, deploy to Edge PC, trigger simulated PLC machine cycles for serial numbers (e.g. `cee348d8-daa0-4730-8d5e-ac59311af94b`), and test degraded mode live.

## 3. Constraints

* **`CON-1`**: **Repetitive Manufacturing Framework** — System operates under repetitive manufacturing rules without relying on commercial "Production Orders".
* **`CON-2`**: **Explicit Technology Stack** — Backend: **.NET 8.0 Web API**, Frontend: **ReactJS** (Site Admin Console + Edge PC Simulator), Database: **PostgreSQL 17.0**. Containerized with Docker and ready for GCP deployment.
* **`CON-3`**: **Non-Validation Policy** — Recording function stores data provided by control devices without validating quality pass/fail status against LSL/USL specification levels.
* **`CON-4`**: **Authenticated API Access** — API endpoints require non-anonymous authentication (badge, token, or API key).
* **`CON-5`**: **Out-of-Scope Boundaries** — Serial number lifecycle management (creation/status), interlocking constraints, and component genealogy are explicitly excluded from this specification.

## 4. Non-Goals

* Performing physical quality pass/fail validation to release workpiece carriers.
* Managing component-level bill-of-materials genealogy or raw material batch tracking (handled in separate initiatives).
* Managing SAP work orders or ERP production scheduling.
* Hardware procurement or physical PLC wiring.

## 5. Success Signal

* Complete Dockerized executable prototype (.NET 8 + ReactJS + PostgreSQL 17) featuring Site Admin Console + Edge PC Simulator, deployable on GCP Cloud Run / GKE with 100% test coverage.
* Verified synchronous recording latency under 50ms and 0% data loss under missing context test scenarios.
* Published AI Engineering Log documenting system prompts, context harnessing, token metrics, and review evidence.
