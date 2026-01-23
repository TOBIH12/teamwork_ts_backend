import express from 'express';
import authMiddleware from '../../middlewares/authMiddleware';
import PostsControllers from '../../controllers/v1/postsControllers';
import validationMiddleware from '../../middlewares/validator';
import { PostGifSchemaDTO } from '../../zodSchema';
import UploadedGif from '../../middlewares/multerMiddleware';

const Router = express();
const postsControllers = new PostsControllers();

Router.post(
  '/post_gif',
  authMiddleware,
  UploadedGif,
  validationMiddleware(PostGifSchemaDTO),
  postsControllers.CreateGifPost
);

export default Router;
