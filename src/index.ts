import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import upload from 'express-fileupload';
import pool from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(upload(
    {
        useTempFiles: true,
        tempFileDir: '/tmp/' // or any temp dir
    }
));
app.use(cors());




pool.connect()
.then(() => console.log('Connected to the postGreSql database!'))
.catch((err) => console.error('Database connection error', err.stack));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


export default app;