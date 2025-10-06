"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { StatsSection } from "@/components/stats-section"
import { ListingCard } from "@/components/listing-card"
import { FiltersSidebar, type FilterOptions } from "@/components/filters-sidebar"
import { ActiveFilters } from "@/components/active-filters"
import { useAuth } from "@/components/auth-provider"
import { mockListings } from "@/lib/mock-data"
import { filterListings, getActiveFiltersCount } from "@/lib/filter-utils"
import type { Listing, ListingType, Quartier, Ecole } from "@/lib/types"

const DEFAULT_FILTERS: FilterOptions = {
  types: [],
  priceRange: [0, 200000],
  quartiers: [],
  ecoles: [],
}

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [allListings, setAllListings] = useState<Listing[]>([])
  const [filteredListings, setFilteredListings] = useState<Listing[]>([])
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS)

  useEffect(() => {
    // Rediriger vers la page de connexion si non authentifié
    if (!isLoading && !user) {
      router.push("/auth/login")
      return
    }

    // Charger les annonces validées
    if (user) {
      const validatedListings = mockListings.filter((l) => l.status === "validee")
      setAllListings(validatedListings)
      setFilteredListings(validatedListings)
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const filtered = filterListings(allListings, filters)
    setFilteredListings(filtered)
  }, [filters, allListings])

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
  }

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS)
  }

  const handleRemoveType = (type: ListingType) => {
    setFilters({
      ...filters,
      types: filters.types.filter((t) => t !== type),
    })
  }

  const handleRemoveQuartier = (quartier: Quartier) => {
    setFilters({
      ...filters,
      quartiers: filters.quartiers.filter((q) => q !== quartier),
    })
  }

  const handleRemoveEcole = (ecole: Ecole) => {
    setFilters({
      ...filters,
      ecoles: filters.ecoles.filter((e) => e !== ecole),
    })
  }

  const handleResetPrice = () => {
    setFilters({
      ...filters,
      priceRange: [0, 200000],
    })
  }

  const activeFiltersCount = getActiveFiltersCount(filters)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <HeroSection />
        <StatsSection />

        <section className="py-12">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Filters sidebar */}
              <aside className="lg:col-span-1">
                <FiltersSidebar
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onReset={handleResetFilters}
                  activeFiltersCount={activeFiltersCount}
                />
              </aside>

              {/* Listings */}
              <div className="lg:col-span-3">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold mb-2">Logements disponibles</h2>
                  <p className="text-muted-foreground">
                    {filteredListings.length} logement{filteredListings.length !== 1 ? "s" : ""} trouvé
                    {filteredListings.length !== 1 ? "s" : ""}
                  </p>
                </div>

                <ActiveFilters
                  filters={filters}
                  onRemoveType={handleRemoveType}
                  onRemoveQuartier={handleRemoveQuartier}
                  onRemoveEcole={handleRemoveEcole}
                  onResetPrice={handleResetPrice}
                  onResetAll={handleResetFilters}
                />

                {filteredListings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredListings.map((listing) => (
                      <ListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">Aucun logement ne correspond à vos critères</p>
                    <button onClick={handleResetFilters} className="text-primary hover:underline font-medium">
                      Réinitialiser les filtres
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 bg-muted/50">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Lomé Housing. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}
