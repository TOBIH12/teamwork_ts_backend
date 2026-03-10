import express from 'express';
import authMiddleware from '../../middlewares/authMiddleware';
import adminAuthentication from '../../middlewares/adminAuth';
import PostsControllers from '../../controllers/v1/postsControllers';
import validationMiddleware from '../../middlewares/validator';
import {
  postGifSchemaDTO,
  gifLikeSchemaDTO,
  gifCommentSchemaDTO,
  editGifCommentSchemaDTO,
} from '../../zodSchema';
import { uploadedGif } from '../../middlewares/multerMiddleware';

const router = express();
const postsControllers = new PostsControllers();

router.post(
  '/post_gif',
  authMiddleware,
  uploadedGif,
  validationMiddleware(postGifSchemaDTO),
  postsControllers.createGifPost
);
router.delete(
  '/gif/delete_gif/:gifId',
  authMiddleware,
  postsControllers.deleteGifPost
);
router.delete(
  '/gif/admin_delete_gif/:gifId',
  authMiddleware,
  adminAuthentication,
  postsControllers.adminDeleteGifPost
);
router.get('/all_gifs/:page', authMiddleware, postsControllers.fetchAllGifs);
router.get(
  '/user_gifs/:creatorId/:page',
  authMiddleware,
  postsControllers.fetchUserGifs
);
router.get('/gif/:gifId', authMiddleware, postsControllers.fetchGif);
router.post(
  '/likeGif/:gifId',
  authMiddleware,
  validationMiddleware(gifLikeSchemaDTO),
  postsControllers.likeGif
);
router.post(
  '/gif/comment/:gifId',
  authMiddleware,
  validationMiddleware(gifCommentSchemaDTO),
  postsControllers.commentOnGif
);
router.get(
  '/gif_comments/:gifId/:page',
  authMiddleware,
  postsControllers.fetchGifComments
);
router.patch(
  '/gif/edit_comment/:commentId',
  authMiddleware,
  validationMiddleware(editGifCommentSchemaDTO),
  postsControllers.editGifComment
);
router.delete(
  '/gif/delete_comment/:commentId',
  authMiddleware,
  postsControllers.deleteGifComment
);
router.delete(
  '/gif/admin_delete_comment/:commentId',
  authMiddleware,
  adminAuthentication,
  postsControllers.adminDeleteGifComment
);

export default router;
