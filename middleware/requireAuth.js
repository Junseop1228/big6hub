const jwt = require('jsonwebtoken');

/**
 * requireAuth — JWT verification middleware
 *
 * Reads the Authorization: Bearer <token> header, verifies the JWT,
 * and attaches the decoded payload to req.user.
 *
 * Returns 401 if the header is missing, malformed, or the token is invalid.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Missing or malformed Authorization header' },
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' },
    });
  }
}

module.exports = requireAuth;
