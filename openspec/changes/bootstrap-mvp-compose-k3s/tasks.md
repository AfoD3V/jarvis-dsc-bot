## 1. Repository and runtime foundation

- [x] 1.1 Create initial Node.js project structure for shared domain modules plus separate `bot-api` and `worker` services
- [x] 1.2 Add configuration and environment loading with explicit validation for Discord, LLM, search, Postgres, and Redis settings
- [x] 1.3 Implement Redis queue wiring and Postgres connection scaffolding shared across runtime services
- [x] 1.4 Add structured logging with request correlation IDs across intake, queue, and completion stages

## 2. Command domain and provider adapters

- [x] 2.1 Define command service interfaces and provider adapter contracts for summarization and fact-check workflows
- [x] 2.2 Implement `/tldr` workflow in domain service including detail-level and language parameter handling
- [x] 2.3 Implement `/fc` workflow in domain service including verdict classification, evidence normalization, and uncertainty path
- [x] 2.4 Implement transcript unavailability fallback and insufficient-evidence fallback responses per requirements

## 3. Discord interaction and worker execution

- [x] 3.1 Implement slash-command registration and interaction handlers for `/tldr` and `/fc`
- [x] 3.2 Implement deferred reply flow in `bot-api` and enqueue command jobs for worker execution
- [x] 3.3 Implement worker job consumers that execute command services and publish final response payloads
- [x] 3.4 Verify end-to-end command lifecycle logging and error handling across both services

## 4. Docker Compose development environment

- [x] 4.1 Create Dockerfiles and Docker Compose definition for `bot`, `worker`, `postgres`, and `redis`
- [x] 4.2 Add compose health checks, service dependency ordering, and volume configuration for local development
- [x] 4.3 Create `.env.example` with required variables and safe defaults for local development
- [x] 4.4 Write developer runbook for startup, first-run migration/command sync, log inspection, and common troubleshooting

## 5. k3s deployment baseline

- [x] 5.1 Create Kubernetes namespace, ConfigMap, and Secret templates for runtime configuration
- [x] 5.2 Create StatefulSet and PVC manifests for in-cluster Postgres and Redis with MVP storage sizing
- [x] 5.3 Create Deployment manifests for `bot-api` and `worker` with readiness/liveness probes and resource requests
- [x] 5.4 Document deployment verification, rollback commands, and Postgres backup/restore runbook for single-node k3s

## 6. CI/CD and operational validation

- [x] 6.1 Add GitHub Actions workflow to run checks, build images, and publish to container registry on `main`
- [x] 6.2 Add deployment stage in GitHub Actions to update k3s workloads and report rollout status
- [ ] 6.3 Validate fresh-clone local onboarding flow by following docs end-to-end
- [ ] 6.4 Validate first production deployment flow on k3s and capture any runbook corrections needed for repeatability
