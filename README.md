# SECURE GRIEVANCE MANAGEMENT SYSTEM (SGMS)
### Enterprise-Grade Online Grievance Redressal & Committee Escalation Platform for Universities

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3.4-38BDF8.svg)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)
[![Security](https://img.shields.io/badge/Security-JWT%20%7C%20bcrypt%20%7C%20RBAC%20%7C%20Audit-red.svg)]()

---

## 1. Project Objective & Architecture

The **Secure Grievance Management System (SGMS)** is a comprehensive full-stack institutional platform designed to receive, categorize, automatically route, investigate, resolve, and escalate grievances for students and faculty.

The platform provides end-to-end anonymity guarantees, tamper-evident audit trails, intelligent category-to-department routing, SLA resolution deadline monitoring, in-app notification dispatch, and hierarchical committee escalations.

### Technology Stack:
- **Frontend**: React.js 18, Vite, Tailwind CSS, Lucide React Icons, Responsive UI/UX (Navy Blue `#0F172A`/`#1E3A8A`, White, Light Blue `#38BDF8`).
- **Backend**: Node.js, Express.js (ES Modules), REST API architecture, JWT authentication (`jsonwebtoken`), password hashing (`bcryptjs`), rate limiting (`express-rate-limit`), secure file uploads (`multer`), security headers (`helmet`), CORS.
- **Database**: MySQL 8.0 (MySQL Workbench compatible relational schema with InnoDB engine, foreign keys, indexes, transactions, and parameterized SQL queries).

---

## 2. Directory Structure

```
grievance-management-system/
├── backend/
│   ├── config/
│   │   ├── constants.js          # Roles, categories, statuses, sensitive keywords
│   │   └── db.js                 # mysql2/promise connection pool & transaction helper
│   ├── controllers/
│   │   ├── adminController.js    # Global analytics, departments, audit logs, reports
│   │   ├── authController.js     # Register, login, profile, change password, notifications
│   │   └── complaintController.js# Submit, list, track, status update, assign, escalate
│   ├── middleware/
│   │   ├── auditLogger.js        # Immutable access logging to complaint_access_logs
│   │   ├── auth.js               # JWT verification & role authorization (RBAC)
│   │   ├── rateLimiter.js        # Brute-force & spam request rate limits
│   │   └── upload.js             # Multer secure attachment upload handling
│   ├── routes/
│   │   ├── adminRoutes.js        # Admin & Committee endpoints
│   │   ├── authRoutes.js         # Authentication endpoints
│   │   └── complaintRoutes.js    # Grievance processing endpoints
│   ├── services/
│   │   ├── escalationService.js  # Overdue SLA checks & committee escalation engine
│   │   ├── notificationService.js# In-app notifications & broadcast
│   │   └── routingService.js     # Intelligent auto-routing & sensitivity analysis
│   ├── uploads/                  # Secure file attachments store
│   ├── .env                      # Local environment configuration
│   ├── package.json              # Backend dependencies
│   ├── server.js                 # Express server & cron scheduler entry point
│   └── test-suite.js             # Automated end-to-end integration test runner
├── database/
│   ├── schema.sql                # Complete relational schema (9 tables, indexes, FKs)
│   └── seed.sql                  # Initial seed data, departments, routing rules & users
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── EscalateModal.jsx       # Committee escalation modal dialog
│   │   │   ├── Navbar.jsx              # Header, branding, notifications bell, user menu
│   │   │   ├── PriorityBadge.jsx       # Priority pill indicators (Low, Med, High, Urgent)
│   │   │   ├── Sidebar.jsx             # Role-scoped left navigation drawer
│   │   │   ├── StatCard.jsx            # Metric summary KPI cards
│   │   │   ├── StatusBadge.jsx         # Status pill badges (all 8 states)
│   │   │   └── StatusUpdateModal.jsx   # Officer status update & notes dialog
│   │   ├── context/
│   │   │   └── AuthContext.jsx         # Global user state, JWT tokens, notifications
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx          # Institutional analytics & SLA charts
│   │   │   ├── CommitteeDashboard.jsx      # Hearing docket for escalations & safety
│   │   │   ├── ComplaintDetailsPage.jsx    # Complete dossier & timeline view
│   │   │   ├── DepartmentManagementPage.jsx# Department & routing rules manager
│   │   │   ├── LandingPage.jsx             # Public portal landing & feature overview
│   │   │   ├── LoginPage.jsx               # Role-based login with 1-click demo accounts
│   │   │   ├── MyComplaintsPage.jsx        # Searchable, filterable grievance registry
│   │   │   ├── OfficerDashboard.jsx        # Department case queue console
│   │   │   ├── RegisterPage.jsx            # Student portal registration
│   │   │   ├── ReportsAnalyticsPage.jsx    # Filterable compliance reports & CSV export
│   │   │   ├── StudentDashboard.jsx        # Student home overview & tracking shortcut
│   │   │   ├── SubmitComplaintPage.jsx     # Grievance submission with anonymous toggle
│   │   │   ├── TrackComplaintPage.jsx      # Reference ID & secret token tracker
│   │   │   └── UserProfilePage.jsx         # Profile information & password change
│   │   ├── services/
│   │   │   └── api.js                  # Frontend REST API service client
│   │   ├── App.jsx                     # Application root and route controller
│   │   ├── index.css                   # Tailwind base directives & custom scrollbars
│   │   └── main.jsx                    # React entrypoint
│   ├── index.html                      # HTML5 page template
│   ├── package.json                    # Frontend dependencies
│   ├── postcss.config.js               # PostCSS configuration
│   ├── tailwind.config.js              # Custom university theme styling
│   └── vite.config.js                  # Vite dev & build configuration
├── .env.example                        # Template environment variables
└── README.md                           # Documentation and deployment manual
```

---

## 3. Database Design & MySQL Workbench Compatibility

The database consists of 9 relational tables with strict foreign key constraints, indexes, and cascades.

### Relational Tables:
1. `departments`: id, department_name, description, contact_email, is_sensitive, created_at.
2. `users`: id, name, email, password_hash, role (student, officer, admin, committee), department_id, phone, student_id, is_active, created_at, updated_at.
3. `routing_rules`: id, category, department_id, default_priority, resolution_days, is_sensitive, created_at.
4. `complaints`: id, reference_id (e.g. `GRV-2026-A8K92X`), tracking_token (secret token), user_id (NULL for anonymous), category, subject, description, anonymous, department_id, assigned_officer_id, status, priority, is_sensitive, rejection_reason, resolution_notes, resolution_deadline, resolved_at, created_at, updated_at.
5. `complaint_updates`: id, complaint_id, updated_by, status, message, is_internal, created_at.
6. `complaint_attachments`: id, complaint_id, file_name, file_path, file_type, file_size, uploaded_at.
7. `escalations`: id, complaint_id, escalated_by, escalation_reason, escalation_level, previous_status, resolved, committee_notes, created_at.
8. `complaint_access_logs`: id, complaint_id, user_id, ip_address, action, timestamp.
9. `notifications`: id, user_id, complaint_id, title, message, is_read, created_at.

### Applying Database Schema in MySQL Workbench / CLI:
1. Open MySQL Workbench or your terminal.
2. Run the SQL script located at `database/schema.sql`:
   ```sql
   source /path/to/grievance-management-system/database/schema.sql;
   ```
3. Run the initial development seed script located at `database/seed.sql`:
   ```sql
   source /path/to/grievance-management-system/database/seed.sql;
   ```

---

## 4. Default Seed Accounts (For Development & Evaluation)

> [!WARNING]
> These credentials are safe development-only seed accounts. Production deployments must require password changes before institutional go-live.

| Role | Name | Email | Password | Scope |
|---|---|---|---|---|
| **Administrator** | System Administrator | `admin@university.edu` | `Password@123` | Global oversight, department manager, reports |
| **Department Officer** | Dr. Sarah Jenkins | `officer.academics@university.edu` | `Password@123` | Academic Affairs & teaching complaints |
| **Department Officer** | Prof. Robert Davis | `officer.hostel@university.edu` | `Password@123` | Hostel & residential facility complaints |
| **Committee Chair** | Dr. Elena Rostova | `committee.chair@university.edu` | `Password@123` | University Grievance Committee hearings |
| **Committee / Safety**| Dr. Maya Patel | `officer.safety@university.edu` | `Password@123` | Women's Safety & Anti-Harassment Cell |
| **Student** | Alex Rivera | `alex.student@university.edu` | `Password@123` | Student submission, tracking & history |

*Tip: A floating "Demo Switch" widget is available at the bottom-right of the frontend UI to switch between roles in one click.*

---

## 5. How to Run Locally

### Prerequisites:
- Node.js v18+ (tested on v24.14.0)
- MySQL 8.0 Server running on port 3306 or 3307

### Step 1: Configure Environment Variables
Copy `.env.example` to `backend/.env` and update your database credentials:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database configuration
DB_HOST=127.0.0.1
DB_PORT=3307        # or 3306 according to your MySQL server port
DB_USER=root
DB_PASSWORD=
DB_NAME=secure_grievance_db

# Security & JWT
JWT_SECRET=super_secure_university_jwt_secret_key_2026_xyz987654321!
JWT_EXPIRES_IN=7d
```

### Step 2: Start the Backend API Server
```bash
cd backend
npm install   # or pnpm install
node server.js
```
The API server will connect to MySQL and run at `http://localhost:5000`.

### Step 3: Start the Frontend Application
In a separate terminal:
```bash
cd frontend
npm install   # or pnpm install
npm run dev   # or pnpm run dev
```
Open `http://localhost:5173` in your web browser.

---

## 6. Security & Confidentiality Architecture

1. **Complete Anonymity Guarantee**:
   - For anonymous submissions, `user_id` is set strictly to `NULL`. No personal identifier or session credential is recorded in the complaint record.
   - An unpredictable, cryptographic tracking token (`tk_...`) is generated alongside the public Reference ID (`GRV-YYYY-XXXXXX`).
   - Unauthenticated public tracking lookups only return safe high-level status without exposing sensitive descriptions or file attachments unless the exact tracking token is supplied.
2. **Password Protection**:
   - All passwords are encrypted with salted `bcrypt` hashes (cost factor 10).
3. **Role-Based Access Control (RBAC)**:
   - Middleware enforces granular authorization:
     - `student`: Can only view their own identified grievances. Blocked from altering workflow status.
     - `officer`: Restricted strictly to grievances routed to their assigned department. Submitter identities are redacted for anonymous cases.
     - `committee`: Exclusive jurisdiction over escalated hearings and sensitive anti-harassment inquiries.
     - `admin`: Global administrative control with immutable audit logging.
4. **SQL Injection Prevention**:
   - 100% of database interactions utilize parameterized prepared statements via `mysql2/promise`.
5. **Audit Trail**:
   - Every view, status change, escalation, and note is recorded in `complaint_access_logs` with timestamps and client IP addresses.
6. **SLA Monitoring & Auto-Escalation**:
   - Background daemon routine automatically inspects resolution deadlines (`resolution_deadline < NOW()`) and forwards overdue complaints to the Grievance Committee.

---

## 7. Running the Automated Test Suite

A comprehensive 12-point automated test script is provided in `backend/test-suite.js`:
```bash
cd backend
node test-suite.js
```
This tests:
1. System Health API
2. Student registration
3. Admin authentication & RBAC
4. Department officer authentication
5. Anonymous complaint submission & auto-routing
6. Identified complaint submission
7. Public tracking redaction vs token-verified full view
8. RBAC blocking students from modifying status (HTTP 403)
9. Authorized status transitions
10. Manual student escalation
11. Real MySQL analytics queries
12. Public departments dropdown API
"# College-Grievance" 
