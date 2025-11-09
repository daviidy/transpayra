import createIntlMiddleware from 'next-intl/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { routing } from './i18n/routing'

const ADMIN_SESSION_COOKIE = 'admin_session'

// Create i18n middleware
const intlMiddleware = createIntlMiddleware(routing)

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect all /admin routes except /admin (login page)
  // Admin routes should work with locale prefix: /fr/admin, /en/admin
  const localePattern = /^\/(fr|en)/
  const localeMatch = pathname.match(localePattern)
  const pathWithoutLocale = localeMatch ? pathname.slice(localeMatch[0].length) : pathname

  if (pathWithoutLocale.startsWith('/admin') && pathWithoutLocale !== '/admin') {
    const adminSession = request.cookies.get(ADMIN_SESSION_COOKIE)

    // If no valid session, redirect to login
    if (!adminSession || adminSession.value !== 'authenticated') {
      const locale = localeMatch ? localeMatch[1] : routing.defaultLocale
      const loginUrl = new URL(`/${locale}/admin`, request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Apply i18n routing
  return intlMiddleware(request)
}

export const config = {
  // Match all pathnames except for
  // - /api (API routes)
  // - /_next (Next.js internals)
  // - /images, etc. (static files)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}
