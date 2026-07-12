"use client"

import { motion } from "framer-motion"
import { Shield, AlertTriangle, Brain, FileSearch, Copy, Info, CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ScanResult } from "@/lib/types/scan"

export type { ScanResult }

interface TrustResultsDashboardProps {
  result: ScanResult
  onClose: () => void
}

export function TrustResultsDashboard({ result, onClose }: TrustResultsDashboardProps) {
  const riskColors = {
    low: "text-success",
    medium: "text-warning",
    high: "text-destructive",
    critical: "text-destructive",
  }

  const riskBgColors = {
    low: "bg-success/10 border-success/30",
    medium: "bg-warning/10 border-warning/30",
    high: "bg-destructive/10 border-destructive/30",
    critical: "bg-destructive/20 border-destructive/50",
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-10 sm:py-12 px-4"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-8"
        >
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Analysis Complete
            </h2>
            <p className="text-muted-foreground mt-1">
              Forensic scan completed successfully
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg border border-border/50 bg-card/20"
          >
            New Scan
          </button>
        </motion.div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Trust Score - Large Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:row-span-2 glass-elevated rounded-2xl p-6 glow-border panel-gradient"
          >
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Trust Score</h3>
            </div>
            
            {/* Circular Meter */}
            <div className="relative w-44 h-44 sm:w-48 sm:h-48 mx-auto mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="12"
                />
                <motion.circle
                  cx="96"
                  cy="96"
                  r="88"
                  fill="none"
                  stroke={result.trustScore >= 70 ? "var(--success)" : result.trustScore >= 40 ? "var(--warning)" : "var(--destructive)"}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={553}
                  initial={{ strokeDashoffset: 553 }}
                  animate={{ strokeDashoffset: 553 - (553 * result.trustScore) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    className="text-5xl font-bold text-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {result.trustScore}
                  </motion.div>
                  <div className="text-sm text-muted-foreground">out of 100</div>
                </div>
              </div>
            </div>

            {/* Risk Level Badge */}
            <div className={cn(
              "flex items-center justify-center gap-2 py-3 px-4 rounded-lg border",
              riskBgColors[result.riskLevel]
            )}>
              <AlertTriangle className={cn("w-5 h-5", riskColors[result.riskLevel])} />
              <span className={cn("font-semibold capitalize", riskColors[result.riskLevel])}>
                {result.riskLevel} Risk
              </span>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Authenticity</span>
                <span className="text-foreground font-medium">
                  {100 - result.aiGeneratedProbability}%
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Metadata</span>
                <span className="text-foreground font-medium">
                  {result.metadataIntegrity.score}%
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Duplicates Found</span>
                <span className="text-foreground font-medium">
                  {result.duplicateCount}
                </span>
              </div>
            </div>
          </motion.div>

          {/* AI Generated Probability */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-elevated rounded-2xl p-6 panel-gradient"
          >
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">AI Detection</h3>
            </div>
            
            <div className="mb-4">
              <div className="text-4xl font-bold text-foreground mb-1">
                {result.aiGeneratedProbability}%
              </div>
              <div className="text-sm text-muted-foreground">
                Probability of AI generation
              </div>
            </div>

            <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  result.aiGeneratedProbability > 70 ? "bg-destructive" :
                  result.aiGeneratedProbability > 40 ? "bg-warning" : "bg-success"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${result.aiGeneratedProbability}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
          </motion.div>

          {/* Metadata Integrity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-elevated rounded-2xl p-6 panel-gradient"
          >
            <div className="flex items-center gap-2 mb-4">
              <FileSearch className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Metadata Integrity</h3>
            </div>
            
            <div className="mb-4">
              <div className="text-4xl font-bold text-foreground mb-1">
                {result.metadataIntegrity.score}%
              </div>
              <div className="text-sm text-muted-foreground">
                Integrity score
              </div>
            </div>

            {result.metadataIntegrity.issues.length > 0 && (
              <div className="space-y-2">
                {result.metadataIntegrity.issues.slice(0, 2).map((issue, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-warning">
                    <AlertTriangle className="w-3 h-3" />
                    {issue}
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Duplicate Detection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-elevated rounded-2xl p-6 panel-gradient"
          >
            <div className="flex items-center gap-2 mb-4">
              <Copy className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Duplicate Detection</h3>
            </div>
            
            <div className="mb-4">
              <div className="text-4xl font-bold text-foreground mb-1">
                {result.duplicateCount}
              </div>
              <div className="text-sm text-muted-foreground">
                Matches found online
              </div>
            </div>

            <div className={cn(
              "text-xs py-2 px-3 rounded-md",
              result.duplicateCount === 0 
                ? "bg-success/10 text-success" 
                : "bg-warning/10 text-warning"
            )}>
              {result.duplicateCount === 0 
                ? "No duplicates detected" 
                : `${result.duplicateCount} potential sources identified`}
            </div>
          </motion.div>

          {/* Trust Explanations - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 glass-elevated rounded-2xl p-6 panel-gradient"
          >
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Trust Explanations</h3>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-3">
              {result.explanations.map((explanation, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border/40"
                >
                  <div className="mt-0.5">
                    {i < 2 ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <XCircle className="w-4 h-4 text-warning" />
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">{explanation}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Forensic Analysis Cards - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-3 glass-elevated rounded-2xl p-6 panel-gradient"
          >
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Forensic Analysis</h3>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {result.forensicDetails.map((detail, i) => {
                const statusColors = {
                  safe: "border-success/30 bg-success/5",
                  warning: "border-warning/30 bg-warning/5",
                  danger: "border-destructive/30 bg-destructive/5",
                }
                const statusTextColors = {
                  safe: "text-success",
                  warning: "text-warning",
                  danger: "text-destructive",
                }
                
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + i * 0.05 }}
                    whileHover={{ scale: 1.02, y: -1 }}
                    className={cn(
                      "p-4 rounded-xl border transition-all",
                      statusColors[detail.status]
                    )}
                  >
                    <div className="text-xs text-muted-foreground mb-1">
                      {detail.label}
                    </div>
                    <div className={cn("font-semibold", statusTextColors[detail.status])}>
                      {detail.value}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}
