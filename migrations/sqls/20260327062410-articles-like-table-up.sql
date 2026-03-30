/* Replace with your SQL commands */

CREATE TABLE IF NOT EXISTS public.article_likes
 (
    like_creator_id integer REFERENCES public.users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
     liked_article_id integer REFERENCES public.articles(article_id) ON DELETE CASCADE ON UPDATE CASCADE,
    liked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT article_likes_pkey PRIMARY KEY (like_creator_id, liked_article_id)
 )
 