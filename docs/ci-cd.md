# CI/CD Deployment Flow

This project deploys automatically to k3s after pushes to `main`.

## How GitHub Actions knows where to deploy

Deployment target is defined by the `KUBE_CONFIG` GitHub secret.

- The workflow decodes `KUBE_CONFIG` into `~/.kube/config`.
- `kubectl` reads that file to know:
  - cluster API address (`server`)
  - credentials (token/cert)
  - context
- Then it runs `kubectl -n jarvis set image ...` and rollout checks.

So deployment goes to whichever cluster is described in `KUBE_CONFIG`.

## Required repository secrets

Configure in GitHub repository settings -> Secrets and variables -> Actions:

- `KUBE_CONFIG` - base64-encoded kubeconfig with access to your k3s cluster

## Create `KUBE_CONFIG`

On VPS with k3s installed:

```bash
base64 -w 0 /etc/rancher/k3s/k3s.yaml
```

Copy output into GitHub secret `KUBE_CONFIG`.

If your platform does not support `-w`, use:

```bash
base64 /etc/rancher/k3s/k3s.yaml | tr -d '\n'
```

## Workflow behavior

- `pull_request` to `main`: runs tests only.
- `push` to `main`: runs tests, builds/pushes GHCR image, deploys to k3s.
- `workflow_dispatch`: manual run of the same build/deploy flow.

Image tags pushed:

- `ghcr.io/afod3v/jarvis-dsc-bot:<git-sha>`
- `ghcr.io/afod3v/jarvis-dsc-bot:latest`

Deploy step uses immutable SHA tag:

- bot-api -> `:<git-sha>`
- worker -> `:<git-sha>`

## Optional debug commands in workflow logs

Add before deployment if needed:

```yaml
- name: Debug cluster target
  run: |
    kubectl config current-context
    kubectl cluster-info
    kubectl -n jarvis get deploy
```

## Notes

- Base manifests now default to `ghcr.io/afod3v/jarvis-dsc-bot:latest`.
- CI deployment still overrides running image to commit SHA for reproducibility.
