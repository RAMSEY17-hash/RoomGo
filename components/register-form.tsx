"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { register } from "@/lib/auth"
import type { UserType } from "@/lib/types"
import { useAuth } from "./auth-provider"
import { AlertCircle } from "lucide-react"

export function RegisterForm() {
  const router = useRouter()
  const { setUser } = useAuth()
  const [userType, setUserType] = useState<UserType>("particulier")
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    proprietaireKey: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères")
      setIsLoading(false)
      return
    }

    // Inscription
    const result = register(
      formData.username,
      formData.email,
      formData.password,
      userType,
      userType === "proprietaire" ? formData.proprietaireKey : undefined,
    )

    setIsLoading(false)

    if (result.success && result.user) {
      setUser(result.user)
      router.push("/")
    } else {
      setError(result.error || "Une erreur est survenue")
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Créer un compte</CardTitle>
        <CardDescription>Rejoignez Lomé Housing pour trouver ou proposer des logements</CardDescription>
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
            <Label>Type de compte</Label>
            <RadioGroup value={userType} onValueChange={(value) => setUserType(value as UserType)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="particulier" id="particulier" />
                <Label htmlFor="particulier" className="font-normal cursor-pointer">
                  Particulier / Étudiant
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="proprietaire" id="proprietaire" />
                <Label htmlFor="proprietaire" className="font-normal cursor-pointer">
                  Propriétaire
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Nom d'utilisateur</Label>
            <Input
              id="username"
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
          </div>

          {userType === "proprietaire" && (
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
                Vous devez avoir une clé propriétaire valide pour créer un compte propriétaire
              </p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Création..." : "S'inscrire"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
