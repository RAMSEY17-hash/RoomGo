import { updateSession } from "@/lib/supabase/middleware"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const response = await updateSession(request)

    const supabaseResponse = await fetch(`${request.nextUrl.origin}/api/auth/user`, {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    }).catch(() => null)

    if (!supabaseResponse || !supabaseResponse.ok) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    return response
  }

  if (pathname === "/admin/login") {
    console.log("[v0] Admin login page accessed from:", request.headers.get("referer") || "direct")
  }

  const protectedRoutes = ["/messages", "/listings/create", "/listings/my-listings"]
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    const response = await updateSession(request)

    const supabaseResponse = await fetch(`${request.nextUrl.origin}/api/auth/user`, {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    }).catch(() => null)

    if (!supabaseResponse || !supabaseResponse.ok) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    return response
  }

  return await updateSession(request)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
