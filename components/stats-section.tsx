import { Home, Users, CheckCircle } from "lucide-react"

export function StatsSection() {
  const stats = [
    {
      icon: Home,
      value: "500+",
      label: "Logements disponibles",
    },
    {
      icon: Users,
      value: "1000+",
      label: "Étudiants satisfaits",
    },
    {
      icon: CheckCircle,
      value: "100%",
      label: "Annonces vérifiées",
    },
  ]

  return (
    <section className="py-12 bg-muted/50">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center text-center space-y-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <p className="text-3xl font-bold text-primary">{stat.value}</p>
              <p className="text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
