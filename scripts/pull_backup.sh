#!/bin/sh
# Copy the newest database backup from the server to this computer (backups/, ignored by git), keeping the last 7.
# A second copy away from the server means a lost or broken VM does not take the backups with it.
# Usage (Git Bash, from repo root): sh scripts/pull_backup.sh
# Needs: the server's SSH key; set FS_KEY / FS_HOST if they differ from the defaults below.
set -eu
KEY="${FS_KEY:-$HOME/.ssh/floodshield_key.pem}"
HOST="${FS_HOST:-azureuser@172.198.139.191}"
mkdir -p backups
latest=$(ssh -i "$KEY" "$HOST" "ls -1t ~/floodshield/backups/floodshield_*.dump | head -n 1")
[ -n "$latest" ] || { echo "No backup found on the server"; exit 1; }
name=$(basename "$latest")
if [ -f "backups/$name" ]; then echo "Already have $name"; exit 0; fi
scp -q -i "$KEY" "$HOST:$latest" "backups/$name.part"
mv "backups/$name.part" "backups/$name"
echo "Copied $name ($(du -h "backups/$name" | cut -f1))"
ls -1t backups/floodshield_*.dump | tail -n +8 | xargs -r rm --
