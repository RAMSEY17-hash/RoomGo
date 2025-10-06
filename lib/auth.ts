// Système d'authentification mock avec localStorage

import type { User, UserType } from "./types"

const USERS_KEY = "lome_housing_users"
const CURRENT_USER_KEY = "lome_housing_current_user"
const PROPRIO_KEYS_KEY = "lome_housing_proprio_keys"

// Générer une clé propriétaire aléatoire
export function generateProprietaireKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let key = "PROP-"
  for (let i = 0; i < 8; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return key
}

// Initialiser les clés propriétaires (pour la démo)
export function initializeProprioKeys() {
  if (typeof window === "undefined") return

  const existingKeys = localStorage.getItem(PROPRIO_KEYS_KEY)
  if (!existingKeys) {
    const demoKeys = [generateProprietaireKey(), generateProprietaireKey(), generateProprietaireKey()]
    localStorage.setItem(PROPRIO_KEYS_KEY, JSON.stringify(demoKeys))
    console.log("[v0] Clés propriétaires générées:", demoKeys)
  }

  const users = getUsers()
  const adminExists = users.some((u) => u.type === "admin")
  if (!adminExists) {
    const adminUser: User = {
      id: "admin-1",
      username: "admin",
      email: "admin@lomehousing.com",
      password: "admin123",
      type: "admin",
      createdAt: new Date().toISOString(),
    }
    users.push(adminUser)
    saveUsers(users)
    console.log("[v0] Compte admin créé - Email: admin@lomehousing.com, Mot de passe: admin123")
  }
}

// Vérifier si une clé propriétaire est valide
export function isValidProprietaireKey(key: string): boolean {
  if (typeof window === "undefined") return false

  const keysStr = localStorage.getItem(PROPRIO_KEYS_KEY)
  if (!keysStr) return false

  const keys: string[] = JSON.parse(keysStr)
  return keys.includes(key)
}

// Obtenir toutes les clés propriétaires (pour affichage admin)
export function getAllProprioKeys(): string[] {
  if (typeof window === "undefined") return []

  const keysStr = localStorage.getItem(PROPRIO_KEYS_KEY)
  if (!keysStr) return []

  return JSON.parse(keysStr)
}

// Obtenir tous les utilisateurs
function getUsers(): User[] {
  if (typeof window === "undefined") return []

  const usersStr = localStorage.getItem(USERS_KEY)
  if (!usersStr) return []

  return JSON.parse(usersStr)
}

// Sauvegarder les utilisateurs
function saveUsers(users: User[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

// Inscription
export function register(
  username: string,
  email: string,
  password: string,
  type: UserType,
  proprietaireKey?: string,
): { success: boolean; error?: string; user?: User } {
  const users = getUsers()

  // Vérifier si l'email ou le username existe déjà
  if (users.some((u) => u.email === email)) {
    return { success: false, error: "Cet email est déjà utilisé" }
  }

  if (users.some((u) => u.username === username)) {
    return { success: false, error: "Ce nom d'utilisateur est déjà pris" }
  }

  // Si c'est un propriétaire, vérifier la clé
  if (type === "proprietaire") {
    if (!proprietaireKey || !isValidProprietaireKey(proprietaireKey)) {
      return { success: false, error: "Clé propriétaire invalide" }
    }
  }

  const newUser: User = {
    id: Date.now().toString(),
    username,
    email,
    password, // En production, il faudrait hasher le mot de passe
    type,
    proprietaireKey: type === "proprietaire" ? proprietaireKey : undefined,
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)
  saveUsers(users)

  return { success: true, user: newUser }
}

// Connexion
export function login(
  email: string,
  password: string,
  proprietaireKey?: string,
): { success: boolean; error?: string; user?: User } {
  const users = getUsers()

  const user = users.find((u) => u.email === email && u.password === password)

  if (!user) {
    return { success: false, error: "Email ou mot de passe incorrect" }
  }

  // Si c'est un propriétaire, vérifier la clé
  if (user.type === "proprietaire") {
    if (!proprietaireKey || proprietaireKey !== user.proprietaireKey) {
      return { success: false, error: "Clé propriétaire incorrecte" }
    }
  }

  // Sauvegarder l'utilisateur connecté
  if (typeof window !== "undefined") {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
  }

  return { success: true, user }
}

// Déconnexion
export function logout() {
  if (typeof window === "undefined") return
  localStorage.removeItem(CURRENT_USER_KEY)
}

// Obtenir l'utilisateur connecté
export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null

  const userStr = localStorage.getItem(CURRENT_USER_KEY)
  if (!userStr) return null

  return JSON.parse(userStr)
}

// Vérifier si l'utilisateur est connecté
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null
}
