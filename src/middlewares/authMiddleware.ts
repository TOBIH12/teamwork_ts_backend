import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import HttpError from '../errorModel'

dotenv.config();



interface AuthRequest extends Request {
  user?: any;
}


 const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization; // lowercase is standard

 // Check if Authorization header is present and starts with 'Bearer'

 if(authHeader && typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        // Extract the token from the Authorization header
        
       const token = authHeader.split(" ")[1];
       
        jwt.verify(token, process.env.JWT_SECRET as string, (error, info) =>{
            if(error?.name === 'TokenExpiredError'){
                console.error(error);
                return next(new HttpError('Unauthorized, expired token', 403))
            } else if (error) {
                console.error(error);
                return next(new HttpError('Unauthorized, invalid token', 401))
            }

            req.user = info;
            next()
        })
    } else {
        return next(new HttpError('Unathorized. No token', 402))
    }

}


export default authMiddleware;