import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export enum ValidationSource {
  BODY = 'body',
  PARAMS = 'params',
  QUERY = 'query',
  HEADER = 'header',
}

export const validationMiddleware = (
  schema: z.ZodSchema,
  source: ValidationSource
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dataToValidate = await schema.safeParseAsync(
        source === ValidationSource.BODY
          ? req.body
          : source === ValidationSource.PARAMS
            ? req.params
            : source === ValidationSource.QUERY
              ? req.query
              : source === ValidationSource.HEADER
                ? req.headers
                : {}
      );
      if (!dataToValidate.success) {
        return res.status(400).json({
          status: 'error',
          error: dataToValidate.error.issues
            .map((issue) => issue.message)
            .join(', '),
        });
      }
      Object.assign(
        source === ValidationSource.BODY
          ? req.body
          : source === ValidationSource.PARAMS
            ? req.params
            : source === ValidationSource.QUERY
              ? req.query
              : source === ValidationSource.HEADER
                ? req.headers
                : {},
        dataToValidate.data
      );
      return next();
    } catch (err) {
      return res.status(500).json({
        status: 'error',
        error: err instanceof Error ? err.message : 'Internal Server Error',
      });
    }
  };
};
