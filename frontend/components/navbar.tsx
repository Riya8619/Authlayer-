"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Shield, Menu, X } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { scrollToSection, scrollToTop } from "@/lib/scroll"

const navItems = [
  { label: "Platform", sectionId: "platform" },
  { label: "Solutions", sectionId: "solutions" },
  { label: "Analysis", sectionId: "scan" },
  { label: "Documentation", sectionId: "docs" },
  { label: "Pricing", sectionId: "pricing" },
  { label: "Live Dashboard", sectionId: "history" },
  { label: "Contact", sectionId: "contact" },
]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [signInOpen, setSignInOpen] = useState(false)
  const [email, setEmail] = useState("")

  const handleNavClick = (sectionId: string) => {
    scrollToSection(sectionId)
    setMobileMenuOpen(false)
  }

  const handleGetStarted = () => {
    scrollToSection("scan")
    setMobileMenuOpen(false)
  }

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error("Enter your work email to continue")
      return
    }
    toast.success("Demo workspace ready", {
      description: `Signed in preview for ${email.trim()}`,
    })
    setSignInOpen(false)
    setEmail("")
    scrollToSection("scan")
  }

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="glass mt-4 rounded-full px-6 py-3">
            <nav className="flex items-center justify-between">
              <button
                type="button"
                onClick={scrollToTop}
                className="flex items-center gap-2"
              >
                <div className="relative">
                  <Shield className="h-8 w-8 text-primary" />
                  <div className="absolute inset-0 blur-md bg-primary/30 rounded-full" />
                </div>
                <span className="text-xl font-semibold tracking-tight text-foreground">
                  AuthLayer
                </span>
              </button>

              <div className="hidden lg:flex items-center gap-5 xl:gap-7">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleNavClick(item.sectionId)}
                    className={cn(
                      "text-sm text-muted-foreground hover:text-foreground transition-colors relative",
                      "after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-primary after:transition-all hover:after:w-full",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="hidden lg:flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => setSignInOpen(true)}
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 soft-ring"
                  onClick={handleGetStarted}
                >
                  Get Started
                </Button>
              </div>

              <button
                type="button"
                className="lg:hidden p-2 text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </nav>
          </div>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass mt-2 rounded-2xl p-4 lg:hidden max-h-[70vh] overflow-y-auto"
              >
                <div className="flex flex-col gap-4">
                  {navItems.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleNavClick(item.sectionId)}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2 text-left"
                    >
                      {item.label}
                    </button>
                  ))}
                  <div className="flex flex-col gap-2 pt-4 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-center"
                      onClick={() => {
                        setSignInOpen(true)
                        setMobileMenuOpen(false)
                      }}
                    >
                      Sign In
                    </Button>
                    <Button
                      size="sm"
                      className="w-full bg-primary text-primary-foreground"
                      onClick={handleGetStarted}
                    >
                      Get Started
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      <Dialog open={signInOpen} onOpenChange={setSignInOpen}>
        <DialogContent className="glass-elevated border-border/60 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in to AuthLayer</DialogTitle>
            <DialogDescription>
              Enterprise SSO preview. Authentication is disabled in this demo build.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSignInSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-secondary/50"
            />
            <DialogFooter>
              <Button type="submit" className="w-full sm:w-auto">
                Continue to Workspace
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
