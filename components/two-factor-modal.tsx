"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Mail, Shield } from "lucide-react"
import { verifyTwoFactorCode, getTwoFactorEmail } from "@/lib/two-factor"

interface TwoFactorModalProps {
  isOpen: boolean
  userId: string
  onVerified: () => void
  onCancel: () => void
}

export function TwoFactorModal({ isOpen, userId, onVerified, onCancel }: TwoFactorModalProps) {
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")

  useEffect(() => {
    if (isOpen) {
      getTwoFactorEmail(userId).then((userEmail) => {
        if (userEmail) {
          setEmail(userEmail)
        }
      })
    }
  }, [isOpen, userId])

  const handleVerify = async () => {
    setError("")
    setIsLoading(true)

    const result = await verifyTwoFactorCode(userId, code)

    setIsLoading(false)

    if (result.success) {
      onVerified()
    } else {
      setError(result.error || "Erreur de vérification")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && code.length === 6) {
      handleVerify()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Shield className="h-6 w-6 text-orange-600" />
            </div>
            <DialogTitle className="text-xl">Authentification à deux facteurs</DialogTitle>
          </div>
          <DialogDescription>
            Pour sécuriser votre compte propriétaire, veuillez entrer le code à 6 chiffres envoyé à votre adresse email.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {email && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Code envoyé à {email}</span>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="code">Code de vérification</Label>
            <Input
              id="code"
              type="text"
              placeholder="000000"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              onKeyPress={handleKeyPress}
              className="text-center text-2xl tracking-widest font-mono"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">Le code expire dans 10 minutes</p>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              En mode démo, le code est affiché dans la console du navigateur (F12). En production, il serait envoyé par
              email.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Annuler
          </Button>
          <Button onClick={handleVerify} disabled={code.length !== 6 || isLoading}>
            {isLoading ? "Vérification..." : "Vérifier"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
