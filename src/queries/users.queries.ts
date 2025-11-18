// QUERIES FOR USER CONTROLLER


// CREATE USER QUERIES

export const checkEmailQuery = `SELECT * FROM "userModel" WHERE email = $1`;

export const insertUserQuery = `INSERT INTO "userModel" (firstName, lastName, email, password, gender, jobrole, department, address) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;