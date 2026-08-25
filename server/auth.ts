const encoder = new TextEncoder();

export const SESSION_COOKIE_NAME = 'rework_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

let cachedSecret = '';
let cachedSigningKey: Promise<CryptoKey> | null = null;

function getSigningKey(secret: string) {
  if (!cachedSigningKey || cachedSecret !== secret) {
    cachedSecret = secret;
    cachedSigningKey = crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
  }
  return cachedSigningKey;
}

function base64Url(bytes: Uint8Array) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function constantTimeEqual(a: string, b: string) {
  const maxLength = Math.max(a.length, b.length);
  let mismatch = a.length ^ b.length;
  for (let i = 0; i < maxLength; i += 1) {
    mismatch |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return mismatch === 0;
}

async function signPayload(payload: string, secret: string) {
  const key = await getSigningKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return base64Url(new Uint8Array(signature));
}

async function sha256(value: string) {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
}

function equalBytes(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) mismatch |= a[i] ^ b[i];
  return mismatch === 0;
}

export async function verifyPassword(input: string, expected: string) {
  const [inputHash, expectedHash] = await Promise.all([sha256(input), sha256(expected)]);
  return equalBytes(inputHash, expectedHash);
}

export async function createSessionToken(secret: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `v1.${expiresAt}`;
  const signature = await signPayload(payload, secret);
  return `${payload}.${signature}`;
}

export async function verifySessionToken(token: string, secret: string) {
  const [version, expiresText, signature, extra] = token.split('.');
  if (extra !== undefined || version !== 'v1' || !expiresText || !signature) return false;

  const expiresAt = Number(expiresText);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) return false;

  const payload = `${version}.${expiresText}`;
  const expectedSignature = await signPayload(payload, secret);
  return constantTimeEqual(signature, expectedSignature);
}

export function getCookieValue(request: Request, name: string) {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(';')) {
    const trimmed = part.trim();
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;
    if (trimmed.slice(0, separator) === name) return trimmed.slice(separator + 1);
  }
  return null;
}

function cookieSecurityAttribute(requestUrl: string) {
  return new URL(requestUrl).protocol === 'https:' ? '; Secure' : '';
}

export function createSessionCookie(token: string, requestUrl: string) {
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}${cookieSecurityAttribute(requestUrl)}`;
}

export function clearSessionCookie(requestUrl: string) {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${cookieSecurityAttribute(requestUrl)}`;
}
