import { query } from '../config/db.js';
import { SENSITIVE_KEYWORDS, PRIORITY } from '../config/constants.js';

/**
 * Intelligent Automatic Complaint Routing Engine
 * Maps category and content to appropriate authorized department and computes deadline
 */
export const routeComplaint = async ({ category, subject, description, requestedDepartmentId }) => {
  const combinedText = `${subject} ${description}`.toLowerCase();

  // Check for sensitive or high-risk keywords (Harassment, safety threats, abuse)
  const containsSensitiveKeyword = SENSITIVE_KEYWORDS.some(word => combinedText.includes(word));
  
  // Look up routing rule from the database
  const rules = await query('SELECT * FROM routing_rules WHERE category = ?', [category]);
  let routingRule = rules && rules.length > 0 ? rules[0] : null;

  let departmentId = requestedDepartmentId ? parseInt(requestedDepartmentId, 10) : null;
  let priority = PRIORITY.MEDIUM;
  let resolutionDays = 7;
  let isSensitive = false;

  if (containsSensitiveKeyword || category.includes('Safety') || category.includes('Harassment')) {
    isSensitive = true;
    priority = PRIORITY.URGENT;
    resolutionDays = 2;

    // Route directly to Women's Safety & Anti-Harassment Cell (Dept ID 6) or Student Grievance Committee (Dept ID 2)
    const safetyDept = await query('SELECT id FROM departments WHERE is_sensitive = TRUE LIMIT 1');
    departmentId = safetyDept.length > 0 ? safetyDept[0].id : 6;
  } else if (routingRule) {
    if (!departmentId) {
      departmentId = routingRule.department_id;
    }
    priority = routingRule.default_priority || PRIORITY.MEDIUM;
    resolutionDays = routingRule.resolution_days || 7;
    isSensitive = routingRule.is_sensitive === 1 || routingRule.is_sensitive === true;
  } else {
    // Default fallback to General Institutional Affairs (Dept ID 8)
    if (!departmentId) {
      const generalDept = await query("SELECT id FROM departments WHERE department_name LIKE '%General%' LIMIT 1");
      departmentId = generalDept.length > 0 ? generalDept[0].id : 8;
    }
    priority = PRIORITY.MEDIUM;
    resolutionDays = 7;
  }

  // Calculate resolution deadline
  const deadlineDate = new Date();
  deadlineDate.setDate(deadlineDate.getDate() + resolutionDays);

  return {
    departmentId,
    priority,
    isSensitive,
    resolutionDays,
    resolutionDeadline: deadlineDate
  };
};
