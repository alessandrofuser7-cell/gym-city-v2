import { Router, Response } from 'express';
import User from '../models/User';
import { generateToken, authenticate, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

// Login
router.post('/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email e password sono richiesti' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Credenziali non valide' });
    }

    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenziali non valide' });
    }

    const token = generateToken(user._id.toString());

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        subscriptionExpiry: user.subscriptionExpiry,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      subscriptionExpiry: user.subscriptionExpiry,
      phone: user.phone
    });
  } catch (error) {
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Admin: Create new user
router.post('/users', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, name, phone, role, subscriptionExpiry } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password e nome sono richiesti' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email già registrata' });
    }

    const user = new User({
      email,
      password,
      name,
      phone,
      role: role || 'user',
      subscriptionExpiry: subscriptionExpiry || null
    });

    await user.save();

    res.status(201).json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      subscriptionExpiry: user.subscriptionExpiry,
      phone: user.phone,
      isActive: user.isActive
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Admin: Get all users
router.get('/users', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users.map(u => ({
      id: u._id,
      email: u.email,
      name: u.name,
      role: u.role,
      phone: u.phone,
      subscriptionExpiry: u.subscriptionExpiry,
      isActive: u.isActive,
      createdAt: u.createdAt
    })));
  } catch (error) {
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Admin: Update user
router.put('/users/:id', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, role, subscriptionExpiry, isActive, password } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (role) updateData.role = role;
    if (subscriptionExpiry !== undefined) updateData.subscriptionExpiry = subscriptionExpiry;
    if (isActive !== undefined) updateData.isActive = isActive;

    const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    // If password needs to be updated, do it separately (to trigger pre-save hook)
    if (password) {
      user.password = password;
      await user.save();
    }

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      subscriptionExpiry: user.subscriptionExpiry,
      isActive: user.isActive
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Admin: Delete user (soft delete)
router.delete('/users/:id', authenticate, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(id, { isActive: false }, { new: true });

    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    res.json({ message: 'Utente disattivato con successo' });
  } catch (error) {
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Change password (user can change own password)
router.put('/change-password', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Password attuale e nuova sono richieste' });
    }

    const user = await User.findById(req.user!._id);
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Password attuale non corretta' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password aggiornata con successo' });
  } catch (error) {
    res.status(500).json({ message: 'Errore del server' });
  }
});

export default router;
