import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Temporarily bypass authentication for development
  return NextResponse.next()

  /* 
  // Re-enable this code when authentication is needed
  const { pathname } = request.nextUrl
  
  // Check if the request is for admin routes
  if (pathname.startsWith('/admin')) {
    // Check for authentication token (you can customize this logic)
    const token = request.cookies.get('auth-token')
    
    if (!token && pathname !== '/admin/login') {
      // Redirect to login page with return URL
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }
  
  return NextResponse.next()
  */
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
}
