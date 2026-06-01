---
name: maopian-production-deploy
description: Use this skill for the maopian-tools project when Codex needs to prepare, validate, commit, push, monitor, or manually run production deployment to miaopian.top from a local checkout, especially on a new computer or after code changes.
---

# Maopian Production Deploy

## Core Workflow

Use the repository runbook for full human-facing setup details:
`docs/production-deploy-runbook.md`.

For ordinary production deploys:

1. Confirm the repo is `/Users/mac/Documents/maopian-tools` or another checkout of `github.com:lililishaoyong/maopian-tools`.
2. Inspect `git status --short`; do not include unrelated dirty files.
3. Run local checks before pushing:
   - `npm run typecheck`
   - `npm run lint`
   - `npm run build`
4. Commit only the intended files with a concise message.
5. Fetch and rebase onto latest main before pushing:
   - `git fetch origin main`
   - `git rebase origin/main`
6. Push `main` to trigger `.github/workflows/deploy-production.yml`.
7. Verify production:
   - `curl -fsS https://miaopian.top/api/health`
   - Expect JSON containing `"ok":true` and `"redis":"ok"`.

## Deployment Paths

Prefer GitHub Actions deployment by pushing `main`. The workflow checks types and lint, SSHes into the production server, then runs `scripts/deploy-production.sh`.

Use direct SSH only when Actions cannot be inspected or must be bypassed:

```bash
ssh -p 2022 -o BatchMode=yes -o ConnectTimeout=10 -o StrictHostKeyChecking=no root@156.239.236.174 \
  'cd /opt/maopian-tools && git fetch origin main && git reset --hard origin/main && SKIP_PULL=1 sh scripts/deploy-production.sh'
```

The direct deploy must show:

- Server `HEAD` at the intended commit
- Docker build success
- `maopian-tools_web_1` up
- Health check success
- `Production deploy finished.`

## New Computer Checklist

On a new computer, ensure:

- GitHub SSH access can clone and push `git@github.com:lililishaoyong/maopian-tools.git`.
- Node.js 22 is installed.
- Dependencies are installed with `npm ci`.
- Production SSH key can reach `root@156.239.236.174` on port `2022` if manual deploy is needed.
- Local `.env` can be copied from `.env.example`; never commit real `.env` values.
- Optional: copy this skill folder to `${CODEX_HOME:-$HOME/.codex}/skills/maopian-production-deploy` so Codex auto-discovers it.

## Guardrails

- Never run `git reset --hard` locally unless the user explicitly asks. Server-side reset inside the deploy command is expected.
- Never overwrite remote `main`; if push is rejected, fetch and rebase.
- Do not commit `.env`, `.env.local`, `.next`, `node_modules`, backups, or runtime data.
- If local checks fail, fix them before deployment.
- If production deploy fails after container recreation, report the failing step, recent logs, and current container status.
