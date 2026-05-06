/* Replace with your SQL commands */

ALTER TABLE IF EXISTS public.article_comments
ADD COLUMN IF NOT EXISTS "user_id" integer REFERENCES public.users(user_id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE IF EXISTS public.article_comments
DROP COLUMN IF EXISTS "commented_article_id";