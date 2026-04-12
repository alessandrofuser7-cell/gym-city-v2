import cron from 'node-cron';
import { exec } from 'child_process';
import User from '../models/User';
import { sendSubscriptionExpiryReminder } from '../services/email';

export function setupCronJobs() {
  // Backup MongoDB - ogni giorno alle 02:00
  cron.schedule('0 2 * * *', () => {
    console.log('[CRON] Avvio backup MongoDB...');
    exec('/app/server/jobs/backup.sh', (error, stdout, stderr) => {
      if (error) {
        console.error('[CRON] Errore backup:', error.message);
        return;
      }
      if (stderr) console.error('[CRON] Backup stderr:', stderr);
      console.log('[CRON] Backup completato:', stdout.trim());
    });
  }, { timezone: 'Europe/Rome' });

  // Notifiche scadenza abbonamento - ogni giorno alle 09:00
  cron.schedule('0 9 * * *', async () => {
    console.log('[CRON] Avvio invio notifiche scadenza...');
    try {
      await sendExpiryNotifications();
    } catch (error) {
      console.error('[CRON] Errore notifiche:', error);
    }
  }, { timezone: 'Europe/Rome' });

  console.log('[CRON] Job configurati: backup (02:00), notifiche (09:00) - timezone Europe/Rome');
}

async function sendExpiryNotifications() {
  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const usersToNotify = await User.find({
    role: 'user',
    isActive: { $ne: false },
    subscriptionExpiry: {
      $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      $lte: in7Days
    }
  });

  console.log(`[CRON] Trovati ${usersToNotify.length} utenti da notificare`);
  let sent = 0;

  for (const user of usersToNotify) {
    if (!user.subscriptionExpiry || !user.email) continue;

    const daysLeft = Math.ceil(
      (user.subscriptionExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysLeft === 7 || daysLeft === 3 || daysLeft === 1 || daysLeft <= 0) {
      const ok = await sendSubscriptionExpiryReminder(
        user.email,
        user.name,
        user.subscriptionExpiry,
        daysLeft
      );
      if (ok) sent++;
    }
  }

  console.log(`[CRON] Notifiche inviate: ${sent}/${usersToNotify.length}`);
}
