import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export const multerErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({
      error: err.message
    });
  } else if (err instanceof Error) {
    res.status(400).json({
      error: err.message
    });
  } else {
    next(err);
  }
};
