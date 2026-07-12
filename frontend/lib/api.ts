import type {
  ForensicDetail,
  RiskLevel,
  ScanHistoryItem,
  ScanResult,
} from "@/lib/types/scan"

/**
 * Backend base URL. Must be supplied via NEXT_PUBLIC_API_BASE at build/deploy
 * time (e.g. in Vercel Project Settings -> Environment Variables). No
 * localhost fallback is used in production so misconfiguration fails loudly
 * instead of silently pointing at a developer's machine.
 */
export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? "").replace(
  /\/+$/,
  "",
)

const REQUEST_TIMEOUT_MS = 30_000
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB
export const ACCEPTED_FILE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]

export class ApiError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

export class ApiConfigError extends ApiError {
  constructor() {
    super(
      "Backend URL is not configured. Set NEXT_PUBLIC_API_BASE and redeploy.",
    )
    this.name = "ApiConfigError"
  }
}

function assertConfigured() {
  if (!API_BASE) {
    throw new ApiConfigError()
  }
}

/** Validates a File before it is sent to the backend. Returns an error message, or null if valid. */
export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
    return "Unsupported file type. Please upload a PNG, JPG, WEBP, or GIF image."
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "File is too large. Maximum upload size is 10MB."
  }
  if (file.size === 0) {
    return "The selected file is empty."
  }
  return null
}

/** Validates a URL string before it is sent to the backend. Returns an error message, or null if valid. */
export function validateImageUrl(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) {
    return "Enter a URL to scan."
  }
  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return "Enter a valid URL, including https://"
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return "URL must use http:// or https://"
  }
  return null
}

async function withTimeout<T>(
  run: (signal: AbortSignal) => Promise<T>,
): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    return await run(controller.signal)
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError(
        "The request timed out. Check your connection and try again.",
      )
    }
    if (error instanceof TypeError) {
      // fetch() rejects with TypeError on network failure / CORS / DNS issues
      throw new ApiError(
        "Unable to reach the backend. Check your connection or try again shortly.",
      )
    }
    throw error
  } finally {
    clearTimeout(timer)
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
  if (!API_BASE) return false
  try {
    const res = await withTimeout((signal) =>
      fetch(`${API_BASE}/`, { method: "GET", signal }),
    )
    return res.ok
  } catch {
    return false
  }
}

export async function scanImage(file: File): Promise<ScanResult> {
  assertConfigured()

  const validationError = validateImageFile(file)
  if (validationError) {
    throw new ApiError(validationError)
  }

  const formData = new FormData()
  formData.append("file", file)

  const res = await withTimeout((signal) =>
    fetch(`${API_BASE}/scan-image`, {
      method: "POST",
      body: formData,
      signal,
    }),
  )

  return parseResponse(res)
}

export async function scanUrl(url: string): Promise<ScanResult> {
  assertConfigured()

  const validationError = validateImageUrl(url)
  if (validationError) {
    throw new ApiError(validationError)
  }

  const res = await withTimeout((signal) =>
    fetch(`${API_BASE}/scan-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: url.trim() }),
      signal,
    }),
  )

  return parseResponse(res)
}

interface BackendHistoryRecord {
  id: number
  scan_type: string
  trust_score: number
  risk_level: string
  explanations?: string | null
  perceptual_hash?: string | null
  created_at?: string | null
}

/** Fetches persisted scan history from the backend (GET /history) and maps it to the dashboard shape. */
export async function getHistory(): Promise<ScanHistoryItem[]> {
  assertConfigured()

  const res = await withTimeout((signal) =>
    fetch(`${API_BASE}/history`, { method: "GET", signal }),
  )

  if (!res.ok) {
    throw new ApiError(`Failed to load scan history (${res.status})`, res.status)
  }

  const data = (await res.json()) as { results?: BackendHistoryRecord[] }
  const results = Array.isArray(data.results) ? data.results : []

  return results.map((record) => {
    const type: ScanHistoryItem["type"] =
      record.scan_type === "url" ? "url" : "image"
    const timestamp = record.created_at
      ? new Date(record.created_at).getTime()
      : Date.now()

    return {
      id: String(record.id),
      type,
      fileName:
        type === "url"
          ? "URL scan"
          : `Image scan${
              record.perceptual_hash ? ` · ${record.perceptual_hash.slice(0, 8)}` : ""
            }`,
      trustScore: record.trust_score,
      riskLevel: pickRiskLevel(record.risk_level),
      timestamp: Number.isFinite(timestamp) ? timestamp : Date.now(),
    }
  })
}
