"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { ListingForm } from "@/components/listing-form"
import { useAuth } from "@/components/auth-provider"

export default function CreateListingPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.type !== "proprietaire")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  if (isLoading || !user || user.type !== "proprietaire") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Publier une annonce</h1>
            <p className="text-muted-foreground">
              Remplissez le formulaire ci-dessous pour publier votre logement. Votre annonce sera vérifiée par un
              administrateur avant d'être publiée.
            </p>
          </div>

          <ListingForm />
        </div>
      </main>
    </div>
  )
}
