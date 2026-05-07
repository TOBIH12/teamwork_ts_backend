/* Replace with your SQL commands */

ALTER TABLE IF EXISTS public.article_likes
DROP COLUMN IF EXISTS "like_creator_id";

ALTER TABLE IF EXISTS public.article_likes
DROP COLUMN IF EXISTS "liked_article_id";

ALTER TABLE IF EXISTS public.article_likes
DROP CONSTRAINT IF EXISTS article_likes_pkey;