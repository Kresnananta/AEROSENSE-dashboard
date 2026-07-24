import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function NodeSummary() {
  return (
    <Card className="flex flex-col h-full border-border/50 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold text-foreground">
          Ringkasan Node
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col justify-between flex-1">
        <div className="mb-4">
          <div className="text-4xl font-bold text-foreground mb-1">12</div>
          <div className="text-sm text-muted-foreground">Node aktif terpasang</div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm text-muted-foreground flex-1">9 Aman</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-sm text-muted-foreground flex-1">2 Waspada</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-sm text-muted-foreground flex-1">1 Bahaya</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
