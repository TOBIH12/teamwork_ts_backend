import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  user?: Record<string, unknown>;
}

const adminAuthentication = (
  req: AuthRequest,
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
      error: 'Rejected: Admins only',
    });
  }
  return next();
};

export default adminAuthentication;
