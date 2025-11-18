import express from 'express';
import { createUser } from "../../controllers/v1/usersControllers";


const router = express();


router.post('/admin/createUser', createUser);


export default router;