import Link from "next/link"
import { LoginForm } from "@/components/login-form"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-600 mb-2">Lomé Housing</h1>
          <p className="text-muted-foreground">Votre logement idéal à Lomé</p>
        </div>

        <LoginForm />

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link href="/auth/register">
              <Button variant="link" className="p-0 h-auto text-orange-600">
                S'inscrire
              </Button>
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
