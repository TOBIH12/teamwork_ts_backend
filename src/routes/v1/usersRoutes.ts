import express from 'express';
import authMiddleware from '../../middlewares/authMiddleware';
import UserControllers from '../../controllers/v1/usersControllers';
import validationMiddleware from '../../middlewares/validator';
import { RegistrationSchemaDTO, SignInSchemaDTO } from '../../zodSchema';
import adminAuthentication from '../../middlewares/adminAuth';

const Router = express();

const userControllers = new UserControllers();

Router.post(
  '/admin/createUser',
  validationMiddleware(RegistrationSchemaDTO),
  authMiddleware,
  adminAuthentication,
  userControllers.createUser
);
Router.post(
  '/signin',
  validationMiddleware(SignInSchemaDTO),
  userControllers.signInUser
);

export default Router;
