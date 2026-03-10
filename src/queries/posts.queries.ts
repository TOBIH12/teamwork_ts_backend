// QUERIES FOR POSTS CONTROLLERS

export const insertGifPostQuery = `INSERT INTO gifs (title, gif_url, creator_id) VALUES ($1, $2, $3) RETURNING *`;

export const deleteGifPostQuery = `DELETE FROM gifs WHERE gif_id = $1`;

export const fetchAllGifsQuery = `SELECT 
gif_id, creator_id, title, gif_url, created_on 
FROM "gifs" 
ORDER BY created_on ASC
LIMIT $1 OFFSET $2`;

export const getGifsCount = `SELECT COUNT(*) AS total_count FROM "gifs"`;

export const fetchUserGifs = `SELECT 
gif_id, creator_id, title, gif_url, created_on 
FROM "gifs" 
WHERE "creator_id" = $1
ORDER BY created_on ASC
LIMIT $2 OFFSET $3`;

export const getUserGifsCount = `SELECT COUNT(*) AS user_gifs_count FROM "gifs" WHERE "creator_id" = $1`;

export const fetchGifById = `SELECT * FROM "gifs" WHERE "gif_id" = $1`;

export const likeGifQuery = `INSERT INTO "gif_likes" (like_creator_id, liked_gif_id, liked_at) VALUES ($1, $2, $3) RETURNING *`;

export const fetchGifLike = `SELECT * FROM "gif_likes" WHERE like_creator_id = $1 AND liked_gif_id = $2`;

export const removeGifLikeQuery = `DELETE FROM "gif_likes" WHERE like_creator_id = $1 AND liked_gif_id = $2 RETURNING *`;

export const getGifLikesCountQuery = `SELECT COUNT(*) AS gif_likes_count FROM "gif_likes" WHERE "liked_gif_id" = $1`;

export const commentOnGifQuery = `INSERT INTO "gif_comments" (comment_text, commented_at, commenter_id, commented_gif_id) VALUES ($1, $2, $3, $4) RETURNING *`;

export const fetchGifCommentsQuery = `SELECT * FROM "gif_comments" WHERE commented_gif_id = $1 ORDER BY commented_at ASC
LIMIT $2 OFFSET $3`;

export const getGifCommentsCountQuery = `SELECT COUNT(*) AS comments_count FROM "gif_comments" WHERE commented_gif_id = $1`;

export const fetchSingleGifCommentQuery = `SELECT * FROM "gif_comments" WHERE comment_id = $1`;

export const editGifCommentQuery = `UPDATE "gif_comments" SET comment_text = $1 WHERE "comment_id" = $2 RETURNING *`;

export const deleteCommentQuery = `DELETE FROM "gif_comments" WHERE "comment_id" = $1`;
