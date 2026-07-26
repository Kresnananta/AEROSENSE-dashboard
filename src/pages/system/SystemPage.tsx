import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Settings2, Users, Network, BellRing, Key } from 'lucide-react'

// Mock Data
const MOCK_USERS = [
  { id: 'USR-01', name: 'Ilan', role: 'Administrator', email: 'ilan@aerosense.id', status: 'Active' },
  { id: 'USR-02', name: 'Budi', role: 'Operator', email: 'budi@aerosense.id', status: 'Active' },
  { id: 'USR-03', name: 'Siti', role: 'Viewer', email: 'siti@aerosense.id', status: 'Inactive' },
]

const MOCK_NODES = [
  { id: 'N-01', name: 'Node Pabrik 01', type: 'ESP32', firmware: 'v1.2.4', interval: '5m' },
  { id: 'N-02', name: 'Node Kawasan Berikat', type: 'ESP32', firmware: 'v1.2.4', interval: '5m' },
  { id: 'N-03', name: 'Node Sidomoro 01', type: 'Raspberry Pi', firmware: 'v2.0.1', interval: '1m' },
]

export function SystemPage() {
  const [activeTab, setActiveTab] = useState('users')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Konfigurasi Sistem
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manajemen pengguna, perangkat node, ambang batas, dan integrasi API
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 flex flex-col md:flex-row gap-6">
        <div className="md:w-64 flex-shrink-0">
          <TabsList className="flex flex-col h-auto bg-transparent space-y-1 p-0">
            <TabsTrigger 
              value="users" 
              className="w-full justify-start py-2.5 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border border-border/50 rounded-lg"
            >
              <Users className="w-4 h-4 mr-2" />
              Manajemen Pengguna
            </TabsTrigger>
            <TabsTrigger 
              value="nodes" 
              className="w-full justify-start py-2.5 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border border-border/50 rounded-lg"
            >
              <Network className="w-4 h-4 mr-2" />
              Manajemen Node
            </TabsTrigger>
            <TabsTrigger 
              value="thresholds" 
              className="w-full justify-start py-2.5 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border border-border/50 rounded-lg"
            >
              <BellRing className="w-4 h-4 mr-2" />
              Ambang Batas (Threshold)
            </TabsTrigger>
            <TabsTrigger 
              value="mqtt" 
              className="w-full justify-start py-2.5 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border border-border/50 rounded-lg"
            >
              <Settings2 className="w-4 h-4 mr-2" />
              Koneksi MQTT
            </TabsTrigger>
            <TabsTrigger 
              value="api" 
              className="w-full justify-start py-2.5 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border border-border/50 rounded-lg"
            >
              <Key className="w-4 h-4 mr-2" />
              API & Integrasi
            </TabsTrigger>
          </TabsList>
        </div>
        
        <div className="flex-1">
          <TabsContent value="users" className="mt-0 border-none p-0 outline-none">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Pengguna Terdaftar</CardTitle>
                  <CardDescription>Kelola hak akses dan peran pengguna dashboard</CardDescription>
                </div>
                <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Tambah Pengguna</Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_USERS.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {user.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nodes" className="mt-0 border-none p-0 outline-none">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Daftar Perangkat Node</CardTitle>
                  <CardDescription>Manajemen hardware sensor yang terhubung</CardDescription>
                </div>
                <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Tambah Node</Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Node</TableHead>
                      <TableHead>Tipe Hardware</TableHead>
                      <TableHead>Versi Firmware</TableHead>
                      <TableHead>Interval Update</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_NODES.map((node) => (
                      <TableRow key={node.id}>
                        <TableCell className="font-medium">{node.name}</TableCell>
                        <TableCell>{node.type}</TableCell>
                        <TableCell>{node.firmware}</TableCell>
                        <TableCell>{node.interval}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="thresholds" className="mt-0 border-none p-0 outline-none">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>Ambang Batas Peringatan</CardTitle>
                <CardDescription>Konfigurasi nilai maksimal sebelum peringatan dipicu</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="pm25">Ambang Kritis PM2.5 (µg/m³)</Label>
                    <Input id="pm25" defaultValue="150" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tvoc">Ambang Kritis TVOC (ppb)</Label>
                    <Input id="tvoc" defaultValue="1000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eco2">Ambang Kritis eCO₂ (ppm)</Label>
                    <Input id="eco2" defaultValue="1200" />
                  </div>
                </div>
                <div className="pt-4 flex items-center space-x-2">
                  <Switch id="auto-alert" defaultChecked />
                  <Label htmlFor="auto-alert">Kirim notifikasi email otomatis jika melampaui batas kritis</Label>
                </div>
                <Button className="mt-4">Simpan Konfigurasi</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mqtt" className="mt-0 border-none p-0 outline-none">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>Konfigurasi MQTT Broker</CardTitle>
                <CardDescription>Pengaturan koneksi untuk menerima data realtime dari node</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="broker-url">Broker URL</Label>
                    <Input id="broker-url" defaultValue="mqtt://broker.hivemq.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="port">Port</Label>
                    <Input id="port" defaultValue="1883" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username (Opsional)</Label>
                    <Input id="username" placeholder="Masukkan username" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password (Opsional)</Label>
                    <Input id="password" type="password" placeholder="••••••••" />
                  </div>
                </div>
                <Button className="mt-4">Update Koneksi</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="api" className="mt-0 border-none p-0 outline-none">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>API Access Keys</CardTitle>
                <CardDescription>Kelola token akses untuk integrasi pihak ketiga</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-md flex justify-between items-center bg-slate-50">
                    <div>
                      <p className="font-medium text-sm">ERP Integration Key</p>
                      <p className="text-xs text-muted-foreground mt-1">Dibuat: 10 Jan 2026</p>
                    </div>
                    <Button variant="outline" size="sm">Regenerate</Button>
                  </div>
                  <Button variant="secondary" className="w-full"><Plus className="w-4 h-4 mr-2" /> Buat API Key Baru</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
