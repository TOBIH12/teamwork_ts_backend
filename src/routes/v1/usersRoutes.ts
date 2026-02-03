import express from 'express';
import authMiddleware from '../../middlewares/authMiddleware';
import UserControllers from '../../controllers/v1/usersControllers';
import validationMiddleware from '../../middlewares/validator';
import { registrationSchemaDTO, signInSchemaDTO } from '../../zodSchema';
import adminAuthentication from '../../middlewares/adminAuth';

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

export default router;
