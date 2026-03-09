// QUERIES FOR USER CONTROLLER

// CREATE USER QUERIES

export const checkEmailQuery = `SELECT * FROM "users" WHERE email = $1`;

export const insertUserQuery = `INSERT INTO "users" (first_name, last_name, email, password, gender, job_role, department, address) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;

export const saveResetTokenQuery = `UPDATE "users" SET reset_password_token = $1, reset_password_token_expires = $2 WHERE email = $3 RETURNING *`;

export const fetchUserByIdQuery = `SELECT * FROM "users" WHERE "user_id" = $1`;

export const getUsersCount = `SELECT COUNT(*) AS total_count FROM "users"`;

export const getUsersQuery = `SELECT 
user_id, first_name, last_name, email, gender, user_img, job_role, department, address, created_on 
FROM "users" 
ORDER BY created_on ASC
LIMIT $1 OFFSET $2`;

export const updateUserQuery = `UPDATE "users" 
SET 
first_name = COALESCE(NULLIF($1, ''), first_name),
 last_name = COALESCE(NULLIF($2, ''), last_name), 
 gender = COALESCE(NULLIF($3, ''), gender), 
 department = COALESCE(NULLIF($4, ''), department), 
 address = COALESCE(NULLIF($5, ''), address)
  WHERE user_id = $6 
  RETURNING *`;

export const updatePasswordQuery = `UPDATE "users" SET password = $1 WHERE user_id = $2 RETURNING *`;

export const updateUserImgquery =
  'UPDATE "users" SET user_img = $1 WHERE user_id = $2 RETURNING *';

export const updateUserRoleQuery = `UPDATE "users" SET job_role = $1 WHERE user_id = $2 RETURNING *`;

export const deleteUserQuery = `DELETE FROM "users" WHERE user_id = $1 RETURNING *`;
