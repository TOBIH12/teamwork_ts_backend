/* Replace with your SQL commands */

ALTER TABLE public.users 
    DROP COLUMN IF EXISTS gifs;

ALTER TABLE public.gifs
    DROP COLUMN IF EXISTS likes;