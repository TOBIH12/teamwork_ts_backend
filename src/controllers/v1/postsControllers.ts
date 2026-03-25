import { Request, Response } from 'express';
import dotenv from 'dotenv';
import z from 'zod';
import pool from '../../db';
import { postGifSchema } from '../../zodSchema';
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
} from '../../queries/posts.queries';
import { fetchUserByIdQuery } from '../../queries/users.queries';

dotenv.config();

type PostGifInput = z.infer<typeof postGifSchema>;

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

      const gifUrl = await handleCloudinaryUpload(dataURI, "gifs");

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

      const { gif_id, created_on } = newGifPost.rows[0];

      return res.status(201).json({
        status: 'success',
        data: {
          gifId: gif_id,
          message: 'GIF post created successfully',
          createdOn: created_on,
          title: newGifPost.rows[0].title,
          gifUrl: newGifPost.rows[0].gif_url,
          authorId: newGifPost.rows[0].creator_id,
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

      const parsedGifId = Number.parseInt(gifId, 10)

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

      const parsedGifId = Number.parseInt(gifId, 10)

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
      const page = Number.parseInt(req.params.page, 10);
      const limit = 10;

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
      const parsedGifsCount = Number.parseInt(totalUserGifsCount, 10)

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
            message: `No Gifs yet`,
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

       const parsedGifId = Number.parseInt(gifId, 10)

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
      const {gifId} = req.params;
      const likeCreatorId = req.user?.user_id;

       const parsedGifId = Number.parseInt(gifId, 10)

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

      const hasLike = await pool.query(fetchGifLike, [likeCreatorId, parsedGifId]);

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
        const parsedGifLikeCount = Number.parseInt(gifLikeCount, 10)

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

      const getGifLikesCount = await pool.query(getGifLikesCountQuery, [parsedGifId]);

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

      const {
        comment_id,
        comment_text,
        commented_at,
        commenter_id,
        commented_gif_id,
      } = postedComment.rows[0];

      return res.status(201).json({
        status: 'success',
        data: {
          message: 'comment posted!',
          commentId: comment_id,
          comment: comment_text,
          createdOn: commented_at,
          createdBy: commenter_id,
          gifId: commented_gif_id,
        },
      });
    } catch (err: unknown) {
      console.log(err)
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

      if (comments.length === 0) {
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

      const { commenter_id } = checkComment.rows[0];

      if (req.user?.user_id !== commenter_id) {
        return res.status(403).json({
          status: 'error',
          error: 'Forbidden.',
        });
      }

      const updatedComment = await pool.query(editGifCommentQuery, [
        comment,
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

      const { commenter_id } = checkComment.rows[0];

      if (req.user?.user_id !== commenter_id) {
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
}
