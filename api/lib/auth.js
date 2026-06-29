const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRES = '7d';

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function getBearerToken(req) {
  const auth = req.headers.authorization || req.headers.Authorization || '';
  if (auth.startsWith('Bearer ')) {
    return auth.slice(7);
  }
  return null;
}

function requireAuth(req, allowedRoles) {
  const token = getBearerToken(req);
  if (!token) {
    return { error: '未登录或登录已过期', status: 401 };
  }
  const decoded = verifyToken(token);
  if (!decoded) {
    return { error: '未登录或登录已过期', status: 401 };
  }
  if (allowedRoles && !allowedRoles.includes(decoded.role)) {
    return { error: '无权访问', status: 403 };
  }
  return { user: decoded };
}

module.exports = {
  hashPassword,
  comparePassword,
  signToken,
  verifyToken,
  getBearerToken,
  requireAuth,
};
