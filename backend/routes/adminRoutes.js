import express from 'express';
import {
  getDashboardStats,
  getDepartments,
  createDepartment,
  updateDepartment,
  getRoutingRules,
  updateRoutingRule,
  getUsers,
  getAuditLogs,
  getReports
} from '../controllers/adminController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// All Admin routes require ADMIN or COMMITTEE role
router.use(authenticateToken, authorizeRoles(ROLES.ADMIN, ROLES.COMMITTEE));

router.get('/dashboard', getDashboardStats);
router.get('/departments', getDepartments);
router.post('/departments', authorizeRoles(ROLES.ADMIN), createDepartment);
router.put('/departments/:id', authorizeRoles(ROLES.ADMIN), updateDepartment);
router.get('/routing-rules', getRoutingRules);
router.post('/routing-rules', authorizeRoles(ROLES.ADMIN), updateRoutingRule);
router.get('/users', getUsers);
router.get('/audit-logs', getAuditLogs);
router.get('/reports', getReports);

export default router;
