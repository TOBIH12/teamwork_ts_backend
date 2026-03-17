/* Replace with your SQL commands */

ALTER TABLE IF EXISTS public.gif_comments
REMOVE PRIMARY KEY IF EXISTS (comment_id);