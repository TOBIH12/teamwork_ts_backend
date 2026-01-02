
-- Create table


CREATE TABLE IF NOT EXISTS public.users
(
    firstname character varying COLLATE pg_catalog."default",
    lastname character varying COLLATE pg_catalog."default",
    email character varying COLLATE pg_catalog."default",
    "userID" integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    password character varying COLLATE pg_catalog."default",
    gender character varying COLLATE pg_catalog."default",
    jobrole character varying COLLATE pg_catalog."default",
    department character varying COLLATE pg_catalog."default",
    address character varying COLLATE pg_catalog."default",
    CONSTRAINT "userModel_pkey" PRIMARY KEY ("userID")
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.users
    OWNER to postgres;