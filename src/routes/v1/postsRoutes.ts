import express from 'express';
import authMiddleware from '../../middlewares/authMiddleware';
import PostsControllers from '../../controllers/v1/postsControllers';
import validationMiddleware from '../../middlewares/validator';
import { postGifSchemaDTO } from '../../zodSchema';
import uploadedGif from '../../middlewares/multerMiddleware';

const router = express();
const postsControllers = new PostsControllers();

router.post(
  '/post_gif',
  authMiddleware,
  uploadedGif,
  validationMiddleware(postGifSchemaDTO),
  postsControllers.createGifPost
);

export default router;
