# Story 1.5: GCP Cloud Infrastructure Deployment & AlloyDB Configuration

**Status**: READY FOR DEPLOYMENT 🚀  
**Epic**: Epic 1: Foundation, Site Admin Console & 4-Tier Process Modeling (BUC-0)  
**Parent Epic**: Epic 1  

---

## Story Overview

As a Cloud & DevOps Engineer,  
I want the application configured to connect securely to provisioned GCP infrastructure (VPC, Subnets, PSA, App Engine, AlloyDB, and Grafana VM),  
So that Valeo MOM runs in GCP production with secure private database connectivity and cloud analytics.

---

## Acceptance Criteria

1. **GCP App Engine Deployment Configuration (`app.yaml`)**:
   * App Engine configuration file configured with Serverless VPC Access connector to route traffic to the provisioned VPC Subnet and Private Service Access (PSA).
2. **GCP AlloyDB Database Connection**:
   * Environment variables `ConnectionStrings__SiteConnection` and `ConnectionStrings__EdgeConnection` set to the provisioned AlloyDB Private IP (`jarvis_site_db` & `jarvis_edge_db`).
3. **Database Initialization**:
   * Execution of `scripts/init-db.sql` against GCP AlloyDB over Private Service Access to initialize central site and edge schemas.
4. **Grafana VM Quality Dashboard**:
   * Import [`valeo_traceability_quality.json`](file:///c:/Valeo/AI-SDLC-BMAD/grafana/dashboards/valeo_traceability_quality.json) into the Grafana instance running on VM and configure PostgreSQL datasource to AlloyDB `jarvis_edge_db`.

---

## Implementation & Configuration Artifacts

* [`src/Jarvis.Traceability.Api/app.yaml`](file:///c:/Valeo/AI-SDLC-BMAD/src/Jarvis.Traceability.Api/app.yaml)
* [`src/Jarvis.Traceability.Api/appsettings.json`](file:///c:/Valeo/AI-SDLC-BMAD/src/Jarvis.Traceability.Api/appsettings.json)
* [`grafana/dashboards/valeo_traceability_quality.json`](file:///c:/Valeo/AI-SDLC-BMAD/grafana/dashboards/valeo_traceability_quality.json)
