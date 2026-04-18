# Development Guide (Docker Compose)

## Prerequisites

- Docker with Compose v2
- Discord application and bot token
- API keys: Gemini, fact-check model provider, and search provider

## 1) Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set all required secrets.

## 2) Start local stack

```bash
docker compose up --build -d
```

Services started:

- `postgres`
- `redis`
- `bot`
- `worker`

## 3) First-run initialization

Run migrations and sync slash commands:

```bash
docker compose exec bot npm run db:migrate
docker compose exec bot npm run commands:sync
```

Note: these are local-only setup steps. In production, CI/CD runs migration and command sync automatically during deploy.

## 4) Validate service health

```bash
curl http://localhost:3001/healthz
curl http://localhost:3002/healthz
```

## 5) Inspect logs

```bash
docker compose logs -f bot
docker compose logs -f worker
```

## 6) Stop stack

```bash
docker compose down
```

To remove local data volumes too:

```bash
docker compose down -v
```

## Troubleshooting

### Missing environment variables

- Symptom: app exits on startup with config validation errors.
- Fix: update `.env` values and restart `bot`/`worker`.

### Postgres or Redis not healthy

- Symptom: `bot`/`worker` restart loop.
- Fix: check dependency logs:

```bash
docker compose logs postgres
docker compose logs redis
```

### Slash commands not visible

- Symptom: `/tldr` and `/fc` not listed in Discord.
- Fix: ensure `DISCORD_CLIENT_ID` and `DISCORD_GUILD_ID` are correct, then rerun:

```bash
docker compose exec bot npm run commands:sync
```

### Queue stuck or delayed responses

- Symptom: interaction acknowledged but final result never appears.
- Fix: inspect `worker` logs and verify external provider keys and endpoints.
