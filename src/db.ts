import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const env = process.env.NODE_ENV || 'dev';
const config = require('../database.json')[env];

const { Pool } = pkg;

const pool = new Pool({
  user: config.user,
  host: config.host,
  database: config.database,
  password: config.password,
  port: config.port || 5432,
});

export default pool;
