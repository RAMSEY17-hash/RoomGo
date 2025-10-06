"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/auth-provider"
import { createClient } from "@/lib/supabase/client"
import { Users, Search, Shield, UserX, Eye, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface UserData {
  id: string
  email: string
  username: string
  user_type: string
  phone: string | null
  owner_key: string | null
  created_at: string
  is_active: boolean
}

export default function UsersManagementPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState<UserData[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && (!user || user.type !== "admin")) {
      router.push("/")
      return
    }

    if (user) {
      loadUsers()
    }
  }, [user, isLoading, router])

  useEffect(() => {
    filterUsers()
  }, [searchTerm, filterType, users])

  const loadUsers = async () => {
    const supabase = createClient()

    const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

    if (!error && data) {
      setUsers(data)
    }
  }

  const filterUsers = () => {
    let filtered = users

    // Filtrer par type
    if (filterType !== "all") {
      filtered = filtered.filter((u) => u.user_type === filterType)
    }

    // Filtrer par recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (u.owner_key && u.owner_key.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    setFilteredUsers(filtered)
  }

  const handleViewDetails = (userData: UserData) => {
    setSelectedUser(userData)
    setIsDetailDialogOpen(true)
  }

  const handleToggleActive = async (userData: UserData) => {
    const supabase = createClient()

    const { error } = await supabase.from("users").update({ is_active: !userData.is_active }).eq("id", userData.id)

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de l'utilisateur",
        variant: "destructive",
      })
      return
    }

    toast({
      title: userData.is_active ? "Compte désactivé" : "Compte activé",
      description: userData.is_active
        ? "L'utilisateur ne peut plus se connecter"
        : "L'utilisateur peut maintenant se connecter",
    })

    loadUsers()
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    const supabase = createClient()

    const { error } = await supabase.from("users").delete().eq("id", selectedUser.id)

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'utilisateur",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Utilisateur supprimé",
      description: "Le compte a été définitivement supprimé",
    })

    setIsDeleteDialogOpen(false)
    setSelectedUser(null)
    loadUsers()
  }

  if (isLoading || !user || user.type !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const proprietaires = users.filter((u) => u.user_type === "proprietaire")
  const particuliers = users.filter((u) => u.user_type === "student")
  const admins = users.filter((u) => u.user_type === "admin")

  const userTypeLabels: Record<string, string> = {
    student: "Particulier",
    proprietaire: "Propriétaire",
    admin: "Administrateur",
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container">
          <div className="mb-8 flex items-center gap-4">
            <Link href="/admin">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold mb-2">Gestion des utilisateurs</h1>
              <p className="text-muted-foreground">Gérez tous les comptes de la plateforme</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total utilisateurs</p>
                    <p className="text-2xl font-bold">{users.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Propriétaires</p>
                    <p className="text-2xl font-bold">{proprietaires.length}</p>
                  </div>
                  <Shield className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Particuliers</p>
                    <p className="text-2xl font-bold">{particuliers.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Administrateurs</p>
                    <p className="text-2xl font-bold">{admins.length}</p>
                  </div>
                  <Shield className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtres et recherche */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filtres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom, email ou clé..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Type d'utilisateur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="student">Particuliers</SelectItem>
                    <SelectItem value="proprietaire">Propriétaires</SelectItem>
                    <SelectItem value="admin">Administrateurs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Table des utilisateurs */}
          <Card>
            <CardHeader>
              <CardTitle>Liste des utilisateurs ({filteredUsers.length})</CardTitle>
              <CardDescription>Toutes les données sensibles sont chiffrées avec AES-256-GCM</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom d'utilisateur</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Clé proprio</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date création</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((userData) => (
                        <TableRow key={userData.id}>
                          <TableCell className="font-medium">{userData.username}</TableCell>
                          <TableCell>{userData.email}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                userData.user_type === "admin"
                                  ? "default"
                                  : userData.user_type === "proprietaire"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {userTypeLabels[userData.user_type]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {userData.phone ? (
                              <span className="text-xs font-mono bg-muted px-2 py-1 rounded">🔒 Chiffré</span>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {userData.owner_key ? <span className="text-xs font-mono">{userData.owner_key}</span> : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={userData.is_active ? "default" : "destructive"}>
                              {userData.is_active ? "Actif" : "Inactif"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(userData.created_at).toLocaleDateString("fr-FR")}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleViewDetails(userData)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant={userData.is_active ? "destructive" : "default"}
                                onClick={() => handleToggleActive(userData)}
                              >
                                {userData.is_active ? "Désactiver" : "Activer"}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          Aucun utilisateur trouvé
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Dialog détails utilisateur */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de l'utilisateur</DialogTitle>
            <DialogDescription>Informations complètes du compte</DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nom d'utilisateur</p>
                  <p className="text-base font-semibold">{selectedUser.username}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-base">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type de compte</p>
                  <Badge
                    variant={
                      selectedUser.user_type === "admin"
                        ? "default"
                        : selectedUser.user_type === "proprietaire"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {userTypeLabels[selectedUser.user_type]}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Statut</p>
                  <Badge variant={selectedUser.is_active ? "default" : "destructive"}>
                    {selectedUser.is_active ? "Actif" : "Inactif"}
                  </Badge>
                </div>
                {selectedUser.phone && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
                    <p className="text-xs font-mono bg-muted px-2 py-1 rounded inline-block">
                      🔒 Données chiffrées (AES-256)
                    </p>
                  </div>
                )}
                {selectedUser.owner_key && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Clé propriétaire</p>
                    <p className="text-sm font-mono bg-muted px-2 py-1 rounded inline-block">
                      {selectedUser.owner_key}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date de création</p>
                  <p className="text-base">
                    {new Date(selectedUser.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID utilisateur</p>
                  <p className="text-xs font-mono">{selectedUser.id}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">
                  🔐 Sécurité : Les données sensibles (téléphone, adresse) sont chiffrées avec AES-256-GCM avant
                  stockage
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Fermer
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setIsDetailDialogOpen(false)
                setIsDeleteDialogOpen(true)
              }}
            >
              <UserX className="h-4 w-4 mr-2" />
              Supprimer le compte
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog confirmation suppression */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l'utilisateur</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Toutes les données de l'utilisateur seront définitivement supprimées.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm">
                Vous êtes sur le point de supprimer le compte de{" "}
                <span className="font-semibold">{selectedUser.username}</span> ({selectedUser.email})
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
