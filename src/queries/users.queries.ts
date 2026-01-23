// QUERIES FOR USER CONTROLLER

// CREATE USER QUERIES

export const CheckEmailQuery = `SELECT * FROM "users" WHERE email = $1`;

export const InsertUserQuery = `INSERT INTO "users" (firstName, lastName, email, password, gender, jobrole, department, address) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;

export const FetchUserByIdQuery = `SELECT * FROM "users" WHERE "user_id" = $1`;
