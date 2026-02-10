import express from 'express';
import authMiddleware from '../../middlewares/authMiddleware';
import UserControllers from '../../controllers/v1/usersControllers';
import validationMiddleware from '../../middlewares/validator';
import {
  registrationSchemaDTO,
  signInSchemaDTO,
  editUserSchemaDTO,
  changePasswordSchemaDTO,
} from '../../zodSchema';
import adminAuthentication from '../../middlewares/adminAuth';
import { uploadedUserImage } from '../../middlewares/multerMiddleware';

const router = express();

const userControllers = new UserControllers();

router.post(
  '/admin/createUser',
  validationMiddleware(registrationSchemaDTO),
  authMiddleware,
  adminAuthentication,
  userControllers.createUser
);
router.post(
  '/signin',
  validationMiddleware(signInSchemaDTO),
  userControllers.signInUser
);
router.patch(
  '/editUserDetails/:userId',
  validationMiddleware(editUserSchemaDTO),
  authMiddleware,
  userControllers.editUserDetails
);
router.patch(
  '/auth/changePassword/:userId',
  validationMiddleware(changePasswordSchemaDTO),
  authMiddleware,
  userControllers.changePassword
);
router.patch(
  '/uploadUserImage/:userId',
  authMiddleware,
  uploadedUserImage,
  userControllers.uploadUserImage
);

export default router;
