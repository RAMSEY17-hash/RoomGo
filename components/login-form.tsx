"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./auth-provider"
import { AlertCircle } from "lucide-react"
import { TwoFactorModal } from "./two-factor-modal"
import type { User } from "@/lib/types"

export function LoginForm() {
  const router = useRouter()
  const { setUser } = useAuth()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    proprietaireKey: "",
  })
  const [showProprioKey, setShowProprioKey] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [show2FA, setShow2FA] = useState(false)
  const [pendingUser, setPendingUser] = useState<User | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const supabase = createClient()

      // Connexion avec Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error("Utilisateur non trouvé")
      }

      // Récupérer les données utilisateur
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authData.user.id)
        .single()

      if (userError) throw userError

      // Si c'est un propriétaire, vérifier la clé et activer 2FA
      if (userData.user_type === "owner") {
        if (!showProprioKey) {
          setShowProprioKey(true)
          setError("Veuillez entrer votre clé propriétaire")
          setIsLoading(false)
          return
        }

        if (formData.proprietaireKey !== userData.owner_key) {
          setError("Clé propriétaire incorrecte")
          setIsLoading(false)
          return
        }

        // Générer et sauvegarder le code 2FA
        const code = Math.floor(100000 + Math.random() * 900000).toString()
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

        await supabase.from("two_factor_codes").insert({
          user_id: userData.id,
          code,
          expires_at: expiresAt,
        })

        console.log(`[v0] Code 2FA envoyé à ${userData.email}: ${code}`)

        setPendingUser({
          id: userData.id,
          username: userData.username,
          email: userData.email,
          type: userData.user_type,
          proprietaireKey: userData.owner_key,
        })
        setShow2FA(true)
      } else {
        // Connexion directe pour les étudiants et admins
        setUser({
          id: userData.id,
          username: userData.username,
          email: userData.email,
          type: userData.user_type,
        })
        router.push("/")
      }
    } catch (err: any) {
      setError(err.message || "Email ou mot de passe incorrect")
    } finally {
      setIsLoading(false)
    }
  }

  const handle2FAVerified = () => {
    if (pendingUser) {
      setUser(pendingUser)
      setShow2FA(false)
      router.push("/")
    }
  }

  const handle2FACancel = () => {
    setShow2FA(false)
    setPendingUser(null)
    setError("Authentification annulée")
  }

  return (
    <>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Connexion</CardTitle>
          <CardDescription>Connectez-vous à votre compte RoomGo</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            {showProprioKey && (
              <div className="space-y-2">
                <Label htmlFor="proprietaireKey">Clé Propriétaire</Label>
                <Input
                  id="proprietaireKey"
                  type="text"
                  required
                  placeholder="PROP-XXXXXXXX"
                  value={formData.proprietaireKey}
                  onChange={(e) => setFormData({ ...formData, proprietaireKey: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">
                  Votre compte est un compte propriétaire, veuillez entrer votre clé
                </p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Connexion..." : "Se connecter"}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => setShowProprioKey(!showProprioKey)}
                className="text-sm"
              >
                {showProprioKey ? "Masquer" : "Je suis propriétaire"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {pendingUser && (
        <TwoFactorModal
          isOpen={show2FA}
          userId={pendingUser.id}
          onVerified={handle2FAVerified}
          onCancel={handle2FACancel}
        />
      )}
    </>
  )
}
