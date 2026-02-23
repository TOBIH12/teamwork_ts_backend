// QUERIES FOR USER CONTROLLER

// CREATE USER QUERIES

export const checkEmailQuery = `SELECT * FROM "users" WHERE email = $1`;

export const insertUserQuery = `INSERT INTO "users" (first_name, last_name, email, password, gender, job_role, department, address) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;

export const fetchUserByIdQuery = `SELECT * FROM "users" WHERE "user_id" = $1`;

export const getUsersQuery = `SELECT user_id, first_name, last_name, email, gender, job_role, department, address, created_on FROM "users" ORDER BY created_on ASC`;

export const updateUserQuery = 
`UPDATE "users" 
SET 
first_name = COALESCE(NULLIF($1, ''), first_name),
 last_name = COALESCE(NULLIF($2, ''), last_name), 
 gender = COALESCE(NULLIF($3, ''), gender), 
 department = COALESCE(NULLIF($4, ''), department), 
 address = COALESCE(NULLIF($5, ''), address)
  WHERE user_id = $6 
  RETURNING *`;

export const updatePasswordQuery = `UPDATE "users" SET password = $1 WHERE user_id = $2 RETURNING *`;

export const updateUserImgquery = 'UPDATE "users" SET user_img = $1 WHERE user_id = $2 RETURNING *';

export const makeUserAdminQuery = `UPDATE "users" SET job_role = 'admin' WHERE user_id = $1 RETURNING *`;

export const removeAdminRoleQuery = `UPDATE "users" SET job_role = 'employee' WHERE user_id = $1 RETURNING *`;

export const deleteUserQuery = `DELETE FROM "users" WHERE user_id = $1 RETURNING *`;
