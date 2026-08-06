import { supabase } from './supabase'
import type { Node, NodeReading } from '../types/node.types'

export async function getNodes(): Promise<Node[]> {
  const { data, error } = await supabase.from('nodes').select('*')

  if (error) {
    throw new Error(`Gagal memuat daftar node: ${error.message}`)
  }

  if (!data || data.length === 0) {
    return []
  }

  return data.map((item: any) => ({
    id: item.id,
    name: item.name,
    location: item.location,
    status: item.status ?? 'online',
    batteryLevel: Number(item.battery_level ?? 100),
    uptime: Number(item.uptime ?? 100),
    latency: Number(item.latency ?? 12),
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }))
}

export async function getNodeReadings(nodeId?: string): Promise<NodeReading[]> {
  let query = supabase
    .from('node_readings')
    .select('*')

  if (nodeId) {
    query = query.eq('node_id', nodeId)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Gagal memuat pembacaan sensor: ${error.message}`)
  }

  return (data || []).map((item: any) => {
    const co2Value = Number(item.co2 ?? item.eco2 ?? 0)
    return {
      id: item.id,
      nodeId: item.node_id,
      pm25: Number(item.pm25 ?? 0),
      tvoc: Number(item.tvoc ?? 0),
      co2: co2Value,
      eco2: co2Value,
      temperature: Number(item.temperature ?? 0),
      humidity: Number(item.humidity ?? 0),
      aqi: Number(item.aqi ?? 0),
      quality: item.quality ?? 'good',
      timestamp: item.timestamp ?? new Date().toISOString(),
    }
  })
}