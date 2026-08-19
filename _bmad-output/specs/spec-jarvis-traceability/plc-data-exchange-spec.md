# BUC-1 & BUC-2: PLC Data Exchange & API Payload Specifications

## Overview
Defines the standard data structures, REST API payloads, and response interfaces for capturing process results from PLCs, industrial PCs, and third-party systems in Valeo MOM (JARVIS).

## Data Payload Structure (PLC $\rightarrow$ Edge API)

A complete process result recording payload contains four distinct contextual blocks:

### 1. Process Context
Identifies the machine, station, step, and operational context:
* `Station_ID` (String/Integer): Station executing the step (e.g., `10001` or `ST060.1`).
* `ProcessStep_ID` (Integer): Step ID (e.g., `11001`).
* `StationMode` (Integer): `0`=Serial, `1`=Prototype, `3`=Retest, `4`=Rework, `5`=MasterSample, `X`=StepByStep.
* `ProcessStep_Result` (Integer): `1`=PASS(OK), `2`=FAILED(NOK), `3`=SCRAP.
* `ProcessStep_FailureCode` (String, Optional): Error code for NOK/SCRAP.
* `WPCNo` (Integer/String, Optional): Workpiece Carrier number.
* `TurnTableNo` (Integer/String, Optional): Turntable position.
* `ToolingNo` (Integer/String, Optional): Tooling number.
* `MachineTime` (Decimal/String, Optional): Machine processing duration in seconds.
* `CycleTime` (Decimal/String, Optional): Total cycle time in seconds.

### 2. Product Context
Identifies the physical product / material instance:
* `Product_ID` / `PartNumber` (String): Product reference (e.g., `MATERIAL-1`).
* `Product_SerialNo` (String): Unique serial number (e.g., `cee348d8-daa0-4730-8d5e-ac59311af94b`) OR batch number.

### 3. Time Context
* `Timestamp` (ISO-8601 String): Date and time reported by device (e.g., `2026-07-09T11:15:21Z`). If omitted or out of sync, system records local Edge server clock as complement while preserving device timestamp as-is.

### 4. Process Results Data Array
List of recorded measurements generated during the machine cycle:
* `ProcessResults_Count` (Integer): Total count of result items in array.
* `ProcessResults_Array` (List of objects):
  * `ProcessOperation_ID` (Integer): ID of operation (e.g., `123021`).
  * `ProcessOperation_Result` (Integer): `1`=PASS(OK), `2`=FAILED(NOK), `3`=SCRAP.
  * `Equipment_ID` (String, Optional): Equipment component ID within station.
  * `ProcessResult_ID` (Integer): Result metric ID (e.g., `50032`).
  * `ProcessResult_ValueNumeric` (Decimal, Optional): Numeric value (e.g., `5.12`, `92.4`).
  * `ProcessResult_ValueText` (String, Optional): Text result (e.g., `123-TRE-AC`).
  * `ProcessResult_ValueFileRef` (String, Optional): Reference to external file (e.g., `/images/part_123.jpg` or JSON/XML payload URI).

---

## BUC-2: REST API Endpoints

### Endpoint: `POST /api/v1/traceability/process-results`
* **Authentication**: Bearer Token or API Key in header (`Authorization: Bearer <token>`).
* **Execution Mode**:
  * Synchronous (`Header: X-Execution-Mode: sync`): Immediate database write & round-trip verification feedback (<50ms).
  * Asynchronous (`Header: X-Execution-Mode: async`): Queue for background persistence with immediate HTTP 202 Accepted.

### Sample Request Payload (JSON)
```json
{
  "product_context": {
    "product_id": "MATERIAL-1",
    "product_serial_no": "cee348d8-daa0-4730-8d5e-ac59311af94b"
  },
  "time_context": {
    "timestamp": "2026-07-09T11:15:21Z"
  },
  "process_context": {
    "station_id": "ST060.1",
    "process_step_id": 11001,
    "station_mode": 0,
    "process_step_result": 1,
    "wpc_no": 587,
    "machine_time": 23.6,
    "cycle_time": 35.12
  },
  "process_results": [
    {
      "process_operation_id": 123021,
      "process_operation_result": 1,
      "process_result_id": 50032,
      "value_numeric": 5.12
    },
    {
      "process_operation_id": 123021,
      "process_operation_result": 1,
      "process_result_id": 50033,
      "value_numeric": 92.4
    },
    {
      "process_operation_id": 123024,
      "process_operation_result": 1,
      "process_result_id": 50129,
      "value_text": "123-TRE-AC"
    }
  ]
}
```

### Sample Response Payload (JSON - Sync Mode)
```json
{
  "status": "SUCCESS",
  "recording_mode": "STANDARD",
  "transaction_id": "tx_8f921a41-3921-4b10",
  "processed_at": "2026-07-09T11:15:21.042Z",
  "latency_ms": 18.4,
  "records_inserted": 3,
  "errors": []
}
```
