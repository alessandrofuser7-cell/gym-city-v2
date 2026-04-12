import "dotenv/config";
import mongoose from 'mongoose';
import User from '../models/User';
import { sendSubscriptionExpiryReminder } from '../services/email';

const MONGO_URI = process.env.MONGO_URI;

async function sendExpiryNotifications() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Find users expiring in 7 days or already expired (within last 7 days)
    const usersToNotify = await User.find({
      role: 'user',
      isActive: true,
      subscriptionExpiry: { 
        $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), 
        $lte: in7Days 
      }
    });

    console.log(`Found ${usersToNotify.length} users to notify`);

    for (const user of usersToNotify) {
      if (!user.subscriptionExpiry || !user.email) continue;

      const daysLeft = Math.ceil(
        (user.subscriptionExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Only send notification at specific intervals: 7 days, 3 days, 1 day, expired
      if (daysLeft === 7 || daysLeft === 3 || daysLeft === 1 || daysLeft <= 0) {
        console.log(`Sending notification to ${user.email} (${daysLeft} days left)`);
        
        const sent = await sendSubscriptionExpiryReminder(
          user.email,
          user.name,
          user.subscriptionExpiry,
          daysLeft
        );

        if (sent) {
          console.log(`✅ Email sent to ${user.email}`);
        } else {
          console.log(`❌ Failed to send email to ${user.email}`);
        }
      }
    }

    console.log('Notification job completed');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error in notification job:', error);
    process.exit(1);
  }
}

sendExpiryNotifications();
