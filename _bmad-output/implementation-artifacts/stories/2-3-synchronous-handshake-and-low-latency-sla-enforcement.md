# Story 2.3: Synchronous Handshake Protocol & Low-Latency SLA Enforcement (<50ms)

## Story Overview
* **Epic**: Epic 2 — Core Low-Latency Recording Engine, Handshaking & Degraded Mode (BUC-1 & BUC-2)
* **Status**: `ready-for-dev`
* **FRs Covered**: NFR1 (Low Latency Synchronous Handshake SLA <50ms), NFR2 (High Database Throughput)

---

## User Story
**As a** Line Systems Engineer,  
**I want** synchronous recording calls to return PLC handshake ACK signals in under 50ms,  
**So that** software communication delays do not create physical machine cycle bottlenecks.

---

## Acceptance Criteria

### AC1: Synchronous Handshake ACK Response
* **Given** a synchronous API call with `X-Execution-Mode: sync` or handshake enabled,
* **When** submitted by a PLC during line production,
* **Then** the .NET 8 API completes database writes in <15ms and returns HTTP 200 OK with handshake ACK signal in `< 50ms` (95th percentile).

### AC2: Non-Blocking Telemetry & Audit Queue
* **Given** audit logging and telemetry processing,
* **When** executing under high machine cycle throughput,
* **Then** audit logging is dispatched asynchronously via non-blocking `Channel<T>` (`ChannelAuditLogger.cs`) so the primary HTTP response pipeline is not delayed.

---

## Technical Tasks
1. [.NET 8 API] Implement non-blocking background queue (`ChannelAuditLogger.cs`) using `System.Threading.Channels`.
2. [.NET 8 API] Optimize Dapper database connection pre-warming and batch queries.
3. [Benchmark] Execute benchmark test verifying sub-50ms API roundtrip response times.
