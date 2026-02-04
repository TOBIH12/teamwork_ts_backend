// QUERIES FOR USER CONTROLLER

// CREATE USER QUERIES

export const checkEmailQuery = `SELECT * FROM "users" WHERE email = $1`;

export const insertUserQuery = `INSERT INTO "users" (first_name, last_name, email, password, gender, job_role, department, address) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;

export const fetchUserByIdQuery = `SELECT * FROM "users" WHERE "user_id" = $1`;
