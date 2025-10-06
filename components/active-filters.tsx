"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import type { FilterOptions } from "./filters-sidebar"
import type { ListingType, Quartier, Ecole } from "@/lib/types"

interface ActiveFiltersProps {
  filters: FilterOptions
  onRemoveType: (type: ListingType) => void
  onRemoveQuartier: (quartier: Quartier) => void
  onRemoveEcole: (ecole: Ecole) => void
  onResetPrice: () => void
  onResetAll: () => void
}

const TYPE_LABELS: Record<ListingType, string> = {
  chambre: "Chambre",
  studio: "Studio",
  appartement: "Appartement",
}

export function ActiveFilters({
  filters,
  onRemoveType,
  onRemoveQuartier,
  onRemoveEcole,
  onResetPrice,
  onResetAll,
}: ActiveFiltersProps) {
  const hasActiveFilters =
    filters.types.length > 0 ||
    filters.quartiers.length > 0 ||
    filters.ecoles.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 200000

  if (!hasActiveFilters) return null

  const isPriceFiltered = filters.priceRange[0] > 0 || filters.priceRange[1] < 200000

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <span className="text-sm font-medium text-muted-foreground">Filtres actifs:</span>

      {filters.types.map((type) => (
        <Badge key={type} variant="secondary" className="gap-1">
          {TYPE_LABELS[type]}
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 hover:bg-transparent"
            onClick={() => onRemoveType(type)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}

      {filters.quartiers.map((quartier) => (
        <Badge key={quartier} variant="secondary" className="gap-1">
          {quartier}
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 hover:bg-transparent"
            onClick={() => onRemoveQuartier(quartier)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}

      {filters.ecoles.map((ecole) => (
        <Badge key={ecole} variant="secondary" className="gap-1">
          {ecole}
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 hover:bg-transparent"
            onClick={() => onRemoveEcole(ecole)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}

      {isPriceFiltered && (
        <Badge variant="secondary" className="gap-1">
          {filters.priceRange[0].toLocaleString()} - {filters.priceRange[1].toLocaleString()} FCFA
          <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent" onClick={onResetPrice}>
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      <Button variant="ghost" size="sm" onClick={onResetAll} className="text-destructive">
        Tout effacer
      </Button>
    </div>
  )
}
