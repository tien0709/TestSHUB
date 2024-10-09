import { Request, Response, NextFunction } from 'express';

export const intervalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof Error) {
    res.status(400).json({
      error: err.message
    });
  } else {
    next(err);
  }
};
