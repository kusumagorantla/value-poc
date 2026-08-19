# Release Manifest & Containerization Output Artifact (v1.0.0-poc)

## Deployment Stack & Docker Compose Services
- **Backend Web API**: .NET 8.0 Web API (`Jarvis.Traceability.Api` on Port 5000)
- **Frontend Console**: React 18 + TypeScript + Vite (`jarvis-traceability-ui` on Port 5173)
- **Site Central Database**: PostgreSQL 17 (`jarvis_site_db` on Port 5432)
- **Edge Line Database**: PostgreSQL 17 (`jarvis_edge_db` on Port 5433)
- **Monitoring Infrastructure**: Grafana Dashboard (Port 3000)

## One-Command Docker Execution
```bash
docker compose up --build -d
```

## Readiness & Liveness Endpoints
- Liveness Probe: `GET /healthz` -> 200 OK
- Readiness Probe: `GET /ready` -> 200 OK
