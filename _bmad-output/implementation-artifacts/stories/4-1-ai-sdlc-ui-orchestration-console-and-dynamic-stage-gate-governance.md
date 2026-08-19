# Story 4.1: AI SDLC UI Orchestration Console & Dynamic Stage-Gate Governance

**Status**: DONE ✅  
**Epic**: Epic 4: Target AI-Enabled Delivery Workflow Orchestration Console  
**Parent Epic**: Epic 4  

---

## Story Overview

As an Engineering Lead / Evaluator,  
I want an interactive UI console visualizing all 6 AI SDLC stages with live disk artifact streaming, agent token economics metrics, and persistent stage-gate approval controls,  
So that I can govern the delivery lifecycle and verify human-in-the-loop sign-offs dynamically.

---

## Acceptance Criteria

1. **Phase Stepper & Artifact Streamer**:
   * Interactive 6-phase stepper rendering phase status (`APPROVED`, `IN_REVIEW`, `PENDING`).
   * Clicking a unlocked phase streams the raw markdown report directly from server disk (`/api/v1/ai-sdlc/artifacts/{filename}`).
2. **Lock Guard Enforcement**:
   * Locked phases (`PENDING`) cannot be clicked or viewed until the preceding gate is approved.
3. **Stage-Gate Approval Engine**:
   * "Approve Gate" posts to `/api/v1/ai-sdlc/gates/{phase}/approve`, appends an audit line to `AI_ENGINEERING_LOG.md` on disk, transitions Phase $N$ to `APPROVED`, and unlocks Phase $N+1$ to `IN_REVIEW`.
   * "Reset Gate Progression" posts to `/api/v1/ai-sdlc/reset-gates` and resets state back to Phase 01 for demo re-testing.
4. **Token Economics Dashboard**:
   * Renders prompt tokens, output tokens, prompt caching hit rate %, latency, and total pricing ($0.370 USD).

---

## Implementation Artifacts

* [`frontend/src/components/AiSdlcOrchestrator.tsx`](file:///c:/Valeo/AI-SDLC-BMAD/frontend/src/components/AiSdlcOrchestrator.tsx)
* [`src/Jarvis.Traceability.Api/Controllers/AiSdlcOrchestratorController.cs`](file:///c:/Valeo/AI-SDLC-BMAD/src/Jarvis.Traceability.Api/Controllers/AiSdlcOrchestratorController.cs)
* [`_bmad-output/AI_ENGINEERING_LOG.md`](file:///c:/Valeo/AI-SDLC-BMAD/_bmad-output/AI_ENGINEERING_LOG.md)
* [`_bmad-output/planning-artifacts/token_utilization_and_agent_metrics.md`](file:///c:/Valeo/AI-SDLC-BMAD/_bmad-output/planning-artifacts/token_utilization_and_agent_metrics.md)
