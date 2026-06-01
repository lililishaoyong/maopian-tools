# 猫片项目生产部署手册

这份文档用于在任意电脑上完成 `maopian-tools` 的代码修改、验证、提交、推送和生产部署。

## 1. 项目信息

- 仓库：`git@github.com:lililishaoyong/maopian-tools.git`
- 主分支：`main`
- 生产站点：`https://miaopian.top`
- 健康检查：`https://miaopian.top/api/health`
- 生产服务器目录：`/opt/maopian-tools`
- 生产部署脚本：`scripts/deploy-production.sh`
- GitHub Actions：`.github/workflows/deploy-production.yml`

默认部署方式是推送 `main`，由 GitHub Actions 自动 SSH 到生产服务器并执行部署脚本。

## 2. 新电脑准备

安装基础工具：

```bash
git --version
node --version
npm --version
ssh -V
```

要求：

- Node.js 使用 22.x。
- GitHub SSH key 已加入你的 GitHub 账号。
- 如需手动部署，生产 SSH key 需要能连接 `root@156.239.236.174` 的 `2022` 端口。

克隆项目：

```bash
git clone git@github.com:lililishaoyong/maopian-tools.git
cd maopian-tools
npm ci
```

准备本地环境变量：

```bash
cp .env.example .env
```

本地开发可把 `.env` 设置为：

```bash
SITE_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379
ADMIN_USER=admin
ADMIN_PASSWORD=admin123456
NEXT_TELEMETRY_DISABLED=1
```

不要提交 `.env` 或 `.env.local`。

## 3. 本地开发

启动本地服务：

```bash
npm run dev
```

默认地址：

```text
http://localhost:3000
```

如果需要本地 Redis：

```bash
npm run redis:local
```

修改代码后，先在浏览器确认关键页面可用。

## 4. 提交前检查

部署前必须跑：

```bash
npm run typecheck
npm run lint
npm run build
```

查看待提交文件：

```bash
git status --short
git diff --stat
```

只提交本次相关文件，避免混入 `.env`、`.next`、`node_modules`、`backups`、`data` 等运行时文件。

## 5. 提交代码

先同步远端：

```bash
git fetch origin main
git rebase origin/main
```

如果有冲突，解决冲突后继续：

```bash
git add <resolved-files>
git rebase --continue
```

提交：

```bash
git add <changed-files>
git commit -m "Your concise commit message"
```

推送：

```bash
git push origin main
```

如果推送被拒绝，说明远端有新提交。不要强推，重新执行：

```bash
git fetch origin main
git rebase origin/main
git push origin main
```

## 6. 自动部署流程

推送 `main` 后，GitHub Actions 会执行：

1. `npm ci`
2. `npm run typecheck`
3. `npm run lint`
4. SSH 到生产服务器
5. 在 `/opt/maopian-tools` 拉取最新 `main`
6. 执行 `SKIP_PULL=1 sh scripts/deploy-production.sh`
7. 检查生产接口

可在 GitHub 仓库的 Actions 页面查看状态。

如果本机安装了 GitHub CLI：

```bash
gh run list --branch main --limit 3
gh run watch
```

## 7. 手动部署

只有在 GitHub Actions 无法查看、失败需要重跑，或你明确要绕过 Actions 时才使用手动部署。

先确认本地 `main` 已推送成功，然后执行：

```bash
ssh -p 2022 -o BatchMode=yes -o ConnectTimeout=10 -o StrictHostKeyChecking=no root@156.239.236.174 \
  'cd /opt/maopian-tools && git fetch origin main && git reset --hard origin/main && SKIP_PULL=1 sh scripts/deploy-production.sh'
```

成功日志应包含：

```text
HEAD is now at <commit>
Successfully built <image>
maopian-tools_web_1     Up
Health check: https://miaopian.top/api/health
Production deploy finished.
```

## 8. 部署后验证

健康检查：

```bash
curl -fsS https://miaopian.top/api/health
```

期望返回类似：

```json
{"ok":true,"redis":"ok","time":"..."}
```

再检查关键页面：

```bash
curl -fsS https://miaopian.top/ >/dev/null
curl -fsS https://miaopian.top/me >/dev/null
```

如果改动涉及后台功能，登录后台后手动检查对应页面，例如：

```text
https://miaopian.top/admin/categories
https://miaopian.top/admin/resources
https://miaopian.top/admin/content
```

## 9. 常见问题

### 推送失败：fetch first

远端有新提交：

```bash
git fetch origin main
git rebase origin/main
git push origin main
```

不要使用强推。

### GitHub API 或 gh 不可用

直接打开 GitHub Actions 页面查看，或在有生产 SSH 权限时执行手动部署命令。

### 生产构建失败

先看失败阶段：

- `npm ci` 失败：检查依赖和 lockfile。
- `npm run build` 失败：本地复现 `npm run build`。
- Docker 重建失败：检查 `Dockerfile`、依赖和服务器磁盘空间。
- 健康检查失败：查看 web 日志。

生产服务器查看日志：

```bash
ssh -p 2022 root@156.239.236.174 'cd /opt/maopian-tools && docker compose ps && docker compose logs --tail=80 web'
```

老服务器如果使用 `docker-compose`：

```bash
ssh -p 2022 root@156.239.236.174 'cd /opt/maopian-tools && docker-compose ps && docker-compose logs --tail=80 web'
```

### 本地不能启动 3000 端口

换端口或关闭占用进程：

```bash
npm run dev -- -p 3001
```

## 10. Codex Skill 使用

仓库内已保存 skill：

```text
.agents/skills/maopian-production-deploy
```

在另一台电脑上，如果希望 Codex 自动识别这个 skill，可以复制到本机 Codex skills 目录：

```bash
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
cp -R .agents/skills/maopian-production-deploy "${CODEX_HOME:-$HOME/.codex}/skills/"
```

以后可以对 Codex 说：

```text
使用 $maopian-production-deploy 帮我验证并部署猫片项目到生产。
```
