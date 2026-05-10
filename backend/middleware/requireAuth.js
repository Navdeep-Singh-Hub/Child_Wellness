import * as jose from 'jose';

function stripProtocol(host) {
  let h = (host || '').trim();
  h = h.replace(/^https?:\/\//i, '');
  const slash = h.indexOf('/');
  if (slash !== -1) h = h.slice(0, slash);
  return h;
}

let jwksCache = { domain: '', jwks: null };

function getJwksForDomain(domain) {
  if (jwksCache.domain !== domain) {
    jwksCache = {
      domain,
      jwks: jose.createRemoteJWKSet(new URL(`https://${domain}/.well-known/jwks.json`)),
    };
  }
  return jwksCache.jwks;
}

export function isJwtAuthConfigured() {
  const d = stripProtocol(process.env.AUTH0_DOMAIN || '');
  const aud = (process.env.AUTH0_AUDIENCE || '').trim();
  return Boolean(d && aud);
}

function issuerFromEnv(domain) {
  const explicit = (process.env.AUTH0_ISSUER || '').trim();
  if (explicit) return explicit.endsWith('/') ? explicit : `${explicit}/`;
  return `https://${domain}/`;
}

export async function verifyAuth0AccessToken(token) {
  const domain = stripProtocol(process.env.AUTH0_DOMAIN || '');
  const audience = (process.env.AUTH0_AUDIENCE || '').trim();
  if (!domain || !audience) {
    throw new Error('AUTH0_DOMAIN and AUTH0_AUDIENCE must be set to verify JWTs');
  }
  const issuer = issuerFromEnv(domain);
  const jwks = getJwksForDomain(domain);
  const { payload } = await jose.jwtVerify(token, jwks, {
    issuer,
    audience,
    clockTolerance: 30,
  });
  return payload;
}

function devHeadersAllowed() {
  return (
    process.env.ALLOW_INSECURE_DEV_AUTH_HEADERS === 'true' ||
    process.env.ALLOW_INSECURE_DEV_AUTH_HEADERS === '1'
  );
}

function applyHeaderIdentity(req, auth0Id, email, name) {
  req.auth0Id = auth0Id.trim();
  req.auth0Email = typeof email === 'string' ? email : '';
  req.auth0Name = typeof name === 'string' ? name : '';
  req.userId = req.auth0Id;
}

/**
 * Sets req.auth0Id, req.auth0Email, req.auth0Name, req.userId.
 *
 * When AUTH0_DOMAIN + AUTH0_AUDIENCE are set, requires a valid Bearer access token
 * (signature, iss, aud, exp) from Auth0. Optional ALLOW_INSECURE_DEV_AUTH_HEADERS=1
 * allows trusting x-auth0-* headers instead (local dev only).
 *
 * When those env vars are unset, legacy behavior: require x-auth0-id (spoofable).
 */
export function requireAuth(req, res, next) {
  if (req.method === 'OPTIONS') {
    return next();
  }

  const authHeader = req.headers.authorization || '';
  const bearer =
    typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : '';

  const emailH = req.headers['x-auth0-email'] || '';
  const nameH = req.headers['x-auth0-name'] || '';
  const idH = req.headers['x-auth0-id'];

  (async () => {
    try {
      const jwtOn = isJwtAuthConfigured();

      if (jwtOn && bearer) {
        const payload = await verifyAuth0AccessToken(bearer);
        const sub = typeof payload.sub === 'string' ? payload.sub : '';
        if (!sub) {
          return res.status(401).json({ ok: false, error: 'Unauthorized' });
        }
        req.auth0Id = sub;
        req.auth0Email = typeof payload.email === 'string' ? payload.email : '';
        req.auth0Name =
          (typeof payload.name === 'string' && payload.name) ||
          (typeof payload.nickname === 'string' && payload.nickname) ||
          '';
        req.userId = sub;
        console.log(`[REQUIRE AUTH] ${req.method} ${req.originalUrl || req.path} - JWT sub: ${sub}`);
        return next();
      }

      if (jwtOn && !bearer) {
        if (devHeadersAllowed() && idH && typeof idH === 'string' && idH.trim()) {
          applyHeaderIdentity(req, idH, emailH, nameH);
          console.warn('[REQUIRE AUTH] Using x-auth0-id (ALLOW_INSECURE_DEV_AUTH_HEADERS) — not for production');
          return next();
        }
        return res.status(401).json({ ok: false, error: 'Unauthorized' });
      }

      if (!jwtOn && idH && typeof idH === 'string' && idH.trim()) {
        applyHeaderIdentity(req, idH, emailH, nameH);
        console.log(`[REQUIRE AUTH] ${req.method} ${req.originalUrl || req.path} - auth0Id: ${req.auth0Id} (header)`);
        return next();
      }

      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    } catch (err) {
      console.warn('[AUTH] JWT verify failed:', err?.message || err);
      if (
        isJwtAuthConfigured() &&
        devHeadersAllowed() &&
        idH &&
        typeof idH === 'string' &&
        idH.trim()
      ) {
        applyHeaderIdentity(req, idH, emailH, nameH);
        console.warn('[REQUIRE AUTH] JWT failed; using x-auth0-id (ALLOW_INSECURE_DEV_AUTH_HEADERS)');
        return next();
      }
      return res.status(401).json({ ok: false, error: 'Invalid or expired token' });
    }
  })().catch((e) => {
    console.error('[AUTH] Unexpected', e);
    res.status(500).json({ ok: false, error: 'Auth error' });
  });
}
