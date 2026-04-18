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

## Current Command Behavior

- `/tldr`
  - Input: YouTube URL + detail level (`low`, `mid`, `high`) + optional clip range (`start`, `end`)
  - Output language: Polish (`pl`)
  - Execution path: Gemini YouTube video input -> transcript fallback -> fallback message
  - Failure mode: if both video and transcript paths fail (for example disabled captions and video source unavailable), returns fallback message
- `/fc`
  - Input: natural-language claim
  - Output language: Polish (`pl`)
  - Returns verdict + explanation + source list

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

- Date: 2026-04-18
  - Learning: URL-only YouTube summarization can produce non-deterministic and irrelevant outputs for the same link.
  - Impact: `/tldr` reliability requires source-grounded input instead of plain URL prompting.
  - Action taken: `/tldr` was switched to transcript-first behavior with explicit fallback on transcript unavailability.

- Date: 2026-04-18
  - Learning: Re-running manual migration and command sync after each deployment is error-prone.
  - Impact: Operational drift can break commands even when deployments are healthy.
  - Action taken: CI/CD deploy workflow now runs `db:migrate` and `commands:sync` automatically after `bot-api` rollout.

- Date: 2026-04-18
  - Learning: Transcript-only strategy improves relevance but fails often for videos with disabled captions.
  - Impact: `/tldr` needs a primary source path that does not depend only on transcript availability.
  - Action taken: `/tldr` now uses Gemini video input (`fileData.fileUri`) as primary strategy and transcript summarization as fallback.
