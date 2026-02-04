/* Replace with your SQL commands */

CREATE TABLE IF NOT EXISTS public.gif_likes
(
    like_creator_id integer REFERENCES public.users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    liked_gif_id integer REFERENCES public.gifs(gif_id) ON DELETE CASCADE ON UPDATE CASCADE,
    liked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT gif_likes_pkey PRIMARY KEY (like_creator_id, liked_gif_id)
)

TABLESPACE pg_default;
