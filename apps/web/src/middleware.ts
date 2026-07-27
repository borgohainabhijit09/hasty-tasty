import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth')
  const isAdminRoute = nextUrl.pathname.startsWith('/admin')
  const isAdminLoginRoute = nextUrl.pathname.startsWith('/admin/login')

  if (isApiAuthRoute) {
    return NextResponse.next()
  }

  if (isAdminRoute && !isAdminLoginRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/admin/login', nextUrl))
    }

    const role = req.auth?.user?.role;
    
    if (role === 'DELIVERY_BOY') {
      return NextResponse.redirect(new URL('/delivery', nextUrl));
    }

    if (role === 'MANAGER') {
      const allowedPaths = ['/admin', '/admin/orders', '/admin/products', '/admin/categories'];
      
      // If path is not exactly one of the allowed paths or their sub-routes, block access
      const isAllowed = allowedPaths.some(path => 
        nextUrl.pathname === path || nextUrl.pathname.startsWith(`${path}/`)
      );

      if (!isAllowed) {
        return NextResponse.redirect(new URL('/admin', nextUrl));
      }
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
