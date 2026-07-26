import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Mock correlation matrix (1.0 to -1.0)
const params = ['PM2.5', 'TVOC', 'eCO2', 'Suhu', 'Lembap']
const matrix = [
  [1.00, 0.85, 0.72, 0.12, -0.24],
  [0.85, 1.00, 0.89, 0.15, -0.18],
  [0.72, 0.89, 1.00, 0.08, -0.10],
  [0.12, 0.15, 0.08, 1.00, -0.85],
  [-0.24, -0.18, -0.10, -0.85, 1.00],
]

// Helper to get color based on correlation value
function getCorrelationColor(value: number) {
  if (value === 1) return 'bg-primary-500 text-white' // Perfect
  if (value > 0.7) return 'bg-primary-400 text-white' // Strong positive
  if (value > 0.3) return 'bg-primary-200 text-primary-900' // Weak positive
  if (value > -0.3) return 'bg-slate-100 text-slate-500' // Neutral
  if (value > -0.7) return 'bg-red-200 text-red-900' // Weak negative
  return 'bg-red-400 text-white' // Strong negative
}

export function CorrelationMatrix() {
  return (
    <Card className="flex flex-col border-border/50 shadow-sm h-full overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-bold text-foreground">
          Matriks Korelasi Sensor
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Hubungan statistik antar parameter pengukuran
        </p>
      </CardHeader>
      <CardContent className="flex-1 overflow-x-auto">
        <div className="min-w-[400px]">
          <div className="grid grid-cols-6 gap-1 mb-1">
            <div className="h-8"></div>
            {params.map(p => (
              <div key={`header-${p}`} className="h-8 flex items-center justify-center text-xs font-semibold text-muted-foreground">
                {p}
              </div>
            ))}
          </div>
          
          {matrix.map((row, i) => (
            <div key={`row-${i}`} className="grid grid-cols-6 gap-1 mb-1">
              <div className="h-10 flex items-center justify-end pr-3 text-xs font-semibold text-muted-foreground">
                {params[i]}
              </div>
              {row.map((val, j) => (
                <div 
                  key={`cell-${i}-${j}`} 
                  className={`h-10 flex items-center justify-center text-xs font-medium rounded-md transition-all hover:scale-105 cursor-default ${getCorrelationColor(val)}`}
                  title={`${params[i]} vs ${params[j]}: ${val.toFixed(2)}`}
                >
                  {val.toFixed(2)}
                </div>
              ))}
            </div>
          ))}
        </div>
        
        <div className="flex items-center gap-4 mt-6 justify-center text-xs text-muted-foreground">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-red-400"></div> -1.0 (Negatif)</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-slate-100 border"></div> 0.0 (Netral)</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-primary-500"></div> +1.0 (Positif)</div>
        </div>
      </CardContent>
    </Card>
  )
}
