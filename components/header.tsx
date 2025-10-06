"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "./auth-provider"
import { Home, PlusCircle, MessageCircle, User, LogOut, Shield, List } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { getUnreadCount } from "@/lib/messaging"

export function Header() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      const updateUnreadCount = () => {
        setUnreadCount(getUnreadCount(user.id))
      }

      updateUnreadCount()
      const interval = setInterval(updateUnreadCount, 5000) // Update every 5 seconds

      return () => clearInterval(interval)
    }
  }, [user])

  const handleLogout = () => {
    logout()
    router.push("/auth/login")
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Home className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">Lomé Housing</span>
        </Link>

        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <Button variant="ghost" asChild className="relative">
                <Link href="/messages">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Messages
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                      {unreadCount}
                    </Badge>
                  )}
                </Link>
              </Button>

              {user.type === "proprietaire" && (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/listings/my-listings">
                      <List className="h-5 w-5 mr-2" />
                      Mes annonces
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/listings/create">
                      <PlusCircle className="h-5 w-5 mr-2" />
                      Publier
                    </Link>
                  </Button>
                </>
              )}

              {user.type === "admin" && (
                <Button variant="ghost" asChild>
                  <Link href="/admin">
                    <Shield className="h-5 w-5 mr-2" />
                    Admin
                  </Link>
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Connexion</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">Inscription</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
