import pool from '../src/db';


(
    async () => {

        try {
            await pool.query('SELECT NOW()')
            .then((data) => {
                console.log('Database time:', data.rows[0])
            }).catch((err) => console.log(err.stack));
        } catch (error) {
            console.error('Error querying the database:', error);
        } finally {
            pool.end();
        }
    }
)();