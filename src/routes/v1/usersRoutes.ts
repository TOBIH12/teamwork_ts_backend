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
router.get('/getUsers/:page', authMiddleware, userControllers.getUsers);
router.get('/getUserById/:userId', authMiddleware, userControllers.getUserById);
router.patch(
  '/editUserDetails',
  validationMiddleware(editUserSchemaDTO),
  authMiddleware,
  userControllers.editUserDetails
);
router.patch(
  '/auth/changePassword',
  validationMiddleware(changePasswordSchemaDTO),
  authMiddleware,
  userControllers.changePassword
);
router.patch(
  '/uploadUserImage',
  authMiddleware,
  uploadedUserImage,
  userControllers.uploadUserImage
);
router.patch(
  '/admin/updateRole/:userId/:role',
  authMiddleware,
  adminAuthentication,
  userControllers.updateUserRole
);
router.delete(
  '/admin/deleteUser/:userId',
  authMiddleware,
  adminAuthentication,
  userControllers.deleteUser
);

export default router;
