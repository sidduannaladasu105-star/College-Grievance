-- SECURE GRIEVANCE MANAGEMENT SYSTEM
-- Relational Database Schema for MySQL 8.0 / MySQL Workbench

CREATE DATABASE IF NOT EXISTS secure_grievance_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE secure_grievance_db;

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    contact_email VARCHAR(150) NULL,
    is_sensitive BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_dept_name (department_name)
) ENGINE=InnoDB;

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'officer', 'admin', 'committee') NOT NULL DEFAULT 'student',
    department_id INT NULL,
    phone VARCHAR(20) NULL,
    student_id VARCHAR(50) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB;

-- 3. Routing Rules Table
CREATE TABLE IF NOT EXISTS routing_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(100) NOT NULL UNIQUE,
    department_id INT NOT NULL,
    default_priority ENUM('Low', 'Medium', 'High', 'Urgent') DEFAULT 'Medium',
    resolution_days INT DEFAULT 7,
    is_sensitive BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reference_id VARCHAR(50) NOT NULL UNIQUE,
    tracking_token VARCHAR(100) NOT NULL,
    user_id INT NULL,
    category VARCHAR(100) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    department_id INT NOT NULL,
    assigned_officer_id INT NULL,
    status ENUM('Submitted', 'Under Review', 'Assigned', 'In Progress', 'Awaiting Information', 'Resolved', 'Rejected', 'Escalated') NOT NULL DEFAULT 'Submitted',
    priority ENUM('Low', 'Medium', 'High', 'Urgent') NOT NULL DEFAULT 'Medium',
    is_sensitive BOOLEAN NOT NULL DEFAULT FALSE,
    rejection_reason TEXT NULL,
    resolution_notes TEXT NULL,
    resolution_deadline DATETIME NULL,
    resolved_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    FOREIGN KEY (assigned_officer_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_reference_id (reference_id),
    INDEX idx_status (status),
    INDEX idx_department (department_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- 5. Complaint Updates & Status History
CREATE TABLE IF NOT EXISTS complaint_updates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT NOT NULL,
    updated_by INT NULL,
    status VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_complaint_updates (complaint_id)
) ENGINE=InnoDB;

-- 6. Complaint Attachments Table
CREATE TABLE IF NOT EXISTS complaint_attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size INT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    INDEX idx_complaint_attachments (complaint_id)
) ENGINE=InnoDB;

-- 7. Escalations Table
CREATE TABLE IF NOT EXISTS escalations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT NOT NULL,
    escalated_by INT NULL,
    escalation_reason TEXT NOT NULL,
    escalation_level INT NOT NULL DEFAULT 1,
    previous_status VARCHAR(50) NULL,
    resolved BOOLEAN DEFAULT FALSE,
    committee_notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    FOREIGN KEY (escalated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_escalations_complaint (complaint_id)
) ENGINE=InnoDB;

-- 8. Complaint Access Logs (Audit Trail)
CREATE TABLE IF NOT EXISTS complaint_access_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT NOT NULL,
    user_id INT NULL,
    ip_address VARCHAR(45) NULL,
    action VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_access_logs_complaint (complaint_id)
) ENGINE=InnoDB;

-- 9. In-App Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    complaint_id INT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    INDEX idx_notifications_user (user_id, is_read)
) ENGINE=InnoDB;
