import { Request, Response, NextFunction } from 'express';

const adminAuthentication = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req?.user) {
    return res.status(401).json({
      status: 'error',
      error: 'Unauthorized access: No user information found',
    });
  }

  const role = req.user?.jobrole as string;
  if (role.trim().toLowerCase() !== 'admin') {
    return res.status(403).json({
      status: 'error',
      error: 'Forbidden.',
    });
  }
  return next();
};

export default adminAuthentication;
