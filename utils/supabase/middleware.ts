import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  console.log('Middleware: Processing request for', request.nextUrl.pathname)

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log('Middleware: User state', user ? 'Logged in' : 'Not logged in')

    const token_hash = request.nextUrl.searchParams.get('token_hash')
    if (token_hash) {
      console.log('Middleware: Token hash found, skipping redirect')
      return supabaseResponse
    }

    const message = request.nextUrl.searchParams.get('message')
    if (message) {
      console.log('Middleware: Message parameter found, skipping redirect')
      return supabaseResponse
    }

    if (request.nextUrl.pathname.startsWith('/auth/complete-profile')) {
      console.log('Middleware: On complete-profile page, skipping redirect')
      return supabaseResponse
    }

    if (user && !user.user_metadata.name || user && !user.user_metadata.full_name) {
      console.log('Middleware: User logged in but name not set, redirecting to complete-profile')
      const url = request.nextUrl.clone()
      url.pathname = '/auth/complete-profile'
      return NextResponse.redirect(url)
    }

    if (
      !user &&
      !request.nextUrl.pathname.startsWith('/') &&
      !request.nextUrl.pathname.startsWith('/api') &&
      !request.nextUrl.pathname.startsWith('/login') &&
      !request.nextUrl.pathname.startsWith('/auth') &&
      !request.nextUrl.pathname.startsWith('/error')
    ) {
      console.log('Middleware: User not logged in, redirecting to login')
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    if (
      user &&
      (request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/auth'))
    ) {
      console.log('Middleware: User logged in and on auth page, redirecting to home')
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

  } catch (error) {
    console.error('Middleware: Error in session update', error)
  }

  console.log('Middleware: No redirect, continuing with request')
  return supabaseResponse
}