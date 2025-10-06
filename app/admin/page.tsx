"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
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
import { createClient } from "@/lib/supabase/client"
import { CheckCircle, XCircle, Eye, MapPin, Phone, Key, HomeIcon, Users, LogOut, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ListingPreviewDialog } from "@/components/listing-preview-dialog"
import { Logo } from "@/components/logo"

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
  owner_key: string | null // Added owner_key field
  created_at: string
  updated_at: string
  users?: {
    username: string
    phone: string
  }
}

interface OwnerKey {
  id: string
  key_value: string
  is_used: boolean
  owner_email: string | null
  created_at: string
}

export default function AdminPage() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [listings, setListings] = useState<Listing[]>([])
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [ownerKeys, setOwnerKeys] = useState<OwnerKey[]>([])
  const [previewListing, setPreviewListing] = useState<Listing | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && (!user || user.type !== "admin")) {
      router.push("/admin/login")
      return
    }

    if (user) {
      loadData()
    }
  }, [user, isLoading, router])

  const loadData = async () => {
    const supabase = createClient()

    const { data: listingsData, error: listingsError } = await supabase
      .from("listings")
      .select(`
        *,
        users (
          username,
          phone
        )
      `)
      .order("created_at", { ascending: false })

    if (!listingsError && listingsData) {
      setListings(listingsData)
    }

    const { data: keysData, error: keysError } = await supabase
      .from("owner_keys")
      .select("*")
      .order("created_at", { ascending: false })

    if (!keysError && keysData) {
      setOwnerKeys(keysData)
    }
  }

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

  const handlePreview = (listing: Listing) => {
    setPreviewListing(listing)
    setIsPreviewOpen(true)
  }

  const confirmAction = async () => {
    if (!selectedListing) return

    const supabase = createClient()

    const { error } = await supabase
      .from("listings")
      .update({
        status: actionType === "approve" ? "approved" : "rejected",
        rejection_reason: actionType === "reject" ? rejectReason : null,
      })
      .eq("id", selectedListing.id)

    if (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      })
      return
    }

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
    loadData()
  }

  const handleLogout = () => {
    logout()
    router.push("/admin/login")
  }

  if (isLoading || !user || user.type !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const pendingListings = listings.filter((l) => l.status === "pending")
  const approvedListings = listings.filter((l) => l.status === "approved")
  const rejectedListings = listings.filter((l) => l.status === "rejected")

  const typeLabels: Record<string, string> = {
    chambre: "Chambre",
    studio: "Studio",
    appartement: "Appartement",
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Admin: {user.username}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8">
        <div className="container">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Administration</h1>
              <p className="text-muted-foreground">Gérez les annonces et les utilisateurs</p>
            </div>
            <Link href="/admin/users">
              <Button>
                <Users className="h-4 w-4 mr-2" />
                Gérer les utilisateurs
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">En attente</p>
                    <p className="text-2xl font-bold">{pendingListings.length}</p>
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
                    <p className="text-2xl font-bold">{approvedListings.length}</p>
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
                    <p className="text-2xl font-bold">{rejectedListings.length}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Clés actives</p>
                    <p className="text-2xl font-bold">{ownerKeys.filter((k) => k.is_used).length}</p>
                  </div>
                  <Key className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList>
              <TabsTrigger value="pending">En attente ({pendingListings.length})</TabsTrigger>
              <TabsTrigger value="approved">Validées ({approvedListings.length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejetées ({rejectedListings.length})</TabsTrigger>
              <TabsTrigger value="keys">Clés propriétaires</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {pendingListings.length > 0 ? (
                pendingListings.map((listing) => (
                  <Card key={listing.id}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="relative h-48 w-full md:w-64 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                          <Image
                            src={listing.images[0] || "/placeholder.svg"}
                            alt={listing.title}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-xl font-semibold mb-1">{listing.title}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                                <Badge variant="secondary">{typeLabels[listing.type]}</Badge>
                                <span>•</span>
                                <span>Par {listing.users?.username}</span>
                                {listing.owner_key && (
                                  <>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                      <Shield className="h-3 w-3" />
                                      <span className="font-mono text-xs">{listing.owner_key}</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                            <p className="text-xl font-bold text-primary">{listing.price.toLocaleString()} FCFA/mois</p>
                          </div>

                          <p className="text-muted-foreground line-clamp-2">{listing.description}</p>

                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{listing.quartier}</span>
                            </div>
                            {listing.users?.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{listing.users.phone}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button size="sm" variant="outline" onClick={() => handlePreview(listing)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Voir toutes les images
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
              {approvedListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {approvedListings.map((listing) => (
                    <Card key={listing.id}>
                      <CardContent className="pt-6">
                        <div className="relative h-32 w-full overflow-hidden rounded-lg bg-muted mb-3">
                          <Image
                            src={listing.images[0] || "/placeholder.svg"}
                            alt={listing.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <h3 className="font-semibold mb-1 line-clamp-1">{listing.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">Par {listing.users?.username}</p>
                        <p className="text-lg font-bold text-primary">{listing.price.toLocaleString()} FCFA/mois</p>
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
              {rejectedListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rejectedListings.map((listing) => (
                    <Card key={listing.id}>
                      <CardContent className="pt-6">
                        <div className="relative h-32 w-full overflow-hidden rounded-lg bg-muted mb-3">
                          <Image
                            src={listing.images[0] || "/placeholder.svg"}
                            alt={listing.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <h3 className="font-semibold mb-1 line-clamp-1">{listing.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">Par {listing.users?.username}</p>
                        <p className="text-lg font-bold text-primary">{listing.price.toLocaleString()} FCFA/mois</p>
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
                    Clés propriétaires
                  </CardTitle>
                  <CardDescription>Toutes les clés générées pour les propriétaires</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {ownerKeys.map((key) => (
                      <div key={key.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex-1">
                          <p className="font-mono text-sm font-semibold">{key.key_value}</p>
                          {key.owner_email && <p className="text-xs text-muted-foreground mt-1">{key.owner_email}</p>}
                        </div>
                        <Badge variant={key.is_used ? "default" : "secondary"}>
                          {key.is_used ? "Utilisée" : "Non utilisée"}
                        </Badge>
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

      {/* Listing Preview Dialog */}
      <ListingPreviewDialog listing={previewListing} open={isPreviewOpen} onOpenChange={setIsPreviewOpen} />
    </div>
  )
}
