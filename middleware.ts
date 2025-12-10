import { NextResponse } from 'next/server'
import authConfig from "@/auth.config"
import NextAuth from "next-auth"
import { DEFAULT_LOGIN_REDIRECT, apiAuthPrefix, authRoutes, publicRoutes } from "@/routes"

const { auth } = NextAuth(authConfig)
 
export default auth(async (req) => {
  const { nextUrl } = req;

  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  

  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, req.url));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn && !isPublicRoute) {

    let callbackUrl = nextUrl.pathname;
    if(nextUrl.search) {
      callbackUrl += nextUrl.search;
    }
    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    const loginUrl = `/auth/login?callbackUrl=${encodedCallbackUrl}`

    return NextResponse.redirect(new URL(loginUrl, nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
