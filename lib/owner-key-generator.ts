// Utility to generate and manage owner keys

export function generateOwnerKey(): string {
  const prefix = "PROP"
  const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase()
  return `${prefix}-${randomPart}`
}

export function sendOwnerKeyEmail(email: string, ownerKey: string): void {
  // Simulate sending email with owner key
  console.log(`
    ========================================
    [RoomGo] Clé Propriétaire Générée
    ========================================
    
    Email: ${email}
    Votre clé propriétaire: ${ownerKey}
    
    Cette clé est nécessaire pour vous connecter à votre compte.
    Conservez-la précieusement et ne la partagez avec personne.
    
    Vous devrez fournir cette clé à chaque connexion pour des raisons de sécurité.
    
    ========================================
  `)
}
