export type RiskLevel = "low" | "medium" | "high" | "critical"

export type ForensicStatus = "safe" | "warning" | "danger"

export interface ForensicDetail {
  label: string
  value: string
  status: ForensicStatus
}

export interface ScanResult {
  trustScore: number
  riskLevel: RiskLevel
  aiGeneratedProbability: number
  metadataIntegrity: {
    score: number
    issues: string[]
  }
  duplicateCount: number
  explanations: string[]
  forensicDetails: ForensicDetail[]
}

export interface ScanHistoryItem {
  id: string
  type: "image" | "url"
  fileName: string
  trustScore: number
  riskLevel: RiskLevel
  timestamp: number
}
