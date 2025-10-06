"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "./auth-provider"
import { createClient } from "@/lib/supabase/client"
import type { ListingType, Quartier, Ecole } from "@/lib/types"
import { AlertCircle, Plus, X } from "lucide-react"

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

const EQUIPEMENTS_COMMUNS = [
  "Lit",
  "Armoire",
  "Bureau",
  "Ventilateur",
  "Climatisation",
  "Eau courante",
  "Électricité",
  "Cuisine équipée",
  "Salle de bain privée",
  "Parking",
  "Internet",
  "Gardien",
]

interface ListingFormProps {
  initialData?: any
  isEditing?: boolean
}

export function ListingForm({ initialData, isEditing = false }: ListingFormProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    type: (initialData?.type || "chambre") as ListingType,
    titre: initialData?.titre || "",
    description: initialData?.description || "",
    prix: initialData?.prix?.toString() || "",
    quartier: (initialData?.quartier || "") as Quartier,
    adresse: initialData?.adresse || "",
    telephone: initialData?.telephone || "",
    superficie: initialData?.superficie?.toString() || "",
    nombreChambres: initialData?.nombreChambres?.toString() || "",
    ecolesProches: initialData?.ecolesProches || ([] as Ecole[]),
    equipements: initialData?.equipements || ([] as string[]),
  })

  const [customEquipement, setCustomEquipement] = useState("")

  const handleEcoleToggle = (ecole: Ecole) => {
    setFormData({
      ...formData,
      ecolesProches: formData.ecolesProches.includes(ecole)
        ? formData.ecolesProches.filter((e) => e !== ecole)
        : [...formData.ecolesProches, ecole],
    })
  }

  const handleEquipementToggle = (equipement: string) => {
    setFormData({
      ...formData,
      equipements: formData.equipements.includes(equipement)
        ? formData.equipements.filter((e) => e !== equipement)
        : [...formData.equipements, equipement],
    })
  }

  const handleAddCustomEquipement = () => {
    if (customEquipement.trim() && !formData.equipements.includes(customEquipement.trim())) {
      setFormData({
        ...formData,
        equipements: [...formData.equipements, customEquipement.trim()],
      })
      setCustomEquipement("")
    }
  }

  const handleRemoveEquipement = (equipement: string) => {
    setFormData({
      ...formData,
      equipements: formData.equipements.filter((e) => e !== equipement),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Validation
    if (
      !formData.titre ||
      !formData.description ||
      !formData.prix ||
      !formData.quartier ||
      !formData.adresse ||
      !formData.telephone
    ) {
      setError("Veuillez remplir tous les champs obligatoires")
      setIsLoading(false)
      return
    }

    if (formData.ecolesProches.length === 0) {
      setError("Veuillez sélectionner au moins une école à proximité")
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("owner_key, username")
        .eq("id", user!.id)
        .single()

      if (userError) throw userError

      const listingData = {
        owner_id: user!.id,
        title: formData.titre,
        description: formData.description,
        type: formData.type,
        price: Number.parseInt(formData.prix),
        quartier: formData.quartier,
        nearby_schools: formData.ecolesProches,
        address: formData.adresse,
        amenities: formData.equipements,
        images: ["/placeholder.svg?height=400&width=600"],
        status: "pending",
        owner_key: userData.owner_key, // Link listing to owner key
      }

      if (isEditing && initialData?.id) {
        const { error: updateError } = await supabase.from("listings").update(listingData).eq("id", initialData.id)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase.from("listings").insert(listingData)

        if (insertError) throw insertError
      }

      router.push("/listings/my-listings")
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
          <CardDescription>Décrivez votre logement</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type de logement *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as ListingType })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chambre">Chambre</SelectItem>
                <SelectItem value="studio">Studio</SelectItem>
                <SelectItem value="appartement">Appartement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="titre">Titre de l'annonce *</Label>
            <Input
              id="titre"
              placeholder="Ex: Chambre confortable près de l'IAI"
              value={formData.titre}
              onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Décrivez votre logement en détail..."
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prix">Prix (FCFA/mois) *</Label>
              <Input
                id="prix"
                type="number"
                placeholder="25000"
                value={formData.prix}
                onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="superficie">Superficie (m²)</Label>
              <Input
                id="superficie"
                type="number"
                placeholder="15"
                value={formData.superficie}
                onChange={(e) => setFormData({ ...formData, superficie: e.target.value })}
              />
            </div>
          </div>

          {(formData.type === "appartement" || formData.type === "studio") && (
            <div className="space-y-2">
              <Label htmlFor="nombreChambres">Nombre de chambres</Label>
              <Input
                id="nombreChambres"
                type="number"
                placeholder="1"
                value={formData.nombreChambres}
                onChange={(e) => setFormData({ ...formData, nombreChambres: e.target.value })}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Localisation</CardTitle>
          <CardDescription>Où se trouve votre logement ?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quartier">Quartier *</Label>
            <Select
              value={formData.quartier}
              onValueChange={(value) => setFormData({ ...formData, quartier: value as Quartier })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un quartier" />
              </SelectTrigger>
              <SelectContent>
                {QUARTIERS.map((quartier) => (
                  <SelectItem key={quartier} value={quartier}>
                    {quartier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adresse">Adresse complète *</Label>
            <Input
              id="adresse"
              placeholder="Ex: Tokoin Gbadago, près du carrefour"
              value={formData.adresse}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Écoles à proximité * (au moins une)</Label>
            <div className="grid grid-cols-2 gap-3">
              {ECOLES.map((ecole) => (
                <div key={ecole} className="flex items-center space-x-2">
                  <Checkbox
                    id={`ecole-form-${ecole}`}
                    checked={formData.ecolesProches.includes(ecole)}
                    onCheckedChange={() => handleEcoleToggle(ecole)}
                  />
                  <Label htmlFor={`ecole-form-${ecole}`} className="font-normal cursor-pointer">
                    {ecole}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact</CardTitle>
          <CardDescription>Comment vous contacter ?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="telephone">Numéro de téléphone *</Label>
            <Input
              id="telephone"
              type="tel"
              placeholder="+228 90 12 34 56"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Équipements</CardTitle>
          <CardDescription>Quels équipements sont disponibles ?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {EQUIPEMENTS_COMMUNS.map((equipement) => (
              <div key={equipement} className="flex items-center space-x-2">
                <Checkbox
                  id={`equipement-${equipement}`}
                  checked={formData.equipements.includes(equipement)}
                  onCheckedChange={() => handleEquipementToggle(equipement)}
                />
                <Label htmlFor={`equipement-${equipement}`} className="font-normal cursor-pointer">
                  {equipement}
                </Label>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Ajouter un équipement personnalisé</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: Balcon"
                value={customEquipement}
                onChange={(e) => setCustomEquipement(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddCustomEquipement()
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddCustomEquipement}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {formData.equipements.filter((e) => !EQUIPEMENTS_COMMUNS.includes(e)).length > 0 && (
            <div className="space-y-2">
              <Label>Équipements personnalisés</Label>
              <div className="flex flex-wrap gap-2">
                {formData.equipements
                  .filter((e) => !EQUIPEMENTS_COMMUNS.includes(e))
                  .map((equipement) => (
                    <div
                      key={equipement}
                      className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-md"
                    >
                      <span className="text-sm">{equipement}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 hover:bg-transparent"
                        onClick={() => handleRemoveEquipement(equipement)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? "Enregistrement..." : isEditing ? "Mettre à jour l'annonce" : "Publier l'annonce"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Annuler
        </Button>
      </div>
    </form>
  )
}
