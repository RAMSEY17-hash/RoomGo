import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Listing } from "@/lib/types"
import { MapPin, School, MessageCircle } from "lucide-react"

interface ListingCardProps {
  listing: Listing
  showStatus?: boolean
}

export function ListingCard({ listing, showStatus = false }: ListingCardProps) {
  const typeLabels = {
    chambre: "Chambre",
    studio: "Studio",
    appartement: "Appartement",
  }

  const statusLabels = {
    en_attente: "En attente",
    validee: "Validée",
    rejetee: "Rejetée",
  }

  const statusColors = {
    en_attente: "bg-yellow-500",
    validee: "bg-green-500",
    rejetee: "bg-red-500",
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/listings/${listing.id}`}>
        <div className="relative h-48 w-full overflow-hidden bg-muted">
          <Image
            src={listing.images[0] || "/placeholder.svg?height=200&width=400"}
            alt={listing.titre}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
          />
          {showStatus && (
            <Badge className={`absolute top-2 right-2 ${statusColors[listing.status]}`}>
              {statusLabels[listing.status]}
            </Badge>
          )}
        </div>
      </Link>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/listings/${listing.id}`} className="flex-1">
            <h3 className="font-semibold text-lg line-clamp-2 hover:text-primary transition-colors">{listing.titre}</h3>
          </Link>
          <Badge variant="secondary">{typeLabels[listing.type]}</Badge>
        </div>
        <p className="text-2xl font-bold text-primary">{listing.prix.toLocaleString()} FCFA/mois</p>
      </CardHeader>

      <CardContent className="space-y-2 pb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span>{listing.quartier}</span>
        </div>
        {listing.ecolesProches.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <School className="h-4 w-4 flex-shrink-0" />
            <span className="line-clamp-1">{listing.ecolesProches.join(", ")}</span>
          </div>
        )}
        <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <Button asChild variant="outline" className="w-full bg-transparent">
          <Link href={`/messages?proprietaire=${listing.proprietaireId}&listing=${listing.id}`}>
            <MessageCircle className="h-4 w-4 mr-2" />
            Contacter le propriétaire
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
