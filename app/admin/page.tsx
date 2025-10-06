"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { useAuth } from "@/components/auth-provider"
import { mockListings } from "@/lib/mock-data"
import { getAllProprioKeys } from "@/lib/auth"
import type { Listing } from "@/lib/types"
import { CheckCircle, XCircle, Eye, MapPin, Phone, Key, Users, HomeIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [listings, setListings] = useState<Listing[]>([])
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [proprietaireKeys, setProprietaireKeys] = useState<string[]>([])

  useEffect(() => {
    if (!isLoading && (!user || user.type !== "admin")) {
      router.push("/")
      return
    }

    if (user) {
      // Charger les annonces
      const listingsStr = localStorage.getItem("lome_housing_listings")
      const storedListings: Listing[] = listingsStr ? JSON.parse(listingsStr) : []
      const allListings = [...mockListings, ...storedListings]
      setListings(allListings)

      // Charger les clés propriétaires
      const keys = getAllProprioKeys()
      setProprietaireKeys(keys)
    }
  }, [user, isLoading, router])

  const handleApprove = (listing: Listing) => {
    setSelectedListing(listing)
    setActionType("approve")
    setIsDialogOpen(true)
  }

  const handleReject = (listing: Listing) => {
    setSelectedListing(listing)
    setActionType("reject")
    setRejectReason("")
    setIsDialogOpen(true)
  }

  const confirmAction = () => {
    if (!selectedListing) return

    const updatedListings = listings.map((l) => {
      if (l.id === selectedListing.id) {
        return {
          ...l,
          status: actionType === "approve" ? ("validee" as const) : ("rejetee" as const),
          updatedAt: new Date().toISOString(),
        }
      }
      return l
    })

    setListings(updatedListings)

    // Sauvegarder dans localStorage
    const storedListings = updatedListings.filter((l) => !mockListings.find((m) => m.id === l.id))
    localStorage.setItem("lome_housing_listings", JSON.stringify(storedListings))

    toast({
      title: actionType === "approve" ? "Annonce validée" : "Annonce rejetée",
      description:
        actionType === "approve"
          ? "L'annonce est maintenant visible par tous les utilisateurs"
          : "Le propriétaire sera notifié du rejet",
    })

    setIsDialogOpen(false)
    setSelectedListing(null)
    setActionType(null)
  }

  if (isLoading || !user || user.type !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const enAttenteListings = listings.filter((l) => l.status === "en_attente")
  const valideesListings = listings.filter((l) => l.status === "validee")
  const rejeteesListings = listings.filter((l) => l.status === "rejetee")

  const typeLabels = {
    chambre: "Chambre",
    studio: "Studio",
    appartement: "Appartement",
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Administration</h1>
            <p className="text-muted-foreground">Gérez les annonces et les clés propriétaires</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">En attente</p>
                    <p className="text-2xl font-bold">{enAttenteListings.length}</p>
                  </div>
                  <HomeIcon className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Validées</p>
                    <p className="text-2xl font-bold">{valideesListings.length}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Rejetées</p>
                    <p className="text-2xl font-bold">{rejeteesListings.length}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{listings.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList>
              <TabsTrigger value="pending">En attente ({enAttenteListings.length})</TabsTrigger>
              <TabsTrigger value="approved">Validées ({valideesListings.length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejetées ({rejeteesListings.length})</TabsTrigger>
              <TabsTrigger value="keys">Clés propriétaires</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {enAttenteListings.length > 0 ? (
                enAttenteListings.map((listing) => (
                  <Card key={listing.id}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="relative h-48 w-full md:w-64 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                          <Image
                            src={listing.images[0] || "/placeholder.svg"}
                            alt={listing.titre}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-xl font-semibold mb-1">{listing.titre}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Badge variant="secondary">{typeLabels[listing.type]}</Badge>
                                <span>•</span>
                                <span>Par {listing.proprietaireName}</span>
                              </div>
                            </div>
                            <p className="text-xl font-bold text-primary">{listing.prix.toLocaleString()} FCFA/mois</p>
                          </div>

                          <p className="text-muted-foreground line-clamp-2">{listing.description}</p>

                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{listing.quartier}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{listing.telephone}</span>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button size="sm" variant="outline" asChild>
                              <a href={`/listings/${listing.id}`} target="_blank" rel="noopener noreferrer">
                                <Eye className="h-4 w-4 mr-2" />
                                Voir détails
                              </a>
                            </Button>
                            <Button size="sm" variant="default" onClick={() => handleApprove(listing)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Valider
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleReject(listing)}>
                              <XCircle className="h-4 w-4 mr-2" />
                              Rejeter
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Aucune annonce en attente de validation</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4">
              {valideesListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {valideesListings.map((listing) => (
                    <Card key={listing.id}>
                      <CardContent className="pt-6">
                        <div className="relative h-32 w-full overflow-hidden rounded-lg bg-muted mb-3">
                          <Image
                            src={listing.images[0] || "/placeholder.svg"}
                            alt={listing.titre}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <h3 className="font-semibold mb-1 line-clamp-1">{listing.titre}</h3>
                        <p className="text-sm text-muted-foreground mb-2">Par {listing.proprietaireName}</p>
                        <p className="text-lg font-bold text-primary">{listing.prix.toLocaleString()} FCFA/mois</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Aucune annonce validée</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4">
              {rejeteesListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rejeteesListings.map((listing) => (
                    <Card key={listing.id}>
                      <CardContent className="pt-6">
                        <div className="relative h-32 w-full overflow-hidden rounded-lg bg-muted mb-3">
                          <Image
                            src={listing.images[0] || "/placeholder.svg"}
                            alt={listing.titre}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <h3 className="font-semibold mb-1 line-clamp-1">{listing.titre}</h3>
                        <p className="text-sm text-muted-foreground mb-2">Par {listing.proprietaireName}</p>
                        <p className="text-lg font-bold text-primary">{listing.prix.toLocaleString()} FCFA/mois</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Aucune annonce rejetée</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="keys">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Clés propriétaires actives
                  </CardTitle>
                  <CardDescription>
                    Ces clés permettent aux propriétaires de créer des comptes et de publier des annonces
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {proprietaireKeys.map((key, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg font-mono text-sm"
                      >
                        <span>{key}</span>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionType === "approve" ? "Valider l'annonce" : "Rejeter l'annonce"}</DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "Cette annonce sera visible par tous les utilisateurs."
                : "Le propriétaire sera notifié du rejet de son annonce."}
            </DialogDescription>
          </DialogHeader>

          {actionType === "reject" && (
            <div className="space-y-2">
              <Label htmlFor="reason">Raison du rejet (optionnel)</Label>
              <Textarea
                id="reason"
                placeholder="Expliquez pourquoi cette annonce est rejetée..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant={actionType === "approve" ? "default" : "destructive"} onClick={confirmAction}>
              {actionType === "approve" ? "Valider" : "Rejeter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
