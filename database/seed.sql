-- SECURE GRIEVANCE MANAGEMENT SYSTEM
-- Initial Seed Data (Safe Development Seeds)
-- Default Seed Password for all accounts: Password@123
-- Hash: $2a$10$OCP.aPzxmxH6CmwNxtxB9ebxrVMipY4vbXHqelOiX71Oy5nNhb5vC

USE secure_grievance_db;

-- 1. Seed Departments
INSERT INTO departments (id, department_name, description, contact_email, is_sensitive) VALUES
(1, 'Academic Affairs', 'Curriculum, lectures, attendance disputes, exam schedules, and grading issues.', 'academics@university.edu', FALSE),
(2, 'Student Grievance Committee', 'Faculty-student disputes, code of conduct, and disciplinary mediation.', 'grievance.committee@university.edu', FALSE),
(3, 'Hostel Administration', 'Hostel accommodation, room maintenance, hygiene, warden assistance, and curfew concerns.', 'hostel.admin@university.edu', FALSE),
(4, 'Mess Management Committee', 'Food hygiene, meal quality, cafeteria pricing, and dietary complaints.', 'mess.committee@university.edu', FALSE),
(5, 'Maintenance Department', 'Campus electrical, plumbing, civil repairs, IT lab hardware, and infrastructure maintenance.', 'maintenance@university.edu', FALSE),
(6, 'Women Safety & Anti-Harassment Cell', 'Sexual harassment, bullying, ragging, student safety, and emergency interventions. Highly confidential.', 'safety.cell@university.edu', TRUE),
(7, 'Administrative Services', 'Tuition payments, scholarships, transcripts, bus transport, library, and registrar affairs.', 'admin.office@university.edu', FALSE),
(8, 'General Institutional Affairs', 'Policy inquiries, campus environment, and miscellaneous grievances.', 'registrar@university.edu', FALSE)
ON DUPLICATE KEY UPDATE department_name = VALUES(department_name);

-- 2. Seed Routing Rules
INSERT INTO routing_rules (id, category, department_id, default_priority, resolution_days, is_sensitive) VALUES
(1, 'Teaching & Academic Issues', 1, 'Medium', 7, FALSE),
(2, 'Faculty Interaction & Behavior', 2, 'High', 5, FALSE),
(3, 'Hostel Facilities', 3, 'Medium', 4, FALSE),
(4, 'Mess & Food Quality', 4, 'High', 3, FALSE),
(5, 'Infrastructure & Maintenance', 5, 'Low', 5, FALSE),
(6, 'Student Safety & Harassment', 6, 'Urgent', 2, TRUE),
(7, 'Administrative Services', 7, 'Medium', 7, FALSE),
(8, 'Other Institutional Concerns', 8, 'Low', 10, FALSE)
ON DUPLICATE KEY UPDATE department_id = VALUES(department_id), default_priority = VALUES(default_priority);

-- 3. Seed Users
-- Password for all users is: Password@123
INSERT INTO users (id, name, email, password_hash, role, department_id, phone, student_id) VALUES
(1, 'System Administrator', 'admin@university.edu', '$2a$10$OCP.aPzxmxH6CmwNxtxB9ebxrVMipY4vbXHqelOiX71Oy5nNhb5vC', 'admin', NULL, '+1-555-0100', 'ADM-001'),
(2, 'Dr. Sarah Jenkins (Academics)', 'officer.academics@university.edu', '$2a$10$OCP.aPzxmxH6CmwNxtxB9ebxrVMipY4vbXHqelOiX71Oy5nNhb5vC', 'officer', 1, '+1-555-0101', 'FAC-101'),
(3, 'Prof. Robert Davis (Hostels)', 'officer.hostel@university.edu', '$2a$10$OCP.aPzxmxH6CmwNxtxB9ebxrVMipY4vbXHqelOiX71Oy5nNhb5vC', 'officer', 3, '+1-555-0102', 'FAC-102'),
(4, 'Mr. James Miller (Maintenance)', 'officer.maintenance@university.edu', '$2a$10$OCP.aPzxmxH6CmwNxtxB9ebxrVMipY4vbXHqelOiX71Oy5nNhb5vC', 'officer', 5, '+1-555-0103', 'FAC-103'),
(5, 'Dr. Elena Rostova (Committee Chair)', 'committee.chair@university.edu', '$2a$10$OCP.aPzxmxH6CmwNxtxB9ebxrVMipY4vbXHqelOiX71Oy5nNhb5vC', 'committee', 2, '+1-555-0104', 'COM-201'),
(6, 'Dr. Maya Patel (Safety Officer)', 'officer.safety@university.edu', '$2a$10$OCP.aPzxmxH6CmwNxtxB9ebxrVMipY4vbXHqelOiX71Oy5nNhb5vC', 'committee', 6, '+1-555-0105', 'COM-202'),
(7, 'Alex Rivera (Student)', 'alex.student@university.edu', '$2a$10$OCP.aPzxmxH6CmwNxtxB9ebxrVMipY4vbXHqelOiX71Oy5nNhb5vC', 'student', NULL, '+1-555-0106', 'STU-2026-4401'),
(8, 'Samantha Reed (Student)', 'samantha.student@university.edu', '$2a$10$OCP.aPzxmxH6CmwNxtxB9ebxrVMipY4vbXHqelOiX71Oy5nNhb5vC', 'student', NULL, '+1-555-0107', 'STU-2026-4402')
ON DUPLICATE KEY UPDATE name = VALUES(name), role = VALUES(role);

-- 4. Seed Realistic Initial Complaints
INSERT INTO complaints (id, reference_id, tracking_token, user_id, category, subject, description, anonymous, department_id, assigned_officer_id, status, priority, is_sensitive, resolution_deadline, created_at) VALUES
(1, 'GRV-2026-A8K92X', 'tk_9f7c3b2a1e8d4f0b', 7, 'Teaching & Academic Issues', 'Continuous delay in publishing Computer Networks grades', 'The midterm exam results for CS301 Computer Networks have not been uploaded even after 4 weeks. This is affecting course withdrawal decisions.', FALSE, 1, 2, 'In Progress', 'Medium', FALSE, DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY)),

(2, 'GRV-2026-M4P10Q', 'tk_1a2b3c4d5e6f7a8b', NULL, 'Mess & Food Quality', 'Substandard food hygiene in North Dining Hall', 'Discovered expired dairy packets and unwashed greens served during dinner on Friday. Request immediate health inspection.', TRUE, 4, NULL, 'Under Review', 'High', FALSE, DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),

(3, 'GRV-2026-H7X49L', 'tk_5d6e7f8a9b0c1d2e', 7, 'Hostel Facilities', 'Frequent water shortage on 3rd floor Block C', 'Water supply cuts out between 7 AM and 9 AM daily, causing extreme hardship for students preparing for morning lab sessions.', FALSE, 3, 3, 'Resolved', 'Medium', FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY)),

(4, 'GRV-2026-S9W83Z', 'tk_8c7b6a5e4d3c2b1a', 8, 'Student Safety & Harassment', 'Severe ragging and harassment near Gymnasium block after 9 PM', 'A group of seniors have been intimidating first-year residents returning from library hours. Immediate intervention and increased security guard patrol required.', FALSE, 6, 6, 'Escalated', 'Urgent', TRUE, DATE_SUB(NOW(), INTERVAL 12 HOUR), DATE_SUB(NOW(), INTERVAL 3 DAY)),

(5, 'GRV-2026-I2N65Y', 'tk_3e4f5a6b7c8d9e0f', NULL, 'Infrastructure & Maintenance', 'Broken projector and power sockets in Auditorium Room 204', 'HDMI input cable is torn and 3 wall sockets are sparking. Safety hazard for students attending guest lectures.', TRUE, 5, 4, 'Assigned', 'Low', FALSE, DATE_ADD(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY))
ON DUPLICATE KEY UPDATE reference_id = VALUES(reference_id);

-- Set resolved details for complaint 3
UPDATE complaints 
SET resolved_at = DATE_SUB(NOW(), INTERVAL 1 DAY),
    resolution_notes = 'Main pump booster valve was replaced on Block C overhead tank. Water pressure tested and restored to regular 24/7 cycle.'
WHERE id = 3;

-- 5. Seed Complaint Updates
INSERT INTO complaint_updates (complaint_id, updated_by, status, message, is_internal, created_at) VALUES
(1, 2, 'Under Review', 'Complaint received. Reaching out to CS Department chair for grading submission log.', FALSE, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(1, 2, 'In Progress', 'Faculty member was on sanctioned medical leave. Evaluation verified and grades will be posted by Wednesday noon.', FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 1, 'Under Review', 'Auto-routed to Mess Committee. Food inspection supervisor notified for surprise hygiene audit.', FALSE, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 3, 'Assigned', 'Assigned to Facility Plumber unit for pressure testing.', FALSE, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(3, 3, 'In Progress', 'Faulty pressure regulator identified on overhead manifold.', FALSE, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(3, 3, 'Resolved', 'Main pump booster valve was replaced on Block C overhead tank. Water pressure tested and restored to regular 24/7 cycle.', FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(4, 6, 'Under Review', 'Confidential safety case opened by Anti-Harassment cell.', TRUE, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(4, 6, 'Escalated', 'Deadline elapsed and serious disciplinary action required. Transferred to Grievance Committee for hearing.', FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(5, 1, 'Assigned', 'Assigned to IT & Electrical Maintenance.', FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- 6. Seed Escalation for Complaint 4
INSERT INTO escalations (complaint_id, escalated_by, escalation_reason, escalation_level, previous_status, resolved, committee_notes, created_at) VALUES
(4, 6, 'Safety threat severity requires formal disciplinary committee hearing and campus security involvement.', 1, 'In Progress', FALSE, 'Scheduled formal hearing with security footage review on Thursday 10:00 AM.', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- 7. Seed Access Logs
INSERT INTO complaint_access_logs (complaint_id, user_id, ip_address, action, timestamp) VALUES
(1, 7, '127.0.0.1', 'SUBMIT_COMPLAINT', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(1, 2, '127.0.0.1', 'VIEW_COMPLAINT', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(2, NULL, '127.0.0.1', 'ANONYMOUS_SUBMIT', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 7, '127.0.0.1', 'SUBMIT_COMPLAINT', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(3, 3, '127.0.0.1', 'RESOLVE_COMPLAINT', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(4, 8, '127.0.0.1', 'SUBMIT_COMPLAINT', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(4, 6, '127.0.0.1', 'ESCALATE_COMPLAINT', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- 8. Seed Notifications
INSERT INTO notifications (user_id, complaint_id, title, message, is_read, created_at) VALUES
(7, 1, 'Complaint Update: GRV-2026-A8K92X', 'Your complaint status has been updated to In Progress.', FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(7, 3, 'Complaint Resolved: GRV-2026-H7X49L', 'Hostel Administration has resolved your complaint regarding Block C water shortage.', TRUE, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(8, 4, 'Case Escalated: GRV-2026-S9W83Z', 'Your safety complaint has been escalated directly to the University Grievance Committee.', FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(5, 4, 'URGENT: Escalated Complaint Alert', 'A serious safety complaint (GRV-2026-S9W83Z) has been escalated to the Grievance Committee.', FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY));
