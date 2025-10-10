import { updateSession } from "@/lib/supabase/middleware"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ------------------------------
  // 1️⃣ Page admin login accessible
  // ------------------------------
  if (pathname === "/admin/login") {
    console.log("[v0] Admin login page accessed", { pathname })
    return NextResponse.next()
  }

  // --------------------------------
  // 2️⃣ Routes admin protégées
  // --------------------------------
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    // Met à jour la session Supabase
    const response = await updateSession(request)

    // Récupère l'utilisateur
    const supabaseResponse = await fetch(`${request.nextUrl.origin}/api/auth/user`, {
      headers: { cookie: request.headers.get("cookie") || "" },
    }).catch(() => null)

    if (!supabaseResponse || !supabaseResponse.ok) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    const userData = await supabaseResponse.json()

    // Vérifie que c'est un admin
    if (userData.user_type !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    return response
  }

  // --------------------------------
  // 3️⃣ Autres routes protégées utilisateur
  // --------------------------------
  const protectedRoutes = ["/messages", "/listings/create", "/listings/my-listings"]
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    const response = await updateSession(request)
    const supabaseResponse = await fetch(`${request.nextUrl.origin}/api/auth/user`, {
      headers: { cookie: request.headers.get("cookie") || "" },
    }).catch(() => null)

    if (!supabaseResponse || !supabaseResponse.ok) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    return response
  }

  // --------------------------------
  // 4️⃣ Toutes les autres routes
  // --------------------------------
  return await updateSession(request)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
