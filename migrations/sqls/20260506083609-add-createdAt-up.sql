/* Replace with your SQL commands */

ALTER TABLE IF EXISTS public.article_comments
ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

ALTER TABLE IF EXISTS public.article_comments
ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();