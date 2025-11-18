import app from "./index";
import dotenv from "dotenv";
import pool from '../src/db'

dotenv.config();

pool.connect()
  .then(() => console.log("Connected to PostgreSQL database"))
  .catch((err) => console.error("Database connection error", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
