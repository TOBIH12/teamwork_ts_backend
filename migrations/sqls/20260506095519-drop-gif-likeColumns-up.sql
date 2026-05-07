/* Replace with your SQL commands */


ALTER TABLE IF EXISTS public.gif_likes
DROP COLUMN IF EXISTS "like_creator_id";

ALTER TABLE IF EXISTS public.gif_likes
DROP COLUMN IF EXISTS "liked_gif_id";

ALTER TABLE IF EXISTS public.gif_likes
DROP CONSTRAINT IF EXISTS gif_likes_pkey;