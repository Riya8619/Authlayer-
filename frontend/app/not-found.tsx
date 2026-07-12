import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
        <p className="text-muted-foreground mb-6">
          This page doesn&apos;t exist. AuthLayer is a single-page app — use
          the navigation menu to jump to a section instead.
        </p>
        <Button asChild>
          <Link href="/">Back to AuthLayer</Link>
        </Button>
      </div>
    </div>
  )
}
