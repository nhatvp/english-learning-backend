import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/responseHelper';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    res.status(401).json(errorResponse('Access denied. No token provided.'));
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string }; 
    if (typeof decoded.userId !== 'string') {
      res.status(400).json(errorResponse('Invalid token format.'));
      return;
    }

    req.userId = decoded.userId; // Chỉ lưu ID của user
    next();
  } catch (error) {
    res.status(401).json(errorResponse('Invalid token.'));
  }
};

export default authMiddleware;
