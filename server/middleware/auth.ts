import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'gymcity-secret-key-change-in-production';

export interface AuthRequest extends Request {
  user?: IUser;
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Accesso non autorizzato' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Utente non trovato o disattivato' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token non valido' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Accesso non autorizzato' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Permessi insufficienti' });
    }

    next();
  };
}

export function checkSubscription(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: 'Accesso non autorizzato' });
  }

  // Admin and instructors don't need subscription
  if (req.user.role === 'admin' || req.user.role === 'instructor') {
    return next();
  }

  // Check if subscription is valid
  if (!req.user.subscriptionExpiry || new Date(req.user.subscriptionExpiry) < new Date()) {
    return res.status(403).json({ 
      message: 'Abbonamento scaduto',
      subscriptionExpiry: req.user.subscriptionExpiry
    });
  }

  next();
}
