import {
  createSessionCookie,
  createSessionToken,
  verifyPassword,
} from '../server/auth';

function json(body: unknown, status: number) {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}

export default {
  async fetch(request: Request) {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: { Allow: 'POST', 'Cache-Control': 'no-store' },
      });
    }

    const expectedPassword = process.env.REWORK_REPORT_PASSWORD;
    const sessionSecret = process.env.REWORK_SESSION_SECRET;
    if (!expectedPassword || !sessionSecret) {
      return json({ error: '访问保护尚未配置完成。' }, 503);
    }

    let password = '';
    try {
      const body = (await request.json()) as { password?: unknown };
      if (typeof body.password === 'string') password = body.password;
    } catch {
      return json({ error: '请求格式无效。' }, 400);
    }

    if (!password || password.length > 256 || !(await verifyPassword(password, expectedPassword))) {
      await new Promise((resolve) => setTimeout(resolve, 350));
      return json({ error: '密码不正确。' }, 401);
    }

    const token = await createSessionToken(sessionSecret);
    return new Response(null, {
      status: 204,
      headers: {
        'Cache-Control': 'no-store',
        'Set-Cookie': createSessionCookie(token, request.url),
      },
    });
  },
};
