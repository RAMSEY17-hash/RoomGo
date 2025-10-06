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
import { createClient } from "@/lib/supabase/client"
import { generateOwnerKey, sendOwnerKeyEmail } from "@/lib/owner-key-generator"
import { AlertCircle, Shield, CheckCircle } from "lucide-react"

export function RegisterForm() {
  const router = useRouter()
  const [userType, setUserType] = useState("particulier")
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "", // Added phone field
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

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

    if (userType === "proprietaire" && !formData.phone) {
      setError("Le numéro de téléphone est obligatoire pour les propriétaires")
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()

      let ownerKey: string | null = null
      if (userType === "proprietaire") {
        ownerKey = generateOwnerKey()

        // Store the owner key in the database
        const { error: keyError } = await supabase.from("owner_keys").insert({
          key_value: ownerKey,
          is_used: false,
          owner_email: formData.email,
        })

        if (keyError) throw keyError

        // Send the key via email (simulated)
        sendOwnerKeyEmail(formData.email, ownerKey)
      }

      // Create the auth account with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/`,
          data: {
            username: formData.username,
            user_type: userType === "proprietaire" ? "owner" : "student",
            owner_key: ownerKey,
            phone: formData.phone,
          },
        },
      })

      if (authError) throw authError

      if (userType === "proprietaire" && authData.user && ownerKey) {
        await supabase.from("owner_keys").update({ is_used: true, used_by: authData.user.id }).eq("key_value", ownerKey)
      }

      setSuccess(true)

      // Redirect after showing success message
      setTimeout(() => {
        router.push("/auth/check-email")
      }, 3000)
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'inscription")
    } finally {
      setIsLoading(false)
    }
  }

  if (success && userType === "proprietaire") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            Inscription réussie !
          </CardTitle>
          <CardDescription>Votre clé propriétaire a été générée</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Votre clé propriétaire a été envoyée à votre adresse email <strong>{formData.email}</strong>.
              <br />
              <br />
              Vous devrez fournir cette clé à chaque connexion. Conservez-la précieusement !
              <br />
              <br />
              Vérifiez également votre boîte de réception pour confirmer votre email.
            </AlertDescription>
          </Alert>
          <p className="text-sm text-muted-foreground text-center">Redirection vers la page de confirmation...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Créer un compte</CardTitle>
        <CardDescription>Rejoignez RoomGo pour trouver ou proposer des logements à Lomé</CardDescription>
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
            <RadioGroup value={userType} onValueChange={(value) => setUserType(value as string)}>
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

          {userType === "proprietaire" && (
            <div className="space-y-2">
              <Label htmlFor="phone">Numéro de téléphone *</Label>
              <Input
                id="phone"
                type="tel"
                required
                placeholder="+228 90 12 34 56"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">
                Ce numéro sera visible sur vos annonces pour que les étudiants puissent vous contacter
              </p>
            </div>
          )}

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
            <Alert>
              <Shield className="h-4 w-4 text-orange-600" />
              <AlertDescription>
                Une clé propriétaire unique sera générée automatiquement et envoyée à votre email après l'inscription.
                Cette clé sera nécessaire à chaque connexion pour sécuriser votre compte.
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Création..." : "S'inscrire"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
