const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');
const { HttpError } = require('./errorHandler');

// Verify JWT and attach user to req.
function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return next(new HttpError(401, 'Authentication required', 'UNAUTHORIZED'));
  }
  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = payload; // { userId, email, role, organizationId }
    return next();
  } catch (err) {
    return next(new HttpError(401, 'Invalid or expired token', 'UNAUTHORIZED'));
  }
}

// Require specific roles. Must be used after authRequired.
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new HttpError(401, 'Authentication required', 'UNAUTHORIZED'));
    if (!roles.includes(req.user.role)) {
      return next(new HttpError(403, 'Insufficient permissions', 'FORBIDDEN'));
    }
    return next();
  };
}

// Optional auth: attach user if token present, but don't require.
function authOptional(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      req.user = jwt.verify(token, jwtSecret);
    } catch (err) {
      // ignore — treat as anonymous
    }
  }
  next();
}

function signToken(user) {
  return jwt.sign(
    {
      userId: user.userId || (user._id ? user._id.toString() : null),
      email: user.email,
      role: user.role,
      organizationId: user.organizationId ? user.organizationId.toString() : null,
      customerId: user.customerId || null,
    },
    jwtSecret,
    { expiresIn: '7d' },
  );
}

module.exports = { authRequired, authOptional, requireRole, signToken };
