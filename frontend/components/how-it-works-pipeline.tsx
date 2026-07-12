"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"
import {
  Upload,
  Scan,
  Brain,
  FileSearch,
  BarChart3,
  Shield,
  type LucideIcon,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { scrollToSection } from "@/lib/scroll"

interface PipelineStep {
  icon: LucideIcon
  title: string
  description: string
  details: string
  capabilities: string[]
}

const pipelineSteps: PipelineStep[] = [
  {
    icon: Upload,
    title: "Upload",
    description: "Submit content via file upload or URL",
    details:
      "AuthLayer ingests media through secure upload channels or direct URL ingestion. Files are fingerprinted and queued for multi-stage forensic processing.",
    capabilities: [
      "Drag-and-drop image ingestion",
      "Direct URL scanning",
      "Automatic format validation",
    ],
  },
  {
    icon: Scan,
    title: "Analysis",
    description: "Deep pixel-level forensic scanning",
    details:
      "The analysis engine inspects compression artifacts, noise distribution, and edge inconsistencies to detect tampering at the pixel layer.",
    capabilities: [
      "Compression artifact mapping",
      "Noise pattern evaluation",
      "Region-level anomaly detection",
    ],
  },
  {
    icon: Brain,
    title: "AI Detection",
    description: "Neural network manipulation detection",
    details:
      "Specialized models estimate synthetic generation probability using visual and statistical signals aligned with enterprise threat models.",
    capabilities: [
      "Generative AI probability scoring",
      "Model ensemble confidence",
      "Manipulation likelihood bands",
    ],
  },
  {
    icon: FileSearch,
    title: "Metadata Verification",
    description: "EXIF and source integrity checks",
    details:
      "Metadata chains are validated for consistency, provenance gaps, and tampering indicators across EXIF, IPTC, and container headers.",
    capabilities: [
      "EXIF integrity validation",
      "Source chain verification",
      "Timestamp consistency checks",
    ],
  },
  {
    icon: BarChart3,
    title: "Trust Aggregation",
    description: "Multi-factor score computation",
    details:
      "Signals from forensic, metadata, and duplication modules are weighted into a unified trust score designed for security operations.",
    capabilities: [
      "Weighted trust index",
      "Confidence intervals",
      "Explainable factor breakdown",
    ],
  },
  {
    icon: Shield,
    title: "Risk Intelligence",
    description: "Actionable security insights",
    details:
      "Final risk posture is classified and packaged with analyst-ready explanations for SOC workflows and incident response.",
    capabilities: [
      "Risk tier classification",
      "Analyst-ready narratives",
      "Exportable trust reports",
    ],
  },
]

export function HowItWorksPipeline() {
  const containerRef = useRef(null)
  const isInView = useInView(containerRef, { once: true, margin: "-100px" })
  const [activeStep, setActiveStep] = useState<PipelineStep | null>(null)

  return (
    <>
      <section
        id="solutions"
        className="py-20 sm:py-24 px-4 overflow-hidden scroll-mt-24"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              How AuthLayer Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our enterprise-grade pipeline combines advanced AI with proven forensic
              techniques to deliver comprehensive trust intelligence.
            </p>
          </motion.div>

          <div ref={containerRef} className="relative">
            <div className="flex flex-col lg:flex-row items-stretch gap-4 lg:gap-0">
              {pipelineSteps.map((step, index) => {
                const Icon = step.icon
                const isLast = index === pipelineSteps.length - 1

                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: index * 0.1 }}
                    className="relative flex-1 flex lg:flex-col items-center"
                  >
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setActiveStep(step)}
                      className="glass-elevated rounded-xl p-6 w-full flex flex-col items-center text-center relative z-10 panel-gradient border border-border/50 hover:border-primary/40 transition-colors cursor-pointer"
                    >
                      <motion.div
                        className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 relative"
                        animate={
                          isInView
                            ? {
                                boxShadow: [
                                  "0 0 0 0 rgba(100, 180, 200, 0)",
                                  "0 0 20px 5px rgba(100, 180, 200, 0.2)",
                                  "0 0 0 0 rgba(100, 180, 200, 0)",
                                ],
                              }
                            : {}
                        }
                        transition={{
                          delay: index * 0.2,
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 3,
                        }}
                      >
                        <Icon className="w-7 h-7 text-primary" />
                      </motion.div>

                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                        <span className="text-xs font-mono text-muted-foreground">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>

                      <h3 className="font-semibold text-foreground mb-2">
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                      <span className="mt-3 text-xs text-primary/80">
                        View workflow details
                      </span>
                    </motion.button>

                    {!isLast && (
                      <>
                        <div className="hidden lg:block absolute top-1/2 -right-4 w-8 z-0">
                          <motion.div
                            className="h-[2px] w-full bg-gradient-to-r from-primary/50 to-primary/20"
                            initial={{ scaleX: 0 }}
                            animate={isInView ? { scaleX: 1 } : {}}
                            transition={{ delay: index * 0.1 + 0.2, duration: 0.3 }}
                            style={{ transformOrigin: "left" }}
                          />
                        </div>
                        <div className="lg:hidden flex justify-center my-2">
                          <motion.div
                            className="w-[2px] h-8 bg-gradient-to-b from-primary/50 to-primary/20"
                            initial={{ scaleY: 0 }}
                            animate={isInView ? { scaleY: 1 } : {}}
                            transition={{ delay: index * 0.1 + 0.2, duration: 0.3 }}
                            style={{ transformOrigin: "top" }}
                          />
                        </div>
                      </>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center mt-16"
          >
            <p className="text-muted-foreground mb-6">
              Ready to secure your content verification workflow?
            </p>
            <button
              type="button"
              onClick={() => scrollToSection("scan")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <Shield className="w-4 h-4" />
              Start Your First Scan
            </button>
          </motion.div>
        </div>
      </section>

      <Dialog open={!!activeStep} onOpenChange={() => setActiveStep(null)}>
        <DialogContent className="glass-elevated border-border/60 sm:max-w-lg">
          {activeStep && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <activeStep.icon className="w-5 h-5 text-primary" />
                  {activeStep.title}
                </DialogTitle>
                <DialogDescription>{activeStep.details}</DialogDescription>
              </DialogHeader>
              <ul className="space-y-2">
                {activeStep.capabilities.map((capability) => (
                  <li
                    key={capability}
                    className="text-sm text-muted-foreground rounded-lg border border-border/50 bg-secondary/20 px-3 py-2"
                  >
                    {capability}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => {
                  setActiveStep(null)
                  scrollToSection("scan")
                }}
                className="w-full mt-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Run this step on live content
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
