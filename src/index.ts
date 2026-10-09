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
);

app.use((req, res, next) => {
  const { origin } = req.headers;
  if (origin) {
    const isAllowedStatic = allowedOrigins.includes(origin);
    const isVercelPreview = origin.endsWith('.vercel.app');

    if (isAllowedStatic || isVercelPreview) {
      res.header('Access-Control-Allow-Origin', origin);
    }
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Access-Control-Allow-Credentials'
  );

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

const corsOptions: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (!origin) {
      return callback(null, true);
    }

    const isAllowedStatic = allowedOrigins.includes(origin);
    const isVercelPreview = origin.endsWith('.vercel.app');

    if (isAllowedStatic || isVercelPreview) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS security policy'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions)); // Allow CORS for the frontend app
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/users', usersV1);
app.use('/api/v1/posts', postsV1);

app.use(notFound);
app.use(errorHandler);

export default app;
