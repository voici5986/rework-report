import { clearSessionCookie } from '../server/auth';

export default {
  async fetch(request: Request) {
    if (request.method !== 'GET' && request.method !== 'POST') {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: { Allow: 'GET, POST', 'Cache-Control': 'no-store' },
      });
    }

    return new Response(null, {
      status: 303,
      headers: {
        'Cache-Control': 'no-store',
        'Set-Cookie': clearSessionCookie(request.url),
        Location: '/login.html',
      },
    });
  },
};
