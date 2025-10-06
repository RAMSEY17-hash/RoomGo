"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { login } from "@/lib/auth"
import { useAuth } from "./auth-provider"
import { AlertCircle } from "lucide-react"

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const result = login(formData.email, formData.password, showProprioKey ? formData.proprietaireKey : undefined)

    setIsLoading(false)

    if (result.success && result.user) {
      setUser(result.user)
      router.push("/")
    } else {
      setError(result.error || "Une erreur est survenue")

      // Si l'erreur concerne la clé propriétaire, afficher le champ
      if (result.error?.includes("Clé propriétaire")) {
        setShowProprioKey(true)
      }
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Connexion</CardTitle>
        <CardDescription>Connectez-vous à votre compte Lomé Housing</CardDescription>
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
            <Button type="button" variant="link" onClick={() => setShowProprioKey(!showProprioKey)} className="text-sm">
              {showProprioKey ? "Masquer" : "Je suis propriétaire"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
