// pdfRoutes.js

import express from 'express';
import pdfController from '../controllers/pdfController.js';

const router = express.Router();

router.post('/split', pdfController.splitPdf);

export default router;
