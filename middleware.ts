import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.get('isAuthenticated')?.value === 'true';
  const userRole = request.cookies.get('userRole')?.value;

  const pathname = request.nextUrl.pathname;

  // Allow login page without authentication
  if (pathname === '/login') {
    return NextResponse.next();
  }

  // Allow public tournament view page
  if (pathname.startsWith('/tournaments')) {
    return NextResponse.next();
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated || userRole !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // Protect organizer routes
  if (pathname.startsWith('/organizer')) {
    if (!isAuthenticated || userRole !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // Allow home page and other public pages
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
