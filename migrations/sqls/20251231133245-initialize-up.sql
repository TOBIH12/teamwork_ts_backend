
-- Create table

--------- USERS TABLE ----------

CREATE TABLE IF NOT EXISTS public.users
(
    first_name character varying COLLATE pg_catalog."default",
    last_name character varying COLLATE pg_catalog."default",
    email character varying COLLATE pg_catalog."default",
    user_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    gifs integer NOT NULL DEFAULT 0,
    articles integer NOT NULL DEFAULT 0,
    password character varying COLLATE pg_catalog."default",
    user_img character varying COLLATE pg_catalog."default",
    gender character varying COLLATE pg_catalog."default",
    job_role character varying COLLATE pg_catalog."default",
    department character varying COLLATE pg_catalog."default",
    address character varying COLLATE pg_catalog."default",
    created_on TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT "userModel_pkey" PRIMARY KEY (user_id)
)

TABLESPACE pg_default;



--------- GIFS TABLE ---------
    CREATE TABLE IF NOT EXISTS public.gifs
(
    gif_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    title character varying COLLATE pg_catalog."default",
    gif_url character varying COLLATE pg_catalog."default",
    created_on TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    creator_id integer REFERENCES public.users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "gif_pkey" PRIMARY KEY (gif_id)
)

TABLESPACE pg_default;

--------- GIF_LIKES TABLE ---------

 CREATE TABLE IF NOT EXISTS public.gif_likes
(
    like_creator_id integer REFERENCES public.users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    liked_gif_id integer REFERENCES public.gifs(gif_id) ON DELETE CASCADE ON UPDATE CASCADE,
    liked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT gif_likes_pkey PRIMARY KEY (like_creator_id, liked_gif_id)
)

TABLESPACE pg_default;


----------- GIF_COMMENTS TABLE ----------

 CREATE TABLE IF NOT EXISTS public.gif_comments
(
    comment_text character varying COLLATE pg_catalog."default",
    commented_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    commenter_id integer REFERENCES public.users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    commented_gif_id integer REFERENCES public.gifs(gif_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT gif_comments_pkey PRIMARY KEY (commenter_id, commented_gif_id)
)

TABLESPACE pg_default;
