import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { ROUTES } from '@/lib/constants'

const MOCK_NODES = [
  {
    id: '1',
    name: 'Node Sidomoro 01',
    status: 'online',
    pm25: 18,
    tvoc: 142,
    eco2: 410,
    temp: 29,
    humidity: 68,
    lastUpdate: '2 menit lalu'
  },
  {
    id: '2',
    name: 'Node Sidomoro 02',
    status: 'warning',
    pm25: 35,
    tvoc: 280,
    eco2: 500,
    temp: 30,
    humidity: 65,
    lastUpdate: '5 menit lalu'
  },
  {
    id: '3',
    name: 'Node Pabrik 01',
    status: 'online',
    pm25: 15,
    tvoc: 120,
    eco2: 400,
    temp: 28,
    humidity: 66,
    lastUpdate: '1 menit lalu'
  },
  {
    id: '4',
    name: 'Node Kawasan Berikat',
    status: 'critical',
    pm25: 75,
    tvoc: 500,
    eco2: 800,
    temp: 31,
    humidity: 60,
    lastUpdate: 'Sekarang'
  },
]

export function NodeMonitoringPage() {
  const navigate = useNavigate()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge className="bg-green-500 hover:bg-green-600 border-transparent text-white">Online</Badge>
      case 'warning':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 border-transparent text-white">Warning</Badge>
      case 'critical':
        return <Badge className="bg-red-500 hover:bg-red-600 border-transparent text-white">Critical</Badge>
      default:
        return <Badge variant="secondary">Offline</Badge>
    }
  }

  const handleRowClick = (id: string) => {
    navigate(ROUTES.NODE_DETAIL.replace(':id', id))
  }

  return (
    <div className="flex flex-col space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Monitoring Node
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Daftar semua sensor node beserta nilai pengukuran terkininya
        </p>
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/30">
            <TableRow className="hover:bg-transparent">
              <TableHead>Nama Node</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">PM2.5 (µg/m³)</TableHead>
              <TableHead className="text-right">TVOC (ppb)</TableHead>
              <TableHead className="text-right">eCO₂ (ppm)</TableHead>
              <TableHead className="text-right">Suhu (°C)</TableHead>
              <TableHead className="text-right">Kelembapan (%)</TableHead>
              <TableHead className="text-right">Pembaruan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_NODES.map((node) => (
              <TableRow 
                key={node.id} 
                className="cursor-pointer hover:bg-secondary/50 transition-colors"
                onClick={() => handleRowClick(node.id)}
              >
                <TableCell className="font-medium">{node.name}</TableCell>
                <TableCell>{getStatusBadge(node.status)}</TableCell>
                <TableCell className="text-right font-medium">{node.pm25}</TableCell>
                <TableCell className="text-right">{node.tvoc}</TableCell>
                <TableCell className="text-right">{node.eco2}</TableCell>
                <TableCell className="text-right">{node.temp}</TableCell>
                <TableCell className="text-right">{node.humidity}</TableCell>
                <TableCell className="text-right text-muted-foreground">{node.lastUpdate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
