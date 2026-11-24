import { query } from '../config/db.js';

/**
 * Records an immutable audit log entry for complaint actions
 */
export const logComplaintAccess = async (complaintId, userId, action, ipAddress = '127.0.0.1') => {
  try {
    await query(
      'INSERT INTO complaint_access_logs (complaint_id, user_id, action, ip_address) VALUES (?, ?, ?, ?)',
      [complaintId, userId || null, action, ipAddress]
    );
  } catch (error) {
    console.error('Failed to write audit log:', error.message);
  }
};

/**
 * Middleware wrapper for automatic access logging
 */
export const auditMiddleware = (actionName) => {
  return (req, res, next) => {
    const originalSend = res.send;
    res.send = function (data) {
      const complaintId = req.params.id || req.body.complaint_id;
      if (complaintId && res.statusCode < 400) {
        const userId = req.user ? req.user.id : null;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        logComplaintAccess(complaintId, userId, actionName, ip);
      }
      return originalSend.apply(res, arguments);
    };
    next();
  };
};
