// Types pour la plateforme de logements Lomé

export type UserType = "particulier" | "proprietaire" | "admin"

export interface User {
  id: string
  username: string
  email: string
  password: string
  type: UserType
  proprietaireKey?: string // Clé aléatoire pour les propriétaires
  createdAt: string
}

export type ListingType = "chambre" | "studio" | "appartement"
export type ListingStatus = "en_attente" | "validee" | "rejetee"

export type Quartier =
  | "Adidogomé"
  | "Agoè"
  | "Bè"
  | "Tokoin"
  | "Nyékonakpoè"
  | "Hédzranawoé"
  | "Amoutivé"
  | "Légbassito"
  | "Cacavéli"
  | "Aflao Gakli"
  | "Démakpoé"
  | "Adewi"

export type Ecole = "IAI-TOGO" | "LBS" | "EPL" | "Université de Lomé" | "ESTBA" | "ISMP" | "IFAG" | "ISCAM" | "Autre"

export interface Listing {
  id: string
  proprietaireId: string
  proprietaireName: string
  type: ListingType
  titre: string
  description: string
  prix: number
  quartier: Quartier
  ecolesProches: Ecole[]
  images: string[]
  status: ListingStatus
  createdAt: string
  updatedAt: string
  // Détails supplémentaires
  superficie?: number
  nombreChambres?: number
  equipements: string[]
  adresse: string
  telephone: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  receiverId: string
  content: string
  createdAt: string
  read: boolean
}

export interface Conversation {
  id: string
  listingId: string
  listingTitle: string
  etudiantId: string
  etudiantName: string
  proprietaireId: string
  proprietaireName: string
  lastMessage?: string
  lastMessageAt?: string
  unreadCount: number
}
