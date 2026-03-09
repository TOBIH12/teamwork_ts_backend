/* Replace with your SQL commands */

ALTER TABLE IF EXISTS public.users 
ADD COLUMN IF NOT EXISTS "reset_password_token" character varying(255);

ALTER TABLE IF EXISTS public.users 
ADD COLUMN IF NOT EXISTS "reset_password_token_expires" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();