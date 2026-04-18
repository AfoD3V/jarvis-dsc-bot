# Jarvis DSC Bot

Discord bot MVP with queue-backed background execution and two slash commands:

- `/tldr` - summarize a YouTube video in Polish with selectable detail level (`low`, `mid`, `high`)
- `/fc` - fact-check a claim and return verdict + sources

## Runtime Architecture

- `bot-api` (`src/bot-api`) receives Discord interactions, stores job records, and enqueues work
- `worker` (`src/worker`) executes long-running command jobs and posts follow-up responses
- `redis` backs BullMQ queue transport
- `postgres` stores durable job state

This split prevents Discord interaction timeout issues during LLM/search work.

## TLDR Notes

- Current `/tldr` behavior is transcript-based for reliability.
- If transcript is unavailable/disabled for a video, command returns a fallback message instead of hallucinating unrelated content.

## Deployment Notes

- CI/CD on `main` now performs post-deploy hooks automatically:
  - `npm run db:migrate`
  - `npm run commands:sync`
- These hooks run from GitHub Actions against the k3s cluster via `kubectl exec` in `bot-api`.

## Documentation

- Local development: `docs/development.md`
- k3s deployment: `docs/deploy-k3s.md`
- CI/CD deployment: `docs/ci-cd.md`
- Agent reference and learning log policy: `AGENTS.md`
