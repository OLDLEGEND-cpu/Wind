export interface SessionPayload {
  sub: string; // user id
  email: string;
  role: 'user' | 'admin';
}

/**
 * Edge-compatible session payload parser for middleware.
 * Parses and verifies expiration without dragging in Node C++ native modules.
 */
export function parseSessionToken(token: string): SessionPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr =
      typeof atob === 'function'
        ? atob(base64)
        : Buffer.from(base64, 'base64').toString('utf8');
    const payload = JSON.parse(jsonStr);

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    if (!payload.sub || !payload.role) return null;

    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role
    };
  } catch {
    return null;
  }
}
