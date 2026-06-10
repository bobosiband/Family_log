import jwt from 'jsonwebtoken';

/**
 * Verifies the Bearer token and sets req.userId from the token payload.
 * Returns 401 on missing or invalid tokens.
 */
function authenticate(req, res, next) {
  const secret = process.env.JWT_SECRET;

  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'unauthorized', message: 'missing or invalid authorization header' });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, secret);
    req.userId = payload.userId;
    return next();
  } catch {
    return res.status(401).json({ error: 'unauthorized', message: 'invalid or expired token' });
  }
}

export { authenticate };
