# Story 1.4: Containerized Multi-Stage Build & Docker Compose Infrastructure Provisioning

**Status**: DONE ✅  
**Epic**: Epic 1: Foundation, Site Admin Console & 4-Tier Process Modeling (BUC-0)  
**Parent Epic**: Epic 1  

---

## Story Overview

As a DevOps Engineer / System Evaluator,  
I want multi-stage Dockerfiles and a unified `docker-compose.yml` manifest orchestrating API, UI, PostgreSQL 17, and Grafana,  
So that the entire Valeo MOM solution can be started with a single `docker compose up` command.

---

## Acceptance Criteria

1. **Multi-Stage Dockerfiles**:
   * **Backend API**: `src/Jarvis.Traceability.Api/Dockerfile` uses `mcr.microsoft.com/dotnet/sdk:8.0` for compilation and lightweight non-root `mcr.microsoft.com/dotnet/aspnet:8.0` for runtime.
   * **Frontend UI**: `frontend/Dockerfile` uses `node:20-alpine` for Vite building and `nginx:alpine` for production web serving.
2. **One-Command Orchestration**:
   * `docker-compose.yml` orchestrates 4 core containers: `jarvis-postgres` (PostgreSQL 17), `jarvis-backend-api` (Port 5000), `jarvis-react-ui` (Port 80/5173), and `jarvis-grafana-reports` (Port 3000).
3. **Health Checks**:
   * `/healthz` liveness and `/ready` readiness endpoints returning 200 OK.
4. **Grafana & DB Provisioning**:
   * Pre-configured PostgreSQL datasources and quality analytics dashboard JSON provisioned on startup.

---

## Verification & Implementation Artifacts

* [`docker-compose.yml`](file:///c:/Valeo/AI-SDLC-BMAD/docker-compose.yml)
* [`src/Jarvis.Traceability.Api/Dockerfile`](file:///c:/Valeo/AI-SDLC-BMAD/src/Jarvis.Traceability.Api/Dockerfile)
* [`frontend/Dockerfile`](file:///c:/Valeo/AI-SDLC-BMAD/frontend/Dockerfile)
* [`grafana/provisioning/`](file:///c:/Valeo/AI-SDLC-BMAD/grafana/provisioning/)
