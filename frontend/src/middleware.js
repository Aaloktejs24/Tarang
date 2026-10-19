import { NextResponse } from 'next/server';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Check if the route is an admin or super-admin route: /[7-char-token]/admin/... or /[7-char-token]/super-admin/...
  const adminMatch = pathname.match(/^\/([a-zA-Z0-9]{7})\/(admin|super-admin)/);
  
  if (adminMatch) {
    const token = adminMatch[1];
    const roleType = adminMatch[2]; // 'admin' or 'super-admin'
    
    // role passed to backend is 'super_admin' or 'admin'
    const role = roleType === 'super-admin' ? 'super_admin' : 'admin';

    // In production, you would check an environment variable for the backend API URL.
    // Assuming backend Krakend API Gateway runs on localhost:8080 locally
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
    
    try {
      const response = await fetch(`${apiUrl}/auth/admin-token/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, role })
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.valid) {
        // Invalid token: Redirect to home or 404
        return NextResponse.redirect(new URL(`/?error=invalid_${role}_token`, request.url));
      }
      
      // Token is valid, allow request
      return NextResponse.next();
      
    } catch (err) {
      console.error(`Failed to validate ${role} token`, err);
      // Fallback: block if we can't verify
      return NextResponse.redirect(new URL('/?error=admin_service_down', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware only to potential admin paths. 
  matcher: [
    '/:token/admin/:path*',
    '/:token/super-admin/:path*'
  ],
};
