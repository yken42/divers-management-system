import { Router } from 'express';
import { createDive, getUserDives, getAllDives } from '../controllers/diveController.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/createDive', authenticateToken, createDive);
router.get('/myDives', authenticateToken, getUserDives);
router.get('/all', authenticateToken, requireAdmin, getAllDives);

export default router;