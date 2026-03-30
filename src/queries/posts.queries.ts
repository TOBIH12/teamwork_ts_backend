// QUERIES FOR POSTS CONTROLLERS

// GIF QUERIES
export const insertGifPostQuery = `INSERT INTO gifs (title, gif_url, creator_id) VALUES ($1, $2, $3) RETURNING *`;

export const deleteGifPostQuery = `DELETE FROM gifs WHERE gif_id = $1 RETURNING *`;

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

export const deleteCommentQuery = `DELETE FROM "gif_comments" WHERE "comment_id" = $1 RETURNING *`;

// ARTICLE QUERIES
export const insertArticlePostQuery = `INSERT INTO articles (title, content, creator_id) VALUES ($1, $2, $3) RETURNING *`;

export const fetchArticleById = `SELECT * FROM "articles" WHERE "article_id" = $1`;

export const deleteArticlePostQuery = `DELETE FROM "articles" WHERE "article_id" = $1 RETURNING *`;

export const getArticlesCount = `SELECT COUNT(*) AS total_count FROM "articles"`;

export const fetchAllArticlesQuery = `SELECT 
article_id, creator_id, title, content, created_on 
FROM "articles" 
ORDER BY created_on ASC
LIMIT $1 OFFSET $2`;

export const getUserArticlesCount = `SELECT COUNT(*) AS user_articles_count FROM "articles" WHERE "creator_id" = $1`;

export const fetchUserArticlesQuery = `SELECT 
article_id, creator_id, title, content, created_on 
FROM "articles" 
WHERE "creator_id" = $1
ORDER BY created_on ASC
LIMIT $2 OFFSET $3`;

export const editArticleQuery = `UPDATE "articles" SET title = $1, content = $2 WHERE "article_id" = $3 RETURNING *`;

export const likeArticleQuery = `INSERT INTO "article_likes" (like_creator_id, liked_article_id, liked_at) VALUES ($1, $2, $3) RETURNING *`;

export const fetchArticleLikes = `SELECT * FROM "article_likes" WHERE like_creator_id = $1 AND liked_article_id = $2`;

export const removeArticleLikeQuery = `DELETE FROM "article_likes" WHERE like_creator_id = $1 AND liked_article_id = $2 RETURNING *`;

export const getArticleLikesCountQuery = `SELECT COUNT(*) AS article_likes_count FROM "article_likes" WHERE "liked_article_id" = $1`;

export const commentOnArticleQuery = `INSERT INTO "article_comments" (comment_text, commented_at, commenter_id, commented_article_id) VALUES ($1, $2, $3, $4) RETURNING *`;

export const fetchArticleCommentsQuery = `SELECT * FROM "article_comments" WHERE commented_article_id = $1 ORDER BY commented_at ASC
LIMIT $2 OFFSET $3`;

export const getArticleCommentsCountQuery = `SELECT COUNT(*) AS comments_count FROM "article_comments" WHERE commented_article_id = $1`;

export const fetchSingleArticleCommentQuery = `SELECT * FROM "article_comments" WHERE comment_id = $1`;

export const editArticleCommentQuery = `UPDATE "article_comments" SET comment_text = $1 WHERE "comment_id" = $2 RETURNING *`;

export const deleteArticleCommentQuery = `DELETE FROM "article_comments" WHERE "comment_id" = $1 RETURNING *`;

export const fetchAllPostsQuery = `
SELECT * FROM (
(SELECT 
article_id AS feed_id, creator_id, title, content, created_on, NULL AS gif_url, 'article' AS post_type FROM "articles")
UNION ALL
(SELECT 
gif_id AS feed_id, creator_id, title, NULL AS content, created_on, gif_url, 'gif' AS post_type FROM "gifs")
) AS combined_posts
ORDER BY created_on ASC
LIMIT $1 OFFSET $2
`;

export const getAllArticlesAndGifsCountQuery = `SELECT 
(SELECT COUNT(*) FROM "articles") + (SELECT COUNT(*) FROM "gifs") AS total_count`;
