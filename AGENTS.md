# AGENTS Reference

This file is a persistent reference for people and AI agents working in this repository.

## Project Snapshot

- Project: `jarvis-dsc-bot`
- Runtime: Node.js 20+, ESM modules
- Primary services:
  - `bot-api` (`src/bot-api`) - Discord interactions and job enqueue
  - `worker` (`src/worker`) - background processing and final response posting
- Shared modules: `src/shared`
- Local stack: `docker-compose.yml`
- Kubernetes manifests: `k8s/base`

## Operational Commands

- Install deps: `npm install`
- Start bot service locally: `npm run start:bot`
- Start worker locally: `npm run start:worker`
- Run DB migration: `npm run db:migrate`
- Sync Discord slash commands: `npm run commands:sync`
- Run tests: `npm test`

## OpenSpec Workflow Reference

- Propose a change: `/opsx-propose`
- Implement tasks: `/opsx-apply`
- Archive a completed change: `/opsx-archive`

## Learning

This section is mandatory maintenance: **whenever we learn something new about architecture, operations, constraints, or recurring failures, we add an entry here.**

Entry format:

- Date:
- Learning:
- Impact:
- Action taken:

### Learning Log

- Date: 2026-04-17
  - Learning: Discord bot MVP does not require ingress when it only uses outbound gateway/webhook interactions.
  - Impact: k3s baseline can stay simpler and safer on single-node VPS.
  - Action taken: Deployment docs were written without ingress as a default requirement.

- Date: 2026-04-17
  - Learning: Running long LLM/search work inside interaction handlers risks Discord timeout and poor responsiveness.
  - Impact: Queue-backed worker separation is required from day one.
  - Action taken: Runtime was split into `bot-api` and `worker` with Redis queue handoff.
