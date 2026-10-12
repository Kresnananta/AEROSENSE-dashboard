import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Leaf, Download, Factory, FileSpreadsheet, FileText } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const MOCK_EMISSIONS = [
  { id: 1, date: '2026-07-26', nodeName: 'Node Pabrik 01', co2e: '124.5 kg', compliance: 'Patuh' },
  { id: 2, date: '2026-07-25', nodeName: 'Node Pabrik 01', co2e: '130.2 kg', compliance: 'Waspada' },
  { id: 3, date: '2026-07-26', nodeName: 'Node Kawasan Berikat', co2e: '45.1 kg', compliance: 'Patuh' },
  { id: 4, date: '2026-07-26', nodeName: 'Node Sidomoro 01', co2e: '22.8 kg', compliance: 'Patuh' },
]

const MOCK_AUDIT = [
  { id: 'AUD-001', timestamp: '2026-07-26 14:00', user: 'Ilan (Admin)', action: 'Ubah Ambang Batas PM2.5 (100 -> 120)', status: 'Success' },
  { id: 'AUD-002', timestamp: '2026-07-26 10:15', user: 'System', action: 'Generate Critical Alert ALT-101', status: 'Success' },
  { id: 'AUD-003', timestamp: '2026-07-25 16:30', user: 'Budi (Operator)', action: 'Resolve Alert ALT-098', status: 'Success' },
]

export function ESGReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Laporan ESG & Jejak Karbon
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pantau kepatuhan lingkungan dan rekam jejak emisi untuk pelaporan
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-primary-600 hover:bg-primary-700 text-white">
              <Download className="mr-2 h-4 w-4" />
              Unduh Laporan
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <FileText className="mr-2 h-4 w-4 text-red-500" />
              Format PDF
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
              Format Excel
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileSpreadsheet className="mr-2 h-4 w-4 text-slate-500" />
              Format CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Emisi CO₂e (Bulan Ini)</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">1,245 <span className="text-lg font-normal text-muted-foreground">ton</span></div>
            <p className="text-xs text-green-400 font-medium mt-1">↓ 12% dari bulan lalu</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Skor Kepatuhan</CardTitle>
            <Leaf className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">92/100</div>
            <p className="text-xs text-muted-foreground mt-1">Sertifikasi PROPER Hijau</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rata-rata PM2.5</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">24.5 <span className="text-lg font-normal text-muted-foreground">µg/m³</span></div>
            <p className="text-xs text-muted-foreground mt-1">Sesuai standar WHO</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Insiden Kritis</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">2</div>
            <p className="text-xs text-muted-foreground mt-1">Bulan ini</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="emissions" className="space-y-4">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="emissions">Log Emisi Harian</TabsTrigger>
          <TabsTrigger value="audit">Jejak Audit (Audit Trail)</TabsTrigger>
        </TabsList>

        <TabsContent value="emissions">
          <Card className="border-border/50 shadow-sm overflow-hidden p-0">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Lokasi</TableHead>
                    <TableHead>Estimasi Emisi (CO₂e)</TableHead>
                    <TableHead className="text-right">Status Kepatuhan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_EMISSIONS.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.date}</TableCell>
                      <TableCell>{log.nodeName}</TableCell>
                      <TableCell>{log.co2e}</TableCell>
                      <TableCell className="text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${log.compliance === 'Patuh'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                          }`}>
                          {log.compliance}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card className="border-border/50 shadow-sm overflow-hidden p-0">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID Audit</TableHead>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Pengguna / Sistem</TableHead>
                    <TableHead>Aktivitas</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_AUDIT.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium text-xs text-muted-foreground">{log.id}</TableCell>
                      <TableCell>{log.timestamp}</TableCell>
                      <TableCell className="font-medium">{log.user}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell className="text-right">
                        <span className="text-green-600 text-xs font-medium">{log.status}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
