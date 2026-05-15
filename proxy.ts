import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const path = req.nextUrl.pathname
  const loginUrl = new URL("/login", req.url)
  const dashboardUrl = new URL("/dashboard", req.url)

  const isProtected = ["/dashboard", "/pegawai", "/master", "/akun", "/log-aktivitas"].some(
    (p) => path.startsWith(p)
  )

  if (isProtected && !token) {
    loginUrl.searchParams.set("callbackUrl", path)
    return NextResponse.redirect(loginUrl)
  }

  if (token && (path === "/login" || path === "/")) {
    return NextResponse.redirect(dashboardUrl)
  }

  if (token && (path.startsWith("/log-aktivitas") || path.startsWith("/akun"))) {
    if (token.role !== "SUPER_ADMIN" && token.role !== "HR") {
      return NextResponse.redirect(dashboardUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/dashboard/:path*",
    "/pegawai/:path*",
    "/master/:path*",
    "/akun/:path*",
    "/log-aktivitas/:path*",
  ],
}
