/* Replace with your SQL commands */

ALTER TABLE IF EXISTS public.gif_comments
DROP CONSTRAINT IF EXISTS gif_comments_pkey;

ALTER TABLE IF EXISTS public.gif_comments
ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();