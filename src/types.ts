import multer from 'multer';
import UserInfo from './userInterface';

declare global {
  namespace Express {
    interface Request {
      user?: UserInfo;
      file?: Express.Multer.File;
    }
  }
}

export {};
