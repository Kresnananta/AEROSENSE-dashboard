import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { ROUTES } from '@/lib/constants'
import { Search, Filter, ChevronRight } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const MOCK_NODES = [
  {
    id: '1',
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
    id: '2',
    name: 'Node Kawasan Berikat',
    status: 'critical',
    pm25: 75,
    tvoc: 500,
    eco2: 800,
    temp: 31,
    humidity: 60,
    lastUpdate: 'Sekarang'
  },
  {
    id: '3',
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
    id: '4',
    name: 'Node Gudang 02',
    status: 'offline',
    pm25: '-',
    tvoc: '-',
    eco2: '-',
    temp: '-',
    humidity: '-',
    lastUpdate: '2 jam lalu'
  },
]

export function NodeMonitoringPage() {
  const navigate = useNavigate()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-transparent shadow-none px-3">Online</Badge>
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-transparent shadow-none px-3">Warning</Badge>
      case 'critical':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-transparent shadow-none px-3">Critical</Badge>
      default:
        return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-transparent shadow-none px-3">Offline</Badge>
    }
  }

  const getRowClassName = (status: string) => {
    let base = "cursor-pointer transition-colors"
    switch (status) {
      case 'critical': return `${base} bg-red-50/50 hover:bg-red-50`
      case 'offline': return `${base} bg-slate-50/50 hover:bg-slate-50 opacity-80`
      default: return `${base} hover:bg-slate-50/50`
    }
  }

  const getValueClassName = (status: string, baseClass: string) => {
    if (status === 'critical') return `${baseClass} text-red-600`
    if (status === 'offline') return `${baseClass} text-muted-foreground/60`
    return baseClass
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

      <Card className="border-border/50 shadow-sm overflow-hidden p-0">
        <div className="p-4 border-b border-border/50 bg-slate-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Cari nama node..." 
              className="pl-9 bg-white"
            />
          </div>
          <div className="flex w-full sm:w-auto items-center gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px] bg-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="bg-white">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">Nama Node</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>PM2.5</TableHead>
              <TableHead>TVOC</TableHead>
              <TableHead>eCO2</TableHead>
              <TableHead>Suhu</TableHead>
              <TableHead>Lembap</TableHead>
              <TableHead>Pembaruan</TableHead>
              <TableHead className="pr-6"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_NODES.map((node) => (
              <TableRow 
                key={node.id} 
                className={getRowClassName(node.status)}
                onClick={() => handleRowClick(node.id)}
              >
                <TableCell className="pl-6 font-semibold text-slate-800 text-base">{node.name}</TableCell>
                <TableCell>{getStatusBadge(node.status)}</TableCell>
                <TableCell className={getValueClassName(node.status, "font-medium text-base")}>{node.pm25}</TableCell>
                <TableCell className={getValueClassName(node.status, "text-base")}>{node.tvoc}</TableCell>
                <TableCell className={getValueClassName(node.status, "text-base")}>{node.eco2}</TableCell>
                <TableCell className={getValueClassName(node.status, "text-base")}>{node.temp}</TableCell>
                <TableCell className={getValueClassName(node.status, "text-base")}>{node.humidity}</TableCell>
                <TableCell className={getValueClassName(node.status, "font-medium")}>{node.lastUpdate}</TableCell>
                <TableCell className="pr-6 text-right">
                  <ChevronRight className="h-5 w-5 inline-block text-muted-foreground/50" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
