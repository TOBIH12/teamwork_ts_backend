import { Request, Response } from 'express';
import dotenv from 'dotenv';
import z from 'zod';
import pool from '../../db';
import { postGifSchema } from '../../zodSchema';
import cloudinaryConfig from '../../cloudinaryConfig';
import { insertGifPostQuery } from '../../queries/posts.queries';

dotenv.config();

type PostGifInput = z.infer<typeof postGifSchema>;

export default class PostsControllers {
  // Create GIF Post
  async createGifPost(req: Request<PostGifInput>, res: Response) {
    try {
      const { title } = req.body;

      if (!req.file) {
        return res
          .status(400)
          .json({ status: 'error', error: 'No GIF file uploaded' });
      }

      const gif = req.file;

      const gifUrl = await cloudinaryConfig.uploader.upload(gif.path, {
        resource_type: 'auto',
        folder: 'gifs',
        public_id: `${Date.now()}`,
      });

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

      // Increment user's GIF count

      return res.status(201).json({
        status: 'success',
        data: {
          id: gif_id,
          message: 'GIF post created successfully',
          createdOn: created_on,
          title: newGifPost.rows[0].title,
          gifUrl: newGifPost.rows[0].gif_url,
          authorId: newGifPost.rows[0].creator_id,
        },
      });
    } catch (err) {
      return res
        .status(400)
        .json({ status: 'error', error: err || 'Failed to create GIF post' });
    }
  }
}
