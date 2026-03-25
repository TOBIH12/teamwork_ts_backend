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
  deleteGifSchemaDTO,
  fetchAllGifsSchemaDTO,
  fetchUserGifsSchemaDTO,
  fetchGifSchemaDTO,
  fetchGifCommentSchemaDTO,
  deleteGifCommentSchemaDTO,
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
  validationMiddleware(deleteGifSchemaDTO),
  postsControllers.deleteGifPost
);
router.delete(
  '/gif/admin_delete_gif/:gifId',
  authMiddleware,
  adminAuthentication,
  validationMiddleware(deleteGifSchemaDTO),
  postsControllers.adminDeleteGifPost
);
router.get(
  '/all_gifs/:page', 
  authMiddleware,
  validationMiddleware(fetchAllGifsSchemaDTO), 
  postsControllers.fetchAllGifs);
router.get(
  '/user_gifs/:creatorId/:page',
  authMiddleware,
  validationMiddleware(fetchUserGifsSchemaDTO),
  postsControllers.fetchUserGifs
);
router.get(
  '/gif/:gifId', 
  authMiddleware,
  validationMiddleware(fetchGifSchemaDTO),
  postsControllers.fetchGif);
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
  validationMiddleware(fetchGifCommentSchemaDTO),
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
  validationMiddleware(deleteGifCommentSchemaDTO),
  postsControllers.deleteGifComment
);
router.delete(
  '/gif/admin_delete_comment/:commentId',
  authMiddleware,
  adminAuthentication,
  validationMiddleware(deleteGifCommentSchemaDTO),
  postsControllers.adminDeleteGifComment
);

export default router;
