/**
 * ============================================
 * ESG Report Type Definitions
 * ============================================
 */

export interface CarbonSummary {
  estimatedCO2e: number // in tons or kg
  avgTVOC: number // ppb
  avgPM25: number // µg/m³
  complianceScore: number // 0-100
}

export interface EmissionLog {
  id: string
  date: string
  nodeId: string
  nodeName: string
  co2: number // Estimated CO2e
  tvoc: number
  pm25: number
}

export interface AuditEntry {
  id: string
  timestamp: string
  userId: string
  userName: string
  action: string
  details: string
}
