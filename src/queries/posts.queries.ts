// QUERIES FOR POSTS CONTROLLERS

export const insertGifPostQuery = `INSERT INTO gifs (title, gif_url, creator_id) VALUES ($1, $2, $3) RETURNING *`;
