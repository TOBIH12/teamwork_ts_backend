/* Replace with your SQL commands */

ALTER TABLE IF EXISTS public.article_comments
ADD COLUMN IF NOT EXISTS "comment_id" integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 CACHE 1 );