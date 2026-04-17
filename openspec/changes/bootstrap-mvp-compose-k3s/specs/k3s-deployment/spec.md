## ADDED Requirements

### Requirement: Kubernetes workload topology
The project SHALL provide Kubernetes manifests or templates for a k3s deployment topology that includes bot-api deployment, worker deployment, in-cluster Postgres stateful service, and in-cluster Redis stateful service.

#### Scenario: Workloads are created in target namespace
- **WHEN** an operator applies the deployment resources to a prepared k3s namespace
- **THEN** the bot-api, worker, Postgres, and Redis workloads MUST be created and schedulable

### Requirement: Stateful persistence configuration
The project SHALL configure persistent storage for in-cluster Postgres and Redis suitable for MVP continuity across pod restarts.

#### Scenario: Stateful pod restarts
- **WHEN** Postgres or Redis pod is restarted by the cluster
- **THEN** its configured persistent volume claim MUST preserve stored data expected for that service

### Requirement: Deployment runbook clarity
The project SHALL provide a step-by-step runbook for k3s deployment covering cluster bootstrap assumptions, namespace setup, secret/config setup, apply commands, and verification steps.

#### Scenario: Operator performs first deployment
- **WHEN** an operator follows the deployment runbook on a fresh VPS k3s instance
- **THEN** they MUST be able to complete a first deployment and verify running bot and worker workloads

### Requirement: Rollback and recovery instructions
The project SHALL document rollback procedures for failed application rollout and backup/restore guidance for Postgres data.

#### Scenario: Rollout regression occurs
- **WHEN** a new deployment version fails operational verification
- **THEN** the runbook MUST include explicit commands or steps to roll back to a prior version

### Requirement: CI/CD deployment pathway
The project SHALL define a GitHub Actions workflow that can build artifacts and trigger deployment updates to the k3s environment on mainline changes.

#### Scenario: Main branch update is released
- **WHEN** code is merged to the designated release branch
- **THEN** the CI/CD workflow MUST execute build/publish/deploy stages and report deployment status
