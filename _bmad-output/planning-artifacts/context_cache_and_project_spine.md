# Context Refresh & Repository Architectural Spine Output Artifact

## Project Context & Architecture Invariants
- **Core Repository Block**: Standardized in `AGENTS.md` following JARVIS MOM standards.
- **Dual Database Architecture**: Site Central DB (`jarvis_site_db`) & Edge Line DB (`jarvis_edge_db`) with 30s background sync.
- **Zero Data Loss Guarantee**: Unlinked payloads persisted in `DEGRADED_MISSING_CONTEXT` with `payload_jsonb` field flexibility.

## Token Economics & Prompt Caching Analytics
| Metric | Value |
| :--- | :--- |
| Total Prompt Tokens | 257,970 tokens |
| Total Output Tokens | 51,460 tokens |
| Net Prompt Tokens | 309,430 tokens |
| Prompt Caching Hit Rate | **81.2%** |
| Net API Cost Estimate | $0.370 USD |
