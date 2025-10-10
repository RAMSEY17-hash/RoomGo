"use client"

import React, { useState, useEffect } from "react"
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
      const supabase = createBrowserClient()

      // Vérifie la whitelist
      if (!isAdminEmail(email)) {
        setError("Accès refusé. Cette page est réservée aux administrateurs.")
        setIsLoading(false)
        return
      }

      // Tentative de connexion Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError || !data.user) {
        setError("Email ou mot de passe incorrect")
        setIsLoading(false)
        return
      }

      // Vérifie le type d'utilisateur dans la table users
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("user_type")
        .eq("email", email)
        .single()

      if (userError || userData?.user_type !== "admin") {
        await supabase.auth.signOut()
        setError("Accès refusé. Vous n'êtes pas administrateur.")
        setIsLoading(false)
        return
      }

      // Génère et envoie le code 2FA
      const code = generateTwoFactorCode()
      await sendTwoFactorEmail(email, code, data.user.id)

      setUserId(data.user.id)
      setShow2FA(true)
      setIsLoading(false)
    } catch (err) {
      console.error("Erreur login admin:", err)
      setError("Une erreur est survenue")
      setIsLoading(false)
    }
  }

  // Appelé après validation 2FA
  const handle2FASuccess = async () => {
    const supabase = createBrowserClient()
    await supabase.auth.getSession() // rafraîchit la session
    router.push("/admin") // redirige vers dashboard
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

      {/* ✅ Ajouter le modal TwoFactor ici, à la fin du JSX */}
      <TwoFactorModal
        isOpen={show2FA}
        userId={userId}
        onVerified={() => router.push("/admin")}
        onCancel={() => setShow2FA(false)}
      />
    </div>
  )
}
