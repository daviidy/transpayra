import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_SESSION_COOKIE = 'admin_session'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect all /admin routes except /admin (login page)
  if (pathname.startsWith('/admin') && pathname !== '/admin') {
    const adminSession = request.cookies.get(ADMIN_SESSION_COOKIE)

    // If no valid session, redirect to login
    if (!adminSession || adminSession.value !== 'authenticated') {
      const loginUrl = new URL('/admin', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
