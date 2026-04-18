# Deployment Guide (k3s on VPS)

This guide assumes **single-node k3s** with in-cluster Postgres and Redis.

## Prerequisites

- Linux VPS with root access
- `kubectl` configured on the server (or your admin machine)
- Container registry access (GHCR recommended)

## 1) Bootstrap k3s

```bash
curl -sfL https://get.k3s.io | sh -
sudo k3s kubectl get nodes
```

If you use local `kubectl`:

```bash
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $(id -u):$(id -g) ~/.kube/config
kubectl get nodes
```

## 2) Prepare manifests and secrets

Update image references in:

- `k8s/base/bot-api-deployment.yaml`
- `k8s/base/worker-deployment.yaml`

Create secrets manifest from template:

```bash
cp k8s/base/secret.example.yaml /tmp/jarvis-secrets.yaml
```

Edit `/tmp/jarvis-secrets.yaml` with real values.

## 3) Deploy namespace and workloads

```bash
kubectl apply -f /tmp/jarvis-secrets.yaml
kubectl apply -k k8s/base
```

## 4) Verify deployment

```bash
kubectl -n jarvis get pods
kubectl -n jarvis get pvc
kubectl -n jarvis rollout status deploy/bot-api
kubectl -n jarvis rollout status deploy/worker
```

Inspect logs:

```bash
kubectl -n jarvis logs deploy/bot-api -f
kubectl -n jarvis logs deploy/worker -f
```

## 5) Run migrations and command sync

For first-time manual deployment (without CI), run:

```bash
kubectl -n jarvis exec deploy/bot-api -- npm run db:migrate
kubectl -n jarvis exec deploy/bot-api -- npm run commands:sync
```

If you deploy via GitHub Actions (`main` branch), these commands run automatically as part of the deploy workflow.

## Rollback

If a rollout regresses:

```bash
kubectl -n jarvis rollout undo deploy/bot-api
kubectl -n jarvis rollout undo deploy/worker
```

## Postgres backup and restore

### Backup

```bash
kubectl -n jarvis exec postgres-0 -- sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > jarvis-backup.sql
```

Store `jarvis-backup.sql` off-node.

### Restore

```bash
kubectl -n jarvis exec -i postgres-0 -- sh -c 'psql -U "$POSTGRES_USER" "$POSTGRES_DB"' < jarvis-backup.sql
```

## Notes

- Discord bot MVP does not require ingress because it maintains outbound gateway connections.
- Add ingress only when exposing webhook/admin HTTP endpoints.
