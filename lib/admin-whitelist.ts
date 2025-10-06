// Whitelist of admin emails - only these emails can access admin routes
export const ADMIN_WHITELIST = [
  "wouemboahmed@gmail.com",
  "admin@roomgo.com", // Backup admin
]

export function isAdminEmail(email: string): boolean {
  return ADMIN_WHITELIST.includes(email.toLowerCase())
}
