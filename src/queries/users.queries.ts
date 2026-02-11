// QUERIES FOR USER CONTROLLER

// CREATE USER QUERIES

export const checkEmailQuery = `SELECT * FROM "users" WHERE email = $1`;

export const insertUserQuery = `INSERT INTO "users" (first_name, last_name, email, password, gender, job_role, department, address) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;

export const fetchUserByIdQuery = `SELECT * FROM "users" WHERE "user_id" = $1`;

export const updateUserQuery = `UPDATE "users" SET first_name = $1, last_name = $2, gender = $3, department = $4, address = $5 WHERE user_id = $6 RETURNING *`;

export const updatePasswordQuery = `UPDATE "users" SET password = $1 WHERE user_id = $2 RETURNING *`;

export const updateUserImgquery =
  'UPDATE "users" SET user_img = $1 WHERE user_id = $2 RETURNING *';
