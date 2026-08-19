# Story 1.6: Infrastructure as Code (Terraform) & Automated CI/CD Deployment Pipelines

**Status**: PROPOSED 📋  
**Epic**: Epic 1: Foundation, Site Admin Console & 4-Tier Process Modeling (BUC-0)  
**Parent Epic**: Epic 1  

---

## Story Overview

As a DevOps / Cloud Platform Engineer,  
I want Terraform Infrastructure as Code (IaC) modules and automated CI/CD pipeline workflows (Google Cloud Build / GitHub Actions),  
So that GCP Cloud Infrastructure (VPC, Private Service Access, AlloyDB Cluster, App Engine / Cloud Run, and Grafana VM) and application releases can be declaratively provisioned and continuously deployed without manual steps.

---

## User Value & Rationale

Currently, GCP infrastructure resources (VPC, Subnets, PSA, App Engine, AlloyDB, Grafana VM) are provisioned via cloud console or manual CLI commands. Creating modular Terraform code (`main.tf`, `variables.tf`, `alloydb.tf`, `app_engine.tf`) and automated CI/CD pipelines guarantees repeatable, version-controlled environment creation across Development, Staging, and Production environments with zero configuration drift.

---

## Acceptance Criteria

1. **Terraform GCP Infrastructure Modules (`infra/terraform/`)**:
   * **Networking & Security**: Declarative Terraform configuration for GCP Custom VPC, Subnets, Private Service Access (PSA) IP allocation, and Serverless VPC Access Connector.
   * **GCP AlloyDB Cluster**: Terraform module (`alloydb.tf`) provisioning primary cluster, instance specs, and automated backups for `jarvis_site_db` & `jarvis_edge_db`.
   * **Application Hosting**: Terraform module (`app_engine.tf` / `cloud_run.tf`) for deploying the containerized .NET 8 Web API and React UI.
   * **Grafana VM**: Terraform compute instance module for Grafana hosting with firewall rules opening Port 3000.
2. **Automated CI/CD Deployment Pipeline (`.github/workflows/` or `cloudbuild.yaml`)**:
   * **Build & Test Stage**: Automatically runs `dotnet test` and `npm run build` on every Pull Request to `main`.
   * **Container Registry Artifact Stage**: Builds multi-stage Docker images for API and UI, pushing tags to GCP Artifact Registry (`pkg.dev`).
   * **Automated Cloud Deployment**: Automatically executes `terraform apply` and deploys container artifacts to GCP App Engine / Cloud Run.
3. **Environment Variable & Secret Management**:
   * Integration with GCP Secret Manager or GitHub Secrets for database credentials and service accounts.

---

## Implementation & Artifact Plan

* [`infra/terraform/main.tf`](file:///c:/Valeo/AI-SDLC-BMAD/infra/terraform/main.tf) — Provider & state backend configuration.
* [`infra/terraform/variables.tf`](file:///c:/Valeo/AI-SDLC-BMAD/infra/terraform/variables.tf) — GCP Project ID, region, and CIDR block variables.
* [`infra/terraform/modules/alloydb/`](file:///c:/Valeo/AI-SDLC-BMAD/infra/terraform/modules/alloydb/) — AlloyDB cluster and database schemas.
* [`.github/workflows/deploy.yml`](file:///c:/Valeo/AI-SDLC-BMAD/.github/workflows/deploy.yml) or [`cloudbuild.yaml`](file:///c:/Valeo/AI-SDLC-BMAD/cloudbuild.yaml) — CI/CD Pipeline definition.
