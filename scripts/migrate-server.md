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

After logging into the admin panel, verify `/admin/resources`, `/admin/categories`, and `/admin/content`.

After the site responds correctly, switch DNS to the new server.
