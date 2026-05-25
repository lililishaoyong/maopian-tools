# Server Migration Runbook

Use this when moving the toolbox site to a cheaper or new cloud provider.

## 1. Create A Backup On The Old Server

```bash
scripts/backup.sh
```

Copy the generated `backups/backup-*.tar.gz` archive and the project source to the new server.

## 2. Prepare The New Server

Install Docker and Docker Compose, then copy the project directory to the new server.

```bash
cp .env.example .env
```

Replace `.env` with the production `.env` from the old server or edit the values manually.

For mainland China servers that need to crawl X through a proxy, keep the proxy in `.env` instead of the database:

```bash
X_CRAWL_PROXY_URL=socks5://proxy-host:proxy-port
```

Supported formats are `socks5://host:port`, `http://host:port`, and `http://user:pass@host:port`. Only the X crawler browser uses this proxy; the website, Redis, and admin APIs keep normal network access.

## 3. Restore Data

```bash
scripts/restore.sh backups/backup-YYYYmmdd-HHMMSS.tar.gz
```

## 4. Start Services

```bash
docker compose up -d --build
docker compose ps
```

## 5. Verify Before DNS Switch

```bash
curl -I http://SERVER_IP/
curl -s http://SERVER_IP/robots.txt
curl -s http://SERVER_IP/sitemap.xml
```

After logging into the admin panel, open `/admin/creators` and use "测试代理和 X 访问" before running a full crawl.

After the site responds correctly, switch DNS to the new server.
