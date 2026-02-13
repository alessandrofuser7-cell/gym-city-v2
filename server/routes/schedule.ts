import { Router, Response } from 'express';
import Schedule from '../models/Schedule';
import Course from '../models/Course';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

// Get weekly schedule (public)
router.get('/', async (req, res: Response) => {
  try {
    const schedules = await Schedule.find({ isActive: true })
      .populate('courseId', 'name description intensity color')
      .sort({ day: 1, time: 1 });

    res.json(schedules.map(s => ({
      id: s._id,
      courseId: (s.courseId as any)?._id || s.courseId,
      courseName: (s.courseId as any)?.name || '',
      courseColor: (s.courseId as any)?.color || 'bg-primary',
      courseIntensity: (s.courseId as any)?.intensity || 'media',
      day: s.day,
      time: s.time,
      instructor: s.instructorName,
      instructorId: s.instructorId,
      capacity: s.capacity
    })));
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Admin: Create schedule item
router.post('/', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, day, time, instructorId, instructorName, capacity } = req.body;

    if (!courseId || !day || !time || !instructorName) {
      return res.status(400).json({ message: 'Dati mancanti' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Corso non trovato' });
    }

    const schedule = new Schedule({
      courseId,
      day,
      time,
      instructorId,
      instructorName,
      capacity: capacity || 20
    });

    await schedule.save();

    res.status(201).json({
      id: schedule._id,
      courseId: schedule.courseId,
      day: schedule.day,
      time: schedule.time,
      instructor: schedule.instructorName,
      capacity: schedule.capacity
    });
  } catch (error) {
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Admin: Update schedule item
router.put('/:id', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { courseId, day, time, instructorId, instructorName, capacity, isActive } = req.body;

    const schedule = await Schedule.findByIdAndUpdate(
      id,
      { courseId, day, time, instructorId, instructorName, capacity, isActive },
      { new: true }
    );

    if (!schedule) {
      return res.status(404).json({ message: 'Lezione non trovata' });
    }

    res.json({
      id: schedule._id,
      courseId: schedule.courseId,
      day: schedule.day,
      time: schedule.time,
      instructor: schedule.instructorName,
      capacity: schedule.capacity
    });
  } catch (error) {
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Admin: Delete schedule item
router.delete('/:id', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await Schedule.findByIdAndUpdate(id, { isActive: false });
    res.json({ message: 'Lezione rimossa con successo' });
  } catch (error) {
    res.status(500).json({ message: 'Errore del server' });
  }
});

export default router;
