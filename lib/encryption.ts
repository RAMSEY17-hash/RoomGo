"use server"

import crypto from "crypto"

// Clé de chiffrement (en production, utilisez une variable d'environnement)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex")
const ALGORITHM = "aes-256-gcm"

/**
 * Chiffre une donnée sensible avec AES-256-GCM
 * @param text - Texte à chiffrer
 * @returns Texte chiffré au format: iv:authTag:encryptedData
 */
export async function encrypt(text: string): Promise<string> {
  if (!text) return ""

  try {
    // Générer un IV (Initialization Vector) aléatoire
    const iv = crypto.randomBytes(16)

    // Créer le cipher avec la clé et l'IV
    const key = Buffer.from(ENCRYPTION_KEY.slice(0, 64), "hex")
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

    // Chiffrer les données
    let encrypted = cipher.update(text, "utf8", "hex")
    encrypted += cipher.final("hex")

    // Récupérer le tag d'authentification
    const authTag = cipher.getAuthTag()

    // Retourner: iv:authTag:encryptedData
    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`
  } catch (error) {
    console.error("[v0] Encryption error:", error)
    throw new Error("Erreur lors du chiffrement des données")
  }
}

/**
 * Déchiffre une donnée chiffrée
 * @param encryptedText - Texte chiffré au format: iv:authTag:encryptedData
 * @returns Texte déchiffré
 */
export async function decrypt(encryptedText: string): Promise<string> {
  if (!encryptedText) return ""

  try {
    // Séparer les composants
    const parts = encryptedText.split(":")
    if (parts.length !== 3) {
      throw new Error("Format de données chiffrées invalide")
    }

    const iv = Buffer.from(parts[0], "hex")
    const authTag = Buffer.from(parts[1], "hex")
    const encrypted = parts[2]

    // Créer le decipher
    const key = Buffer.from(ENCRYPTION_KEY.slice(0, 64), "hex")
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    // Déchiffrer
    let decrypted = decipher.update(encrypted, "hex", "utf8")
    decrypted += decipher.final("utf8")

    return decrypted
  } catch (error) {
    console.error("[v0] Decryption error:", error)
    throw new Error("Erreur lors du déchiffrement des données")
  }
}

/**
 * Hash une donnée avec SHA-256 et salt
 * Utilisé pour les données qui n'ont pas besoin d'être déchiffrées
 */
export async function hashData(data: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.pbkdf2Sync(data, salt, 10000, 64, "sha256").toString("hex")
  return `${salt}:${hash}`
}

/**
 * Vérifie un hash
 */
export async function verifyHash(data: string, hashedData: string): Promise<boolean> {
  const [salt, originalHash] = hashedData.split(":")
  const hash = crypto.pbkdf2Sync(data, salt, 10000, 64, "sha256").toString("hex")
  return hash === originalHash
}
