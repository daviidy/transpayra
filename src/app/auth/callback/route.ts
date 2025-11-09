import { createRouteHandlerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { migrateAnonymousSubmissions } from '@/app/actions/migrate-anonymous-submissions'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient(cookieStore)

    const { data } = await supabase.auth.exchangeCodeForSession(code)

    // Migrate anonymous submissions to authenticated user
    if (data.user) {
      // Check if user has anonymous token in cookies
      const anonymousTokenCookie = cookieStore.get('anonymous_user_token')

      if (anonymousTokenCookie?.value) {
        const result = await migrateAnonymousSubmissions(
          data.user.id,
          anonymousTokenCookie.value
        )

        if (result.success && result.migratedCount > 0) {
          console.log(`✅ Migrated ${result.migratedCount} anonymous submissions for user ${data.user.email}`)
        }
      }
    }
  }

  // Redirect to dashboard after successful sign-in
  // Default to French locale
  return NextResponse.redirect(`${origin}/fr/dashboard`)
}