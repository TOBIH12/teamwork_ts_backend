import multer from 'multer';
import { UserInfo } from './utils/userInterface';

declare global {
  namespace Express {
    interface Request {
      user?: UserInfo;
      file?: Express.Multer.File;
      params?: {
        userId?: string;
        page?: string;
        role?: string;
        gifId?: string;
        articleId?: string;
        commentId: string;
      };
      query?: {
        page?: string;
        limit?: string;
      };
    }
  }
}

export {};
