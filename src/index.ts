import './types';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import usersV1 from './routes/v1/usersRoutes';
import postsV1 from './routes/v1/postsRoutes';
import { errorHandler, notFound } from './middlewares/errorMiddleware';

dotenv.config();

const App = express();

App.use(express.json());
App.use(express.urlencoded({ extended: true }));
App.use(cors());

App.use('/api/v1/users', usersV1);
App.use('/api/v1/posts', postsV1);

App.use(notFound);
App.use(errorHandler);

export default App;
