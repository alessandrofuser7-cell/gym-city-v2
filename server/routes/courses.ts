import { Router, Response } from 'express';
import Course from '../models/Course';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

// Get all courses (public)
router.get('/', async (req, res: Response) => {
  try {
    const courses = await Course.find({ isActive: true }).sort({ name: 1 });
    res.json(courses.map(c => ({
      id: c._id,
      name: c.name,
      description: c.description,
      intensity: c.intensity,
      color: c.color
    })));
  } catch (error) {
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Admin: Create course
router.post('/', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, intensity, color } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: 'Nome e descrizione sono richiesti' });
    }

    const course = new Course({
      name,
      description,
      intensity: intensity || 'media',
      color: color || 'bg-primary'
    });

    await course.save();

    res.status(201).json({
      id: course._id,
      name: course.name,
      description: course.description,
      intensity: course.intensity,
      color: course.color
    });
  } catch (error) {
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Admin: Update course
router.put('/:id', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, intensity, color, isActive } = req.body;

    const course = await Course.findByIdAndUpdate(
      id,
      { name, description, intensity, color, isActive },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ message: 'Corso non trovato' });
    }

    res.json({
      id: course._id,
      name: course.name,
      description: course.description,
      intensity: course.intensity,
      color: course.color
    });
  } catch (error) {
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Admin: Delete course
router.delete('/:id', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await Course.findByIdAndUpdate(id, { isActive: false });
    res.json({ message: 'Corso disattivato con successo' });
  } catch (error) {
    res.status(500).json({ message: 'Errore del server' });
  }
});

export default router;
