import { Request, Response } from 'express';
import dotenv from 'dotenv';
import z from 'zod';
import multer from 'multer';
import pool from '../../db';
import { postGifSchema } from '../../zodSchema';
import cloudinaryConfig from '../../cloudinaryConfig';
import {
  incrementUserGifsCountQuery,
  insertGifPostQuery,
} from '../../queries/posts.queries';

dotenv.config();

type PostGifInput = z.infer<typeof postGifSchema>;

interface PostRequest extends Request<PostGifInput> {
  user?: {
    user_id: number;
    firstname: string;
    lastname: string;
    email: string;
    gifs: number;
    articles: number;
    user_img: string;
    gender: string;
    jobrole: string;
    department: string;
    address: string;
  };
  file?: Express.Multer.File;
}

export default class PostsControllers {
  // Create GIF Post
  async createGifPost(req: PostRequest, res: Response) {
    try {
      const { title } = req.body;

      if (!req.file) {
        return res
          .status(400)
          .json({ status: 'error', error: 'No GIF file uploaded' });
      }

      const gif = req.file;

      const gif_url = await cloudinaryConfig.uploader.upload(gif.path, {
        resource_type: 'auto',
        folder: 'gifs',
        public_id: `${Date.now()}`,
      });

      if (!gif_url || !gif_url.secure_url) {
        return res.status(500).json({
          status: 'error',
          error: 'Failed to upload GIF to Cloudinary',
        });
      }

      const creator_id = req.user?.user_id;

      const newGifPost = await pool.query(insertGifPostQuery, [
        title,
        gif_url.secure_url,
        creator_id,
      ]);

      const { gif_id, created_on } = newGifPost.rows[0];

      // Increment user's GIF count
      const newGifsCount = (req.user?.gifs || 0) + 1;

      await pool
        .query(incrementUserGifsCountQuery, [newGifsCount, creator_id])
        .catch((err) => {
          return res.status(500).json({
            status: 'error',
            error: err.message || 'Failed to update user GIFs count',
          });
        });

      return res.status(201).json({
        status: 'success',
        data: {
          gif_id,
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
