import { Router } from 'express';
import { createDive, getUserDives, getAllDives, updateDive } from '../controllers/diveController.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/createDive', authenticateToken, createDive);
router.get('/myDives', authenticateToken, getUserDives);
router.get('/all', authenticateToken, requireAdmin, getAllDives);
router.patch('/:id', authenticateToken, requireAdmin, updateDive);

export default router;