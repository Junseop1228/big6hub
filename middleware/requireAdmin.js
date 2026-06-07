/**
 * requireAdmin — role-based access control middleware
 *
 * Must be used AFTER requireAuth (depends on req.user being set).
 * Returns 403 if the authenticated user's role is not 'admin'.
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      error: { code: 'FORBIDDEN', message: 'Admin access required' },
    });
  }
  next();
}

module.exports = requireAdmin;
