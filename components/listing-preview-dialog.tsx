"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MapPin, Phone, Home, Wifi, Zap, Droplet, Shield, School } from "lucide-react"

interface Listing {
  id: string
  owner_id: string
  title: string
  description: string
  type: string
  price: number
  quartier: string
  nearby_schools: string[]
  address: string
  amenities: string[]
  images: string[]
  status: string
  owner_key: string | null
  created_at: string
  updated_at: string
  users?: {
    username: string
    phone: string
  }
}

interface ListingPreviewDialogProps {
  listing: Listing | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const typeLabels: Record<string, string> = {
  chambre: "Chambre",
  studio: "Studio",
  appartement: "Appartement",
}

const amenityIcons: Record<string, any> = {
  wifi: Wifi,
  electricite: Zap,
  eau: Droplet,
  securite: Shield,
}

export function ListingPreviewDialog({ listing, open, onOpenChange }: ListingPreviewDialogProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  if (!listing) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{listing.title}</DialogTitle>
          <DialogDescription>Vérifiez tous les détails et images avant de valider cette annonce</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            {/* Galerie d'images */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Images du logement ({listing.images.length})
                </h3>
                <Badge variant="outline">
                  Image {selectedImageIndex + 1} / {listing.images.length}
                </Badge>
              </div>

              {/* Image principale */}
              <div className="relative h-96 w-full overflow-hidden rounded-lg bg-muted border-2 border-border">
                <Image
                  src={listing.images[selectedImageIndex] || "/placeholder.svg"}
                  alt={`${listing.title} - Image ${selectedImageIndex + 1}`}
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              {/* Miniatures */}
              {listing.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {listing.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative h-20 overflow-hidden rounded-lg border-2 transition-all ${
                        selectedImageIndex === index
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`Miniature ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  ⚠️ <strong>Vérification importante :</strong> Assurez-vous que toutes les images correspondent bien à
                  un logement réel et ne contiennent pas de contenu inapproprié.
                </p>
              </div>
            </div>

            {/* Informations principales */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Type de logement</p>
                <Badge variant="secondary" className="text-base">
                  {typeLabels[listing.type]}
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Prix mensuel</p>
                <p className="text-2xl font-bold text-primary">{listing.price.toLocaleString()} FCFA</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Quartier</p>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{listing.quartier}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Adresse complète</p>
                <p className="font-medium">{listing.address}</p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="font-semibold">Description</h3>
              <p className="text-muted-foreground leading-relaxed">{listing.description}</p>
            </div>

            {/* Équipements */}
            {listing.amenities.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Équipements disponibles</h3>
                <div className="flex flex-wrap gap-2">
                  {listing.amenities.map((amenity) => {
                    const Icon = amenityIcons[amenity] || Home
                    return (
                      <Badge key={amenity} variant="outline" className="gap-1">
                        <Icon className="h-3 w-3" />
                        {amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                      </Badge>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Écoles à proximité */}
            {listing.nearby_schools.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <School className="h-4 w-4" />
                  Écoles à proximité
                </h3>
                <div className="flex flex-wrap gap-2">
                  {listing.nearby_schools.map((school) => (
                    <Badge key={school} variant="secondary">
                      {school}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Informations du propriétaire */}
            <div className="border-t pt-4 space-y-3">
              <h3 className="font-semibold">Informations du propriétaire</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Nom</p>
                  <p className="font-medium">{listing.users?.username}</p>
                </div>

                {listing.users?.phone && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Téléphone</p>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{listing.users.phone}</p>
                    </div>
                  </div>
                )}

                {listing.owner_key && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Clé propriétaire</p>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <p className="font-mono text-sm font-semibold">{listing.owner_key}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Date de soumission</p>
                  <p className="font-medium">{new Date(listing.created_at).toLocaleDateString("fr-FR")}</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
