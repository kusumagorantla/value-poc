# Infrastructure & DevOps Best Practices — JARVIS Traceability Demo

> **Purpose:** A **demo-ready**, agent-consumable infrastructure standard for the JARVIS Process Result Traceability prototype — how to package, run, secure, observe, and deploy the .NET 8 API + React UI + PostgreSQL + Grafana so it stands up reliably for a live evaluation.
> **Scope:** Local/single-node **Docker Compose** demo that stays close to the Valeo platform direction (Docker, GCP/AWS, Kubernetes, Grafana, GitHub) but deliberately drops heavy orchestration for a reproducible, one-command demo.
> **How to use in BMAD:** place in `docs/org/` (or `devLoadAlwaysFiles`) so it loads as standing context for every infra/deployment story.

---

## 0. Demo Guardrails (read first)

| Priority | Practice | Why it matters for the demo |
|---|---|---|
| ✅ Must | One-command spin-up (`docker compose up`) | Reproducible, no "works on my machine" |
| ✅ Must | Everything containerized (API, UI, DB, Grafana) | Clean, portable, credible |
| ✅ Must | Config via env vars / secrets, never in code | Security + easy re-point |
| ✅ Must | Healthchecks + restart policy | Demo never dies mid-presentation |
| ✅ Must | Seeded DB on startup | VIB Annex-1 data ready to show |
| ✅ Must | Grafana wired to PostgreSQL | Latency + degraded/full panels |
| 🔶 Nice | GitHub Actions CI (build/test/scan) | AI-SDLC evidence |
| 🔶 Nice | K8s/ArgoCD manifests as "path to prod" | Shows platform alignment, not built |

---

## 1. Reference vs. Demo Stack

The functional requirement is VIB-defined; infra stays **close to Valeo's platform** but simplified to be demo-able.

| Concern | Valeo platform (reference) | **Demo-ready choice** | Rationale |
|---|---|---|---|
| Packaging | Docker | **Docker + Compose** | Same base tech, one-command run |
| Orchestration | Kubernetes + ArgoCD | **Compose (single node)** | Drop cluster complexity for demo |
| Cloud | GCP / AWS | **Local / single VM** | No cloud dependency to present |
| Edge runtime | Ubuntu Edge PC | **Linux container** | Represents the Edge tier simply |
| Messaging | Kafka (Edge↔Site) | **Omitted** | Not needed for core recording flow |
| Reporting | Grafana | **Grafana** | Kept — it's in the flow diagram |
| Repo / CI | GitHub | **GitHub + Actions** | Lightweight build/test/scan |
| Quality gates | SonarQube, Black Duck | **Analyzers + optional Sonar scan** | Right-sized for demo |

> Keep unbuilt items (K8s, ArgoCD, Kafka, cloud) documented as **"next step to production"** — this shows platform awareness without over-building.

---

## 2. Containerization

### 2.1 Principles
- **One process per container**; API, UI, DB, and Grafana are separate services.
- **Multi-stage builds** — small, secure runtime images; build tools never ship.
- **Non-root user** in the final image; pin base image tags (no `latest`).
- `.dockerignore` to keep build context lean (no `bin/`, `obj/`, `node_modules`).

### 2.2 Backend Dockerfile (multi-stage, example)
```dockerfile
# build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish Jarvis.Api -c Release -o /app

# runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
RUN adduser --disabled-password appuser && chown -R appuser /app
USER appuser
COPY --from=build /app .
EXPOSE 8080
ENTRYPOINT ["dotnet", "Jarvis.Api.dll"]
```

### 2.3 Frontend
- Build the React app, serve static assets via **nginx** (or the API's static hosting for simplicity).
- Inject `API_BASE`/`API_KEY` at container start via env, not baked into the bundle.

---

## 3. One-Command Demo (`docker-compose.yml`)

Everything the evaluator needs comes up together, seeded and healthy.
```yaml
services:
  db:
    image: postgres:17
    environment:
      POSTGRES_DB: jarvis
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - dbdata:/var/lib/postgresql/data
      - ./seed:/docker-entrypoint-initdb.d   # VIB Annex-1 seed
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 5s
      retries: 5

  api:
    build: ./backend
    depends_on:
      db: { condition: service_healthy }
    environment:
      ConnectionStrings__Default: "Host=db;Database=jarvis;Username=${DB_USER};Password=${DB_PASSWORD}"
      Api__Key: ${API_KEY}
    ports: ["8080:8080"]
    restart: unless-stopped

  ui:
    build: ./frontend
    depends_on: [api]
    environment:
      API_BASE: "http://localhost:8080"
    ports: ["3000:80"]
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    depends_on: [db]
    volumes:
      - ./grafana/provisioning:/etc/grafana/provisioning  # datasource + dashboards as code
    ports: ["3001:3000"]
    restart: unless-stopped

volumes:
  dbdata:
```

**Golden rule:** `docker compose up` → seeded DB + running API + UI + Grafana, no manual steps.

---

## 4. Configuration & Secrets

- **No secrets in code or committed files.** Use a `.env` (git-ignored) for the demo; env vars in real deployments.
- Provide a committed **`.env.example`** documenting every variable (no real values).
- Separate config per concern: DB creds, API key, connection strings.
- The app reads config via the **Options pattern** (from `dotnet-best-practices.md`) — never hard-coded.

```
# .env.example
DB_USER=jarvis_app
DB_PASSWORD=change_me
API_KEY=demo_key_change_me
```

---

## 5. Networking & Access

- Only expose the ports you demo: API (8080), UI (3000), Grafana (3001). Keep PostgreSQL **internal** to the compose network (don't publish 5432 unless needed).
- **HTTPS/TLS** in front where possible; at minimum document it as the prod step.
- Lock **CORS** on the API to the UI origin.
- Two DB users (from `data-best-practices.md`): least-privilege **app user** (read/write) + **read-only** user for Grafana.

---

## 6. Health, Reliability & Recovery

- **Healthchecks** on every service; `depends_on: condition: service_healthy` so startup order is correct.
- **`restart: unless-stopped`** so a hiccup during the demo self-heals.
- Expose a `/health` (liveness) and `/ready` (readiness) endpoint on the API (ASP.NET Core Health Checks).
- **Named volume** for PostgreSQL so data survives restarts; a reset script to return to a clean demo state.
- Offline resilience note (VIB Edge context): the Edge tier buffers locally — for the demo, the single node *is* the Edge; document Edge↔Site sync as a prod step.

---

## 7. Observability (feeds the VIB proofs)

- **Grafana provisioned as code** — datasource + dashboards live in `./grafana/provisioning`, so the panels exist on first boot (no manual clicking on stage).
- Two headline panels tied to VIB rules:
  1. **Recording latency** (`recording_latency_ms`) — proves the synchronous low-latency requirement.
  2. **Full vs. Degraded vs. Failed** counts — proves the no-data-loss / degraded-mode behavior.
- **Structured logs** from the API (serial, station, mode, latency) — one line per recording attempt.
- Optional: Prometheus/OpenTelemetry as "path to prod"; for the demo, Grafana over PostgreSQL is enough.

---

## 8. CI/CD (lightweight, evidence-generating)

Keep it simple but real — the pipeline itself is AI-SDLC evidence.
- **GitHub Actions** on push/PR: `restore → build (warnings-as-errors) → test (xUnit/Vitest) → optional Sonar scan → docker build`.
- Branch protection on `main`; PRs required; no direct pushes.
- Tag/version images; keep the compose file pointing at a known-good tag for the demo.
```yaml
# .github/workflows/ci.yml (sketch)
on: [push, pull_request]
jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with: { dotnet-version: '8.0.x' }
      - run: dotnet test --configuration Release
```

---

## 9. Security (right-sized)

- **Least privilege everywhere:** non-root containers, scoped DB users, minimal published ports.
- **Scan dependencies:** `dotnet list package --vulnerable`, `npm audit`, optional image scan (Trivy) in CI.
- **No secrets in images or git**; use env/secret injection.
- Pin all image and package versions; rebuild from trusted base images only.
- Document the **service-account boundary**: creating credentials/permissions stays a **human** decision — never delegated to an agent (an agent tends toward the broadest permission that makes the task succeed).

---

## 10. Reproducibility & Demo Runbook

- **README with a 3-step run:** `cp .env.example .env` → `docker compose up` → open UI/Grafana.
- Seed + migrations are **idempotent** — same result every run.
- A `make demo` / script that: builds, seeds VIB Annex-1 data, runs the PLC test-case fixture, and prints the URLs.
- Keep a **reset** command to return to a clean state between rehearsals.

---

## 11. Definition of Done (demo checklist)

- [ ] `docker compose up` brings up API + UI + DB + Grafana, seeded and healthy.
- [ ] Multi-stage, non-root, version-pinned images; `.dockerignore` in place.
- [ ] All config via env/secrets; `.env.example` committed, real `.env` git-ignored.
- [ ] Healthchecks + `restart: unless-stopped`; `/health` and `/ready` endpoints.
- [ ] PostgreSQL internal-only; app + read-only DB users; CORS locked.
- [ ] Grafana provisioned as code with latency + full/degraded/failed panels.
- [ ] GitHub Actions builds, tests, and scans on PR; `main` protected.
- [ ] Dependency + image scans clean; no secrets in git or images.
- [ ] README runbook + reset script make the demo reproducible.
- [ ] K8s/ArgoCD/Kafka/cloud documented as "next step to production."

---

*Companion to `dotnet-best-practices.md`, `react-best-practices.md`, and `data-best-practices.md` — a demo-ready, agent-loadable infrastructure standard for the JARVIS BMAD build.*
