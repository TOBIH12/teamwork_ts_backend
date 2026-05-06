/* Replace with your SQL commands */

ALTER TABLE IF EXISTS public.article_likes
ADD COLUMN IF NOT EXISTS "user_id" integer REFERENCES public.users(user_id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE IF EXISTS public.article_likes
ADD COLUMN IF NOT EXISTS "article_id" integer REFERENCES public.articles(article_id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE IF EXISTS public.article_likes
ADD CONSTRAINT article_likes_pkey PRIMARY KEY (user_id, article_id);