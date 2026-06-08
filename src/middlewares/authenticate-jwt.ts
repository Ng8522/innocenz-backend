import { Request, Response, NextFunction } from 'express';
import { authRepository } from '@/composition-root.js';
import { Error } from '@/error/index.js';

const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: Error.UNAUTHORIZED });
  }

  try {
    const admin = await authRepository.getUserDataByToken(token);
    if (!admin || admin.status !== 'active') {
      return res.status(401).json({ message: Error.UNAUTHORIZED });
    }
    req.admin = admin;
    next();
  } catch {
    return res.status(401).json({ message: Error.UNAUTHORIZED });
  }
};

export default authenticateJWT;
