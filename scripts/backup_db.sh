#!/bin/sh
# Daily database backup, keeps the last 7. On the server, from cron:
#   0 2 * * * cd /path/to/floodshield-bd && sh scripts/backup_db.sh
set -eu
mkdir -p backups
docker compose exec -T db pg_dump -U floodshield -Fc floodshield > backups/tmp.dump
mv backups/tmp.dump "backups/floodshield_$(date +%Y%m%d).dump"
ls -1t backups/floodshield_*.dump | tail -n +8 | xargs -r rm --
