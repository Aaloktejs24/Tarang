import { NextResponse } from 'next/server';

export async function POST(request) {
  const cookieHeader = request.headers.get('cookie') || '';

  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
    const backendRes = await fetch(`${backendUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Cookie': cookieHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    if (!backendRes.ok) {
      // Swallowing the 401 error so it doesn't show in the browser console
      return NextResponse.json({ authenticated: false, error: 'refresh_failed' }, { status: 200 });
    }

    const data = await backendRes.json();
    const res = NextResponse.json(data);

    // Pass along any new cookies (like a new refresh token)
    const setCookie = backendRes.headers.get('set-cookie');
    if (setCookie) {
      res.headers.set('set-cookie', setCookie);
    }

    return res;
  } catch (err) {
    return NextResponse.json({ authenticated: false, error: err.message }, { status: 200 });
  }
}
