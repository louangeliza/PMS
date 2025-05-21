const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/jwt');

const authenticate = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // Check if the header starts with 'Bearer '
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Invalid token format. Must be Bearer token' });
  }

  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Invalid token format' });
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    if (!decoded.id && !decoded._id) {
      throw new Error('Invalid token payload');
    }
    req.user = {
      id: decoded.id || decoded._id,
      role: decoded.role,
      email: decoded.email
    };
    next();
  } catch (err) {
    const errorMap = {
      'TokenExpiredError': 'Token expired',
      'JsonWebTokenError': 'Invalid token',
      'NotBeforeError': 'Token not active'
    };
    const message = errorMap[err.name] || 'Authentication failed';
    res.status(401).json({ error: message });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    console.log('Authorization check:', {
      user: req.user,
      requiredRoles: roles,
      userRole: req.user?.role
    });
    
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Required roles: ${roles.join(', ')}. Your role: ${req.user.role}` 
      });
    }
    next();
  };
};

module.exports = { authenticate, authorizeRoles };