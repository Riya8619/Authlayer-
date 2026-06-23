"use client"

import dynamic from "next/dynamic"
import { AnimatePresence } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { UploadPanel } from "@/components/upload-panel"
import { TrustResultsDashboard } from "@/components/trust-results-dashboard"
import { ScanHistoryTable } from "@/components/scan-history-table"
import { HowItWorksPipeline } from "@/components/how-it-works-pipeline"
import {
  DocumentationSection,
  PricingSection,
} from "@/components/marketing-sections"
import { useScanWorkflow } from "@/hooks/use-scan-workflow"

const AnimatedBackground = dynamic(
  () =>
    import("@/components/animated-background").then(
      (mod) => mod.AnimatedBackground,
    ),
  { ssr: false },
)

const ScanningOverlay = dynamic(
  () =>
    import("@/components/scanning-overlay").then((mod) => mod.ScanningOverlay),
  { ssr: false },
)

export default function AuthLayerDashboard() {
  const {
    isScanning,
    scanProgress,
    currentStep,
    scanResult,
    scanHistory,
    scanError,
    runScan,
    clearResult,
  } = useScanWorkflow()

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <Navbar />

      <main>
        {!scanResult ? (
          <>
            <HeroSection />
            <UploadPanel
              onScanStart={runScan}
              isScanning={isScanning}
              errorMessage={scanError}
            />
            <HowItWorksPipeline />
            <DocumentationSection />
            <PricingSection />
            <ScanHistoryTable history={scanHistory} />
          </>
        ) : (
          <div id="results" className="pt-24">
            <TrustResultsDashboard result={scanResult} onClose={clearResult} />
          </div>
        )}
      </main>

      <AnimatePresence>
        {isScanning && (
          <ScanningOverlay progress={scanProgress} currentStep={currentStep} />
        )}
      </AnimatePresence>
    </div>
  )
}
