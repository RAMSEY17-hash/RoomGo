"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ListingType, Quartier, Ecole } from "@/lib/types"
import { X, SlidersHorizontal } from "lucide-react"

export interface FilterOptions {
  types: ListingType[]
  priceRange: [number, number]
  quartiers: Quartier[]
  ecoles: Ecole[]
}

interface FiltersSidebarProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  onReset: () => void
  activeFiltersCount: number
}

const QUARTIERS: Quartier[] = [
  "Adidogomé",
  "Agoè",
  "Bè",
  "Tokoin",
  "Nyékonakpoè",
  "Hédzranawoé",
  "Amoutivé",
  "Légbassito",
  "Cacavéli",
  "Aflao Gakli",
  "Démakpoé",
  "Adewi",
]

const ECOLES: Ecole[] = ["IAI-TOGO", "LBS", "EPL", "Université de Lomé", "ESTBA", "ISMP", "IFAG", "ISCAM", "Autre"]

const TYPES: { value: ListingType; label: string }[] = [
  { value: "chambre", label: "Chambre" },
  { value: "studio", label: "Studio" },
  { value: "appartement", label: "Appartement" },
]

export function FiltersSidebar({ filters, onFiltersChange, onReset, activeFiltersCount }: FiltersSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleTypeToggle = (type: ListingType) => {
    const newTypes = filters.types.includes(type) ? filters.types.filter((t) => t !== type) : [...filters.types, type]
    onFiltersChange({ ...filters, types: newTypes })
  }

  const handleQuartierToggle = (quartier: Quartier) => {
    const newQuartiers = filters.quartiers.includes(quartier)
      ? filters.quartiers.filter((q) => q !== quartier)
      : [...filters.quartiers, quartier]
    onFiltersChange({ ...filters, quartiers: newQuartiers })
  }

  const handleEcoleToggle = (ecole: Ecole) => {
    const newEcoles = filters.ecoles.includes(ecole)
      ? filters.ecoles.filter((e) => e !== ecole)
      : [...filters.ecoles, ecole]
    onFiltersChange({ ...filters, ecoles: newEcoles })
  }

  const handlePriceChange = (value: number[]) => {
    onFiltersChange({ ...filters, priceRange: [value[0], value[1]] })
  }

  return (
    <>
      {/* Mobile toggle button */}
      <div className="lg:hidden mb-4">
        <Button onClick={() => setIsOpen(!isOpen)} variant="outline" className="w-full">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filtres
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filters panel */}
      <div className={`${isOpen ? "block" : "hidden"} lg:block space-y-4`}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg">Filtres</CardTitle>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={onReset}>
                <X className="h-4 w-4 mr-1" />
                Réinitialiser
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Type de logement */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Type de logement</Label>
              <div className="space-y-2">
                {TYPES.map((type) => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type.value}`}
                      checked={filters.types.includes(type.value)}
                      onCheckedChange={() => handleTypeToggle(type.value)}
                    />
                    <Label htmlFor={`type-${type.value}`} className="font-normal cursor-pointer">
                      {type.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Prix */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Prix (FCFA/mois)</Label>
              <div className="pt-2">
                <Slider
                  min={0}
                  max={200000}
                  step={5000}
                  value={filters.priceRange}
                  onValueChange={handlePriceChange}
                  className="mb-4"
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{filters.priceRange[0].toLocaleString()} FCFA</span>
                  <span>{filters.priceRange[1].toLocaleString()} FCFA</span>
                </div>
              </div>
            </div>

            {/* Quartiers */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Quartiers</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {QUARTIERS.map((quartier) => (
                  <div key={quartier} className="flex items-center space-x-2">
                    <Checkbox
                      id={`quartier-${quartier}`}
                      checked={filters.quartiers.includes(quartier)}
                      onCheckedChange={() => handleQuartierToggle(quartier)}
                    />
                    <Label htmlFor={`quartier-${quartier}`} className="font-normal cursor-pointer">
                      {quartier}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Écoles */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Écoles à proximité</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {ECOLES.map((ecole) => (
                  <div key={ecole} className="flex items-center space-x-2">
                    <Checkbox
                      id={`ecole-${ecole}`}
                      checked={filters.ecoles.includes(ecole)}
                      onCheckedChange={() => handleEcoleToggle(ecole)}
                    />
                    <Label htmlFor={`ecole-${ecole}`} className="font-normal cursor-pointer">
                      {ecole}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
