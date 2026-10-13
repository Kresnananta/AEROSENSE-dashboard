import { useState } from 'react'
import { PageHeading } from '@/components/shared/PageHeading'
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
import { useToast } from '@/components/shared/Toast'

const MOCK_USERS = [
  { id: 'USR-01', name: 'Ilan', role: 'Administrator', email: 'ilan@aerosense.id', status: 'Active' },
  { id: 'USR-02', name: 'Budi', role: 'Operator', email: 'budi@aerosense.id', status: 'Active' },
  { id: 'USR-03', name: 'Siti', role: 'Viewer', email: 'siti@aerosense.id', status: 'Inactive' },
]

const MOCK_NODES = [
  { id: 'N-01', name: 'Cerme (AS-CRM-01)', type: 'ESP32 + SPS30', firmware: 'v2.4.1', interval: '5s' },
  { id: 'N-02', name: 'Gresik Kota (AS-GRK-02)', type: 'ESP32 + SPS30', firmware: 'v2.4.1', interval: '5s' },
  { id: 'N-03', name: 'Manyar (AS-MYR-03)', type: 'ESP32 + BME680', firmware: 'v2.4.1', interval: '5s' },
  { id: 'N-04', name: 'Sidayu (AS-SDY-05)', type: 'ESP32 + SPS30', firmware: 'v2.4.1', interval: '5s' },
]

export function SystemPage() {
  const [activeTab, setActiveTab] = useState('users')
  const { showToast } = useToast()

  const handleSave = (message: string) => {
    showToast(message)
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeading
        eyebrow="PENGATURAN • SISTEM"
        title="Konfigurasi Sistem"
        titleAccent="& Akses"
        description="Manajemen pengguna, perangkat node, ambang batas, dan integrasi API"
        badge={
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-[#e7f3ff] text-[#086cf0] border border-[#cbe3ff]">
            AEROSENSE Core v2.4
          </span>
        }
      />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        orientation="vertical"
        className="flex flex-col md:flex-row gap-5 items-start"
      >
        <div className="w-full md:w-64 shrink-0">
          <TabsList className="flex flex-col h-auto w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-2 space-y-1 shadow-sm">
            <TabsTrigger
              value="users"
              className="w-full justify-start py-2.5 px-3.5 rounded-xl font-bold text-xs data-[state=active]:bg-primary-50 dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary-600 dark:data-[state=active]:text-primary-400"
            >
              <Users className="w-4 h-4 mr-2.5" />
              Manajemen Pengguna
            </TabsTrigger>
            <TabsTrigger
              value="nodes"
              className="w-full justify-start py-2.5 px-3.5 rounded-xl font-bold text-xs data-[state=active]:bg-primary-50 dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary-600 dark:data-[state=active]:text-primary-400"
            >
              <Network className="w-4 h-4 mr-2.5" />
              Manajemen Node
            </TabsTrigger>
            <TabsTrigger
              value="thresholds"
              className="w-full justify-start py-2.5 px-3.5 rounded-xl font-bold text-xs data-[state=active]:bg-primary-50 dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary-600 dark:data-[state=active]:text-primary-400"
            >
              <BellRing className="w-4 h-4 mr-2.5" />
              Ambang Batas
            </TabsTrigger>
            <TabsTrigger
              value="mqtt"
              className="w-full justify-start py-2.5 px-3.5 rounded-xl font-bold text-xs data-[state=active]:bg-primary-50 dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary-600 dark:data-[state=active]:text-primary-400"
            >
              <Settings2 className="w-4 h-4 mr-2.5" />
              Koneksi MQTT
            </TabsTrigger>
            <TabsTrigger
              value="api"
              className="w-full justify-start py-2.5 px-3.5 rounded-xl font-bold text-xs data-[state=active]:bg-primary-50 dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary-600 dark:data-[state=active]:text-primary-400"
            >
              <Key className="w-4 h-4 mr-2.5" />
              API & Integrasi
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 w-full min-w-0">
          <TabsContent value="users" className="mt-0 border-none p-0 outline-none">
            <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
              <CardHeader className="flex flex-row items-center justify-between p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                    Pengguna Terdaftar
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Kelola hak akses dan peran pengguna dashboard
                  </CardDescription>
                </div>
                <Button size="sm" className="rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs">
                  <Plus className="w-4 h-4 mr-1.5" /> Tambah Pengguna
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                      <TableHead className="pl-6">Nama</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                    {MOCK_USERS.map((user) => (
                      <TableRow key={user.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <TableCell className="pl-6 font-bold text-slate-900 dark:text-white">{user.name}</TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-300">{user.email}</TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-300 font-medium">{user.role}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              user.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
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
            <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
              <CardHeader className="flex flex-row items-center justify-between p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                    Daftar Perangkat Node
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Manajemen hardware sensor yang terhubung
                  </CardDescription>
                </div>
                <Button size="sm" className="rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs">
                  <Plus className="w-4 h-4 mr-1.5" /> Tambah Node
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                      <TableHead className="pl-6">Nama Node</TableHead>
                      <TableHead>Tipe Hardware</TableHead>
                      <TableHead>Versi Firmware</TableHead>
                      <TableHead>Interval Update</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                    {MOCK_NODES.map((node) => (
                      <TableRow key={node.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <TableCell className="pl-6 font-bold text-slate-900 dark:text-white">{node.name}</TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-300">{node.type}</TableCell>
                        <TableCell className="font-mono text-slate-600 dark:text-slate-300">{node.firmware}</TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-300">{node.interval}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="thresholds" className="mt-0 border-none p-0 outline-none">
            <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-2xl bg-white dark:bg-slate-900 p-5 sm:p-6">
              <CardHeader className="p-0 mb-5">
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Ambang Batas Peringatan
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Konfigurasi nilai maksimal sebelum peringatan dipicu
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="pm25" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Ambang Kritis PM2.5 (µg/m³)
                    </Label>
                    <Input id="pm25" defaultValue="150" className="rounded-xl text-xs bg-slate-50/50 dark:bg-slate-800" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="tvoc" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Ambang Kritis TVOC (ppb)
                    </Label>
                    <Input id="tvoc" defaultValue="1000" className="rounded-xl text-xs bg-slate-50/50 dark:bg-slate-800" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="eco2" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Ambang Kritis eCO₂ (ppm)
                    </Label>
                    <Input id="eco2" defaultValue="1200" className="rounded-xl text-xs bg-slate-50/50 dark:bg-slate-800" />
                  </div>
                </div>
                <div className="pt-3 flex items-center space-x-2 border-t border-slate-100 dark:border-slate-800">
                  <Switch id="auto-alert" defaultChecked />
                  <Label htmlFor="auto-alert" className="text-xs text-slate-600 dark:text-slate-300">
                    Kirim notifikasi email otomatis jika melampaui batas kritis
                  </Label>
                </div>
                <Button
                  onClick={() => handleSave('Ambang batas berhasil diperbarui.')}
                  className="mt-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs cursor-pointer"
                >
                  Simpan Konfigurasi
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mqtt" className="mt-0 border-none p-0 outline-none">
            <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-2xl bg-white dark:bg-slate-900 p-5 sm:p-6">
              <CardHeader className="p-0 mb-5">
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Konfigurasi MQTT Broker
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Pengaturan koneksi untuk menerima data realtime dari node
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="broker-url" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Broker URL
                    </Label>
                    <Input id="broker-url" defaultValue="mqtt://broker.hivemq.com" className="rounded-xl text-xs bg-slate-50/50 dark:bg-slate-800" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="port" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Port
                    </Label>
                    <Input id="port" defaultValue="1883" className="rounded-xl text-xs bg-slate-50/50 dark:bg-slate-800" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="username" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Username (Opsional)
                    </Label>
                    <Input id="username" placeholder="Masukkan username" className="rounded-xl text-xs bg-slate-50/50 dark:bg-slate-800" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Password (Opsional)
                    </Label>
                    <Input id="password" type="password" placeholder="••••••••" className="rounded-xl text-xs bg-slate-50/50 dark:bg-slate-800" />
                  </div>
                </div>
                <Button
                  onClick={() => handleSave('Koneksi MQTT berhasil diupdate.')}
                  className="mt-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs cursor-pointer"
                >
                  Update Koneksi
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="mt-0 border-none p-0 outline-none">
            <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-2xl bg-white dark:bg-slate-900 p-5 sm:p-6">
              <CardHeader className="p-0 mb-5">
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  API Access Keys
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Kelola token akses untuk integrasi pihak ketiga & machine learning
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl flex justify-between items-center bg-slate-50/60 dark:bg-slate-800/60">
                  <div>
                    <p className="font-bold text-xs text-slate-900 dark:text-white">ERP Integration Key</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Dibuat: 10 Jan 2026 • Status: Aktif</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSave('API Key baru berhasil di-generate.')}
                    className="rounded-xl text-xs font-bold"
                  >
                    Regenerate
                  </Button>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => handleSave('Modal pembuatan API Key dibuka.')}
                  className="w-full rounded-xl text-xs font-bold"
                >
                  <Plus className="w-4 h-4 mr-1.5" /> Buat API Key Baru
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
