import { api } from './api'
import type { Sensor, SensorReading, SensorQueryParams } from '@/types/sensor.types'
import type { PaginatedResponse } from '@/types/api.types'

/**
 * Sensor service.
 * CRUD operations and data retrieval for sensor devices.
 *
 * TODO: Implement actual API calls.
 */
export const sensorService = {
  /** Get paginated list of sensors */
  getAll: (params?: SensorQueryParams) => {
    const query = params
      ? '?' + new URLSearchParams(params as Record<string, string>).toString()
      : ''
    return api.get<PaginatedResponse<Sensor>>(`/sensors${query}`)
  },

  /** Get a single sensor by ID */
  getById: (id: string) =>
    api.get<Sensor>(`/sensors/${id}`),

  /** Get readings for a specific sensor */
  getReadings: (sensorId: string, limit = 50) =>
    api.get<SensorReading[]>(`/sensors/${sensorId}/readings?limit=${limit}`),

  /** Create a new sensor */
  create: (data: Partial<Sensor>) =>
    api.post<Sensor>('/sensors', data),

  /** Update a sensor */
  update: (id: string, data: Partial<Sensor>) =>
    api.put<Sensor>(`/sensors/${id}`, data),

  /** Delete a sensor */
  delete: (id: string) =>
    api.delete<void>(`/sensors/${id}`),
}
