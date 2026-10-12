import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Search, Filter, AlertTriangle, Info, ShieldAlert } from 'lucide-react'

// Mock Data for Alerts
const MOCK_ALERTS = [
  {
    id: 'ALT-101',
    nodeName: 'Node Pabrik 01',
    timestamp: '2026-07-26T10:15:00',
    severity: 'critical',
    sensor: 'PM2.5',
    value: '125 µg/m³',
    threshold: '100 µg/m³',
    status: 'active',
    description: 'Level PM2.5 melebihi ambang batas aman secara signifikan.',
    recommendation: 'Segera periksa filter udara di area produksi dan pastikan ventilasi berjalan maksimal.',
  },
  {
    id: 'ALT-102',
    nodeName: 'Node Kawasan Berikat',
    timestamp: '2026-07-26T09:30:00',
    severity: 'warning',
    sensor: 'TVOC',
    value: '850 ppb',
    threshold: '800 ppb',
    status: 'active',
    description: 'Terdeteksi peningkatan TVOC perlahan selama 2 jam terakhir.',
    recommendation: 'Lakukan inspeksi visual di area penyimpanan bahan kimia.',
  },
  {
    id: 'ALT-103',
    nodeName: 'Node Sidomoro 01',
    timestamp: '2026-07-25T14:20:00',
    severity: 'info',
    sensor: 'System',
    value: 'Offline',
    threshold: 'N/A',
    status: 'resolved',
    description: 'Node kehilangan koneksi jaringan.',
    recommendation: 'Koneksi telah pulih. Tidak ada tindakan diperlukan.',
  }
]

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'critical': return <ShieldAlert className="h-4 w-4 text-red-600" />
    case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />
    case 'info': return <Info className="h-4 w-4 text-blue-500" />
    default: return null
  }
}

const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case 'critical': return <Badge variant="destructive">Kritis</Badge>
    case 'warning': return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Waspada</Badge>
    case 'info': return <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">Info</Badge>
    default: return <Badge variant="outline">{severity}</Badge>
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active': return <Badge variant="default" className="bg-primary-500">Aktif</Badge>
    case 'resolved': return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Terselesaikan</Badge>
    default: return <Badge variant="outline">{status}</Badge>
  }
}

export function AlertsPage() {
  const [selectedAlert, setSelectedAlert] = useState<typeof MOCK_ALERTS[0] | null>(null)
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Peringatan & Notifikasi
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pantau anomali data, status kritis sensor, dan log peringatan sistem
        </p>
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden p-0">
        <div className="p-4 border-b border-border/50 bg-slate-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari ID peringatan, lokasi..."
              className="pl-8 bg-white"
            />
          </div>
          <div className="flex w-full sm:w-auto items-center gap-2">
            <Select defaultValue="all-severity">
              <SelectTrigger className="w-[140px] bg-white">
                <SelectValue placeholder="Prioritas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-severity">Semua Prioritas</SelectItem>
                <SelectItem value="critical">Kritis</SelectItem>
                <SelectItem value="warning">Waspada</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="active">
              <SelectTrigger className="w-[140px] bg-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-status">Semua Status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="resolved">Terselesaikan</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="bg-white">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Prioritas</TableHead>
                <TableHead>Waktu (WIB)</TableHead>
                <TableHead>Lokasi Node</TableHead>
                <TableHead>Parameter</TableHead>
                <TableHead>Pesan</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_ALERTS.map((alert) => (
                <TableRow 
                  key={alert.id} 
                  className="cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setSelectedAlert(alert)}
                >
                  <TableCell className="font-medium text-xs">{alert.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(alert.severity)}
                      {getSeverityBadge(alert.severity)}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {new Date(alert.timestamp).toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell className="font-medium">{alert.nodeName}</TableCell>
                  <TableCell>{alert.sensor}</TableCell>
                  <TableCell className="max-w-[300px] truncate text-muted-foreground">
                    {alert.description}
                  </TableCell>
                  <TableCell className="text-right">
                    {getStatusBadge(alert.status)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedAlert} onOpenChange={(open) => !open && setSelectedAlert(null)}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedAlert && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  {getSeverityBadge(selectedAlert.severity)}
                  {getStatusBadge(selectedAlert.status)}
                </div>
                <DialogTitle className="text-xl">Detail Peringatan {selectedAlert.id}</DialogTitle>
                <DialogDescription>
                  Terdeteksi pada {new Date(selectedAlert.timestamp).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'long' })}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-sm font-medium text-muted-foreground">Lokasi Node</span>
                  <span className="col-span-3 font-medium">{selectedAlert.nodeName}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-sm font-medium text-muted-foreground">Parameter</span>
                  <span className="col-span-3 font-medium">{selectedAlert.sensor}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-sm font-medium text-muted-foreground">Nilai / Ambang</span>
                  <span className="col-span-3 font-medium text-red-600">
                    {selectedAlert.value} <span className="text-muted-foreground text-sm font-normal">/ max {selectedAlert.threshold}</span>
                  </span>
                </div>
                
                <div className="mt-4 border-t pt-4">
                  <h4 className="text-sm font-medium text-foreground mb-2">Deskripsi Peringatan</h4>
                  <p className="text-sm text-muted-foreground bg-slate-50 p-3 rounded-md">
                    {selectedAlert.description}
                  </p>
                </div>

                <div className="mt-2">
                  <h4 className="text-sm font-medium text-foreground mb-2">Rekomendasi Tindakan</h4>
                  <p className="text-sm text-primary-700 bg-primary-50 p-3 rounded-md border border-primary-100">
                    {selectedAlert.recommendation}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" onClick={() => setSelectedAlert(null)}>Tutup</Button>
                {selectedAlert.status === 'active' && (
                  <Button onClick={() => setSelectedAlert(null)}>Tandai Terselesaikan</Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
