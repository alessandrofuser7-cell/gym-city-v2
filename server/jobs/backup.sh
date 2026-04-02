#!/bin/bash
# Backup automatico MongoDB per Gym City
# Da eseguire via cron: 0 2 * * * /app/server/jobs/backup.sh

BACKUP_DIR="/var/backups/gymcity"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="gymcity_backup_$TIMESTAMP"
MONGO_URI="${MONGO_URI:-mongodb://localhost:27017/gymcity}"
RETENTION_DAYS=30

# Crea directory se non esiste
mkdir -p $BACKUP_DIR

# Esegui mongodump
echo "Starting backup: $BACKUP_NAME"
mongodump --uri="$MONGO_URI" --out="$BACKUP_DIR/$BACKUP_NAME"

# Comprimi il backup
cd $BACKUP_DIR
tar -czf "$BACKUP_NAME.tar.gz" "$BACKUP_NAME"
rm -rf "$BACKUP_NAME"

echo "Backup created: $BACKUP_DIR/$BACKUP_NAME.tar.gz"

# Rimuovi backup più vecchi di $RETENTION_DAYS giorni
find $BACKUP_DIR -name "gymcity_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete
echo "Old backups cleaned (older than $RETENTION_DAYS days)"

# Log
echo "$(date): Backup $BACKUP_NAME completed" >> $BACKUP_DIR/backup.log
