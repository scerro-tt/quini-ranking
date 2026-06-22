import { auth } from '@/auth'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const pathname = req.nextUrl.pathname

  // Rutas que requieren autenticación
  if (pathname.startsWith('/dashboard') && !isLoggedIn) {
    return Response.redirect(new URL('/login', req.nextUrl))
  }

  // Rutas de auth que no deben ser accesibles si está logueado
  if ((pathname === '/login' || pathname === '/register') && isLoggedIn) {
    return Response.redirect(new URL('/dashboard', req.nextUrl))
  }

  // Pass userId to API routes via header
  if (isLoggedIn && pathname.startsWith('/api')) {
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-user-id', req.auth?.user?.id || '')
    return new Response(req.body, {
      headers: requestHeaders,
    })
  }
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
