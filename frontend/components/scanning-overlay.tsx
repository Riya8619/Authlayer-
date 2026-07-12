"use client"

import { motion } from "framer-motion"
import { Scan, Shield, Eye, Database, Brain } from "lucide-react"

const scanSteps = [
  { icon: Scan, label: "Initializing pipeline", stage: "Provisioning forensic modules" },
  { icon: Eye, label: "Pixel and artifact analysis", stage: "Tracing compression and tamper signatures" },
  { icon: Brain, label: "AI synthesis detection", stage: "Evaluating synthetic generation confidence" },
  { icon: Database, label: "Cross-source intelligence", stage: "Correlating metadata and duplicate vectors" },
  { icon: Shield, label: "Trust score generation", stage: "Compiling risk report and recommendations" },
]

interface ScanningOverlayProps {
  progress: number
  currentStep: number
}

export function ScanningOverlay({ progress, currentStep }: ScanningOverlayProps) {
  const activeStep = Math.min(currentStep, scanSteps.length - 1)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/88 backdrop-blur-md"
    >
      <div className="max-w-xl w-full mx-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-elevated rounded-2xl p-6 sm:p-8 panel-gradient soft-ring"
        >
          <div className="mb-5">
            <div className="text-xs uppercase tracking-[0.18em] text-primary/90">Forensic Runtime</div>
            <div className="mt-2 text-sm text-muted-foreground">{scanSteps[activeStep].stage}</div>
          </div>

          {/* Animated Scanner */}
          <div className="relative w-44 h-44 sm:w-48 sm:h-48 mx-auto mb-8">
            {/* Outer ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary/20"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Middle ring */}
            <motion.div
              className="absolute inset-4 rounded-full border-2 border-primary/30"
              animate={{ rotate: -360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Inner ring with progress */}
            <svg className="absolute inset-8 w-32 h-32">
              <circle
                cx="64"
                cy="64"
                r="60"
                fill="none"
                stroke="var(--border)"
                strokeWidth="4"
              />
              <motion.circle
                cx="64"
                cy="64"
                r="60"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={377}
                strokeDashoffset={377 - (377 * progress) / 100}
                style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
              />
            </svg>
            
            {/* Center content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <motion.div
                  className="text-3xl font-bold text-primary"
                  key={progress}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                >
                  {Math.round(progress)}%
                </motion.div>
              </div>
            </div>
            
            {/* Scanning beam */}
            <motion.div
              className="absolute left-1/2 top-1/2 w-1 h-24 -translate-x-1/2 origin-bottom"
              style={{
                background: "linear-gradient(to top, var(--primary) 0%, transparent 100%)",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </div>

          <div className="mb-5 h-2 rounded-full bg-secondary/70 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary/70 via-primary to-accent/80"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>

          {/* Progress Steps */}
          <div className="space-y-3">
            {scanSteps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStep
              const isComplete = index < currentStep

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                    isActive
                      ? "bg-primary/10 border-primary/30"
                      : isComplete
                      ? "opacity-60 border-border/20"
                      : "opacity-35 border-transparent"
                  }`}
                >
                  <div
                    className={`p-2 rounded-full ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : isComplete
                        ? "bg-success/20 text-success"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      isActive ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                  {isActive && (
                    <motion.div
                      className="ml-auto"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </motion.div>
                  )}
                  {isComplete && (
                    <div className="ml-auto text-success text-xs">Complete</div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
