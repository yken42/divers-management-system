import { Router } from 'express';
import { createDive, getUserDives } from '../controllers/diveController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/createDive', authenticateToken, createDive);
router.get('/myDives', authenticateToken, getUserDives);

export default router;