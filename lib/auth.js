/**
 * Authentication utilities for Next.js
 */
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supreme_dev_secret_key_999';
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'password'
};

export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return null;
    }
    return decoded;
  } catch (e) {
    return null;
  }
}

export function createToken(username) {
  return jwt.sign(
    { role: 'admin', username },
    JWT_SECRET,
    { expiresIn: '2h' }
  );
}

export function validateCredentials(username, password) {
  return username === ADMIN_CREDENTIALS.username && 
         password === ADMIN_CREDENTIALS.password;
}

// Middleware helper for API routes
export function requireAdmin(request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    return { error: 'Authentication required', status: 401 };
  }
  
  const user = verifyToken(token);
  if (!user) {
    return { error: 'Admin access denied', status: 403 };
  }
  
  return { user };
}

