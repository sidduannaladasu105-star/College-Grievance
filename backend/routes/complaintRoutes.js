import express from 'express';
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  trackComplaint,
  updateStatus,
  assignComplaint,
  addUpdate,
  escalateComplaint,
  downloadAttachment
} from '../controllers/complaintController.js';
import { authenticateToken, optionalAuth, authorizeRoles } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { submissionLimiter, trackingLimiter } from '../middleware/rateLimiter.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Complaint Submission (Anonymous doesn't require token, identified attaches req.user)
router.post('/', submissionLimiter, optionalAuth, upload.array('attachments', 5), createComplaint);

// Public Tracking by Reference ID (optional auth to unlock full details if logged-in owner)
router.get('/track/:referenceId', trackingLimiter, optionalAuth, trackComplaint);

// List Complaints (Role Scoped)
router.get('/', authenticateToken, getComplaints);

// Secure Attachment Download
router.get('/attachments/:attachmentId', authenticateToken, downloadAttachment);

// Get Specific Complaint Details
router.get('/:id', authenticateToken, getComplaintById);

// Update Status (Department Officer, Admin, Committee)
router.put('/:id/status', authenticateToken, authorizeRoles(ROLES.OFFICER, ROLES.ADMIN, ROLES.COMMITTEE), updateStatus);

// Assign Department or Officer
router.put('/:id/assign', authenticateToken, authorizeRoles(ROLES.ADMIN, ROLES.COMMITTEE, ROLES.OFFICER), assignComplaint);

// Add Progress Update / Note
router.post('/:id/updates', authenticateToken, addUpdate);

// Escalate Complaint (Student owner, Officer, Admin)
router.post('/:id/escalate', authenticateToken, escalateComplaint);

export default router;
