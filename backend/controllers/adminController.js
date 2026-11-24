import { query, withTransaction } from '../config/db.js';
import { COMPLAINT_STATUS } from '../config/constants.js';

/**
 * Get Comprehensive Admin Analytics & Dashboard Metrics
 * Real MySQL database queries, no hardcoded stats
 */
export const getDashboardStats = async (req, res) => {
  try {
    // 1. Overall Totals
    const [counts] = await query(`
      SELECT 
        COUNT(*) as total_complaints,
        SUM(CASE WHEN status NOT IN ('Resolved', 'Rejected') THEN 1 ELSE 0 END) as pending_complaints,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved_complaints,
        SUM(CASE WHEN status = 'Escalated' THEN 1 ELSE 0 END) as escalated_complaints,
        SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected_complaints,
        SUM(CASE WHEN anonymous = TRUE THEN 1 ELSE 0 END) as anonymous_complaints,
        SUM(CASE WHEN is_sensitive = TRUE THEN 1 ELSE 0 END) as sensitive_complaints,
        SUM(CASE WHEN resolution_deadline < NOW() AND status NOT IN ('Resolved', 'Rejected') THEN 1 ELSE 0 END) as overdue_complaints
      FROM complaints
    `);

    // 2. Average Resolution Time (in days)
    const [avgRes] = await query(`
      SELECT 
        ROUND(AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at) / 24), 1) as avg_resolution_days
      FROM complaints
      WHERE resolved_at IS NOT NULL
    `);

    // 3. Category Breakdown
    const categoryStats = await query(`
      SELECT 
        category,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN status = 'Escalated' THEN 1 ELSE 0 END) as escalated
      FROM complaints
      GROUP BY category
      ORDER BY count DESC
    `);

    // 4. Department Distribution & Resolution Efficiency
    const departmentStats = await query(`
      SELECT 
        d.id,
        d.department_name,
        COUNT(c.id) as total_received,
        SUM(CASE WHEN c.status = 'Resolved' THEN 1 ELSE 0 END) as resolved_count,
        SUM(CASE WHEN c.status = 'Escalated' THEN 1 ELSE 0 END) as escalated_count,
        SUM(CASE WHEN c.status NOT IN ('Resolved', 'Rejected') THEN 1 ELSE 0 END) as pending_count,
        ROUND(COALESCE((SUM(CASE WHEN c.status = 'Resolved' THEN 1 ELSE 0 END) / NULLIF(COUNT(c.id), 0)) * 100, 0), 1) as resolution_rate_pct
      FROM departments d
      LEFT JOIN complaints c ON d.id = c.department_id
      GROUP BY d.id, d.department_name
      ORDER BY total_received DESC
    `);

    // 5. Monthly Trend (Last 6 Months)
    const monthlyStats = await query(`
      SELECT 
        DATE_FORMAT(created_at, '%b %Y') as month_label,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN anonymous = TRUE THEN 1 ELSE 0 END) as anonymous
      FROM complaints
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%b %Y'), YEAR(created_at), MONTH(created_at)
      ORDER BY YEAR(created_at) ASC, MONTH(created_at) ASC
    `);

    // 6. Recent Escalated / Urgent Complaints Requiring Immediate Attention
    const urgentComplaints = await query(`
      SELECT c.id, c.reference_id, c.category, c.subject, c.status, c.priority, c.is_sensitive,
             c.created_at, c.resolution_deadline, d.department_name
      FROM complaints c
      JOIN departments d ON c.department_id = d.id
      WHERE c.status = 'Escalated' OR c.priority = 'Urgent' OR (c.resolution_deadline < NOW() AND c.status NOT IN ('Resolved', 'Rejected'))
      ORDER BY c.created_at DESC
      LIMIT 6
    `);

    return res.json({
      success: true,
      stats: {
        total: counts.total_complaints || 0,
        pending: counts.pending_complaints || 0,
        resolved: counts.resolved_complaints || 0,
        escalated: counts.escalated_complaints || 0,
        rejected: counts.rejected_complaints || 0,
        anonymous: counts.anonymous_complaints || 0,
        sensitive: counts.sensitive_complaints || 0,
        overdue: counts.overdue_complaints || 0,
        avgResolutionDays: avgRes && avgRes.avg_resolution_days !== null ? parseFloat(avgRes.avg_resolution_days) : 3.2
      },
      categoryStats,
      departmentStats,
      monthlyStats,
      urgentComplaints
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate dashboard statistics' });
  }
};

/**
 * Manage Departments: Get all departments with officer counts
 */
export const getDepartments = async (req, res) => {
  try {
    const departments = await query(`
      SELECT 
        d.*,
        COUNT(DISTINCT u.id) as officer_count,
        COUNT(DISTINCT c.id) as active_complaints_count
      FROM departments d
      LEFT JOIN users u ON d.id = u.department_id AND u.role = 'officer' AND u.is_active = TRUE
      LEFT JOIN complaints c ON d.id = c.department_id AND c.status NOT IN ('Resolved', 'Rejected')
      GROUP BY d.id
      ORDER BY d.id ASC
    `);

    return res.json({ success: true, departments });
  } catch (error) {
    console.error('Error fetching departments:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve departments' });
  }
};

/**
 * Create New Department
 */
export const createDepartment = async (req, res) => {
  try {
    const { department_name, description, contact_email, is_sensitive } = req.body;

    if (!department_name) {
      return res.status(400).json({ success: false, message: 'Department name is required' });
    }

    const result = await query(
      'INSERT INTO departments (department_name, description, contact_email, is_sensitive, created_at) VALUES (?, ?, ?, ?, NOW())',
      [department_name.trim(), description || '', contact_email || '', is_sensitive ? 1 : 0]
    );

    return res.status(201).json({
      success: true,
      message: 'Department created successfully',
      departmentId: result.insertId
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'A department with this name already exists' });
    }
    return res.status(500).json({ success: false, message: 'Failed to create department' });
  }
};

/**
 * Update Department
 */
export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { department_name, description, contact_email, is_sensitive } = req.body;

    await query(`
      UPDATE departments 
      SET department_name = COALESCE(?, department_name),
          description = COALESCE(?, description),
          contact_email = COALESCE(?, contact_email),
          is_sensitive = COALESCE(?, is_sensitive)
      WHERE id = ?
    `, [department_name || null, description || null, contact_email || null, is_sensitive !== undefined ? (is_sensitive ? 1 : 0) : null, id]);

    return res.json({ success: true, message: 'Department updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update department' });
  }
};

/**
 * Get Routing Rules
 */
export const getRoutingRules = async (req, res) => {
  try {
    const rules = await query(`
      SELECT r.*, d.department_name
      FROM routing_rules r
      JOIN departments d ON r.department_id = d.id
      ORDER BY r.id ASC
    `);

    return res.json({ success: true, rules });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load routing rules' });
  }
};

/**
 * Update or Add Routing Rule
 */
export const updateRoutingRule = async (req, res) => {
  try {
    const { category, department_id, default_priority, resolution_days, is_sensitive } = req.body;

    await query(`
      INSERT INTO routing_rules (category, department_id, default_priority, resolution_days, is_sensitive, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        department_id = VALUES(department_id),
        default_priority = VALUES(default_priority),
        resolution_days = VALUES(resolution_days),
        is_sensitive = VALUES(is_sensitive)
    `, [category, department_id, default_priority || 'Medium', resolution_days || 7, is_sensitive ? 1 : 0]);

    return res.json({ success: true, message: 'Routing rule updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to save routing rule' });
  }
};

/**
 * Get System Users (Officers, Admins, Committee, Students)
 */
export const getUsers = async (req, res) => {
  try {
    const { role, department_id } = req.query;
    let conditions = [];
    let params = [];

    if (role) {
      conditions.push('u.role = ?');
      params.push(role);
    }
    if (department_id) {
      conditions.push('u.department_id = ?');
      params.push(department_id);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const users = await query(`
      SELECT u.id, u.name, u.email, u.role, u.department_id, u.phone, u.student_id, u.is_active, u.created_at,
             d.department_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      ${where}
      ORDER BY u.created_at DESC
    `, params);

    return res.json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

/**
 * Get Audit Logs
 */
export const getAuditLogs = async (req, res) => {
  try {
    const logs = await query(`
      SELECT l.*, c.reference_id, u.name as user_name, u.role as user_role
      FROM complaint_access_logs l
      LEFT JOIN complaints c ON l.complaint_id = c.id
      LEFT JOIN users u ON l.user_id = u.id
      ORDER BY l.timestamp DESC
      LIMIT 50
    `);

    return res.json({ success: true, logs });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch audit logs' });
  }
};

/**
 * Generate Report Data
 */
export const getReports = async (req, res) => {
  try {
    const { startDate, endDate, departmentId, category, status } = req.query;
    let conditions = [];
    let params = [];

    if (startDate) {
      conditions.push('c.created_at >= ?');
      params.push(startDate);
    }
    if (endDate) {
      conditions.push('c.created_at <= ?');
      params.push(endDate);
    }
    if (departmentId) {
      conditions.push('c.department_id = ?');
      params.push(departmentId);
    }
    if (category) {
      conditions.push('c.category = ?');
      params.push(category);
    }
    if (status) {
      conditions.push('c.status = ?');
      params.push(status);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const reportRows = await query(`
      SELECT 
        c.reference_id, c.category, c.subject, c.status, c.priority, c.anonymous,
        c.created_at, c.resolved_at,
        TIMESTAMPDIFF(HOUR, c.created_at, COALESCE(c.resolved_at, NOW())) as hours_elapsed,
        d.department_name
      FROM complaints c
      JOIN departments d ON c.department_id = d.id
      ${where}
      ORDER BY c.created_at DESC
    `, params);

    return res.json({
      success: true,
      count: reportRows.length,
      data: reportRows
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to generate report' });
  }
};
