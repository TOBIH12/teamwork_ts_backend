import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import upload from 'express-fileupload';
// import pool from './db';
import usersV1 from './routes/v1/usersRoutes';

dotenv.config();

const app = express();
// const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(upload(
    {
        useTempFiles: true,
        tempFileDir: '/tmp/' // or any temp dir
    }
));
app.use(cors());

app.use('/api/v1/users', usersV1);




// pool.query('SELECT NOW()')
//   .then(() => console.log('Connected to PostgreSQL'))
//   .catch(err => console.error('Database connection error', err.stack));

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });


export default app;