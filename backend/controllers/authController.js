import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { generateToken } from '../utils/tokens.js';
import { ROLES } from '../config/constants.js';

/**
 * Register a new user (Default: Student)
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, student_id, phone, department_id } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Check existing email
    const existing = await query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert user
    const insertResult = await query(
      `INSERT INTO users (name, email, password_hash, role, department_id, phone, student_id, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, NOW())`,
      [
        name.trim(),
        email.toLowerCase().trim(),
        passwordHash,
        ROLES.STUDENT,
        department_id ? parseInt(department_id, 10) : null,
        phone || null,
        student_id || null
      ]
    );

    const newUserId = insertResult.insertId;

    const userProfile = {
      id: newUserId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: ROLES.STUDENT,
      department_id: department_id || null,
      student_id: student_id || null,
      phone: phone || null
    };

    const token = generateToken(userProfile);

    // Create welcome notification
    await query(
      'INSERT INTO notifications (user_id, title, message, is_read, created_at) VALUES (?, ?, ?, FALSE, NOW())',
      [newUserId, 'Welcome to Grievance Management System', 'Your account has been created successfully. You can now submit and track grievances securely.']
    );

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: userProfile
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
};

/**
 * Login user
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const users = await query(
      `SELECT u.id, u.name, u.email, u.password_hash, u.role, u.department_id, u.phone, u.student_id, u.is_active,
              d.department_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.email = ?`,
      [email.toLowerCase().trim()]
    );

    if (!users || users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is suspended or deactivated. Contact system administrator.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department_id: user.department_id,
      department_name: user.department_name,
      student_id: user.student_id,
      phone: user.phone
    };

    const token = generateToken(userProfile);

    // Fetch unread notifications count
    const [notifCount] = await query(
      'SELECT COUNT(*) as unread FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [user.id]
    );

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userProfile,
      unreadNotifications: notifCount ? notifCount.unread : 0
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

/**
 * User Profile
 */
export const getProfile = async (req, res) => {
  try {
    const users = await query(
      `SELECT u.id, u.name, u.email, u.role, u.department_id, u.phone, u.student_id, u.created_at,
              d.department_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    return res.json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile'
    });
  }
};

/**
 * Change Password
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters'
      });
    }

    const users = await query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    const isMatch = await bcrypt.compare(currentPassword, users[0].password_hash);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?', [newHash, req.user.id]);

    return res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Password change error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

/**
 * Notifications list and mark read
 */
export const getNotifications = async (req, res) => {
  try {
    const notifications = await query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30',
      [req.user.id]
    );

    return res.json({
      success: true,
      notifications
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load notifications' });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === 'all') {
      await query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [req.user.id]);
    } else {
      await query('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [id, req.user.id]);
    }

    return res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
};
