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

  const role = req.user?.job_role as string;
  if (!role) {
    return res.status(403).json({
      status: 'error',
      error: 'Forbidden: User role not found',
    });
  }

  if (
    role.trim().toLowerCase() !== 'admin' &&
    role.trim().toLowerCase() !== 'super_admin'
  ) {
    return res.status(403).json({
      status: 'error',
      error: 'Forbidden.',
    });
  }
  return next();
};

export default adminAuthentication;
