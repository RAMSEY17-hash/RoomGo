"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useAuth } from "./auth-provider"
import { getOrCreateConversation, sendMessage } from "@/lib/messaging"
import type { Listing } from "@/lib/types"
import { MessageCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MessageButtonProps {
  listing: Listing
}

export function MessageButton({ listing }: MessageButtonProps) {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = () => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    if (user.type !== "etudiant") {
      toast({
        title: "Accès refusé",
        description: "Seuls les étudiants peuvent contacter les propriétaires",
        variant: "destructive",
      })
      return
    }

    setIsOpen(true)
  }

  const handleSend = () => {
    if (!user || !message.trim()) return

    setIsLoading(true)

    // Créer ou obtenir la conversation
    const conversation = getOrCreateConversation(
      listing.id,
      listing.titre,
      user.id,
      user.username,
      listing.proprietaireId,
      listing.proprietaireName,
    )

    // Envoyer le message
    sendMessage(conversation.id, user.id, user.username, listing.proprietaireId, message.trim())

    toast({
      title: "Message envoyé",
      description: "Le propriétaire recevra votre message",
    })

    setIsLoading(false)
    setIsOpen(false)
    setMessage("")

    // Rediriger vers la page des messages
    router.push("/messages")
  }

  return (
    <>
      <Button onClick={handleClick} className="w-full">
        <MessageCircle className="h-4 w-4 mr-2" />
        Contacter le propriétaire
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contacter le propriétaire</DialogTitle>
            <DialogDescription>Envoyez un message à {listing.proprietaireName}</DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="message">Votre message</Label>
            <Textarea
              id="message"
              placeholder="Bonjour, je suis intéressé par votre logement..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSend} disabled={!message.trim() || isLoading}>
              {isLoading ? "Envoi..." : "Envoyer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
