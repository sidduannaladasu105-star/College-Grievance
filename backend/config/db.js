import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3307', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'secure_grievance_db',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  dateStrings: true
});

// Helper for running parameterized queries
export const query = async (sql, params = []) => {
  const [results] = await pool.execute(sql, params);
  return results;
};

// Helper for database transactions
export const withTransaction = async (callback) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Database connectivity check
export const testConnection = async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Connected to MySQL Database at', `${process.env.DB_HOST}:${process.env.DB_PORT}`);
    conn.release();
    return true;
  } catch (error) {
    console.error('❌ MySQL Connection Failed:', error.message);
    return false;
  }
};

export default pool;
