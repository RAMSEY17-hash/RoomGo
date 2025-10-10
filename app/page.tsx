"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { StatsSection } from "@/components/stats-section"
import { ListingCard } from "@/components/listing-card"
import { FiltersSidebar, type FilterOptions } from "@/components/filters-sidebar"
import { ActiveFilters } from "@/components/active-filters"
import { useAuth } from "@/components/auth-provider"
import { filterListings, getActiveFiltersCount } from "@/lib/filter-utils"
import type { Listing, ListingType, Quartier, Ecole } from "@/lib/types"
import { createBrowserClient } from "@/lib/supabase/client"
import { mockListings } from "@/lib/mock-data"

const DEFAULT_FILTERS: FilterOptions = {
  types: [],
  priceRange: [0, 200000],
  quartiers: [],
  ecoles: [],
}

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const [allListings, setAllListings] = useState<Listing[]>([])
  const [filteredListings, setFilteredListings] = useState<Listing[]>([])
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS)
  const [isLoadingListings, setIsLoadingListings] = useState(true)

  useEffect(() => {
    const loadListings = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseKey) {
          console.log("[v0] Supabase not configured, using mock data")
          // Use mock data filtered to only show validated listings
          const validatedMockListings = mockListings.filter((listing) => listing.status === "validee")
          setAllListings(validatedMockListings)
          setFilteredListings(validatedMockListings)
          setIsLoadingListings(false)
          return
        }

        const supabase = createBrowserClient()
        console.log("[v0] Loading listings from Supabase...")

        const { data, error } = await supabase
          .from("listings")
          .select("*")
          .eq("status", "validee")
          .order("created_at", { ascending: false })

        if (error) {
          console.error("[v0] Supabase error:", error.message)
          console.log("[v0] Falling back to mock data")
          // Fallback to mock data
          const validatedMockListings = mockListings.filter((listing) => listing.status === "validee")
          setAllListings(validatedMockListings)
          setFilteredListings(validatedMockListings)
          return
        }

        if (data && data.length > 0) {
          console.log(`[v0] Loaded ${data.length} listings from Supabase`)
          setAllListings(data)
          setFilteredListings(data)
        } else {
          console.log("[v0] No listings in database, using mock data")
          // Use mock data if database is empty
          const validatedMockListings = mockListings.filter((listing) => listing.status === "validee")
          setAllListings(validatedMockListings)
          setFilteredListings(validatedMockListings)
        }
      } catch (error) {
        console.error("[v0] Error loading listings:", error)
        console.log("[v0] Using mock data as fallback")
        // Fallback to mock data on any error
        const validatedMockListings = mockListings.filter((listing) => listing.status === "validee")
        setAllListings(validatedMockListings)
        setFilteredListings(validatedMockListings)
      } finally {
        setIsLoadingListings(false)
      }
    }

    loadListings()
  }, [])

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

  if (isLoadingListings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement des logements...</p>
        </div>
      </div>
    )
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
          <p>&copy; 2025 RoomGo. Tous droits réservés.</p>
        </div>
      </footer>

                
    </div>
  )
}
