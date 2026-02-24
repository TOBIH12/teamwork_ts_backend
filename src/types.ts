import multer from 'multer';
import { UserInfo } from './userInterface';

declare global {
  namespace Express {
    interface Request {
      user?: UserInfo;
      file?: Express.Multer.File;
      params?: {
        userId?: string;
        page?: string;
        role?: string;
      };
    }
  }
}

export {};
