import { Node, NodeReading } from '@/types/node.types'
import { Alert } from '@/types/alert.types'
import { CarbonSummary, EmissionLog } from '@/types/esg.types'

/**
 * ============================================
 * Mock Data for AEROSENSE Dashboard
 * ============================================
 */

export const mockNodes: Node[] = [
  {
    id: 'node-01',
    name: 'Node #01',
    location: { lat: -7.2504, lng: 112.7688, address: 'Sidomoro Sector A' },
    status: 'online',
    batteryLevel: 98,
    uptime: 99.9,
    latency: 24,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'node-02',
    name: 'Node #02',
    location: { lat: -7.2510, lng: 112.7695, address: 'Sidomoro Sector B' },
    status: 'warning',
    batteryLevel: 85,
    uptime: 99.5,
    latency: 45,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'node-03',
    name: 'Node #03',
    location: { lat: -7.2525, lng: 112.7670, address: 'Sidomoro Sector C' },
    status: 'online',
    batteryLevel: 92,
    uptime: 99.8,
    latency: 30,
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'node-04',
    name: 'Node #04',
    location: { lat: -7.2490, lng: 112.7710, address: 'Perimeter Fence' },
    status: 'offline',
    batteryLevel: 0,
    uptime: 85.0,
    latency: 0,
    createdAt: '2026-02-20T10:00:00Z',
    updatedAt: '2026-07-20T10:00:00Z',
  },
]

export const mockReadings: NodeReading[] = [
  {
    id: 'read-001',
    nodeId: 'node-01',
    pm25: 15.2,
    tvoc: 120,
    eco2: 410,
    temperature: 28.5,
    humidity: 65,
    aqi: 42,
    quality: 'good',
    timestamp: new Date().toISOString(),
    estimations: {
      eco2: {
        rawValue: undefined, // Purely estimated
        estimatedValue: 410,
        correction: 0,
        confidence: 92,
      },
    },
  },
  {
    id: 'read-002',
    nodeId: 'node-02',
    pm25: 55.4,
    tvoc: 450,
    eco2: 680,
    temperature: 29.2,
    humidity: 68,
    aqi: 85,
    quality: 'moderate',
    timestamp: new Date().toISOString(),
    estimations: {
      eco2: {
        rawValue: 700,
        estimatedValue: 680,
        correction: -20,
        confidence: 88,
      },
    },
  },
]

// Add last reading to mock nodes
mockNodes[0].lastReading = mockReadings[0]
mockNodes[1].lastReading = mockReadings[1]

export const mockAlerts: Alert[] = [
  {
    id: 'alert-1',
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(), // 10 mins ago
    nodeId: 'node-02',
    nodeName: 'Node #02',
    sensor: 'PM2.5',
    severity: 'warning',
    description: 'PM2.5 meningkat, gunakan masker saat beraktivitas di luar ruangan.',
    status: 'active',
    value: 55.4,
    threshold: 50.0,
  },
  {
    id: 'alert-2',
    timestamp: new Date(Date.now() - 60 * 60000).toISOString(), // 1 hr ago
    nodeId: 'node-01',
    nodeName: 'Node #01',
    sensor: 'System',
    severity: 'info',
    description: 'Kondisi udara kembali aman, tidak diperlukan tindakan.',
    status: 'resolved',
  },
  {
    id: 'alert-3',
    timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), // 1 day ago
    nodeId: 'system',
    nodeName: 'System',
    sensor: 'System',
    severity: 'info',
    description: 'Kualitas udara membaik 12% dibanding minggu sebelumnya.',
    status: 'acknowledged',
  }
]

export const mockCarbonSummary: CarbonSummary = {
  estimatedCO2e: 12450.5, // kg
  avgTVOC: 185.4,
  avgPM25: 24.2,
  complianceScore: 92,
}

export const mockEmissionLogs: EmissionLog[] = [
  {
    id: 'log-1',
    date: '2026-07-23',
    nodeId: 'node-01',
    nodeName: 'Node #01',
    co2: 45.2,
    tvoc: 110,
    pm25: 18.5,
  },
  {
    id: 'log-2',
    date: '2026-07-23',
    nodeId: 'node-02',
    nodeName: 'Node #02',
    co2: 68.5,
    tvoc: 350,
    pm25: 45.2,
  },
]

// Trend chart mock data
export const mockTrendData24h = Array.from({ length: 24 }, (_, i) => {
  const hour = new Date()
  hour.setHours(hour.getHours() - (23 - i))
  
  return {
    time: `${hour.getHours().toString().padStart(2, '0')}:00`,
    pm25: Math.floor(Math.random() * 30) + 15,
    tvoc: Math.floor(Math.random() * 200) + 100,
    eco2: Math.floor(Math.random() * 100) + 400,
  }
})
