import { createClient } from "@/lib/supabase/client"

// Vérifier un code 2FA
export async function verifyTwoFactorCode(userId: string, code: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    // Récupérer le code de l'utilisateur
    const { data: codeData, error: codeError } = await supabase
      .from("two_factor_codes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (codeError || !codeData) {
      return { success: false, error: "Aucun code trouvé" }
    }

    // Vérifier l'expiration
    if (new Date(codeData.expires_at) < new Date()) {
      // Supprimer le code expiré
      await supabase.from("two_factor_codes").delete().eq("id", codeData.id)
      return { success: false, error: "Le code a expiré. Veuillez vous reconnecter." }
    }

    // Vérifier le code
    if (codeData.code !== code) {
      return { success: false, error: "Code incorrect" }
    }

    // Supprimer le code après vérification réussie
    await supabase.from("two_factor_codes").delete().eq("id", codeData.id)

    return { success: true }
  } catch (error) {
    return { success: false, error: "Erreur lors de la vérification du code" }
  }
}

export async function getTwoFactorEmail(userId: string): Promise<string | null> {
  try {
    const supabase = createClient()

    // Récupérer l'email de l'utilisateur
    const { data: userData, error: userError } = await supabase.from("users").select("email").eq("id", userId).single()

    if (userError || !userData) {
      return null
    }

    return userData.email
  } catch (error) {
    return null
  }
}
