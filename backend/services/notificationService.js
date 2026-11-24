import { query } from '../config/db.js';
import { ROLES } from '../config/constants.js';

/**
 * Create an in-app notification for a user
 */
export const createNotification = async ({ userId, complaintId, title, message }) => {
  if (!userId) return null;
  try {
    const result = await query(
      'INSERT INTO notifications (user_id, complaint_id, title, message, is_read, created_at) VALUES (?, ?, ?, ?, FALSE, NOW())',
      [userId, complaintId || null, title, message]
    );
    return result;
  } catch (error) {
    console.error('Failed to create notification:', error.message);
    return null;
  }
};

/**
 * Broadcast notification to all officers in a department and admins
 */
export const notifyDepartmentStaff = async (departmentId, complaintId, title, message) => {
  try {
    const officers = await query(
      'SELECT id FROM users WHERE (department_id = ? AND role = ?) OR role = ?',
      [departmentId, ROLES.OFFICER, ROLES.ADMIN]
    );

    for (const officer of officers) {
      await createNotification({
        userId: officer.id,
        complaintId,
        title,
        message
      });
    }
  } catch (error) {
    console.error('Failed to notify department staff:', error.message);
  }
};

/**
 * Notify all Grievance Committee members
 */
export const notifyCommittee = async (complaintId, title, message) => {
  try {
    const committeeMembers = await query(
      'SELECT id FROM users WHERE role = ? OR role = ?',
      [ROLES.COMMITTEE, ROLES.ADMIN]
    );

    for (const member of committeeMembers) {
      await createNotification({
        userId: member.id,
        complaintId,
        title,
        message
      });
    }
  } catch (error) {
    console.error('Failed to notify committee:', error.message);
  }
};
