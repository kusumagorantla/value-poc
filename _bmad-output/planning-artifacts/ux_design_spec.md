# Phase 02: UX Designer Specification & Component Architecture (v2.0 Refined)

**System**: Valeo MOM System (JARVIS Process Result Traceability)  
**Phase**: Phase 02 — Design & Specification  
**Lead Agent**: UX Designer Agent (Sally)  
**Date**: August 13, 2026  

---

## 1. UI Aesthetics & Industrial Design System

* **Theme**: Modern industrial dark mode (`bg-slate-900`, `text-slate-100`, `border-slate-800`).
* **Color Tokens**:
  * Primary Accent: **Valeo Emerald** (`#10b981` / `emerald-500`) for PASS / `SYNCED` status.
  * Warning Accent: **Industrial Amber** (`#f59e0b` / `amber-500`) for DEGRADED mode / `EDGE_MODIFIED`.
  * Danger Accent: **Crimson Red** (`#ef4444` / `red-500`) for NOK / Scrap.
  * Info Accent: **Cyan Blue** (`#06b6d4` / `cyan-500`) for Site-to-Edge Sync actions.

---

## 2. Navigation & Layout Structure

The application features a **Tabbed Dual-Console Navigation**:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 🏭 VALEO MOM — JARVIS TRACEABILITY RECORDING CONSOLE                                   │
├─────────────────────────┬─────────────────────────┬────────────────────────────────────┤
│ [Site Admin Console]    │ [Edge PC Local Console] │ [PLC Trigger & Simulator]          │
└─────────────────────────┴─────────────────────────┴────────────────────────────────────┘
```

---

## 3. Console Screens Breakdown

### Screen 1: Site Admin Console UI (BUC-0 Central Modeler with 4-Tier Tree)
* **Header Bar**: Product Reference selector (`MATERIAL-1`), Flow Code (`FLOW1`), and global **"Deploy to Edge PC"** action button.
* **4-Tier Hierarchy Modeler**:
  - **Tier 1 (Flow)**: `MATERIAL-1 / FLOW1 - Primary Assembly Line`
  - **Tier 2 (Steps)**: Ordered step cards (`[11001] Housing Screwing`, `[11002] Body Sub Assembly 1`).
  - **Tier 3 (Operations)**: Nested operation rows under each step (`[123021] Screw 1`, `[123022] Screw 2`).
  - **Tier 4 (Result Definitions)**: Parameter tolerance editor (`[50032] Angle: Nominal 90 DD, LSL 80, USL 100`, `[50033] Torque: Nominal 5 NU, LSL 4.5, USL 5.5`, Mandatory toggle).
* **Station Assignment Panel**: Map steps to physical station codes (`ST060.1` to `ST120`).

### Screen 2: Edge PC Local Console UI (BUC-0 Line Inspector & Local Editor)
* **Active Line Model Card**: Displays current active line model running locally on the Edge PC.
* **Sync Status Badge**:
  * `<span className="badge bg-emerald-500">SYNCED</span>`: Indicates full alignment with Site Central DB.
  * `<span className="badge bg-amber-500">EDGE_MODIFIED</span>`: Indicates local edits made directly on Edge PC, synchronized back to Site DB.
* **Local 4-Tier Hierarchy Editor**: Direct modal editor to adjust tolerances or operation names on the shopfloor.

### Screen 3: Interactive PLC Trigger Simulator & Live Audit Inspector
* **PLC Handshake Protocol Control**:
  * **Handshake Toggle**: Enable/Disable synchronous PLC handshake ACK signal.
  * **Station Mode Selector**: `0=Serial`, `1=Prototype`, `3=Retest`, `4=Rework`, `5=MasterSample`.
  * **Step Result Selector**: `1=PASS(OK)`, `2=FAILED(NOK)`, `3=SCRAP`.
* **Preset Machine Cycle Triggers**:
  * 🟢 **Standard Housing Screwing Cycle** (Serial `cee348d8-...`, Torque 5.12, Angle 92.4, Status OK).
  * 🟡 **Missing Context Degraded Mode** (Missing Station Code, Status `DEGRADED_MISSING_CONTEXT`).
  * 🔴 **Multi-Result NOK Cycle** (Torque 6.8 N·m > USL 5.5 N·m, Status NOK).
* **Live Handshake Latency Bar**: Displays real-time API response time in milliseconds with **`< 50ms SLA PASS`** badge.
* **Live Audit Log Table**: Real-time table rendering transaction ID, serial number, storage mode, raw payload JSON viewer, and timestamp.

### Screen 4: Embedded Grafana Quality Dashboard
* **Part Quality Ratio Pie**: OK / NOK / SCRAP distribution.
* **Torque & Angle Tolerance Histograms**: Real-time measurement values plotted against LSL and USL limits.
* **Degraded Mode Incident Counter**: Live counter tracking missing context events over time.

### Screen 5: AI SDLC Workflow Orchestration Console UI
* **6-Phase Stepper Navigation Bar**: Top horizontal stepper visualizing all 6 phases (`Phase 01` through `Phase 06`) with badged gate statuses (`APPROVED ✅`, `IN_REVIEW ⏳`, `LOCKED 🔒`).
* **Active Phase Metadata & Token Metrics Panel**:
  - Displays assigned agent persona, model routing choice (e.g. Gemini 1.5 Pro), Prompt Tokens, Output Tokens, Total Tokens, Prompt Caching Hit Rate (%), Execution Latency, and Cost Estimation ($ USD).
* **Live Server Disk Markdown Report Viewer**:
  - Full-width dark code container rendering live markdown text read directly from disk via `/api/v1/ai-sdlc/artifacts/{filename}`.
* **Persistent Human Stage Gate Action Bar**:
  - Primary Action Button (`🚀 Approve Phase N & Unlock Phase N+1`): Triggers live `POST /api/v1/ai-sdlc/gates/{N}/approve` request and updates server state.
  - Presentation Demo Reset Button (`🔄 Reset Gate Progression`): Resets state back to Phase 01 for live presentation re-testing.

