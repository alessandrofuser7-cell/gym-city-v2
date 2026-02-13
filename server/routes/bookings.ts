import { Router, Response } from 'express';
import Booking from '../models/Booking';
import Schedule from '../models/Schedule';
import User from '../models/User';
import { authenticate, AuthRequest, requireRole, checkSubscription } from '../middleware/auth';

const router = Router();

// Get user's bookings
router.get('/my', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await Booking.find({ 
      userId: req.user!._id,
      status: { $ne: 'cancelled' }
    })
    .populate({
      path: 'scheduleId',
      populate: { path: 'courseId', select: 'name color intensity' }
    })
    .sort({ date: -1 });

    res.json(bookings.map(b => ({
      id: b._id,
      scheduleId: (b.scheduleId as any)?._id,
      courseName: (b.scheduleId as any)?.courseId?.name || '',
      courseColor: (b.scheduleId as any)?.courseId?.color || '',
      day: (b.scheduleId as any)?.day || '',
      time: (b.scheduleId as any)?.time || '',
      instructor: (b.scheduleId as any)?.instructorName || '',
      date: b.date,
      status: b.status
    })));
  } catch (error) {
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Get bookings count for a schedule on a specific date (public for capacity display)
router.get('/count/:scheduleId/:date', async (req, res: Response) => {
  try {
    const { scheduleId, date } = req.params;
    
    const count = await Booking.countDocuments({
      scheduleId,
      date,
      status: 'confirmed'
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Create booking (requires valid subscription)
router.post('/', authenticate, checkSubscription, async (req: AuthRequest, res: Response) => {
  try {
    const { scheduleId, date } = req.body;

    if (!scheduleId || !date) {
      return res.status(400).json({ message: 'Dati mancanti' });
    }

    // Check if schedule exists
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule || !schedule.isActive) {
      return res.status(404).json({ message: 'Lezione non trovata' });
    }

    // Check if user already booked for this date (max 1 per day)
    const existingBookingToday = await Booking.findOne({
      userId: req.user!._id,
      date,
      status: 'confirmed'
    });

    if (existingBookingToday) {
      return res.status(400).json({ message: 'Puoi prenotare un solo corso al giorno' });
    }

    // Check if already booked this specific class
    const existingBooking = await Booking.findOne({
      userId: req.user!._id,
      scheduleId,
      date,
      status: 'confirmed'
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'Hai già prenotato questa lezione' });
    }

    // Check capacity
    const currentBookings = await Booking.countDocuments({
      scheduleId,
      date,
      status: 'confirmed'
    });

    if (currentBookings >= schedule.capacity) {
      return res.status(400).json({ message: 'Posti esauriti per questa lezione' });
    }

    const booking = new Booking({
      userId: req.user!._id,
      scheduleId,
      date,
      status: 'confirmed'
    });

    await booking.save();

    res.status(201).json({
      id: booking._id,
      scheduleId: booking.scheduleId,
      date: booking.date,
      status: booking.status
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Cancel booking
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findOne({
      _id: id,
      userId: req.user!._id
    });

    if (!booking) {
      return res.status(404).json({ message: 'Prenotazione non trovata' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Prenotazione cancellata' });
  } catch (error) {
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Admin/Instructor: Get all bookings for a date
router.get('/date/:date', authenticate, requireRole('admin', 'instructor'), async (req: AuthRequest, res: Response) => {
  try {
    const { date } = req.params;

    const bookings = await Booking.find({ date, status: 'confirmed' })
      .populate('userId', 'name email phone')
      .populate({
        path: 'scheduleId',
        populate: { path: 'courseId', select: 'name' }
      });

    res.json(bookings.map(b => ({
      id: b._id,
      userName: (b.userId as any)?.name || '',
      userEmail: (b.userId as any)?.email || '',
      userPhone: (b.userId as any)?.phone || '',
      courseName: (b.scheduleId as any)?.courseId?.name || '',
      time: (b.scheduleId as any)?.time || '',
      day: (b.scheduleId as any)?.day || '',
      status: b.status
    })));
  } catch (error) {
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Admin: Mark booking as attended
router.put('/:id/attended', authenticate, requireRole('admin', 'instructor'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: 'attended' },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Prenotazione non trovata' });
    }

    res.json({ message: 'Presenza registrata' });
  } catch (error) {
    res.status(500).json({ message: 'Errore del server' });
  }
});

export default router;
