import express from 'express';
import multer from 'multer';
import { fileUploadHandler } from '../controllers/fileController';
import { multerErrorHandler } from '../middlewares/multerErrorHandler';

// Cấu hình multer
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `file_${Date.now()}.xlsx`;
      cb(null, uniqueSuffix);
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only .xlsx files are allowed.'));
    }
  }
});

const router = express.Router();
router.post('/', upload.single('file'), multerErrorHandler, fileUploadHandler);

export default router;
