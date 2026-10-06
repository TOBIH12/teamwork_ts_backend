import './types';
import express from 'express';
import dotenv from 'dotenv';
import cors, { CorsOptions } from 'cors';
import usersV1 from './routes/v1/usersRoutes';
import postsV1 from './routes/v1/postsRoutes';
import { errorHandler, notFound } from './middlewares/errorMiddleware';

dotenv.config();

const app = express();

const allowedOrigins: string[] = Array.from(
    new Set([
        process.env.FRONTEND_URL as string,
        ...(process.env.CORS_ALLOWED_ORIGINS?.split(',') || []),
    ])
)

const frontendPreviewRegex = /^https:\/\/.*-tobi-s-projects-59df0dff\.vercel\.app\$/;

const corsOptions: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (!origin) {
      return callback(null, true);
    }

    const isAllowedStatic = allowedOrigins.includes(origin);
    const isAllowedPreview = frontendPreviewRegex.test(origin);

    if (isAllowedStatic || isAllowedPreview) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS security policy'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions)); // Allow CORS for the frontend app
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/users', usersV1);
app.use('/api/v1/posts', postsV1);

app.use(notFound);
app.use(errorHandler);

export default app;
