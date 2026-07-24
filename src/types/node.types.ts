/**
 * ============================================
 * Node Type Definitions (Multi-sensor per node)
 * ============================================
 */

/** Node operational status */
export type NodeStatus = 'online' | 'offline' | 'warning' | 'critical'

/** Air quality index levels based on PRD Sec. 5 */
export type AirQualityLevel = 'good' | 'moderate' | 'unhealthy' | 'hazardous'

/** AI Soft-Sensing estimation data */
export interface AIEstimation {
  rawValue?: number
  estimatedValue: number
  correction: number
  confidence: number // 0-100 percentage
}

/** Complete reading for a node at a specific timestamp */
export interface NodeReading {
  id: string
  nodeId: string
  pm25: number // µg/m³
  tvoc: number // ppb
  eco2: number // ppm
  temperature: number // °C
  humidity: number // %
  aqi: number
  quality: AirQualityLevel
  timestamp: string
  
  // AI Estimation metrics for parameters that might be estimated
  estimations?: {
    eco2?: AIEstimation
    tvoc?: AIEstimation
  }
}

/** Node device information */
export interface Node {
  id: string
  name: string
  location: {
    lat: number
    lng: number
    address: string
  }
  status: NodeStatus
  lastReading?: NodeReading
  batteryLevel?: number // 0-100
  uptime: number // percentage
  latency: number // ms
  createdAt: string
  updatedAt: string
}

/** Data query parameters */
export interface NodeQueryParams {
  page?: number
  limit?: number
  status?: NodeStatus
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
