import { Request, Response } from 'express';
import dotenv from 'dotenv';
import z from 'zod';
import pool from '../../db';
import { PostGifSchema } from '../../zodSchema';
import CloudinaryConfig from '../../cloudinaryConfig';
import {
  InsertGifPostQuery,
} from '../../queries/posts.queries';

dotenv.config();

type PostGifInput = z.infer<typeof PostGifSchema>;

export default class PostsControllers {
  // Create GIF Post
  async CreateGifPost(req: Request<PostGifInput>, res: Response) {
    try {
      const { title } = req.body;

      if (!req.file) {
        return res
          .status(400)
          .json({ status: 'error', error: 'No GIF file uploaded' });
      }

      const Gif = req.file;

      const GifUrl = await CloudinaryConfig.uploader.upload(Gif.path, {
        resource_type: 'auto',
        folder: 'gifs',
        public_id: `${Date.now()}`,
      });

      if (!GifUrl || !GifUrl.secure_url) {
        return res.status(500).json({
          status: 'error',
          error: 'Failed to upload GIF to Cloudinary',
        });
      }

      const CreatorId = req.user?.user_id;

      const NewGifPost = await pool.query(InsertGifPostQuery, [
        title,
        GifUrl.secure_url,
        CreatorId,
      ]);

      const { gif_id, created_on } = NewGifPost.rows[0];

      // Increment user's GIF count

      return res.status(201).json({
        status: 'success',
        data: {
          gif_id,
          message: 'GIF post created successfully',
          createdOn: created_on,
          title: NewGifPost.rows[0].title,
          gifUrl: NewGifPost.rows[0].gif_url,
          authorId: NewGifPost.rows[0].creator_id,
        },
      });
    } catch (err) {
      return res
        .status(400)
        .json({ status: 'error', error: err || 'Failed to create GIF post' });
    }
  }
}
