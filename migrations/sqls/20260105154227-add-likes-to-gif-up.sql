-------- ADD LIKES COLUMN TO GIFS TABLE ---------

ALTER TABLE IF EXISTS public.gifs 
    ADD COLUMN likes integer NOT NULL DEFAULT 0;