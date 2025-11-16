import { Request, Response, NextFunction } from 'express';


// Unsupported (404) routes

const notFound = (req: Request, res: Response, next: NextFunction) => {
    const error = new Error(`Not Found + ${req.originalUrl}`);
    res.status(404);
    next(error);
}


// General error handler
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {

    if(res.headersSent) {
        return next(err);
    }

    res.status(err.statusCode || 500);
    res.json({
        message: err.message || 'Unknown error occurred',
    });
}


export { notFound, errorHandler };