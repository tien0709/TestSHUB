import { Request, Response } from 'express';

export const fileUploadHandler = (req: Request, res: Response): void => {
  const uploadRequest = req as any;
  console.log(uploadRequest.file);
  if (!uploadRequest.file) {
    res.status(400).json({
      error: 'No file uploaded.'
    });
    return;
  }
  console.log(uploadRequest.file);

  res.status(200).json({
    message: 'Excel file uploaded successfully',
    file: {
      originalName: uploadRequest.file.originalname,
      filename: uploadRequest.file.filename,
      size: uploadRequest.file.size,
      mimetype: uploadRequest.file.mimetype
    }
  });
};
