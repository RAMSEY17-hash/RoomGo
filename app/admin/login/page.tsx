"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Lock, Mail } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { isAdminEmail } from "@/lib/admin-whitelist"
import { generateTwoFactorCode, sendTwoFactorEmail } from "@/lib/two-factor"
import { TwoFactorModal } from "@/components/two-factor-modal"
import { Logo } from "@/components/logo"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [show2FA, setShow2FA] = useState(false)
  const [userId, setUserId] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      console.log("[v0] Admin login attempt for:", email)

      // Check if email is in admin whitelist
      if (!isAdminEmail(email)) {
        console.log("[v0] Email not in whitelist")
        setError("Accès refusé. Cette page est réservée aux administrateurs.")
        setIsLoading(false)
        return
      }

      console.log("[v0] Email is in whitelist, attempting Supabase auth...")
      const supabase = createBrowserClient()

      // Attempt to sign in
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.log("[v0] Supabase auth error:", signInError)
        setError("Email ou mot de passe incorrect")
        setIsLoading(false)
        return
      }

      if (!data.user) {
        console.log("[v0] No user data returned")
        setError("Erreur d'authentification")
        setIsLoading(false)
        return
      }

      console.log("[v0] Supabase auth successful, checking user_type in database...")

      // Verify user is admin in database
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("user_type")
        .eq("email", email)
        .single()

      console.log("[v0] User data from database:", userData)
      console.log("[v0] User error:", userError)

      if (userError) {
        console.log("[v0] Error fetching user data:", userError)
        await supabase.auth.signOut()
        setError(`Erreur: ${userError.message}. Veuillez contacter l'administrateur système.`)
        setIsLoading(false)
        return
      }

      if (userData?.user_type !== "admin") {
        console.log("[v0] User type is not admin:", userData?.user_type)
        await supabase.auth.signOut()
        setError("Accès refusé. Vous n'êtes pas administrateur.")
        setIsLoading(false)
        return
      }

      console.log("[v0] Admin verification successful, generating 2FA code...")

      // Generate and send 2FA code
      const code = generateTwoFactorCode()
      await sendTwoFactorEmail(email, code, data.user.id)

      setUserId(data.user.id)
      setShow2FA(true)
      setIsLoading(false)
    } catch (err) {
      console.log("[v0] Unexpected error:", err)
      setError("Une erreur est survenue")
      setIsLoading(false)
    }
  }

  const handle2FASuccess = () => {
    router.push("/admin")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Administration</h1>
          </div>
          <p className="text-muted-foreground">Accès sécurisé réservé aux administrateurs</p>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Connexion sécurisée
            </CardTitle>
            <CardDescription>Authentification à deux facteurs requise</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email administrateur</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@roomgo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Vérification..." : "Se connecter"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <Shield className="h-4 w-4 inline mr-1" />
                Connexion protégée par 2FA
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>Cette page est strictement réservée aux administrateurs autorisés.</p>
          <p className="mt-1">Toute tentative d'accès non autorisée sera enregistrée.</p>
        </div>
      </div>

      <TwoFactorModal
        isOpen={show2FA}
        onClose={() => setShow2FA(false)}
        onSuccess={handle2FASuccess}
        userId={userId}
        email={email}
      />
    </div>
  )
}
