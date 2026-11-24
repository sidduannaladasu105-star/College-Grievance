import { query, withTransaction } from '../config/db.js';
import { COMPLAINT_STATUS, ROLES } from '../config/constants.js';
import { createNotification, notifyDepartmentStaff } from './notificationService.js';

/**
 * Checks for overdue complaints and automatically escalates them to the Grievance Committee
 */
export const checkAndAutoEscalate = async () => {
  try {
    // Find active complaints where deadline has passed and not yet resolved or escalated
    const overdueComplaints = await query(`
      SELECT c.id, c.reference_id, c.subject, c.department_id, c.status, c.resolution_deadline,
             d.department_name
      FROM complaints c
      JOIN departments d ON c.department_id = d.id
      WHERE c.status NOT IN (?, ?, ?)
        AND c.resolution_deadline IS NOT NULL
        AND c.resolution_deadline < NOW()
    `, [COMPLAINT_STATUS.RESOLVED, COMPLAINT_STATUS.REJECTED, COMPLAINT_STATUS.ESCALATED]);

    if (!overdueComplaints || overdueComplaints.length === 0) {
      return { escalatedCount: 0 };
    }

    let escalatedCount = 0;

    for (const complaint of overdueComplaints) {
      await withTransaction(async (conn) => {
        // 1. Update complaint status to Escalated
        await conn.execute(
          'UPDATE complaints SET status = ?, updated_at = NOW() WHERE id = ?',
          [COMPLAINT_STATUS.ESCALATED, complaint.id]
        );

        // 2. Insert into escalations table
        await conn.execute(`
          INSERT INTO escalations (complaint_id, escalated_by, escalation_reason, escalation_level, previous_status, created_at)
          VALUES (?, NULL, ?, 1, ?, NOW())
        `, [
          complaint.id,
          `Automated Escalation: Resolution deadline (${complaint.resolution_deadline}) exceeded without resolution. Forwarded to University Grievance Committee.`,
          complaint.status
        ]);

        // 3. Insert complaint update history
        await conn.execute(`
          INSERT INTO complaint_updates (complaint_id, updated_by, status, message, is_internal, created_at)
          VALUES (?, NULL, ?, ?, FALSE, NOW())
        `, [
          complaint.id,
          COMPLAINT_STATUS.ESCALATED,
          `Automated system escalation triggered: exceeded resolution SLA. Assigned to University Grievance Committee.`
        ]);
      });

      // 4. Send notifications to Grievance Committee members & Administrators
      const committeeMembers = await query('SELECT id FROM users WHERE role IN (?, ?)', [ROLES.COMMITTEE, ROLES.ADMIN]);
      for (const member of committeeMembers) {
        await createNotification({
          userId: member.id,
          complaintId: complaint.id,
          title: `OVERDUE ESCALATION: ${complaint.reference_id}`,
          message: `Complaint #${complaint.reference_id} (${complaint.subject}) has exceeded its deadline and has been automatically escalated.`
        });
      }

      escalatedCount++;
    }

    console.log(`[Escalation Engine] Auto-escalated ${escalatedCount} overdue complaints.`);
    return { escalatedCount };
  } catch (error) {
    console.error('Error during automatic escalation check:', error.message);
    return { error: error.message };
  }
};

/**
 * Manual escalation triggered by complainant or department staff
 */
export const escalateComplaintManually = async ({ complaintId, userId, reason, previousStatus }) => {
  return await withTransaction(async (conn) => {
    // 1. Update complaint status
    await conn.execute(
      'UPDATE complaints SET status = ?, updated_at = NOW() WHERE id = ?',
      [COMPLAINT_STATUS.ESCALATED, complaintId]
    );

    // 2. Record escalation entry
    await conn.execute(`
      INSERT INTO escalations (complaint_id, escalated_by, escalation_reason, escalation_level, previous_status, created_at)
      VALUES (?, ?, ?, 1, ?, NOW())
    `, [complaintId, userId || null, reason, previousStatus]);

    // 3. Record status update
    await conn.execute(`
      INSERT INTO complaint_updates (complaint_id, updated_by, status, message, is_internal, created_at)
      VALUES (?, ?, ?, ?, FALSE, NOW())
    `, [
      complaintId,
      userId || null,
      COMPLAINT_STATUS.ESCALATED,
      `Escalated to University Grievance Committee: ${reason}`
    ]);

    return true;
  });
};
