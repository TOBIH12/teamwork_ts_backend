import express from 'express';
import authMiddleware from '../../middlewares/authMiddleware';
import { createUser, signInUser } from '../../controllers/v1/usersControllers';

const router = express();

router.post('/admin/createUser', authMiddleware, createUser);
router.post('/signin', signInUser);

export default router;
