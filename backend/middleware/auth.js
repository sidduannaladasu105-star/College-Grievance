import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { query } from '../config/db.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_development_key_2026';

/**
 * Verifies JWT token and attaches user to request
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token required'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Verify user is still active in the database
    const users = await query('SELECT id, name, email, role, department_id, phone, student_id, is_active FROM users WHERE id = ?', [decoded.id]);
    if (!users || users.length === 0 || !users[0].is_active) {
      return res.status(401).json({
        success: false,
        message: 'User account not found or deactivated'
      });
    }

    req.user = users[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.'
      });
    }
    return res.status(403).json({
      success: false,
      message: 'Invalid or forged authentication token'
    });
  }
};

/**
 * Optional authentication: attaches user if token is provided, proceeds anyway if not
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const users = await query('SELECT id, name, email, role, department_id, phone, student_id, is_active FROM users WHERE id = ?', [decoded.id]);
      if (users && users.length > 0 && users[0].is_active) {
        req.user = users[0];
      }
    }
    next();
  } catch {
    // If token invalid in optionalAuth, just proceed without req.user
    next();
  }
};

/**
 * Restrict endpoint to specific roles
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User not authenticated'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of roles: [${allowedRoles.join(', ')}]`
      });
    }

    next();
  };
};
