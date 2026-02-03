/* Replace with your SQL commands */

 CREATE TABLE IF NOT EXISTS public.gif_comments
(
    comment_text character varying COLLATE pg_catalog."default",
    commented_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    commenter_id integer REFERENCES public.users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    commented_gif_id integer REFERENCES public.gifs(gif_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT gif_comments_pkey PRIMARY KEY (commenter_id, commented_gif_id)
)

TABLESPACE pg_default;