## Context

The project currently has a product vision but no runnable implementation. The MVP must ship quickly while keeping a structure that can grow into future integrations (MCP and n8n) without reworking command logic. Runtime behavior must satisfy Discord interaction constraints for long-running operations, and operations must be reproducible in both local development (Docker Compose) and production (single-node k3s on VPS with in-cluster Postgres/Redis).

## Goals / Non-Goals

**Goals:**
- Deliver an MVP runtime with a clear service boundary between Discord interaction handling and background command execution.
- Define reusable integration boundaries for LLM and search providers.
- Provide deterministic developer onboarding via Docker Compose.
- Provide deterministic k3s deployment guidance for VPS with in-cluster Postgres/Redis.
- Establish operational baseline: health checks, logging, rollout and rollback procedure, and basic backup guidance.

**Non-Goals:**
- Full MCP integration in this change.
- Full n8n workflow automation in this change.
- Multi-node Kubernetes high availability.
- Advanced autoscaling and multi-region deployment.

## Decisions

1. **Split runtime into `bot-api` and `worker` services.**
   - `bot-api` owns Discord gateway/slash interactions and immediate defer responses.
   - `worker` owns long-running `/tldr` and `/fc` processing.
   - **Alternative considered:** single process for all responsibilities.
   - **Why not chosen:** long-running LLM and search calls can block Discord interaction responsiveness and make scaling/operability harder.

2. **Use Redis as the queue and Postgres as persistent state store for MVP.**
   - Redis stores queued jobs and transient execution state.
   - Postgres stores durable metadata (job records, command history, config-like runtime state).
   - **Alternative considered:** Postgres-only queue or in-memory queue.
   - **Why not chosen:** in-memory queue is not resilient; Postgres-only queue increases complexity for MVP throughput and retry handling.

3. **Use provider adapter interfaces for LLM/search integrations.**
   - Command handlers call domain services, not provider SDKs directly.
   - Adapters are selected through configuration to support future vendor swaps.
   - **Alternative considered:** direct SDK calls in each command handler.
   - **Why not chosen:** creates coupling that makes future MCP/n8n and provider substitution expensive.

4. **Model `/tldr` and `/fc` as asynchronous command workflows with explicit fallback behavior.**
   - `/tldr` must support language and detail controls and handle transcript unavailability.
   - `/fc` must produce verdict categories with citation-backed evidence and uncertainty path.
   - **Alternative considered:** synchronous responses only.
   - **Why not chosen:** unreliable under external API latency and Discord timing constraints.

5. **Standardize local development around Docker Compose with four services (`bot`, `worker`, `postgres`, `redis`).**
   - Include first-run migration and slash-command sync steps in docs.
   - **Alternative considered:** host-native setup without containers.
   - **Why not chosen:** lower reproducibility across machines and higher onboarding friction.

6. **Deploy to single-node k3s on VPS with in-cluster Postgres/Redis for MVP.**
   - Stateful services run as StatefulSets with PVCs.
   - App services run as Deployments with readiness/liveness probes.
   - **Alternative considered:** external managed Postgres/Redis now.
   - **Why not chosen:** faster MVP path and lower initial operational setup burden.

7. **Automate deploy from GitHub Actions on `main` through image publish and k3s rollout.**
   - Pipeline stages: test/build, image push, deployment update, rollout verification.
   - **Alternative considered:** manual image build and kubectl-only deployment.
   - **Why not chosen:** higher release error rate and slower iteration cycle.

## Risks / Trade-offs

- [Single-node k3s is a durability and availability bottleneck] -> Mitigate with documented Postgres backups to off-node storage and tested restore runbook.
- [External API cost can spike with unbounded command use] -> Mitigate with per-command limits, request timeout, and usage logging.
- [Transcript availability for some YouTube videos is inconsistent] -> Mitigate with explicit fallback response and optional transcript-source retries.
- [Fact-check output quality depends on search result quality] -> Mitigate with source-count threshold and explicit `UNKNOWN` verdict when evidence is insufficient.
- [Queue backlog can delay command completion] -> Mitigate with worker concurrency tuning and queue health monitoring.

## Migration Plan

1. Introduce runtime skeleton with `bot-api`, `worker`, shared core domain modules, and configuration layer.
2. Introduce data and queue dependencies locally with Docker Compose and validate first-run onboarding steps.
3. Implement `/tldr` and `/fc` workflows end-to-end with adapter-based provider integrations.
4. Add Kubernetes resources for namespace, stateful services, app deployments, and operational probes.
5. Add GitHub Actions deployment workflow and validate rollout and rollback commands.
6. Verify backup and restore procedure for in-cluster Postgres before production use.

## Open Questions

- Which exact provider(s) are default for `/fc` in MVP (Claude direct API vs broker/provider abstraction over multiple models)?
- Do we persist full response payloads for debugging, or only normalized command results and references?
- Should we include optional webhook endpoint scaffolding in MVP docs to pre-stage n8n integration points?
