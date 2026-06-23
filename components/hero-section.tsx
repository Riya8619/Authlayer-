"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Scan, Activity } from "lucide-react"
import dynamic from "next/dynamic"
import { scrollToSection } from "@/lib/scroll"

const NetworkVisualization = dynamic(
  () =>
    import("@/components/network-visualization").then(
      (mod) => mod.NetworkVisualization
    ),
  { ssr: false }
)

export function HeroSection() {
  return (
    <section
      id="platform"
      className="relative min-h-screen flex items-center justify-center pt-28 pb-12 px-4 scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="inline-flex items-center rounded-full border border-primary/35 bg-primary/8 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-primary/90"
            >
              Enterprise Forensic Intelligence
            </motion.div>

            <h1 className="mt-6 text-4xl sm:text-5xl xl:text-6xl font-semibold leading-tight">
              Trust Nothing.
              <br />
              <span className="text-primary glow-text">
                Verify Everything.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base sm:text-lg text-muted-foreground">
              Enterprise AI trust intelligence platform for
              detecting manipulated media and verifying digital authenticity.
            </p>

            <div className="mt-10 flex flex-wrap gap-3 justify-center lg:justify-start">
              <Button
                size="lg"
                className="soft-ring"
                onClick={() => scrollToSection("scan")}
              >
                <Scan className="mr-2 h-4 w-4" />
                Analyze Content
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-border/70 bg-card/30 hover:bg-card/50"
                onClick={() => scrollToSection("history")}
              >
                <Activity className="mr-2 h-4 w-4" />
                Live Dashboard
              </Button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="mt-10 grid grid-cols-3 gap-3 text-left"
            >
              {[
                { k: "98.2%", v: "Detection Precision" },
                { k: "<2.4s", v: "Avg Scan Latency" },
                { k: "24/7", v: "Threat Monitoring" },
              ].map((item) => (
                <div key={item.v} className="rounded-xl border border-border/60 bg-card/40 backdrop-blur-md p-3">
                  <div className="text-lg font-semibold text-foreground">{item.k}</div>
                  <div className="text-xs text-muted-foreground">{item.v}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative"
          >
            <div className="rounded-2xl border border-border/50 bg-card/25 backdrop-blur-xl p-4 sm:p-6 panel-gradient soft-ring">
              <NetworkVisualization />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}