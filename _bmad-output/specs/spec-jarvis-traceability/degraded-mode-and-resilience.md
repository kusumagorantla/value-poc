# Degraded Mode, Low-Latency & Data Resilience Specifications

## Overview
Specifies the critical operational rules, error recovery, degraded mode fallbacks, and performance constraints for process result recording in Valeo MOM (JARVIS).

## 1. Zero Data Loss Policy & Degraded Mode Engine

### Core Rule
**No data received from a PLC, computer, or external device can be lost.**

Even if the incoming payload has missing context, invalid station IDs, or unregistered part numbers, the system MUST still persist the payload in **Degraded Mode** rather than rejecting the transaction.

### Degraded Mode Behaviors

| Missing / Invalid Context | Action Taken | Storage Mode | Audit Logging |
| :--- | :--- | :--- | :--- |
| **Missing `Station_ID` or `ProcessStep_ID`** | Store raw payload with fallback `UNKNOWN_STATION` / `UNKNOWN_STEP`. | `DEGRADED_MISSING_CONTEXT` | Log warning in Edge PC diagnostic table. |
| **Unregistered `Product_SerialNo`** | Record result under raw string provided without blocking. | `DEGRADED_UNLINKED_SERIAL` | Flag in data exchange audit log. |
| **Partial Operation / Result Array Error** | Store valid results; flag corrupted elements in exception payload. | `PARTIAL_SUCCESS` | Return HTTP 207 Multi-Status with element-level error list. |
| **Database Transient Disruption** | Buffer payload in local Edge memory/file queue for auto-retry. | `EDGE_BUFFERED` | Retry asynchronously upon DB reconnection. |

---

## 2. Low-Latency Synchronous Handshake & Cycle Time Protection

### SLA Targets
* **Synchronous API Round-Trip**: `< 50 ms` for 95% of machine control signals.
* **Database Write Latency**: `< 15 ms` local Edge PostgreSQL insert time.

### Architecture Mechanisms
1. **Connection Pooling & Prepared Statements**: Pre-warmed DB pools to avoid handshake overhead.
2. **Non-blocking Logging**: Write audit/diagnostic telemetry asynchronously to prevent delaying the primary PLC response.
3. **Optimized DB Indexing**: B-Tree indices on `(Product_SerialNo, Timestamp)` and `(Station_ID, ProcessStep_ID)`.

---

## 3. Communication Audit & Logging Requirements

Every recording attempt — whether standard, degraded, or failed — MUST produce an immutable execution log entry containing:
* `Log_ID`: UUID
* `Received_Timestamp`: Edge server system clock
* `Client_IP` / `Device_ID`: Origin of call
* `Execution_Status`: `SUCCESS`, `DEGRADED`, `BUFFERED`, or `FAILED`
* `Raw_Payload_Snapshot`: Full incoming JSON string for forensic analysis.
* `Error_Code_List`: Array of warning/error messages.
