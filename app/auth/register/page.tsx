import Link from "next/link"
import { RegisterForm } from "@/components/register-form"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="flex justify-center mb-8">
          <Logo className="scale-150" />
        </div>

        <RegisterForm />

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link href="/auth/login">
              <Button variant="link" className="p-0 h-auto text-orange-600">
                Se connecter
              </Button>
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
