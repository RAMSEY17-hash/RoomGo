import type { Listing } from "./types"
import type { FilterOptions } from "@/components/filters-sidebar"

export function filterListings(listings: Listing[], filters: FilterOptions): Listing[] {
  return listings.filter((listing) => {
    // Filter by type
    if (filters.types.length > 0 && !filters.types.includes(listing.type)) {
      return false
    }

    // Filter by price range
    if (listing.prix < filters.priceRange[0] || listing.prix > filters.priceRange[1]) {
      return false
    }

    // Filter by quartier
    if (filters.quartiers.length > 0 && !filters.quartiers.includes(listing.quartier)) {
      return false
    }

    // Filter by ecoles (at least one match)
    if (filters.ecoles.length > 0) {
      const hasMatchingEcole = listing.ecolesProches.some((ecole) => filters.ecoles.includes(ecole))
      if (!hasMatchingEcole) {
        return false
      }
    }

    return true
  })
}

export function getActiveFiltersCount(filters: FilterOptions): number {
  let count = 0

  count += filters.types.length
  count += filters.quartiers.length
  count += filters.ecoles.length

  // Count price filter if it's not the default range
  if (filters.priceRange[0] > 0 || filters.priceRange[1] < 200000) {
    count += 1
  }

  return count
}
