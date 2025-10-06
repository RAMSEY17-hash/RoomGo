import { Home } from "lucide-react"
import Link from "next/link"

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg blur-sm opacity-75" />
        <div className="relative bg-gradient-to-br from-orange-500 to-amber-600 p-2 rounded-lg">
          <Home className="h-5 w-5 text-white" />
        </div>
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-bold text-xl bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
          RoomGo
        </span>
        <span className="text-xs text-muted-foreground">Lomé Housing</span>
      </div>
    </Link>
  )
}
