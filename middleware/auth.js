const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes — verifies JWT from Authorization header
 * Attaches req.user (without password) to the request
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Check Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. Fallback to cookie (if you later add cookie auth)
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized — no token provided',
    });
  }

  try {
    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Load user (exclude password)
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — user no longer exists',
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Contact administrator.',
      });
    }

    // 5. Attach user + decoded payload (role fresh from DB)
    req.user = user;
    req.tokenPayload = decoded;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired — please log in again',
        code: 'TOKEN_EXPIRED',
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        code: 'INVALID_TOKEN',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Not authorized — token failed',
    });
  }
};

/**
 * Restrict route to specific roles
 * Usage: authorize('admin', 'hr')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not allowed to access this resource`,
        allowedRoles: roles,
      });
    }

    next();
  };
};

/**
 * Allow access only if the authenticated user is the owner
 * or has an admin-type role.
 *
 * The getOwnerId callback receives req and must return
 * the owner's user ObjectId (string) — usually from params/body.
 *
 * Usage:
 *   router.get('/:id', protect, isSelfOrAdmin(req => req.params.id), ctrl.getEmployee)
 */
const isSelfOrAdmin = (getOwnerId, adminRoles = ['admin', 'hr']) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const ownerId = String(getOwnerId(req) || '');
    const currentUserId = String(req.user._id);
    const isAdmin = adminRoles.includes(req.user.role);

    if (isAdmin || ownerId === currentUserId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'You can only access your own resource',
    });
  };
};

/**
 * Optional authentication — does not fail if no token provided.
 * Useful for public endpoints that want enhanced data for logged-in users.
 */
const optionalAuth = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (user) req.user = user;
  } catch (_) {
    // silently ignore invalid token for optional auth
  }
  next();
};

module.exports = {
  protect,
  authorize,
  isSelfOrAdmin,
  optionalAuth,
};