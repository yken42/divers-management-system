import { Router } from 'express';
import { createUser, login } from '../controllers/userController.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/signup', createUser);
router.post('/login', login);
router.get('/protected', authenticateToken, (req ,res) => {
    try {
        return res.status(200).json({ message: "You are authenticated"});
    } catch (error) {
        return res.status(500).json({ message: "Internal server error"});
    }
})

export default router;