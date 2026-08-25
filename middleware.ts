import { next } from '@vercel/functions';
import {
  getCookieValue,
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from './server/auth';

export default async function middleware(request: Request) {
  const sessionSecret = process.env.REWORK_SESSION_SECRET;
  const sessionToken = getCookieValue(request, SESSION_COOKIE_NAME);

  if (sessionSecret && sessionToken && (await verifySessionToken(sessionToken, sessionSecret))) {
    return next();
  }

  const requestUrl = new URL(request.url);
  const loginUrl = new URL('/login.html', requestUrl.origin);
  const destination = `${requestUrl.pathname}${requestUrl.search}`;
  if (destination !== '/') loginUrl.searchParams.set('next', destination);
  if (!sessionSecret) loginUrl.searchParams.set('config', '1');

  return Response.redirect(loginUrl, 307);
}

export const config = {
  matcher: ['/((?!login\\.html|api/login|api/logout|favicon\\.ico).*)'],
};
