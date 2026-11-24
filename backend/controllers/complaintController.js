import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, withTransaction } from '../config/db.js';
import { generateReferenceId, generateTrackingToken } from '../utils/tokens.js';
import { routeComplaint } from '../services/routingService.js';
import { escalateComplaintManually } from '../services/escalationService.js';
import { createNotification, notifyDepartmentStaff, notifyCommittee } from '../services/notificationService.js';
import { logComplaintAccess } from '../middleware/auditLogger.js';
import { ROLES, COMPLAINT_STATUS } from '../config/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '../uploads');

/**
 * Submit a new complaint (Identified or Anonymous)
 */
export const createComplaint = async (req, res) => {
  try {
    const { category, subject, description, anonymous, department_id, priority } = req.body;
    const isAnonymous = anonymous === 'true' || anonymous === true || anonymous === '1';

    if (!category || !subject || !description) {
      return res.status(400).json({
        success: false,
        message: 'Category, subject, and description are required'
      });
    }

    // Determine user_id: strictly null if anonymous, otherwise authenticated user's ID
    const userId = (!isAnonymous && req.user) ? req.user.id : null;

    // Automatic Routing Analysis
    const routingResult = await routeComplaint({
      category,
      subject,
      description,
      requestedDepartmentId: department_id
    });

    const chosenDepartmentId = routingResult.departmentId;
    const chosenPriority = priority || routingResult.priority;
    const isSensitive = routingResult.isSensitive;
    const resolutionDeadline = routingResult.resolutionDeadline;

    // Generate Unique Tracking Credentials
    const referenceId = generateReferenceId();
    const trackingToken = generateTrackingToken();

    // Handle files if uploaded
    const files = req.files || [];

    // Execute atomic creation in transaction
    const complaintRecord = await withTransaction(async (conn) => {
      // 1. Insert Complaint
      const [insertResult] = await conn.execute(`
        INSERT INTO complaints (
          reference_id, tracking_token, user_id, category, subject, description,
          anonymous, department_id, status, priority, is_sensitive,
          resolution_deadline, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        referenceId,
        trackingToken,
        userId,
        category,
        subject.trim(),
        description.trim(),
        isAnonymous,
        chosenDepartmentId,
        COMPLAINT_STATUS.SUBMITTED,
        chosenPriority,
        isSensitive,
        resolutionDeadline
      ]);

      const complaintId = insertResult.insertId;

      // 2. Insert Attachments
      for (const file of files) {
        await conn.execute(`
          INSERT INTO complaint_attachments (complaint_id, file_name, file_path, file_type, file_size, uploaded_at)
          VALUES (?, ?, ?, ?, ?, NOW())
        `, [
          complaintId,
          file.originalname,
          file.filename,
          file.mimetype,
          file.size
        ]);
      }

      // 3. Initial Status Update Entry
      await conn.execute(`
        INSERT INTO complaint_updates (complaint_id, updated_by, status, message, is_internal, created_at)
        VALUES (?, ?, ?, ?, FALSE, NOW())
      `, [
        complaintId,
        userId,
        COMPLAINT_STATUS.SUBMITTED,
        isAnonymous 
          ? 'Complaint received anonymously and registered in secure queue.'
          : 'Complaint successfully registered.'
      ]);

      return {
        id: complaintId,
        referenceId,
        trackingToken,
        departmentId: chosenDepartmentId,
        priority: chosenPriority,
        isSensitive
      };
    });

    // Audit Log
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    await logComplaintAccess(
      complaintRecord.id,
      userId,
      isAnonymous ? 'ANONYMOUS_SUBMISSION' : 'IDENTIFIED_SUBMISSION',
      ip
    );

    // Notifications
    const deptInfo = await query('SELECT department_name FROM departments WHERE id = ?', [chosenDepartmentId]);
    const deptName = deptInfo.length > 0 ? deptInfo[0].department_name : 'Assigned Department';

    if (userId) {
      await createNotification({
        userId,
        complaintId: complaintRecord.id,
        title: `Complaint Submitted: ${referenceId}`,
        message: `Your grievance regarding "${subject}" has been submitted and routed to ${deptName}. Tracking ID: ${referenceId}`
      });
    }

    // Notify Department Staff or Committee
    if (isSensitive) {
      await notifyCommittee(
        complaintRecord.id,
        `HIGH-SENSITIVITY COMPLAINT: ${referenceId}`,
        `A high-sensitivity complaint in category "${category}" has been filed.`
      );
    } else {
      await notifyDepartmentStaff(
        chosenDepartmentId,
        complaintRecord.id,
        `New Complaint: ${referenceId}`,
        `New complaint submitted under ${category}: "${subject}". Priority: ${chosenPriority}.`
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Grievance submitted successfully',
      data: {
        id: complaintRecord.id,
        referenceId: complaintRecord.referenceId,
        trackingToken: complaintRecord.trackingToken,
        anonymous: isAnonymous,
        category,
        subject,
        departmentName: deptName,
        priority: chosenPriority,
        status: COMPLAINT_STATUS.SUBMITTED,
        resolutionDeadline
      }
    });
  } catch (error) {
    console.error('Error creating complaint:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit complaint. ' + error.message
    });
  }
};

/**
 * Get Complaints list (Role Scoped)
 */
export const getComplaints = async (req, res) => {
  try {
    const user = req.user;
    const { status, category, priority, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    let whereConditions = [];
    let params = [];

    // Role-based Access Control
    if (user.role === ROLES.STUDENT) {
      // Students only see their own identified complaints
      whereConditions.push('c.user_id = ?');
      params.push(user.id);
    } else if (user.role === ROLES.OFFICER) {
      // Officers only see complaints assigned to their department (and non-sensitive unless safety dept)
      whereConditions.push('c.department_id = ?');
      params.push(user.department_id);
    } else if (user.role === ROLES.COMMITTEE) {
      // Grievance Committee sees escalated complaints or sensitive complaints
      whereConditions.push('(c.status = ? OR c.is_sensitive = TRUE OR c.department_id = ?)');
      params.push(COMPLAINT_STATUS.ESCALATED, user.department_id || 2);
    } else if (user.role === ROLES.ADMIN) {
      // Admin can view all
    }

    // Filters
    if (status) {
      whereConditions.push('c.status = ?');
      params.push(status);
    }
    if (category) {
      whereConditions.push('c.category = ?');
      params.push(category);
    }
    if (priority) {
      whereConditions.push('c.priority = ?');
      params.push(priority);
    }
    if (search) {
      whereConditions.push('(c.reference_id LIKE ? OR c.subject LIKE ? OR c.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Total Count
    const countSql = `SELECT COUNT(*) as total FROM complaints c ${whereClause}`;
    const [countResult] = await query(countSql, params);
    const total = countResult ? countResult.total : 0;

    // List Query with Joins
    // Redact submitter details if anonymous or if viewed by department officer to maintain confidentiality
    const sql = `
      SELECT 
        c.id, c.reference_id, c.category, c.subject, c.status, c.priority, c.anonymous,
        c.is_sensitive, c.created_at, c.updated_at, c.resolution_deadline, c.resolved_at,
        d.department_name,
        o.name as officer_name,
        CASE 
          WHEN c.anonymous = TRUE THEN 'Anonymous Complainant'
          WHEN ? = 'student' OR ? = 'admin' THEN u.name
          ELSE 'Confidential Student'
        END as submitter_name,
        CASE 
          WHEN c.anonymous = TRUE THEN NULL
          WHEN ? = 'student' OR ? = 'admin' THEN u.email
          ELSE NULL
        END as submitter_email,
        (SELECT COUNT(*) FROM complaint_attachments WHERE complaint_id = c.id) as attachment_count,
        (SELECT COUNT(*) FROM complaint_updates WHERE complaint_id = c.id) as update_count
      FROM complaints c
      JOIN departments d ON c.department_id = d.id
      LEFT JOIN users o ON c.assigned_officer_id = o.id
      LEFT JOIN users u ON c.user_id = u.id
      ${whereClause}
      ORDER BY 
        CASE WHEN c.priority = 'Urgent' THEN 1 WHEN c.priority = 'High' THEN 2 WHEN c.priority = 'Medium' THEN 3 ELSE 4 END,
        c.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const fullParams = [user.role, user.role, user.role, user.role, ...params, parseInt(limit, 10), parseInt(offset, 10)];
    const complaints = await query(sql, fullParams);

    return res.json({
      success: true,
      complaints,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve complaints' });
  }
};

/**
 * Get Complaint Details by ID
 */
export const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const complaints = await query(`
      SELECT c.*, d.department_name, d.contact_email as dept_email,
             o.name as officer_name, o.email as officer_email,
             u.name as submitter_name, u.email as submitter_email, u.student_id as submitter_roll
      FROM complaints c
      JOIN departments d ON c.department_id = d.id
      LEFT JOIN users o ON c.assigned_officer_id = o.id
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [id]);

    if (!complaints || complaints.length === 0) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const complaint = complaints[0];

    // Authorization checks
    if (user.role === ROLES.STUDENT && complaint.user_id !== user.id) {
      return res.status(403).json({ success: false, message: 'Access denied: not your complaint' });
    }
    if (user.role === ROLES.OFFICER && complaint.department_id !== user.department_id) {
      return res.status(403).json({ success: false, message: 'Access denied: not assigned to your department' });
    }

    // Mask identity if anonymous or non-admin officer
    if (complaint.anonymous) {
      complaint.submitter_name = 'Anonymous Complainant';
      complaint.submitter_email = null;
      complaint.submitter_roll = null;
      complaint.user_id = null;
    } else if (user.role === ROLES.OFFICER && complaint.user_id !== user.id) {
      // Hide student email/roll from officer to protect against bias unless admin
      complaint.submitter_email = null;
      complaint.submitter_roll = null;
    }

    // Hide tracking_token from non-owners
    if (user.role !== ROLES.ADMIN && complaint.user_id !== user.id) {
      delete complaint.tracking_token;
    }

    // Fetch updates / timeline
    // If student viewing, omit internal investigation notes
    let updatesQuery = 'SELECT u.*, us.name as updater_name FROM complaint_updates u LEFT JOIN users us ON u.updated_by = us.id WHERE u.complaint_id = ?';
    if (user.role === ROLES.STUDENT) {
      updatesQuery += ' AND u.is_internal = FALSE';
    }
    updatesQuery += ' ORDER BY u.created_at ASC';
    const updates = await query(updatesQuery, [id]);

    // Fetch attachments
    const attachments = await query(
      'SELECT id, file_name, file_type, file_size, uploaded_at FROM complaint_attachments WHERE complaint_id = ?',
      [id]
    );

    // Fetch escalations
    const escalations = await query(`
      SELECT e.*, u.name as escalated_by_name
      FROM escalations e
      LEFT JOIN users u ON e.escalated_by = u.id
      WHERE e.complaint_id = ?
      ORDER BY e.created_at DESC
    `, [id]);

    // Log Access
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    await logComplaintAccess(id, user.id, 'VIEW_COMPLAINT_DETAILS', ip);

    return res.json({
      success: true,
      complaint,
      updates,
      attachments,
      escalations
    });
  } catch (error) {
    console.error('Error fetching complaint details:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve complaint details' });
  }
};

/**
 * Public & Secure Tracking Endpoint
 * GET /api/complaints/track/:referenceId
 * Query: ?token=tk_... (Required for full sensitive details if anonymous)
 */
export const trackComplaint = async (req, res) => {
  try {
    const { referenceId } = req.params;
    const token = req.query.token;
    const authUser = req.user;

    const complaints = await query(`
      SELECT c.id, c.reference_id, c.tracking_token, c.user_id, c.category, c.subject, c.description,
             c.anonymous, c.status, c.priority, c.is_sensitive, c.created_at, c.updated_at,
             c.resolution_deadline, c.resolved_at, c.resolution_notes, c.rejection_reason,
             d.department_name
      FROM complaints c
      JOIN departments d ON c.department_id = d.id
      WHERE c.reference_id = ?
    `, [referenceId]);

    if (!complaints || complaints.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No grievance found with reference ID: ' + referenceId
      });
    }

    const complaint = complaints[0];

    // Determine verification level:
    // Verified if:
    // 1. Valid tracking_token provided matching database record
    // 2. OR authenticated user is the owner or staff
    const isTokenVerified = token && token === complaint.tracking_token;
    const isOwnerVerified = authUser && (authUser.id === complaint.user_id || [ROLES.ADMIN, ROLES.COMMITTEE].includes(authUser.role));
    const isFullAccess = isTokenVerified || isOwnerVerified;

    // Log tracking access
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    await logComplaintAccess(
      complaint.id,
      authUser ? authUser.id : null,
      isFullAccess ? 'VERIFIED_TRACKING' : 'PUBLIC_STATUS_CHECK',
      ip
    );

    // Fetch public updates
    const updates = await query(`
      SELECT status, message, created_at
      FROM complaint_updates
      WHERE complaint_id = ? AND is_internal = FALSE
      ORDER BY created_at ASC
    `, [complaint.id]);

    // If verified with tracking secret or logged-in owner, return full details
    if (isFullAccess) {
      const attachments = await query(
        'SELECT id, file_name, file_type, file_size, uploaded_at FROM complaint_attachments WHERE complaint_id = ?',
        [complaint.id]
      );

      return res.json({
        success: true,
        verified: true,
        complaint: {
          id: complaint.id,
          referenceId: complaint.reference_id,
          category: complaint.category,
          subject: complaint.subject,
          description: complaint.description,
          status: complaint.status,
          priority: complaint.priority,
          departmentName: complaint.department_name,
          anonymous: complaint.anonymous,
          createdAt: complaint.created_at,
          updatedAt: complaint.updated_at,
          resolutionDeadline: complaint.resolution_deadline,
          resolvedAt: complaint.resolved_at,
          resolutionNotes: complaint.resolution_notes,
          rejectionReason: complaint.rejection_reason,
          updates,
          attachments
        }
      });
    }

    // Unverified public check: Safe Sanitized Information Only
    return res.json({
      success: true,
      verified: false,
      message: 'Basic status retrieved. Provide tracking token for full updates and attachments.',
      complaint: {
        referenceId: complaint.reference_id,
        category: complaint.category,
        subject: complaint.subject,
        status: complaint.status,
        departmentName: complaint.is_sensitive ? 'Confidential Committee' : complaint.department_name,
        createdAt: complaint.created_at,
        updatedAt: complaint.updated_at,
        resolutionDeadline: complaint.resolution_deadline,
        resolvedAt: complaint.resolved_at,
        updates
      }
    });
  } catch (error) {
    console.error('Error tracking complaint:', error);
    return res.status(500).json({ success: false, message: 'Tracking lookup failed' });
  }
};

/**
 * Update Complaint Status
 * PUT /api/complaints/:id/status
 */
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message, is_internal, resolution_notes, rejection_reason } = req.body;
    const user = req.user;

    const complaints = await query('SELECT * FROM complaints WHERE id = ?', [id]);
    if (!complaints || complaints.length === 0) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const complaint = complaints[0];

    // Role Permission check
    if (user.role === ROLES.OFFICER && complaint.department_id !== user.department_id) {
      return res.status(403).json({ success: false, message: 'Cannot modify complaints outside your department' });
    }
    if (user.role === ROLES.STUDENT) {
      return res.status(403).json({ success: false, message: 'Students cannot alter complaint workflow status' });
    }

    let resolvedAt = null;
    if (status === COMPLAINT_STATUS.RESOLVED) {
      resolvedAt = new Date();
    }

    await withTransaction(async (conn) => {
      // 1. Update Complaint
      await conn.execute(`
        UPDATE complaints 
        SET status = ?,
            resolution_notes = COALESCE(?, resolution_notes),
            rejection_reason = COALESCE(?, rejection_reason),
            resolved_at = CASE WHEN ? = 'Resolved' THEN NOW() ELSE resolved_at END,
            updated_at = NOW()
        WHERE id = ?
      `, [status, resolution_notes || null, rejection_reason || null, status, id]);

      // 2. Insert Update Timeline
      const updateMessage = message || `Status updated to "${status}".`;
      await conn.execute(`
        INSERT INTO complaint_updates (complaint_id, updated_by, status, message, is_internal, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
      `, [id, user.id, status, updateMessage, is_internal === true || is_internal === 'true']);
    });

    // Notify Complainant if identified
    if (complaint.user_id && is_internal !== true && is_internal !== 'true') {
      await createNotification({
        userId: complaint.user_id,
        complaintId: id,
        title: `Status Update: ${complaint.reference_id}`,
        message: `Your complaint is now "${status}". Update note: ${message || 'No additional note provided.'}`
      });
    }

    // Log Action
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    await logComplaintAccess(id, user.id, `UPDATE_STATUS_${status.toUpperCase()}`, ip);

    return res.json({
      success: true,
      message: `Complaint status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating status:', error);
    return res.status(500).json({ success: false, message: 'Failed to update complaint status' });
  }
};

/**
 * Assign Department or Officer
 * PUT /api/complaints/:id/assign
 */
export const assignComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { department_id, assigned_officer_id, note } = req.body;
    const user = req.user;

    if (![ROLES.ADMIN, ROLES.COMMITTEE, ROLES.OFFICER].includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Unauthorized to assign complaints' });
    }

    const complaints = await query('SELECT * FROM complaints WHERE id = ?', [id]);
    if (!complaints || complaints.length === 0) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    await withTransaction(async (conn) => {
      await conn.execute(`
        UPDATE complaints 
        SET department_id = COALESCE(?, department_id),
            assigned_officer_id = ?,
            status = CASE WHEN status = 'Submitted' THEN 'Assigned' ELSE status END,
            updated_at = NOW()
        WHERE id = ?
      `, [department_id || null, assigned_officer_id || null, id]);

      await conn.execute(`
        INSERT INTO complaint_updates (complaint_id, updated_by, status, message, is_internal, created_at)
        VALUES (?, ?, 'Assigned', ?, FALSE, NOW())
      `, [id, user.id, note || 'Complaint assignment updated by administration.']);
    });

    if (assigned_officer_id) {
      await createNotification({
        userId: assigned_officer_id,
        complaintId: id,
        title: `Case Assigned: ${complaints[0].reference_id}`,
        message: `You have been assigned to handle complaint ${complaints[0].reference_id} (${complaints[0].subject}).`
      });
    }

    return res.json({ success: true, message: 'Complaint assigned successfully' });
  } catch (error) {
    console.error('Error assigning complaint:', error);
    return res.status(500).json({ success: false, message: 'Failed to assign complaint' });
  }
};

/**
 * Add Progress Update / Note
 * POST /api/complaints/:id/updates
 */
export const addUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, is_internal } = req.body;
    const user = req.user;

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const complaints = await query('SELECT * FROM complaints WHERE id = ?', [id]);
    if (!complaints || complaints.length === 0) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const complaint = complaints[0];

    await query(`
      INSERT INTO complaint_updates (complaint_id, updated_by, status, message, is_internal, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [id, user.id, complaint.status, message.trim(), is_internal === true || is_internal === 'true']);

    // Notify complainant if identified and not internal
    if (complaint.user_id && is_internal !== true && is_internal !== 'true' && user.id !== complaint.user_id) {
      await createNotification({
        userId: complaint.user_id,
        complaintId: id,
        title: `Officer Update on ${complaint.reference_id}`,
        message: `An officer added an update: "${message.trim().substring(0, 80)}..."`
      });
    }

    return res.json({ success: true, message: 'Update note added successfully' });
  } catch (error) {
    console.error('Error adding update:', error);
    return res.status(500).json({ success: false, message: 'Failed to add update' });
  }
};

/**
 * Escalate Complaint
 * POST /api/complaints/:id/escalate
 */
export const escalateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const user = req.user;

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'A clear, detailed reason for escalation is required (min 10 characters)'
      });
    }

    const complaints = await query('SELECT * FROM complaints WHERE id = ?', [id]);
    if (!complaints || complaints.length === 0) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const complaint = complaints[0];

    // Complainant, department officer, or admin can escalate
    if (user.role === ROLES.STUDENT && complaint.user_id !== user.id) {
      return res.status(403).json({ success: false, message: 'You are not authorized to escalate this complaint' });
    }

    if (complaint.status === COMPLAINT_STATUS.ESCALATED) {
      return res.status(400).json({ success: false, message: 'Complaint is already in escalated status' });
    }

    await escalateComplaintManually({
      complaintId: id,
      userId: user.id,
      reason: reason.trim(),
      previousStatus: complaint.status
    });

    // Notify committee members
    await notifyCommittee(
      id,
      `MANUAL ESCALATION: ${complaint.reference_id}`,
      `Complaint escalated by ${user.name} (${user.role}). Reason: ${reason.trim()}`
    );

    // Log Action
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    await logComplaintAccess(id, user.id, 'MANUAL_ESCALATION', ip);

    return res.json({
      success: true,
      message: 'Complaint has been escalated to the University Grievance Committee'
    });
  } catch (error) {
    console.error('Error escalating complaint:', error);
    return res.status(500).json({ success: false, message: 'Failed to escalate complaint' });
  }
};

/**
 * Secure Attachment Download
 * GET /api/complaints/attachments/:attachmentId
 */
export const downloadAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.params;
    const user = req.user;

    const attachments = await query(`
      SELECT a.*, c.user_id, c.department_id, c.is_sensitive, c.anonymous
      FROM complaint_attachments a
      JOIN complaints c ON a.complaint_id = c.id
      WHERE a.id = ?
    `, [attachmentId]);

    if (!attachments || attachments.length === 0) {
      return res.status(404).json({ success: false, message: 'Attachment not found' });
    }

    const att = attachments[0];

    // Authorization
    if (user.role === ROLES.STUDENT && att.user_id !== user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (user.role === ROLES.OFFICER && att.department_id !== user.department_id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const filePath = path.join(uploadDir, att.file_path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Physical file missing from server' });
    }

    res.setHeader('Content-Type', att.file_type);
    res.setHeader('Content-Disposition', `inline; filename="${att.file_name.replace(/"/g, '')}"`);
    return fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error('Error downloading attachment:', error);
    return res.status(500).json({ success: false, message: 'Download failed' });
  }
};
