import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHeading } from '@/components/shared/PageHeading'
import { NodeFilter, type FilterType } from '@/components/sensor-map/NodeFilter'
import { NodeDetailCard } from '@/components/sensor-map/NodeDetailCard'
import { NodeTable } from '@/components/sensor-map/NodeTable'
import { SensorMapContainer } from '@/components/map/MapContainer'
import { GRESIK_NODES_DATA } from '@/lib/mock-data'

export function SensorMapPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialNode = searchParams.get('node') || 'Gresik Kota'

  const [selectedNodeName, setSelectedNodeName] = useState(initialNode)
  const [filter, setFilter] = useState<FilterType>('semua')

  // Keep query param synced when node changes
  useEffect(() => {
    const nodeFromQuery = searchParams.get('node')
    if (nodeFromQuery && nodeFromQuery !== selectedNodeName) {
      setSelectedNodeName(nodeFromQuery)
    }
  }, [searchParams, selectedNodeName])

  const handleSelectNode = (name: string) => {
    setSelectedNodeName(name)
    setSearchParams({ node: name }, { replace: true })
  }

  // Calculate filtered nodes
  const filteredNodes = useMemo(() => {
    if (filter === 'baik') {
      return GRESIK_NODES_DATA.filter((n) => n.uiStatus === 'baik')
    }
    if (filter === 'perhatian') {
      return GRESIK_NODES_DATA.filter((n) => n.uiStatus === 'perhatian')
    }
    return GRESIK_NODES_DATA
  }, [filter])

  // Get active node object, fallback to first in list
  const activeNode = useMemo(() => {
    const found = GRESIK_NODES_DATA.find((n) => n.name === selectedNodeName)
    return found || GRESIK_NODES_DATA[1] // Default Gresik Kota
  }, [selectedNodeName])

  // Counts for filter tabs
  const counts = useMemo(() => {
    return {
      semua: GRESIK_NODES_DATA.length,
      baik: GRESIK_NODES_DATA.filter((n) => n.uiStatus === 'baik').length,
      perhatian: GRESIK_NODES_DATA.filter((n) => n.uiStatus === 'perhatian').length,
    }
  }, [])

  return (
    <div className="space-y-4">
      {/* Page Heading */}
      <PageHeading
        eyebrow="JARINGAN SENSOR • GRESIK, JAWA TIMUR"
        title="Peta sensor"
        titleAccent="di sekitar Anda."
        description="Pilih titik untuk melihat kualitas udara dan kondisi perangkat."
        badge={
          <span className="rounded-full bg-[#eef7ff] text-[#3883bf] border border-[#d6ebfc] text-[10px] font-bold px-3 py-1.5 whitespace-nowrap">
            Peta & lokasi sensor
          </span>
        }
      />

      {/* Segmented Filter Toolbar */}
      <NodeFilter
        currentFilter={filter}
        onChange={setFilter}
        counts={counts}
      />

      {/* Map + Selected Node Details */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_268px] gap-4 items-stretch">
        <SensorMapContainer
          nodes={filteredNodes}
          selectedNodeName={selectedNodeName}
          onSelectNode={handleSelectNode}
          heightClassName="h-[385px] sm:h-[420px]"
        />
        <NodeDetailCard node={activeNode} />
      </div>

      {/* Full Network Table */}
      <NodeTable
        nodes={filteredNodes}
        selectedNodeName={selectedNodeName}
        onSelectNode={handleSelectNode}
      />
    </div>
  )
}
