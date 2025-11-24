import express from 'express';
import authMiddleware from '../../middlewares/authMiddleware';
import { createUser, signInUser } from '../../controllers/v1/usersControllers';
import {
  validationMiddleware,
  ValidationSource,
} from '../../middlewares/validator';
import { registerSchema, signInSchema } from '../../zodSchema';
import adminAuthentication from '../../middlewares/adminAuth';

const router = express();

router.post(
  '/admin/createUser',
  validationMiddleware(registerSchema, ValidationSource.BODY),
  authMiddleware,
  adminAuthentication,
  createUser
);
router.post(
  '/signin',
  validationMiddleware(signInSchema, ValidationSource.BODY),
  signInUser
);

export default router;
