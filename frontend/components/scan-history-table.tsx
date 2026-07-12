"use client"

import { motion } from "framer-motion"
import { FileImage, Link2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ScanHistoryItem } from "@/lib/types/scan"

export type { ScanHistoryItem }

interface ScanHistoryTableProps {
  history: ScanHistoryItem[]
}

export function ScanHistoryTable({ history }: ScanHistoryTableProps) {
  const riskColors = {
    low: "bg-success/10 text-success border-success/30",
    medium: "bg-warning/10 text-warning border-warning/30",
    high: "bg-destructive/10 text-destructive border-destructive/30",
    critical: "bg-destructive/20 text-destructive border-destructive/50",
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-success"
    if (score >= 40) return "text-warning"
    return "text-destructive"
  }

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <section id="history" className="py-20 sm:py-24 px-4 scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Scan History
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your recent content verification activities and trust intelligence reports.
          </p>
        </motion.div>

        {history.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-elevated rounded-2xl p-10 text-center panel-gradient border border-dashed border-border/60"
          >
            <p className="text-foreground font-medium">No scans yet</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              Run your first image or URL analysis to populate live trust intelligence history.
            </p>
          </motion.div>
        ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="glass-elevated rounded-2xl overflow-hidden panel-gradient"
        >
          {/* Table Header */}
          <div className="hidden md:grid md:grid-cols-5 gap-4 p-4 border-b border-border bg-secondary/30 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <div>Scan ID</div>
            <div>Type</div>
            <div>Trust Score</div>
            <div>Risk Level</div>
            <div>Timestamp</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-border">
            {history.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ backgroundColor: "rgba(148, 163, 184, 0.06)" }}
                className="p-4 transition-colors cursor-pointer"
              >
                {/* Mobile Layout */}
                <div className="md:hidden space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {item.type === "image" ? (
                        <FileImage className="w-4 h-4 text-primary" />
                      ) : (
                        <Link2 className="w-4 h-4 text-primary" />
                      )}
                      <span className="font-mono text-sm text-foreground">
                        {item.id.slice(0, 8)}
                      </span>
                    </div>
                    <span className={cn(
                      "text-sm font-semibold",
                      getScoreColor(item.trustScore)
                    )}>
                      {item.trustScore}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full border",
                      riskColors[item.riskLevel]
                    )}>
                      {item.riskLevel}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimestamp(item.timestamp)}
                    </span>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:grid md:grid-cols-5 gap-4 items-center">
                  <div className="font-mono text-sm text-foreground truncate">
                    {item.id.slice(0, 8)}
                  </div>
                  <div className="flex items-center gap-2">
                    {item.type === "image" ? (
                      <>
                        <FileImage className="w-4 h-4 text-primary" />
                        <span className="text-sm text-muted-foreground">Image</span>
                      </>
                    ) : (
                      <>
                        <Link2 className="w-4 h-4 text-primary" />
                        <span className="text-sm text-muted-foreground">URL</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          item.trustScore >= 70 ? "bg-success" :
                          item.trustScore >= 40 ? "bg-warning" : "bg-destructive"
                        )}
                        style={{ width: `${item.trustScore}%` }}
                      />
                    </div>
                    <span className={cn(
                      "text-sm font-semibold",
                      getScoreColor(item.trustScore)
                    )}>
                      {item.trustScore}%
                    </span>
                  </div>
                  <div>
                    <span className={cn(
                      "text-xs px-3 py-1 rounded-full border capitalize",
                      riskColors[item.riskLevel]
                    )}>
                      {item.riskLevel}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTimestamp(item.timestamp)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        )}
      </div>
    </section>
  )
}
