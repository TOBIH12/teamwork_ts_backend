/* Replace with your SQL commands */

ALTER TABLE IF EXISTS public.gif_comments
ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

ALTER TABLE IF EXISTS public.gif_comments
ADD COLUMN IF NOT EXISTS "user_id" integer REFERENCES public.users(user_id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE IF EXISTS public.gif_comments
ADD COLUMN IF NOT EXISTS "gif_id" integer REFERENCES public.gifs(gif_id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE IF EXISTS public.gif_comments
ADD CONSTRAINT gif_comments_pkey PRIMARY KEY (user_id, gif_id);