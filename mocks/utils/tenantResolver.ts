/**
 * Tenant resolution logic for MSW
 * Priority: query param ?tenant= → X-Tenant-ID header → host subdomain → default
 */

export function resolveTenant(request: Request): string {
  const url = new URL(request.url);

  // 1. Check query parameter
  const tenantParam = url.searchParams.get("tenant");
  if (tenantParam) {
    return tenantParam;
  }

  // 2. Check X-Tenant-ID header
  const tenantHeader = request.headers.get("X-Tenant-ID");
  if (tenantHeader) {
    return tenantHeader;
  }

  // 3. Extract subdomain from host
  const host = url.hostname;
  const parts = host.split(".");

  // If localhost:3000, check for subdomain pattern like demo-salon.localhost
  if (parts.length >= 2) {
    const subdomain = parts[0];
    // Ignore 'localhost', 'www', and single-letter subdomains
    if (subdomain !== "localhost" && subdomain !== "www" && subdomain.length > 1) {
      return subdomain;
    }
  }

  // 4. Default to demo-salon
  return "demo-salon";
}

/**
 * Extract Bearer token from Authorization header
 */
export function extractBearerToken(request: Request): string | null {
  const authHeader = request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return null;
}

/**
 * Generate a simple JWT-like token (not cryptographically secure, for mock only)
 */
export function generateMockToken(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  const signature = btoa("mock-signature");
  return `${header}.${body}.${signature}`;
}

/**
 * Decode mock token (reverse of generateMockToken)
 */
export function decodeMockToken(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
}

/**
 * Validate mock token and return payload
 */
export function validateMockToken(token: string): Record<string, unknown> | null {
  const payload = decodeMockToken(token);
  if (!payload) return null;

  // Check expiry
  const exp = payload.exp as number;
  if (exp && Date.now() >= exp * 1000) {
    return null;
  }

  return payload;
}

/**
 * Generate idempotency key hash
 */
export function generateIdempotencyHash(
  endpoint: string,
  tenant: string,
  body: unknown
): string {
  const data = JSON.stringify({ endpoint, tenant, body });
  // Simple hash (for mock purposes)
  return btoa(data);
}

/**
 * Generate UUID (simple implementation for mock)
 */
export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

