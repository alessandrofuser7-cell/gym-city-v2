import { Router, Response } from 'express';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import User from '../models/User';
import Course from '../models/Course';
import Schedule from '../models/Schedule';
import Booking from '../models/Booking';
import { sendSubscriptionExpiryReminder } from '../services/email';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);
const router = Router();

// Get users with expiring subscriptions
router.get('/expiring-subscriptions', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Users expiring in 7 days
    const expiringIn7Days = await User.find({
      role: 'user',
      isActive: true,
      subscriptionExpiry: { $gte: now, $lte: in7Days }
    }).select('-password').sort({ subscriptionExpiry: 1 });

    // Users expiring in 30 days (but more than 7)
    const expiringIn30Days = await User.find({
      role: 'user',
      isActive: true,
      subscriptionExpiry: { $gt: in7Days, $lte: in30Days }
    }).select('-password').sort({ subscriptionExpiry: 1 });

    // Already expired users
    const expired = await User.find({
      role: 'user',
      isActive: true,
      subscriptionExpiry: { $lt: now }
    }).select('-password').sort({ subscriptionExpiry: -1 });

    res.json({
      expiringIn7Days: expiringIn7Days.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        subscriptionExpiry: u.subscriptionExpiry
      })),
      expiringIn30Days: expiringIn30Days.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        subscriptionExpiry: u.subscriptionExpiry
      })),
      expired: expired.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        subscriptionExpiry: u.subscriptionExpiry
      }))
    });
  } catch (error) {
    console.error('Error fetching expiring subscriptions:', error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Export database backup (JSON format)
router.get('/backup', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    // Get all data
    const users = await User.find().select('-password').limit(1000);
    const courses = await Course.find().limit(500);
    const schedules = await Schedule.find().limit(1000);
    const bookings = await Booking.find().limit(5000);

    const backup = {
      exportDate: new Date().toISOString(),
      exportedBy: req.user!.email,
      data: {
        users: users.map(u => ({
          id: u._id,
          email: u.email,
          name: u.name,
          phone: u.phone,
          role: u.role,
          subscriptionExpiry: u.subscriptionExpiry,
          isActive: u.isActive,
          mustChangePassword: u.mustChangePassword,
          createdAt: u.createdAt
        })),
        courses: courses.map(c => ({
          id: c._id,
          name: c.name,
          description: c.description,
          intensity: c.intensity,
          color: c.color,
          isActive: c.isActive
        })),
        schedules: schedules.map(s => ({
          id: s._id,
          courseId: s.courseId,
          day: s.day,
          time: s.time,
          instructorId: s.instructorId,
          instructorName: s.instructorName,
          capacity: s.capacity,
          isActive: s.isActive
        })),
        bookings: bookings.map(b => ({
          id: b._id,
          userId: b.userId,
          scheduleId: b.scheduleId,
          date: b.date,
          status: b.status,
          createdAt: b.createdAt
        }))
      },
      stats: {
        totalUsers: users.length,
        totalCourses: courses.length,
        totalSchedules: schedules.length,
        totalBookings: bookings.length
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=gymcity_backup_${new Date().toISOString().split('T')[0]}.json`);
    res.json(backup);
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ message: 'Errore durante la creazione del backup' });
  }
});

// MongoDB dump backup (admin only)
router.post('/backup/dump', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const backupDir = '/tmp/gymcity_backups';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `backup_${timestamp}`);

    // Create backup directory
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Run mongodump
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/gymcity';
    await execAsync(`mongodump --uri="${mongoUri}" --out="${backupPath}"`);

    res.json({ 
      message: 'Backup completato',
      path: backupPath,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating MongoDB dump:', error);
    res.status(500).json({ message: 'Errore durante il backup MongoDB' });
  }
});

// Send expiry notifications manually
router.post('/send-expiry-notifications', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
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

    const results: { email: string; sent: boolean; daysLeft: number }[] = [];

    for (const user of usersToNotify) {
      if (!user.subscriptionExpiry || !user.email) continue;

      const daysLeft = Math.ceil(
        (user.subscriptionExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      const sent = await sendSubscriptionExpiryReminder(
        user.email,
        user.name,
        user.subscriptionExpiry,
        daysLeft
      );

      results.push({ email: user.email, sent, daysLeft });
    }

    res.json({
      message: `Notifiche inviate a ${results.filter(r => r.sent).length}/${results.length} utenti`,
      results
    });
  } catch (error) {
    console.error('Error sending notifications:', error);
    res.status(500).json({ message: 'Errore durante l\'invio delle notifiche' });
  }
});

export default router;
