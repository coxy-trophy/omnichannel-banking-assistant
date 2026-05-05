import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  const isDashboard = path.startsWith('/dashboard');
  const isBooking = path.startsWith('/booking');
  const isKyc = path.startsWith('/kyc');
  const isComplaints = path.startsWith('/complaints');
  const isFinancial = path.startsWith('/deposit') || path.startsWith('/withdraw');
  const isAdmin = path.startsWith('/admin');
  
  const authToken = request.cookies.get('auth_token')?.value;

  if ((isDashboard || isBooking || isKyc || isComplaints || isFinancial) && !authToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAdmin && !path.includes('/login')) {
    const adminAuth = request.cookies.get('admin_auth')?.value;
    if (!adminAuth) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/admin/:path*', 
    '/booking/:path*', 
    '/kyc/:path*', 
    '/complaints/:path*',
    '/deposit/:path*',
    '/withdraw/:path*'
  ],
};
