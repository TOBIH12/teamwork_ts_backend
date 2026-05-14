import { Request, Response } from 'express';
import dotenv from 'dotenv';
import z from 'zod';
import { ca } from 'zod/v4/locales';
import pool from '../../db';
import { postGifSchema, postArticleSchema } from '../../zodSchema';
import {
  handleCloudinaryUpload,
  handleCloudinaryFileDelete,
} from '../../utils/cloudinaryConfig';
import {
  insertGifPostQuery,
  fetchAllGifsQuery,
  getGifsCount,
  fetchUserGifs,
  getUserGifsCount,
  fetchGifById,
  likeGifQuery,
  removeGifLikeQuery,
  getGifLikesCountQuery,
  fetchGifLike,
  commentOnGifQuery,
  fetchGifCommentsQuery,
  editGifCommentQuery,
  deleteCommentQuery,
  fetchSingleGifCommentQuery,
  getGifCommentsCountQuery,
  deleteGifPostQuery,
  insertArticlePostQuery,
  fetchArticleById,
  deleteArticlePostQuery,
  getArticlesCount,
  fetchAllArticlesQuery,
  getUserArticlesCount,
  fetchUserArticlesQuery,
  editArticleQuery,
  fetchArticleLikes,
  removeArticleLikeQuery,
  getArticleLikesCountQuery,
  likeArticleQuery,
  commentOnArticleQuery,
  fetchArticleCommentsQuery,
  getArticleCommentsCountQuery,
  fetchSingleArticleCommentQuery,
  editArticleCommentQuery,
  deleteArticleCommentQuery,
  fetchAllPostsQuery,
  getAllArticlesAndGifsCountQuery,
  getCategoryArticlesCount,
  fetchCategoryArticles,
} from '../../queries/posts.queries';
import { fetchUserByIdQuery } from '../../queries/users.queries';

dotenv.config();

type PostGifInput = z.infer<typeof postGifSchema>;
type PostArticleInput = z.infer<typeof postArticleSchema>;

export default class PostsControllers {
  // Create GIF Post
  async createGifPost(
    req: Request<PostGifInput>,
    res: Response
  ): Promise<Response> {
    try {
      const { title } = req.body;

      if (!req.file) {
        return res
          .status(400)
          .json({ status: 'error', error: 'No GIF file uploaded' });
      }

      const gif = req.file;

      const b64 = Buffer.from(gif.buffer).toString('base64');
      const dataURI = `data:${gif.mimetype};base64,${b64}`;

      const gifUrl = await handleCloudinaryUpload(dataURI, 'gifs');

      if (!gifUrl || !gifUrl.secure_url) {
        return res.status(500).json({
          status: 'error',
          error: 'Failed to upload GIF to Cloudinary',
        });
      }

      const creatorId = req.user?.user_id;

      const newGifPost = await pool.query(insertGifPostQuery, [
        title,
        gifUrl.secure_url,
        creatorId,
      ]);

      const { gif_id, gif_url, creator_id, created_on } = newGifPost.rows[0];

      return res.status(201).json({
        status: 'success',
        data: {
          message: 'GIF posted!',
          gifId: gif_id,
          createdOn: created_on,
          title,
          gifUrl: gif_url,
          authorId: creator_id,
        },
      });
    } catch (err: unknown) {
      return res
        .status(400)
        .json({ status: 'error', error: err || 'Failed to create GIF post' });
    }
  }

  // DELETE GIF
  async deleteGifPost(req: Request, res: Response): Promise<Response> {
    try {
      const { gifId } = req.params;
      const reqUserId = req.user?.user_id;

      const parsedGifId = Number.parseInt(gifId, 10);

      const checkGif = await pool.query(fetchGifById, [parsedGifId]);

      if (!checkGif || !checkGif.rows || checkGif.rows.length === 0) {
        return res.status(404).json({
          status: 'error',
          error: 'The gif must have deleted or does not exist.',
        });
      }

      const { creator_id, gif_url } = checkGif.rows[0];

      if (reqUserId !== creator_id) {
        return res.status(403).json({
          status: 'error',
          error: `You cannot delete another user's post`,
        });
      }

      await handleCloudinaryFileDelete(gif_url);

      const deleteGif = await pool.query(deleteGifPostQuery, [parsedGifId]);

      if (!deleteGif || deleteGif.rows.length === 0) {
        return res.status(500).json({
          status: 'error',
          error: 'unable to delete post.',
        });
      }

      return res.status(200).json({
        status: 'success',
        data: {
          message: 'post deleted.',
        },
      });
    } catch (err: unknown) {
      return res
        .status(400)
        .json({ status: 'error', error: err || 'Failed to delete GIF post' });
    }
  }

  // ADMIN DELETE GIF
  async adminDeleteGifPost(req: Request, res: Response): Promise<Response> {
    try {
      const { gifId } = req.params;

      const parsedGifId = Number.parseInt(gifId, 10);

      const checkGif = await pool.query(fetchGifById, [parsedGifId]);

      if (!checkGif || !checkGif.rows || checkGif.rows.length === 0) {
        return res.status(404).json({
          status: 'error',
          error: 'The gif must have deleted or does not exist.',
        });
      }

      const { gif_url } = checkGif.rows[0];

      await handleCloudinaryFileDelete(gif_url);

      const deleteGif = await pool.query(deleteGifPostQuery, [parsedGifId]);

      if (!deleteGif || deleteGif.rows.length === 0) {
        return res.status(500).json({
          status: 'error',
          error: 'unable to delete post.',
        });
      }

      return res.status(200).json({
        status: 'success',
        data: {
          message: 'post deleted.',
        },
      });
    } catch (err: unknown) {
      return res
        .status(400)
        .json({ status: 'error', error: err || 'Failed to delete GIF post' });
    }
  }

  // FETCH all GIFS
  async fetchAllGifs(req: Request, res: Response): Promise<Response> {
    try {
      const page = Number.parseInt(req.query.page as string, 10) || 1;
      const limit = Number.parseInt(req.query.limit as string, 10) || 10;

      const offset = (page - 1) * limit;

      const gifsCountResult = await pool.query(getGifsCount);
      const totalGifsCount = gifsCountResult.rows[0].total_count;
      const parsedGifsCount = Number.parseInt(totalGifsCount, 10);

      const gifsResponse = await pool.query(fetchAllGifsQuery, [limit, offset]);

      const gifs = gifsResponse.rows;

      return res.status(200).json({
        status: 'success',
        data: {
          message: 'Gifs fetched successfully',
          gifsCount: parsedGifsCount,
          gifs,
        },
      });
    } catch (err: unknown) {
      return res
        .status(500)
        .json({ status: 'error', error: err || 'Server Error' });
    }
  }

  // FETCH USER GIFS
  async fetchUserGifs(req: Request, res: Response): Promise<Response> {
    try {
      const creatorId = Number.parseInt(req.params.creatorId, 10);
      const page = Number.parseInt(req.params.page, 10);
      const limit = 10;

      const offset = (page - 1) * limit;

      const creatorResponse = await pool.query(fetchUserByIdQuery, [creatorId]);

      if (
        !creatorResponse ||
        !creatorResponse.rows ||
        creatorResponse.rows.length === 0
      ) {
        return res.status(404).json({
          status: 'error',
          error: 'A problem occured with finding this user',
        });
      }

      const gifsCountResult = await pool.query(getUserGifsCount, [creatorId]);
      const totalUserGifsCount = gifsCountResult.rows[0].user_gifs_count;
      const parsedGifsCount = Number.parseInt(totalUserGifsCount, 10);

      const gifsResponse = await pool.query(fetchUserGifs, [
        creatorId,
        limit,
        offset,
      ]);

      const gifs = gifsResponse.rows;

      if (gifs.length === 0) {
        return res.status(200).json({
          status: 'success',
          data: {
            message: `No Gifs from this user yet`,
          },
        });
      }

      return res.status(200).json({
        status: 'success',
        data: {
          message: `User's Gifs fetched successfully`,
          userGifsCount: parsedGifsCount,
          gifs,
        },
      });
    } catch (err: unknown) {
      return res
        .status(500)
        .json({ status: 'error', error: err || 'Server Error' });
    }
  }

  // FETCH SINGLE GIF
  async fetchGif(req: Request, res: Response): Promise<Response> {
    try {
      const { gifId } = req.params;

      const parsedGifId = Number.parseInt(gifId, 10);

      const gifResponse = await pool.query(fetchGifById, [parsedGifId]);

      if (!gifResponse || !gifResponse.rows || gifResponse.rows.length === 0) {
        return res.status(404).json({
          status: 'error',
          error: 'gif not found',
        });
      }

      const { creator_id, title, gif_url, created_on } = gifResponse.rows[0];

      return res.status(200).json({
        status: 'success',
        data: {
          message: 'gif successfully fetched',
          title,
          gifUrl: gif_url,
          creatorId: creator_id,
          createdOn: created_on,
        },
      });
    } catch (err: unknown) {
      return res
        .status(500)
        .json({ status: 'error', error: err || 'Server Error' });
    }
  }

  // LIKE GIF
  async likeGif(req: Request, res: Response): Promise<Response> {
    try {
      const { gifId } = req.params;
      const likeCreatorId = req.user?.user_id;

      const parsedGifId = Number.parseInt(gifId, 10);

      const checkGif = await pool.query(fetchGifById, [parsedGifId]);

      if (!checkGif || !checkGif.rows || checkGif.rows.length === 0) {
        return res.status(404).json({
          status: 'error',
          error: 'gif might have been deleted or does not exist',
        });
      }

      const currentTimeInMilliseconds = Date.now();
      const dbFormatCurrentTime = new Date(
        currentTimeInMilliseconds
      ).toISOString();

      const hasLike = await pool.query(fetchGifLike, [
        likeCreatorId,
        parsedGifId,
      ]);

      if (hasLike.rows.length !== 0) {
        await pool.query(removeGifLikeQuery, [likeCreatorId, parsedGifId]);

        const getGifLikesCount = await pool.query(getGifLikesCountQuery, [
          parsedGifId,
        ]);

        if (!getGifLikesCount.rows[0].gif_likes_count) {
          return res.status(404).json({
            status: 'error',
            error: 'error retrieving likes',
          });
        }

        const gifLikeCount = getGifLikesCount.rows[0].gif_likes_count;
        const parsedGifLikeCount = Number.parseInt(gifLikeCount, 10);

        return res.status(200).json({
          status: 'success',
          data: {
            message: 'unliked gif!',
            likes: parsedGifLikeCount,
          },
        });
      }

      const likeGif = await pool.query(likeGifQuery, [
        likeCreatorId,
        parsedGifId,
        dbFormatCurrentTime,
      ]);

      if (!likeGif || !likeGif.rows || likeGif.rows.length === 0) {
        return res.status(500).json({
          status: 'error',
          error: 'Could not like post, try again later',
        });
      }

      const { liked_at } = likeGif.rows[0];

      const getGifLikesCount = await pool.query(getGifLikesCountQuery, [
        parsedGifId,
      ]);

      if (!getGifLikesCount.rows[0].gif_likes_count) {
        return res.status(404).json({
          status: 'error',
          error: 'error retrieving likes',
        });
      }

      const gifLikeCount = getGifLikesCount.rows[0].gif_likes_count;
      const parsedGifLikeCount = Number.parseInt(gifLikeCount, 10);

      return res.status(201).json({
        status: 'success',
        data: {
          message: 'Gif liked!',
          likedAt: liked_at,
          likes: parsedGifLikeCount,
        },
      });
    } catch (err: unknown) {
      return res
        .status(500)
        .json({ status: 'error', error: err || 'Server Error' });
    }
  }

  // Comment on GIF
  async commentOnGif(req: Request, res: Response): Promise<Response> {
    try {
      const { gifId } = req.params;
      const commentCreatorId = req.user?.user_id;
      const { comment } = req.body;

      const parsedGifId = Number.parseInt(gifId, 10);

      const checkGif = await pool.query(fetchGifById, [parsedGifId]);

      if (!checkGif || !checkGif.rows || checkGif.rows.length === 0) {
        return res.status(404).json({
          status: 'error',
          error: 'gif might have been deleted or does not exist',
        });
      }

      const currentTimeInMilliseconds = Date.now();
      const dbFormatCurrentTime = new Date(
        currentTimeInMilliseconds
      ).toISOString();

      const postedComment = await pool.query(commentOnGifQuery, [
        comment,
        dbFormatCurrentTime,
        commentCreatorId,
        parsedGifId,
      ]);

      if (
        !postedComment ||
        !postedComment.rows ||
        postedComment.rows.length === 0
      ) {
        return res.status(500).json({
          status: 'error',
          error: 'Could not comment on this post, try again later',
        });
      }

      const { comment_id, comment_text, created_at, user_id, gif_id } =
        postedComment.rows[0];

      return res.status(201).json({
        status: 'success',
        data: {
          message: 'comment posted!',
          commentId: comment_id,
          comment: comment_text,
          createdOn: created_at,
          createdBy: user_id,
          gifId: gif_id,
        },
      });
    } catch (err: unknown) {
      return res
        .status(500)
        .json({ status: 'error', error: err || 'Server Error' });
    }
  }

  // Fetch GIF comments
  async fetchGifComments(req: Request, res: Response): Promise<Response> {
    try {
      const { gifId } = req.params;
      const page = Number.parseInt(req.params.page, 10);
      const limit = 10;

      const parsedGifId = Number.parseInt(gifId, 10);

      const offset = (page - 1) * limit;

      const checkGif = await pool.query(fetchGifById, [parsedGifId]);

      if (!checkGif || !checkGif.rows || checkGif.rows.length === 0) {
        return res.status(404).json({
          status: 'error',
          error: 'gif might have been deleted or does not exist',
        });
      }

      const gifComments = await pool.query(fetchGifCommentsQuery, [
        parsedGifId,
        limit,
        offset,
      ]);

      const comments = gifComments.rows;

      const gifCommentsCount = await pool.query(getGifCommentsCountQuery, [
        parsedGifId,
      ]);

      const totalGifCommentsCount = gifCommentsCount.rows[0].comments_count;
      const parsedCommentsCount = Number.parseInt(totalGifCommentsCount, 10);

      if (page === 1 && comments.length === 0) {
        return res.status(200).json({
          status: 'success',
          data: {
            message: 'Be the first to comment on this post',
            commentsCount: parsedCommentsCount,
            comments,
          },
        });
      }

      return res.status(200).json({
        status: 'success',
        data: {
          message: 'comments fetched successfully',
          commentsCount: parsedCommentsCount,
          comments,
        },
      });
    } catch (err: unknown) {
      return res
        .status(500)
        .json({ status: 'error', error: err || 'Server Error' });
    }
  }

  // Edit GIF comment
  async editGifComment(req: Request, res: Response): Promise<Response> {
    try {
      const { commentId } = req.params;
      const { comment } = req.body;

      const parsedCommentId = Number.parseInt(commentId, 10);

      const checkComment = await pool.query(fetchSingleGifCommentQuery, [
        parsedCommentId,
      ]);

      if (
        !checkComment ||
        !checkComment.rows ||
        checkComment.rows.length === 0
      ) {
        return res.status(404).json({
          status: 'error',
          error: 'comment might have been deleted or does not exist',
        });
      }

      const { user_id } = checkComment.rows[0];

      if (req.user?.user_id !== user_id) {
        return res.status(403).json({
          status: 'error',
          error: 'Forbidden.',
        });
      }

      const currentTimeInMilliseconds = Date.now();
      const dbFormatCurrentTime = new Date(
        currentTimeInMilliseconds
      ).toISOString();

      const updatedComment = await pool.query(editGifCommentQuery, [
        comment,
        dbFormatCurrentTime,
        parsedCommentId,
      ]);

      if (
        !updatedComment ||
        !updatedComment.rows ||
        updatedComment.rows.length === 0
      ) {
        return res.status(500).json({
          status: 'error',
          error:
            'Something went wrong when updating comment, please try again later',
        });
      }

      const { comment_id, comment_text } = updatedComment.rows[0];

      return res.status(200).json({
        status: 'success',
        data: {
          message: 'comment updated!',
          commentId: comment_id,
          comment: comment_text,
        },
      });
    } catch (err: unknown) {
      return res
        .status(500)
        .json({ status: 'error', error: err || 'Server Error' });
    }
  }

  // Delete Gif comment
  async deleteGifComment(req: Request, res: Response): Promise<Response> {
    try {
      const { commentId } = req.params;
      const parsedCommentId = Number.parseInt(commentId, 10);

      const checkComment = await pool.query(fetchSingleGifCommentQuery, [
        parsedCommentId,
      ]);

      if (
        !checkComment ||
        !checkComment.rows ||
        checkComment.rows.length === 0
      ) {
        return res.status(404).json({
          status: 'error',
          error: 'comment might have been deleted or does not exist',
        });
      }

      const { user_id } = checkComment.rows[0];

      if (req.user?.user_id !== user_id) {
        return res.status(403).json({
          status: 'error',
          error: 'Forbidden.',
        });
      }

      const deleteGifComment = await pool.query(deleteCommentQuery, [
        parsedCommentId,
      ]);

      if (!deleteGifComment || deleteGifComment.rows.length === 0) {
        return res.status(500).json({
          status: 'error',
          error: 'unable to delete comment, please retry later',
        });
      }

      return res.status(200).json({
        status: 'success',
        data: {
          message: 'comment deleted',
        },
      });
    } catch (err: unknown) {
      return res
        .status(500)
        .json({ status: 'error', error: err || 'Server Error' });
    }
  }

  // ADMIN DELETE COMMENT
  async adminDeleteGifComment(req: Request, res: Response): Promise<Response> {
    try {
      const { commentId } = req.params;

      const parsedCommentId = Number.parseInt(commentId, 10);

      const checkComment = await pool.query(fetchSingleGifCommentQuery, [
        parsedCommentId,
      ]);

      if (
        !checkComment ||
        !checkComment.rows ||
        checkComment.rows.length === 0
      ) {
        return res.status(404).json({
          status: 'error',
          error: 'comment might have been deleted or does not exist',
        });
      }

      const deleteGifComment = await pool.query(deleteCommentQuery, [
        parsedCommentId,
      ]);

      if (!deleteGifComment || deleteGifComment.rows.length === 0) {
        return res.status(500).json({
          status: 'error',
          error: 'unable to delete comment, please retry later',
        });
      }

      return res.status(200).json({
        status: 'success',
        data: {
          message: 'comment deleted',
        },
      });
    } catch (err: unknown) {
      return res
        .status(500)
        .json({ status: 'error', error: err || 'Server Error' });
    }
  }

  // ARTICLE CONTROLLERS

  // POST ARTICLE
  async postArticle(
    req: Request<PostArticleInput>,
    res: Response
  ): Promise<Response> {
    try {
      const { title, content, category } = req.body;
      const creatorId = req.user?.user_id;

      const newArticlePost = await pool.query(insertArticlePostQuery, [
        title,
        content,
        category,
        creatorId,
      ]);

      const { article_id, created_on, creator_id } = newArticlePost.rows[0];

      return res.status(201).json({
        status: 'success',
        data: {
          message: 'Article posted!',
          articleId: article_id,
          title,
          content,
          category,
          createdOn: created_on,
          creatorId: creator_id,
        },
      });
    } catch (err: unknown) {
      return res
        .status(500)
        .json({ status: 'error', error: err || 'Server Error' });
    }
  }

  // UPDATE ARTICLE
  async updateArticle(req: Request, res: Response): Promise<Response> {
    try {
      const { title, content } = req.body;
      const { articleId } = req.params;
      const parsedArticleId = Number.parseInt(articleId, 10);
      const reqUserId = req.user?.user_id;

      const checkArticle = await pool.query(fetchArticleById, [
        parsedArticleId,
      ]);

      if (
        !checkArticle ||
        !checkArticle.rows ||
        checkArticle.rows.length === 0
      ) {
        return res.status(404).json({
          status: 'error',
          error: 'article might have been deleted or does not exist.',
        });
      }

      const { creator_id } = checkArticle.rows[0];

      if (reqUserId !== creator_id) {
        return res.status(403).json({
          status: 'error',
          error: `Forbidden.`,
        });
      }

      const updatedArticle = await pool.query(editArticleQuery, [
        title,
        content,
        parsedArticleId,
      ]);

      if (
        !updatedArticle ||
        !updatedArticle.rows ||
        updatedArticle.rows.length === 0
      ) {
        return res.status(400).json({
          status: 'error',
          error: 'Failed to update, try again.',
        });
      }

      return res.status(200).json({
        status: 'success',
        data: {
          message: 'update successful.',
          articleId,
          title,
          content,
        },
      });
    } catch (err: unknown) {
      return res
        .status(500)
        .json({ status: 'error', error: err || 'Server Error' });
    }
  }

  // DELETE ARTICLE
  async deleteArticle(req: Request, res: Response): Promise<Response> {
    try {
      const { articleId } = req.params;
      const parsedArticleId = Number.parseInt(articleId, 10);
      const reqUserId = req.user?.user_id;

      const checkArticle = await pool.query(fetchArticleById, [
        parsedArticleId,
      ]);

      if (
        !checkArticle ||
        !checkArticle.rows ||
        checkArticle.rows.length === 0
      ) {
        return res.status(404).json({
          status: 'error',
          error: 'article might have been deleted or does not exist.',
        });
      }

      const { creator_id } = checkArticle.rows[0];

      if (reqUserId !== creator_id) {
        return res.status(403).json({
          status: 'error',
          error: `Forbidden.`,
        });
      }

      const deletedArticle = await pool.query(deleteArticlePostQuery, [
        parsedArticleId,
      ]);

      if (
        !deletedArticle ||
        !deletedArticle.rows ||
        deletedArticle.rows.length === 0
      ) {
        return res.status(500).json({
          status: 'error',
          error: 'unable to delete article, please retry later',
        });
      }

      return res.status(200).json({
        status: 'success',
        data: {
          message: 'post deleted.',
        },
      });
    } catch (err: unknown) {
      return res
        .status(500)
        .json({ status: 'error', error: err || 'Server Error' });
    }
  }

  // ADMIN DELETE ARTICLE
  async adminDeleteArticle(req: Request, res: Response): Promise<Response> {
    try {
      const { articleId } = req.params;
      const parsedArticleId = Number.parseInt(articleId, 10);

      const checkArticle = await pool.query(fetchArticleById, [
        parsedArticleId,
      ]);

      if (
        !checkArticle ||
        !checkArticle.rows ||
        checkArticle.rows.length === 0
      ) {
        return res.status(404).json({
          status: 'error',
          error: 'article might have been deleted or does not exist.',
        });
      }

      const deletedArticle = await pool.query(deleteArticlePostQuery, [
        parsedArticleId,
      ]);

      if (
        !deletedArticle ||
        !deletedArticle.rows ||
        deletedArticle.rows.length === 0
      ) {
        return res.status(500).json({
          status: 'error',
          error: 'unable to delete article, please retry later',
        });
      }

      return res.status(200).json({
        status: 'success',
        data: {
          message: 'post deleted.',
        },
      });
    } catch (err: unknown) {
      return res
        .status(500)
        .json({ status: 'error', error: err || 'Server Error' });
    }
  }

  // FETCH ALL ARTICLES
  async fetchAllArticles(req: Request, res: Response): Promise<Response> {
    try {
      const page = Number.parseInt(req.query.page as string, 10) || 1;
      const limit = Number.parseInt(req.query.limit as string, 10) || 10;

      const offset = (page - 1) * limit;

      const articlesCountResult = await pool.query(getArticlesCount);
      const articlesCount = articlesCountResult.rows[0].total_count;
      const parsedArticlesCount = Number.parseInt(articlesCount, 10);

      const articlesResponse = await pool.query(fetchAllArticlesQuery, [
        limit,
        offset,
      ]);

      const articles = articlesResponse.rows;

      return res.status(200).json({
        status: 'success',
        data: {
          message: 'Articles successfully fetched',
          articlesCount: parsedArticlesCount,
          articles,
        },
      });
    } catch (err: unknown) {
      return res
        .status(500)
        .json({ status: 'error', error: err || 'Server Error' });
    }
  }

  // FETCH USER ARTICLES
  async fetchUserArticles(req: Request, res: Response): Promise<Response> {
    try {
      const creatorId = Number.parseInt(req.params.creatorId, 10);
      const page = Number.parseInt(req.params.page, 10);
      const limit = 10;

      const offset = (page - 1) * limit;

      const creatorResponse = await pool.query(fetchUserByIdQuery, [creatorId]);

      if (
        !creatorResponse ||
        !creatorResponse.rows ||
        creatorResponse.rows.length === 0
      ) {
        return res.status(404).json({
          status: 'error',
          error: 'A problem occured with finding this user',
        });
      }

      const articlesCountResponse = await pool.query(getUserArticlesCount, [
        creatorId,
      ]);
      const articlesCount = articlesCountResponse.rows[0].user_articles_count;
      const parsedArticlesCount = Number.parseInt(articlesCount, 10);

      const articlesResponse = await pool.query(fetchUserArticlesQuery, [
        creatorId,
        limit,
        offset,
      ]);

      const articles = articlesResponse.rows;

      if (articles.length === 0) {
        return res.status(200).json({
          status: 'success',
          data: {
            message: `No Articles from this user yet`,
          },
        });
      }

      return res.status(200).json({
        status: 'success',
        data: {
          message: `User's Articles fetched successfully`,
          userArticlesCount: parsedArticlesCount,
          articles,
        },
      });
    } catch (err: unknown) {
      return res
        .status(500)
        .json({ status: 'error', error: err || 'Server Error' });
    }
  }

  // FETCH CATEGORY ARTICLE
  async fetchCategoryArticle(req: Request, res: Response): Promise<Response> {
    try {
      const { category } = req.params;
      const page = Number.parseInt(req.params.page, 10);
      const limit = 10;

      const offset = (page - 1) * limit;

      const queries = [
        pool.query(getCategoryArticlesCount, [category]),
        pool.query(fetchCategoryArticles, [category, limit, offset]),
      ];

      const [categoryArticlesCount, categoryArticlesResponse] =
        await Promise.all(queries).catch((err) => {
          throw err;
        });

      const parsedCategoryArticlesCount = Number.parseInt(
        categoryArticlesCount.rows[0].category_articles_count,
        10
      );

      return res.status(200).json({
        status: 'success',
        data: {
          message: `Category Articles fetched successfully`,
          categoryArticlesCount: parsedCategoryArticlesCount,
          articles: categoryArticlesResponse.rows,
        },
      });
    } catch (err: unknown) {
      return res
        .status(500)
        .json({ status: 'error', error: err || 'Server Error' });
    }
  }

  // FETCH SINGLE ARTICLE
  async fetchSingleArticle(req: Request, res: Response): Promise<Response> {
    try {
      const { articleId } = req.params;
      const parsedArticleId = Number.parseInt(articleId, 10);

      const fetchResponse = await pool.query(fetchArticleById, [
        parsedArticleId,
      ]);

      if (
        !fetchResponse ||
        !fetchResponse.rows ||
        fetchResponse.rows.length === 0
      ) {
        return res.status(404).json({
          status: 'error',
          error: 'Post not found',
        });
      }

      const { article_id, creator_id, title, content, created_on } =
        fetchResponse.rows[0];

      return res.status(200).json({
        status: 'success',
        data: {
          message: 'Article fetched successfully',
          articleId: article_id,
          creatorId: creator_id,
          title,
          content,
          createdOn: created_on,
        },
      });
    } catch (err: unknown) {
      return res
        .status(500)
        .json({ status: 'error', error: err || 'Server Error' });
    }
  }

  // LIKE ARTICLE
  async likeArticle(req: Request, res: Response): Promise<Response> {
    try {
      const { articleId } = req.params;
      const likeCreatorId = req.user?.user_id;
      const parsedArticleId = Number.parseInt(articleId, 10);

      const checkArticle = await pool.query(fetchArticleById, [
        parsedArticleId,
      ]);

      if (
        !checkArticle ||
        !checkArticle.rows ||
        checkArticle.rows.length === 0
      ) {
        return res.status(404).json({
          status: 'error',
          error: 'article might have been deleted or does not exist',
        });
      }

      const currentTimeInMilliseconds = Date.now();
      const dbFormatCurrentTime = new Date(
        currentTimeInMilliseconds
      ).toISOString();

      const hasLiked = await pool.query(fetchArticleLikes, [
        likeCreatorId,
        parsedArticleId,
      ]);

      if (hasLiked.rows.length !== 0) {
        await pool.query(removeArticleLikeQuery, [
          likeCreatorId,
          parsedArticleId,
        ]);

        const getArticleLikesCount = await pool.query(
          getArticleLikesCountQuery,
          [parsedArticleId]
        );

        if (!getArticleLikesCount.rows[0].article_likes_count) {
          return res.status(404).json({
            status: 'error',
            error: 'error retrieving likes',
          });
        }

        const articleLikesCount =
          getArticleLikesCount.rows[0].article_likes_count;
        const parsedArticleLikesCount = Number.parseInt(articleLikesCount, 10);

        return res.status(200).json({
          status: 'success',
          data: {
            message: 'unliked article!',
            likes: parsedArticleLikesCount,
          },
        });
      }

      const likeArticle = await pool.query(likeArticleQuery, [
        likeCreatorId,
        parsedArticleId,
        dbFormatCurrentTime,
      ]);

      if (!likeArticle || !likeArticle.rows || likeArticle.rows.length === 0) {
        return res.status(500).json({
          status: 'error',
          error: 'Could not like post, try again later',
        });
      }

      const { liked_at } = likeArticle.rows[0];

      const getArticleLikesCount = await pool.query(getArticleLikesCountQuery, [
        parsedArticleId,
      ]);

      if (!getArticleLikesCount.rows[0].article_likes_count) {
        return res.status(404).json({
          status: 'error',
          error: 'error retrieving likes',
        });
      }

      const articleLikeCount = getArticleLikesCount.rows[0].article_likes_count;
      const parsedArticleLikeCount = Number.parseInt(articleLikeCount, 10);

      return res.status(201).json({
        status: 'success',
        data: {
          message: 'Article liked!',
          likedAt: liked_at,
          likes: parsedArticleLikeCount,
        },
      });
    } catch (err: unknown) {
      return res
        .status(500)
        .json({ status: 'error', error: err || 'Server Error' });
    }
  }

  // COMMENT ON ARTICLE
  async commentOnArticle(req: Request, res: Response): Promise<Response> {
    try {
      const { comment } = req.body;
      const { articleId } = req.params;
      const reqUserId = req.user?.user_id;

      const parsedArticleId = Number.parseInt(articleId, 10);

      const checkArticle = await pool.query(fetchArticleById, [
        parsedArticleId,
      ]);

      if (
        !checkArticle ||
        !checkArticle.rows ||
        checkArticle.rows.length === 0
      ) {
        return res.status(404).json({
          status: 'error',
          error: 'article might have been deleted or does not exist',
        });
      }

      const currentTimeInMilliseconds = Date.now();
      const dbFormatCurrentTime = new Date(
        currentTimeInMilliseconds
      ).toISOString();

      const commentResponse = await pool.query(commentOnArticleQuery, [
        comment,
        dbFormatCurrentTime,
        reqUserId,
        parsedArticleId,
      ]);

      if (
        !commentResponse ||
        !commentResponse.rows ||
        commentResponse.rows.length === 0
      ) {
        return res.status(400).json({
          status: 'error',
          error: 'failed to post comment, try again.',
        });
      }

      const { comment_id, comment_text, created_at, user_id, article_id } =
        commentResponse.rows[0];

      return res.status(201).json({
        status: 'success',
        data: {
          message: 'comment posted!',
          commentId: comment_id,
          comment: comment_text,
          createdAt: created_at,
          userId: user_id,
          articleId: article_id,
        },
      });
    } catch (err: unknown) {
      return res
        .status(500)
        .json({ status: 'error', error: err || 'Server Error' });
    }
  }

  // FETCH ARTICLE COMMENTS
  async fetchArticleComments(req: Request, res: Response): Promise<Response> {
    try {
      const { articleId } = req.params;
      const page = Number.parseInt(req.params.page, 10);
      const limit = 10;

      const parsedArticleId = Number.parseInt(articleId, 10);

      const offset = (page - 1) * limit;

      const checkArticle = await pool.query(fetchArticleById, [
        parsedArticleId,
      ]);

      if (
        !checkArticle ||
        !checkArticle.rows ||
        checkArticle.rows.length === 0
      ) {
        return res.status(404).json({
          status: 'error',
          error: 'article might have been deleted or does not exist',
        });
      }

      const commentsResponse = await pool.query(fetchArticleCommentsQuery, [
        parsedArticleId,
        limit,
        offset,
      ]);

      const comments = commentsResponse.rows;

      const commentsCountResponse = await pool.query(
        getArticleCommentsCountQuery,
        [parsedArticleId]
      );

      const commentsCount = commentsCountResponse.rows[0].comments_count;
      const parsedCommentsCount = Number.parseInt(commentsCount, 10);

      if (page === 1 && comments.length === 0) {
        return res.status(200).json({
          status: 'success',
          data: {
            message: 'Be the first to comment on this post',
            commentsCount: parsedCommentsCount,
            comments,
          },
        });
      }

      return res.status(200).json({
        status: 'success',
        data: {
          message: 'comments fetched successfully',
          commentsCount: parsedCommentsCount,
          comments,
        },
      });
    } catch (err: unknown) {
      return res
        .status(500)
        .json({ status: 'error', error: err || 'Server Error' });
    }
  }

  // EDIT ARTICLE COMMENT
  async editArticleComment(req: Request, res: Response): Promise<Response> {
    try {
      const { comment } = req.body;
      const commentId = Number.parseInt(req.params.commentId, 10);
      const reqUserId = req.user?.user_id;

      const checkComment = await pool.query(fetchSingleArticleCommentQuery, [
        commentId,
      ]);

      if (
        !checkComment ||
        !checkComment.rows ||
        checkComment.rows.length === 0
      ) {
        return res.status(404).json({
          status: 'error',
          error: 'comment might have been deleted or does not exist',
        });
      }

      const { user_id } = checkComment.rows[0];

      if (user_id !== reqUserId) {
        return res.status(403).json({
          status: 'error',
          error: 'Forbidden.',
        });
      }

      const currentTimeInMilliseconds = Date.now();
      const dbFormatCurrentTime = new Date(
        currentTimeInMilliseconds
      ).toISOString();

      const editCommentResponse = await pool.query(editArticleCommentQuery, [
        comment,
        dbFormatCurrentTime,
        commentId,
      ]);

      if (
        !editCommentResponse ||
        !editCommentResponse.rows ||
        editCommentResponse.rows.length === 0
      ) {
        return res.status(400).json({
          status: 'error',
          error: 'Failed to update comment, try again.',
        });
      }

      const { comment_id, comment_text, updated_at } =
        editCommentResponse.rows[0];

      return res.status(200).json({
        status: 'success',
        data: {
          message: 'comment updated!',
          commentId: comment_id,
          comment: comment_text,
          updatedAt: updated_at,
        },
      });
    } catch (err: unknown) {
      return res
        .status(500)
        .json({ status: 'error', error: err || 'Server Error' });
    }
  }

  // DELETE ARTICLE COMMENT
  async deleteArticleComment(req: Request, res: Response): Promise<Response> {
    try {
      const { commentId } = req.params;
      const parsedCommentId = Number.parseInt(commentId, 10);
      const reqUserId = req.user?.user_id;

      const checkComment = await pool.query(fetchSingleArticleCommentQuery, [
        parsedCommentId,
      ]);

      if (
        !checkComment ||
        !checkComment.rows ||
        checkComment.rows.length === 0
      ) {
        return res.status(404).json({
          status: 'error',
          error: 'comment might have been deleted or does not exist',
        });
      }

      const { user_id } = checkComment.rows[0];

      if (user_id !== reqUserId) {
        return res.status(403).json({
          status: 'error',
          error: 'Forbidden.',
        });
      }

      const deleteCommentResponse = await pool.query(
        deleteArticleCommentQuery,
        [parsedCommentId]
      );

      if (
        !deleteCommentResponse ||
        !deleteCommentResponse.rows ||
        deleteCommentResponse.rows.length === 0
      ) {
        return res.status(500).json({
          status: 'error',
          error: 'unable to delete comment, please retry later',
        });
      }

      return res.status(200).json({
        status: 'success',
        data: {
          message: 'comment deleted',
        },
      });
    } catch (err: unknown) {
      return res
        .status(500)
        .json({ status: 'error', error: err || 'Server Error' });
    }
  }

  // ADMIN DELETE ARTICLE
  async adminDeleteArticleComment(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { commentId } = req.params;
      const parsedCommentId = Number.parseInt(commentId, 10);

      const checkComment = await pool.query(fetchSingleArticleCommentQuery, [
        parsedCommentId,
      ]);

      if (
        !checkComment ||
        !checkComment.rows ||
        checkComment.rows.length === 0
      ) {
        return res.status(404).json({
          status: 'error',
          error: 'comment might have been deleted or does not exist',
        });
      }

      const deleteCommentResponse = await pool.query(
        deleteArticleCommentQuery,
        [parsedCommentId]
      );

      if (
        !deleteCommentResponse ||
        !deleteCommentResponse.rows ||
        deleteCommentResponse.rows.length === 0
      ) {
        return res.status(500).json({
          status: 'error',
          error: 'unable to delete comment, please retry later',
        });
      }

      return res.status(200).json({
        status: 'success',
        data: {
          message: 'comment deleted',
        },
      });
    } catch (err: unknown) {
      return res
        .status(500)
        .json({ status: 'error', error: err || 'Server Error' });
    }
  }

  // FETCH ALL POSTS (ARTICLES + GIFS)
  async fetchAllPosts(req: Request, res: Response): Promise<Response> {
    try {
      const page = Number.parseInt(req.query.page as string, 10) || 1;
      const limit = Number.parseInt(req.query.limit as string, 10) || 10;

      const offset = (page - 1) * limit;

      const queries = [
         pool.query(fetchAllPostsQuery, [limit, offset]),
         pool.query(getAllArticlesAndGifsCountQuery),
      ];

      const [posts, postsCount] = await Promise.all(queries).catch((err) => {
        throw err;
      });

      if (page === 1 && posts.rows.length === 0) {
        return res.status(200).json({
          status: 'success',
          data: {
            message: 'No posts yet',
          },
        });
      }

      const parsedPostsCount = Number.parseInt(
        postsCount.rows[0].total_count,
        10
      );

      return res.status(200).json({
        status: 'success',
        data: {
          message: 'Posts fetched successfully',
          postsCount: parsedPostsCount,
          posts: posts.rows,
        },
      });
    } catch (err: unknown) {
      return res
        .status(500)
        .json({ status: 'error', error: err || 'Server Error' });
    }
  }
}
