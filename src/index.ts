import './types';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import usersV1 from './routes/v1/usersRoutes';
import postsV1 from './routes/v1/postsRoutes';
import { errorHandler, notFound } from './middlewares/errorMiddleware';

dotenv.config();

const app = express();

app.use(cors({origin: process.env.FRONTEND_URL, credentials: true})); // Allow CORS for the frontend app
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/users', usersV1);
app.use('/api/v1/posts', postsV1);

app.use(notFound);
app.use(errorHandler);

export default app;
