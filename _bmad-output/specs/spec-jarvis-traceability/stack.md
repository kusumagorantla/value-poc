# Technology Stack & Deployment Architecture

## Core Technology Stack
* **Backend**: **.NET 8.0 Web API** (C#) — High-performance REST controller, Entity Framework Core / Dapper for PostgreSQL, System.Text.Json, Serilog.
* **Frontend / Simulator**: **ReactJS** (TypeScript / Vite / Tailwind CSS or Vanilla CSS) — Interactive Process Flow Configurator (BUC-0), PLC Payload Simulator & Trigger Tool (BUC-1/BUC-2), Real-time Results & Audit Viewer.
* **Database**: **PostgreSQL 17.0** — Storing Process Models, Station Mappings, Serialized Process Results, and Audit Logs.
* **Messaging / Streaming**: Direct in-memory / database queue for demo execution (Kafka integration interface maintained for future production scaling).
* **Containerization**: Multi-stage **Docker** containers for Backend (.NET 8 Web API), Frontend (React nginx container), and PostgreSQL 17 database.
* **Deployment Platform**: **Google Cloud Platform (GCP)** — Containerized deployment (GCP Cloud Run / GKE / Compute Engine) using Docker Compose or Kubernetes manifest, enabling zero-friction demonstration.

## Edge & Cloud Portability
* The .NET 8 API and PostgreSQL 17 DB execute seamlessly inside Docker containers on Linux/Ubuntu Edge PCs or GCP cloud instances.
