/* Replace with your SQL commands */

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