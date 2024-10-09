import express from 'express';
import { getTotalInIntervalHandler } from '../controllers/getTotalController';
import { intervalErrorHandler } from '../middlewares/intervalErrorHandler';

const router = express.Router();
router.get('/', intervalErrorHandler, getTotalInIntervalHandler);

export default router;
