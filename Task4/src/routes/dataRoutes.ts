
import express from 'express';
import { getProcessedDataHandler } from '../controllers/dataController';

const router = express.Router();

router.get('/', getProcessedDataHandler);

export default router;
