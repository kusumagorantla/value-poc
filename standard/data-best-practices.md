# Data & Database Best Practices — JARVIS Traceability Demo

> **Purpose:** A **demo-ready**, agent-consumable data standard for the JARVIS Process Result Traceability prototype — the **PostgreSQL** data model and access layer that stores the BUC-0 process model and the BUC-1/BUC-2 recorded results.
> **Scope:** PostgreSQL 17 + EF Core (from the .NET 8 backend). Designed around the VIB's hard rules: **0% data loss**, **degraded-mode recording**, **low-latency synchronous writes**, **log every attempt**, and a **"Repetitive Manufacturing" (no Production Orders)** model.
> **How to use in BMAD:** place in `docs/org/` (or `devLoadAlwaysFiles`) so it loads as standing context for every data/persistence story.

---

## 0. Demo Guardrails (read first)

| Priority | Practice | VIB / demo driver |
|---|---|---|
| ✅ Must | Never reject silently — always persist something | "Record by all means, no data loss" |
| ✅ Must | Raw-payload failure log table | "Log all failed recording attempts with received data" |
| ✅ Must | Fast, indexed write path | Synchronous PLC latency rule |
| ✅ Must | Flexible schema for unforeseen result fields | "Accept missing/extra context; degraded mode" |
| ✅ Must | Serial **or** batch as traceability key | VIB product-context rule |
| ✅ Must | Store device timestamp *as-is* + system time | VIB time-context rule |
| 🔶 Nice | Time-series/partitioning by day | Scales toward Barflow's 12M rows/day |
| 🔶 Nice | Grafana-ready views | Feeds the reporting panel in the flow diagram |

---

## 1. Data Model Principles (from the VIB)

### 1.1 Core entities (BUC-0 model + BUC-1 results)
```
ProcessFlow (per Part Number)
  └── ProcessStep (ordered)
        └── ProcessOperation
              └── ProcessResultDefinition  (name, type, UOM, nominal, LSL, USL, mandatory)

Station ──(link)── ProcessStep            (which steps a station can perform)

RecordingEvent  (one physical record from a device)
  ├── product context   (Product_ID, SerialNo | BatchNo)   ← key = serial OR batch
  ├── process context   (Station_ID, ProcessStep_ID, StationMode, StepResult, FailureCode, WPCNo, MachineTime, CycleTime)
  ├── time context      (device_ts AS-IS, system_ts)
  └── ProcessResultValue[]  (ResultDef_ID, numeric | text | file_ref)
```

### 1.2 Repetitive Manufacturing — no Production Orders
Valeo assigns materials to a line via SAP production versions (routing + BOM), **not** discrete Production Orders. **Do not** model a `ProductionOrder` entity or make it a required FK. Anchor records to **Part Number + line/station + serial/batch**.

### 1.3 Flexible result storage (accept the unforeseen)
The recording function must accept new/unexpected result fields with **no schema change** — this is also the "live change request" the demo is graded on.
- Store scalar results in typed columns **and** keep a `payload_jsonb JSONB` column for extra/unmodeled fields.
- New value definitions, limits, and units are **data, not code** (rows in `ProcessResultDefinition`), so a new field lands in the flexible column, not a migration.
```sql
CREATE TABLE process_result_value (
    id              BIGSERIAL PRIMARY KEY,
    recording_id    BIGINT NOT NULL REFERENCES recording_event(id),
    result_def_id   BIGINT NULL REFERENCES process_result_definition(id),
    result_type     TEXT NOT NULL,        -- 'Numeric' | 'Text' | 'File'
    numeric_value   NUMERIC NULL,
    text_value      TEXT NULL,
    file_ref        TEXT NULL,            -- path / object-store key for images & large files
    extra           JSONB NULL           -- unforeseen fields, no schema change
);
```

---

## 2. No Data Loss & Degraded Mode (the defining rule)

- **Every** recording attempt persists **something**. Full context → normal row. Missing non-key context → **degraded** row flagged `recording_mode = 'Degraded'`. Only truly unusable input → a **raw failure log** row (still stored).
- A dedicated append-only failure table guarantees nothing is ever dropped:
```sql
CREATE TABLE recording_failure_log (
    id            BIGSERIAL PRIMARY KEY,
    received_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    raw_payload   JSONB NOT NULL,         -- exactly what the PLC sent
    error_reason  TEXT NOT NULL,
    source        TEXT NULL               -- station / api caller
);
```
- Add a `recording_mode` enum-like column (`Full | Degraded`) on `recording_event` and return it to the caller as the "detailed status".

---

## 3. Keys, Identity & Constraints

- **Traceability key is serial OR batch** — enforce "at least one present" with a check constraint:
```sql
ALTER TABLE recording_event
  ADD CONSTRAINT chk_trace_id
  CHECK (serial_no IS NOT NULL OR batch_no IS NOT NULL);
```
- Use `BIGSERIAL`/`GENERATED ALWAYS AS IDENTITY` surrogate keys; keep natural keys (serial, station id) as indexed columns.
- **Idempotency / duplicate protection:** a device may retry. Add a unique key on `(station_id, serial_no, process_step_id, device_ts)` so a re-send updates rather than duplicates — protects the "no data loss" goal without creating double records.
- Enums stored as short TEXT with a `CHECK` (StationMode: Serial/Prototype/Retest/Rework/MasterSample/StepByStep; StepResult: PASS/NOK/SCRAP).

---

## 4. Time Handling (VIB rule)

- Store the **device timestamp exactly as received** (`device_ts TIMESTAMPTZ`), even if out of sync — never "correct" it.
- Also store **system time** (`system_ts TIMESTAMPTZ DEFAULT now()`) as an independent complement.
- Always use `TIMESTAMPTZ` (UTC) — never naive local timestamps.

---

## 5. Performance & Low-Latency Writes

The synchronous path makes write latency a physical machine constraint.

- **Index the write/read path** deliberately:
  ```sql
  CREATE INDEX ix_recording_serial   ON recording_event (serial_no);
  CREATE INDEX ix_recording_station  ON recording_event (station_id, system_ts DESC);
  CREATE INDEX ix_resultval_recording ON process_result_value (recording_id);
  ```
- Keep the insert transaction **small and single-round-trip**; batch child rows in one command.
- Use a **connection pool** (Npgsql pooling on by default); never open per-call connections.
- Read paths use `AsNoTracking()` (EF Core) and projections — don't load the whole graph for a dashboard.
- For scale toward Barflow volumes (12M rows/day), note **table partitioning by day** on `recording_event` as a "next step to production" (not required for the demo).

---

## 6. EF Core Access Layer

- **Repository pattern** over `DbContext` for testability; inject via DI.
- Migrations are **code-first and versioned** — commit every migration; never edit the DB by hand.
- Parameterized queries only (EF does this) — no string-concatenated SQL (OWASP Injection).
- Map the flexible `extra` column to `JsonDocument`/`Jsonb`.
- Set sane defaults: `CommandTimeout` short on the sync path; explicit `CancellationToken` on every async call.
```csharp
public async Task SaveAsync(RecordingEvent ev, CancellationToken ct)
{
    _db.RecordingEvents.Add(ev);          // parent + children in one SaveChanges
    await _db.SaveChangesAsync(ct);       // single round-trip
}
```

---

## 7. Data Quality & Integrity

- **Validate, then downgrade — don't reject.** Missing UOM/spec → record with nulls + degraded flag, not a failure.
- Foreign keys where they add safety (result value → recording event), but make model links (result_def_id) **nullable** so unmodeled results still persist.
- Enforce numeric spec sanity only as *warnings/metadata* (LSL ≤ USL) — the function **records**, it does **not** judge part quality (explicit VIB rule).
- Keep an audit trail: `created_at`, `source`, and the raw payload for anything degraded/failed.

---

## 8. Reporting & Observability (feeds Grafana)

- Expose read-optimized **views** for the dashboard rather than querying raw tables:
```sql
CREATE VIEW v_recent_results AS
SELECT r.serial_no, r.station_id, r.step_result, r.recording_mode,
       r.device_ts, r.system_ts, v.result_type, v.numeric_value, v.text_value
FROM recording_event r
JOIN process_result_value v ON v.recording_id = r.id;
```
- Emit a `recording_latency_ms` metric and a `recording_mode` breakdown so Grafana can show **latency** and **degraded vs. full** — the two headline VIB proofs.
- Log every attempt with structured fields (serial, station, mode, latency) — one log line per recording.

---

## 9. Security & Config

- **No credentials in code** — connection string via env vars / user-secrets; never in `appsettings.json` committed to git.
- Use a **least-privilege DB user** for the app; a separate **read-only** user for the Grafana/agent reporting connection.
- Encrypt in transit (TLS to PostgreSQL); encrypt at rest if the demo host supports it.
- Back up / seed data via a repeatable script so the demo is reproducible.

---

## 10. Seed & Test Data (reproducible demo)

- Seed the **VIB Annex-1 sample**: `MATERIAL-1` / `FLOW1` with steps 11001–11006 and the Screw-1 `Angle`/`Torque` result definitions.
- Provide the **PLC test-case payload** (serial `cee348d8-…`, Angle=5.12, Torque=92.4, text `123-TRE-AC`) as a fixture so Valeo's sample runs end-to-end.
- Keep seed + migration idempotent (`docker compose up` → ready-to-demo database).

---

## 11. Definition of Done (demo checklist)

- [ ] Schema models BUC-0 (flow/step/operation/result) + BUC-1 recording with serial-or-batch key.
- [ ] No Production Order entity; anchored to Part Number + line/station.
- [ ] `payload_jsonb`/`extra` column accepts unforeseen fields with no migration.
- [ ] Failure-log table captures raw payload for every unrecordable input.
- [ ] `recording_mode` (Full/Degraded) stored and returned as detailed status.
- [ ] Device timestamp stored as-is + system time; all `TIMESTAMPTZ`.
- [ ] Write-path indexes + pooled, single-round-trip inserts; async + cancellation tokens.
- [ ] Duplicate-protection unique key prevents double records on retry.
- [ ] Least-privilege app user + read-only reporting user; no secrets in code.
- [ ] VIB Annex-1 seed + PLC test-case fixture load reproducibly.

---

*Companion to `dotnet-best-practices.md` and `react-best-practices.md` — a demo-ready, agent-loadable data standard for the JARVIS BMAD build.*
