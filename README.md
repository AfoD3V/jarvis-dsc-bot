# Jarvis DSC Bot

Discord bot MVP with two LLM-powered slash commands:

- `/tldr` - YouTube summarization with detail and language options
- `/fc` - fact-check verdict with cited evidence

The runtime is split into two services:

- `bot-api` - receives Discord interactions and enqueues jobs
- `worker` - executes long-running jobs against LLM/search providers

See:

- Local development: `docs/development.md`
- k3s deployment: `docs/deploy-k3s.md`
- CI/CD deployment: `docs/ci-cd.md`
- Agent reference and learning log policy: `AGENTS.md`
