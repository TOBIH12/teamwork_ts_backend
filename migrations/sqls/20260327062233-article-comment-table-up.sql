/* Replace with your SQL commands */

CREATE TABLE IF NOT EXISTS public.article_comments
(
        comment_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
        comment_text character varying COLLATE pg_catalog."default",
        commented_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        commenter_id integer REFERENCES public.users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
        commented_article_id integer REFERENCES public.articles(article_id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT article_comments_pkey PRIMARY KEY (comment_id)
)
