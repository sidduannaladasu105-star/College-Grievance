import express from 'express';
import { 
  register, 
  login, 
  getProfile, 
  changePassword, 
  getNotifications, 
  markNotificationRead 
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', (req, res) => {
  return res.json({ success: true, message: 'Logged out successfully' });
});

router.get('/profile', authenticateToken, getProfile);
router.put('/password', authenticateToken, changePassword);
router.get('/notifications', authenticateToken, getNotifications);
router.put('/notifications/:id', authenticateToken, markNotificationRead);

export default router;
