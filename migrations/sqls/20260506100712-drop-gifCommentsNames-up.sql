/* Replace with your SQL commands */

ALTER TABLE IF EXISTS public.gif_comments
DROP COLUMN IF EXISTS "commented_at";

ALTER TABLE IF EXISTS public.gif_comments
DROP COLUMN IF EXISTS "commenter_id";

ALTER TABLE IF EXISTS public.gif_comments
DROP COLUMN IF EXISTS "commented_gif_id";

ALTER TABLE IF EXISTS public.gif_comments
DROP CONSTRAINT IF EXISTS gif_comments_pkey;