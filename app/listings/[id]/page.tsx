"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Header } from "@/components/header"
import { MessageButton } from "@/components/message-button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"
import { mockListings } from "@/lib/mock-data"
import type { Listing } from "@/lib/types"
import { MapPin, Phone, Home, Ruler, Bed, CheckCircle } from "lucide-react"

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [listing, setListing] = useState<Listing | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
      return
    }

    if (params.id) {
      // Charger l'annonce
      const listingsStr = localStorage.getItem("lome_housing_listings")
      const storedListings: Listing[] = listingsStr ? JSON.parse(listingsStr) : []
      const allListings = [...mockListings, ...storedListings]

      const found = allListings.find((l) => l.id === params.id)
      setListing(found || null)
    }
  }, [params.id, user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Annonce introuvable</p>
            <button onClick={() => router.back()} className="text-primary hover:underline">
              Retour
            </button>
          </div>
        </main>
      </div>
    )
  }

  const typeLabels = {
    chambre: "Chambre",
    studio: "Studio",
    appartement: "Appartement",
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container max-w-6xl">
          {/* Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {listing.images.map((image, index) => (
              <div key={index} className="relative h-96 overflow-hidden rounded-lg bg-muted">
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${listing.titre} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Informations principales */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{typeLabels[listing.type]}</Badge>
                  {listing.status === "validee" && (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Validée
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold mb-2">{listing.titre}</h1>
                <p className="text-2xl font-bold text-primary">{listing.prix.toLocaleString()} FCFA/mois</p>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">Description</h2>
                  <p className="text-muted-foreground whitespace-pre-line">{listing.description}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">Caractéristiques</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Home className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Type</p>
                        <p className="font-medium">{typeLabels[listing.type]}</p>
                      </div>
                    </div>

                    {listing.superficie && (
                      <div className="flex items-center gap-2">
                        <Ruler className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Superficie</p>
                          <p className="font-medium">{listing.superficie} m²</p>
                        </div>
                      </div>
                    )}

                    {listing.nombreChambres && (
                      <div className="flex items-center gap-2">
                        <Bed className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Chambres</p>
                          <p className="font-medium">{listing.nombreChambres}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {listing.equipements && listing.equipements.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-4">Équipements</h2>
                    <div className="flex flex-wrap gap-2">
                      {listing.equipements.map((equipement, index) => (
                        <Badge key={index} variant="outline">
                          {equipement}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">Écoles à proximité</h2>
                  <div className="flex flex-wrap gap-2">
                    {listing.ecolesProches.map((ecole, index) => (
                      <Badge key={index} variant="secondary">
                        {ecole}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar contact */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Propriétaire</h3>
                    <p className="text-muted-foreground">{listing.proprietaireName}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">{listing.quartier}</p>
                        <p className="text-sm text-muted-foreground">{listing.adresse}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <p className="font-medium">{listing.telephone}</p>
                    </div>
                  </div>

                  {user.type === "etudiant" && user.id !== listing.proprietaireId && (
                    <MessageButton listing={listing} />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
