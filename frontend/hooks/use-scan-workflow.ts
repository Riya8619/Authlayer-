"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import {
  ApiConfigError,
  ApiError,
  getHistory,
  scanImage,
  scanUrl,
  validateImageFile,
  validateImageUrl,
} from "@/lib/api"
import type { ScanHistoryItem, ScanResult } from "@/lib/types/scan"

const SCAN_STEPS_COUNT = 5

function createHistoryItem(
  input: File | string,
  result: ScanResult,
): ScanHistoryItem {
  return {
    id: crypto.randomUUID(),
    type: typeof input === "string" ? "url" : "image",
    fileName: typeof input === "string" ? input : input.name,
    trustScore: result.trustScore,
    riskLevel: result.riskLevel,
    timestamp: Date.now(),
  }
}

export function useScanWorkflow() {
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([])
  const [scanError, setScanError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    getHistory()
      .then((items) => {
        if (!cancelled) setScanHistory(items)
      })
      .catch(() => {
        // Silent: an empty/unavailable history should not block the page.
        // Errors surface only for active scan attempts, not background hydration.
      })

    return () => {
      cancelled = true
    }
  }, [])

  const runScan = useCallback(async (input: File | string) => {
    let intervalId: ReturnType<typeof setInterval> | null = null

    const preflightError =
      typeof input === "string"
        ? validateImageUrl(input)
        : validateImageFile(input)

    if (preflightError) {
      setScanError(preflightError)
      toast.error("Invalid input", { description: preflightError })
      return
    }

    try {
      setScanError(null)
      setIsScanning(true)
      setCurrentStep(0)
      setScanProgress(6)

      let progress = 6
      intervalId = setInterval(() => {
        progress = Math.min(progress + 8, 92)
        const step = Math.min(
          Math.floor((progress / 100) * SCAN_STEPS_COUNT),
          SCAN_STEPS_COUNT - 1,
        )
        setScanProgress(progress)
        setCurrentStep(step)
      }, 480)

      const result =
        typeof input === "string" ? await scanUrl(input) : await scanImage(input)

      if (intervalId) clearInterval(intervalId)
      setCurrentStep(SCAN_STEPS_COUNT - 1)
      setScanProgress(100)
      setScanResult(result)
      setScanHistory((prev) => [createHistoryItem(input, result), ...prev])

      toast.success("Forensic scan completed", {
        description: `Trust score: ${result.trustScore} · ${result.riskLevel} risk`,
      })
    } catch (error) {
      const message =
        error instanceof ApiConfigError
          ? error.message
          : error instanceof ApiError
            ? error.message
            : error instanceof Error
              ? error.message
              : "Unable to complete scan. Check backend connectivity."

      setScanError(message)
      toast.error("Scan failed", { description: message })
    } finally {
      if (intervalId) clearInterval(intervalId)
      setIsScanning(false)
    }
  }, [])

  const clearResult = useCallback(() => {
    setScanResult(null)
    setScanError(null)
  }, [])

  return {
    isScanning,
    scanProgress,
    currentStep,
    scanResult,
    scanHistory,
    scanError,
    runScan,
    clearResult,
  }
}
