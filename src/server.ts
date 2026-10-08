import dotenv from 'dotenv';
import app from './index';
import pool from './db';

dotenv.config();

pool
  .connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch((err) => console.error('Database connection error', err));

const PORT = process.env.PORT || 5000;
app.listen(Number(PORT), '0.0.0.0', () => {console.log(`Server running on  http://0.0.0.0:${PORT}`);});
