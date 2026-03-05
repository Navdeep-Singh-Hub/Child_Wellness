/**
 * Require admin: allow only if x-auth0-id is in ADMIN_AUTH0_IDS env (comma-separated).
 * For development, set ADMIN_AUTH0_IDS=* to allow any authenticated user.
 */
export function requireAdmin(req, res, next) {
  if (req.method === 'OPTIONS') return next();
  const auth0Id = req.headers['x-auth0-id'] || req.body?.auth0Id || req.query?.auth0Id;
  const allowed = process.env.ADMIN_AUTH0_IDS || '';
  if (!allowed.trim()) {
    return res.status(403).json({ ok: false, error: 'Admin access not configured' });
  }
  if (allowed.trim() === '*') {
    if (!auth0Id) return res.status(401).json({ ok: false, error: 'Unauthorized' });
    return next();
  }
  const ids = allowed.split(',').map((s) => s.trim()).filter(Boolean);
  if (!auth0Id || !ids.includes(auth0Id)) {
    return res.status(403).json({ ok: false, error: 'Admin access required' });
  }
  next();
}
