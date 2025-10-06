"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { ListingCard } from "@/components/listing-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-provider"
import type { Listing } from "@/lib/types"
import { PlusCircle } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function MyListingsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createBrowserClient()

  useEffect(() => {
    if (!isLoading && (!user || user.type !== "proprietaire")) {
      router.push("/")
      return
    }

    if (user) {
      loadListings()
    }
  }, [user, isLoading, router])

  const loadListings = async () => {
    try {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("proprietaire_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      // Transform database format to app format
      const transformedListings: Listing[] = (data || []).map((item) => ({
        id: item.id,
        titre: item.titre,
        description: item.description,
        type: item.type,
        prix: item.prix,
        quartier: item.quartier,
        ecolesProches: item.ecoles_proches || [],
        images: item.images || [],
        proprietaireId: item.proprietaire_id,
        proprietaireNom: item.proprietaire_nom,
        status: item.status,
        datePublication: item.created_at,
        superficie: item.superficie,
        nombrePieces: item.nombre_pieces,
        equipements: item.equipements || [],
      }))

      setListings(transformedListings)
    } catch (error) {
      console.error("[v0] Error loading listings:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger vos annonces",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteListing = async (listingId: string) => {
    try {
      const { error } = await supabase.from("listings").delete().eq("id", listingId)

      if (error) throw error

      toast({
        title: "Annonce supprimée",
        description: "Votre annonce a été supprimée avec succès",
      })

      // Refresh listings
      loadListings()
    } catch (error) {
      console.error("[v0] Error deleting listing:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'annonce",
        variant: "destructive",
      })
    }
  }

  if (isLoading || loading || !user || user.type !== "proprietaire") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const enAttenteListings = listings.filter((l) => l.status === "en_attente")
  const valideesListings = listings.filter((l) => l.status === "validee")
  const rejeteesListings = listings.filter((l) => l.status === "rejetee")

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Mes annonces</h1>
              <p className="text-muted-foreground">Gérez vos annonces de logements</p>
            </div>
            <Button asChild>
              <Link href="/listings/create">
                <PlusCircle className="h-4 w-4 mr-2" />
                Nouvelle annonce
              </Link>
            </Button>
          </div>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">Toutes ({listings.length})</TabsTrigger>
              <TabsTrigger value="en_attente">En attente ({enAttenteListings.length})</TabsTrigger>
              <TabsTrigger value="validee">Validées ({valideesListings.length})</TabsTrigger>
              <TabsTrigger value="rejetee">Rejetées ({rejeteesListings.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {listings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} showStatus isOwner onDelete={handleDeleteListing} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">Vous n'avez pas encore d'annonces</p>
                  <Button asChild>
                    <Link href="/listings/create">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Créer votre première annonce
                    </Link>
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="en_attente">
              {enAttenteListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enAttenteListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} showStatus isOwner onDelete={handleDeleteListing} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Aucune annonce en attente</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="validee">
              {valideesListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {valideesListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} showStatus isOwner onDelete={handleDeleteListing} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Aucune annonce validée</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="rejetee">
              {rejeteesListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rejeteesListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} showStatus isOwner onDelete={handleDeleteListing} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Aucune annonce rejetée</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
