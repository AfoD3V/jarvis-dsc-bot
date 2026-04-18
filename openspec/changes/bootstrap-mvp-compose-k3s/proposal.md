## Why

The repository currently contains only a prototype vision and no runnable bot, local environment, or deployment workflow. We need a concrete MVP baseline now so development can start quickly, be reproducible on any machine, and deploy consistently to a k3s VPS.

## What Changes

- Bootstrap the Discord bot MVP with a modular runtime split into an interaction-facing service and background worker service.
- Deliver two initial slash-command capabilities: `/tldr` (YouTube summary with detail level) and `/fc` (fact-check verdict with evidence and citations).
- Define provider abstractions for LLM and web-search integrations so future model/vendor changes and MCP/n8n extensions do not require command rewrites.
- Add a clear Docker Compose development workflow with Postgres and Redis dependencies, including first-run and troubleshooting guidance.
- Add a clear k3s deployment workflow for a VPS, including in-cluster Postgres/Redis, Kubernetes resource layout, and GitHub Actions-based deployment flow.

## Capabilities

### New Capabilities
- `jarvis-bot-runtime`: Modular Discord bot runtime with API/worker separation, queue-backed background execution, and extension-ready integration boundaries.
- `llm-slash-commands`: MVP slash commands `/tldr` and `/fc` with configurable output detail, language targeting, and citation-backed responses.
- `docker-compose-dev-environment`: Reproducible local development environment that runs all required services with a single compose workflow.
- `k3s-deployment`: Production deployment model and runbook for k3s on VPS, including in-cluster data services and CI/CD rollout guidance.

### Modified Capabilities
- None.

## Impact

- Adds initial application code structure for bot runtime, command handlers, worker processing, and provider adapters.
- Introduces infrastructure artifacts for local containers and Kubernetes deployment descriptors.
- Adds operational documentation for developer onboarding, environment setup, deployment, rollback, and recovery.
- Introduces required external dependencies: Discord API, LLM providers (Gemini and fact-check model provider), search provider, Postgres, and Redis.
