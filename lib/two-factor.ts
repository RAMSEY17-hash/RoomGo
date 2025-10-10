import { createClient } from "@/lib/supabase/client"

// Générer un code 2FA
export function generateTwoFactorCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Envoyer un email de 2FA et retourner le code (utile en mode dev)
export async function sendTwoFactorEmail(email: string, code: string, userId: string): Promise<string> {
  try {
    const supabase = createClient()

    // Stocker le code dans la base de données
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 10) // Code expire en 10 minutes

    await supabase.from("two_factor_codes").insert({
      user_id: userId,
      code: code,
      expires_at: expiresAt.toISOString(),
    })

    // Simuler l'envoi de l'email (en prod, utiliser un service de messagerie)
    console.log(`[v0] 2FA Code for ${email}: ${code}`)
    console.log(`[v0] Code expires at: ${expiresAt.toLocaleString()}`)

    // Retourner le code pour l'utiliser dans le modal
    return code
  } catch (error) {
    console.error("[v0] Error sending 2FA email:", error)
    throw error
  }
}

// Vérifier un code 2FA
export async function verifyTwoFactorCode(userId: string, code: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    const { data: codeData, error: codeError } = await supabase
      .from("two_factor_codes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (codeError || !codeData) return { success: false, error: "Aucun code trouvé" }

    if (new Date(codeData.expires_at) < new Date()) {
      await supabase.from("two_factor_codes").delete().eq("id", codeData.id)
      return { success: false, error: "Le code a expiré. Veuillez vous reconnecter." }
    }

    if (codeData.code !== code) return { success: false, error: "Code incorrect" }

    await supabase.from("two_factor_codes").delete().eq("id", codeData.id)

    return { success: true }
  } catch (error) {
    return { success: false, error: "Erreur lors de la vérification du code" }
  }
}

export async function getTwoFactorEmail(userId: string): Promise<string | null> {
  try {
    const supabase = createClient()

    const { data: userData, error: userError } = await supabase.from("users").select("email").eq("id", userId).single()
    if (userError || !userData) return null

    return userData.email
  } catch (error) {
    return null
  }
}
