import dotenv from 'dotenv';
import App from './index';
import pool from './db';

dotenv.config();

pool
  .connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch((err) => console.error('Database connection error', err));

const PORT = process.env.PORT || 5000;
App.listen(PORT, () => console.log(`Server running on port ${PORT}`));
