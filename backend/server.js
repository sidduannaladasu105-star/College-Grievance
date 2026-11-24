import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { testConnection } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { checkAndAutoEscalate } from './services/escalationService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    return callback(new Error('CORS access blocked by policy.'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Secure Grievance Management System API',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);

import fs from 'fs';

// Public departments list for submission dropdown without auth
import { query } from './config/db.js';
app.get('/api/public/departments', async (req, res) => {
  try {
    const depts = await query('SELECT id, department_name, description, is_sensitive FROM departments ORDER BY department_name ASC');
    res.json({ success: true, departments: depts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch departments' });
  }
});

// Serve Frontend in Production / Bundled Mode
const frontendDist = path.resolve(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// 404 Route Handler for unmatched API calls
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start Server and Escalation Scheduler
const startServer = async () => {
  const isDbReady = await testConnection();
  if (!isDbReady) {
    console.warn('⚠️ Server starting, but MySQL connection is pending or failed.');
  }

  // Periodic Auto-Escalation Check (Runs every 10 minutes)
  setInterval(async () => {
    try {
      await checkAndAutoEscalate();
    } catch (err) {
      console.error('Periodic escalation job error:', err.message);
    }
  }, 10 * 60 * 1000);

  // Initial escalation sweep on startup
  setTimeout(() => {
    checkAndAutoEscalate().catch(err => console.error('Startup escalation check failed:', err.message));
  }, 3000);

  const server = app.listen(PORT, () => {
    console.log(`🚀 Secure Grievance API Server running on http://localhost:${PORT}`);
  });

  return server;
};

startServer();

export default app;
