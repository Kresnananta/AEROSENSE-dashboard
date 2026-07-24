/**
 * ============================================
 * Sensor Type Definitions
 * ============================================
 */

/** Sensor device information */
export interface Sensor {
  id: string
  name: string
  location: string
  status: SensorStatus
  type: SensorType
  lastReading?: SensorReading
  createdAt: string
  updatedAt: string
}

/** Sensor operational status */
export type SensorStatus = 'online' | 'offline' | 'maintenance' | 'error'

/** Types of sensors supported */
export type SensorType =
  | 'temperature'
  | 'humidity'
  | 'pm25'
  | 'pm10'
  | 'co2'
  | 'voc'
  | 'noise'

/** Individual sensor reading */
export interface SensorReading {
  id: string
  sensorId: string
  value: number
  unit: string
  quality: AirQualityLevel
  timestamp: string
}

/** Air quality index levels */
export type AirQualityLevel =
  | 'good'
  | 'moderate'
  | 'unhealthy-sensitive'
  | 'unhealthy'
  | 'very-unhealthy'
  | 'hazardous'

/** Sensor data query parameters */
export interface SensorQueryParams {
  page?: number
  limit?: number
  status?: SensorStatus
  type?: SensorType
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
