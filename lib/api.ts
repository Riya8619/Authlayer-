import type { ForensicDetail, RiskLevel, ScanResult } from "@/lib/types/scan"

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000"

export class ApiError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

function buildForensicDetails(
  trustScore: number,
  riskLevel: RiskLevel,
  aiProbability: number,
  metadataScore: number,
  duplicateCount: number,
): ForensicDetail[] {
  const riskStatus: ForensicDetail["status"] =
    riskLevel === "low" ? "safe" : riskLevel === "medium" ? "warning" : "danger"

  return [
    {
      label: "Trust Index",
      value: `${trustScore}/100`,
      status: trustScore >= 70 ? "safe" : trustScore >= 40 ? "warning" : "danger",
    },
    {
      label: "AI Synthesis",
      value: `${aiProbability}%`,
      status: aiProbability > 70 ? "danger" : aiProbability > 40 ? "warning" : "safe",
    },
    {
      label: "Metadata Chain",
      value: `${metadataScore}%`,
      status: metadataScore >= 75 ? "safe" : metadataScore >= 50 ? "warning" : "danger",
    },
    {
      label: "Risk Posture",
      value: riskLevel.toUpperCase(),
      status: riskStatus,
    },
    {
      label: "Duplicate Signals",
      value: String(duplicateCount),
      status: duplicateCount === 0 ? "safe" : "warning",
    },
  ]
}

function pickRiskLevel(value: unknown): RiskLevel {
  const level = String(value ?? "medium").toLowerCase()
  if (level === "low" || level === "medium" || level === "high" || level === "critical") {
    return level
  }
  return "medium"
}

/** Unwrap nested backend payloads (trust_analysis) or flat camelCase/snake_case. */
export function normalizeScanResult(data: Record<string, unknown>): ScanResult {
  const nested = data.trust_analysis ?? data.trustAnalysis
  const source =
    nested && typeof nested === "object"
      ? (nested as Record<string, unknown>)
      : data

  const trustScore = Number(
    source.trustScore ?? source.trust_score ?? data.trustScore ?? 0,
  )
  const riskLevel = pickRiskLevel(
    source.riskLevel ?? source.risk_level ?? data.riskLevel,
  )
  const aiGeneratedProbability = Number(
    source.aiGeneratedProbability ??
      source.ai_generated_probability ??
      source.ai_probability ??
      data.aiGeneratedProbability ??
      0,
  )

  const rawMetadata =
    source.metadataIntegrity ??
    source.metadata_integrity ??
    data.metadataIntegrity ??
    data.metadata_integrity

  const metadataIntegrity: ScanResult["metadataIntegrity"] =
    rawMetadata && typeof rawMetadata === "object"
      ? {
          score: Number(
            (rawMetadata as Record<string, unknown>).score ?? 0,
          ),
          issues: Array.isArray((rawMetadata as Record<string, unknown>).issues)
            ? ((rawMetadata as Record<string, unknown>).issues as string[])
            : [],
        }
      : { score: 0, issues: [] }

  const duplicateCount = Number(
    source.duplicateCount ??
      source.duplicate_count ??
      data.duplicateCount ??
      0,
  )

  const explanations = Array.isArray(source.explanations)
    ? (source.explanations as string[])
    : Array.isArray(data.explanations)
      ? (data.explanations as string[])
      : []

  const forensicDetails = Array.isArray(data.forensicDetails)
    ? (data.forensicDetails as ForensicDetail[])
    : buildForensicDetails(
        trustScore,
        riskLevel,
        aiGeneratedProbability,
        metadataIntegrity.score,
        duplicateCount,
      )

  return {
    trustScore,
    riskLevel,
    aiGeneratedProbability,
    metadataIntegrity,
    duplicateCount,
    explanations,
    forensicDetails,
  }
}

async function parseResponse(res: Response): Promise<ScanResult> {
  const data = (await res.json()) as Record<string, unknown>

  if (!res.ok) {
    const detail = data.detail
    const message =
      typeof detail === "string"
        ? detail
        : detail
          ? JSON.stringify(detail)
          : `Request failed (${res.status})`
    throw new ApiError(message, res.status)
  }

  if (data.success === false) {
    throw new ApiError(
      typeof data.error === "string" ? data.error : "Scan failed",
      res.status,
    )
  }

  return normalizeScanResult(data)
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/`, { method: "GET" })
    return res.ok
  } catch {
    return false
  }
}

export async function scanImage(file: File): Promise<ScanResult> {
  const formData = new FormData()
  formData.append("file", file)

  const res = await fetch(`${API_BASE}/scan-image`, {
    method: "POST",
    body: formData,
  })

  return parseResponse(res)
}

export async function scanUrl(url: string): Promise<ScanResult> {
  const res = await fetch(`${API_BASE}/scan-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  })

  return parseResponse(res)
}
