import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { hasRole } from '@/lib/roles';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  
  // Create a new supabase server client with the request cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name, options) {
          res.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );
  const { data: { session } } = await supabase.auth.getSession();

  // Check if the user is authenticated
  const isAuth = !!session;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                    request.nextUrl.pathname.startsWith('/signup') ||
                    request.nextUrl.pathname.startsWith('/forgot-password') ||
                    request.nextUrl.pathname.startsWith('/reset-password');
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/user') || 
                          request.nextUrl.pathname.startsWith('/admin');

  // Handle authentication redirects
  if (isAuthPage) {
    if (isAuth) {
      // If user is authenticated and tries to access auth pages, redirect to dashboard
      return NextResponse.redirect(new URL('/user', request.url));
    }
    // Allow access to auth pages for non-authenticated users
    return res;
  }

  if (isProtectedRoute) {
    if (!isAuth) {
      // If user is not authenticated and tries to access protected routes, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Check for admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
      const user = session.user;
      const isAdmin = await hasRole(user.id, 'admin');
      if (!isAdmin) {
        // Redirect non-admin users to user dashboard
        return NextResponse.redirect(new URL('/user', request.url));
      }
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/user/:path*',
    '/admin/:path*',
  ],
};
