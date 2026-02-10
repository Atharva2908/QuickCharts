'use client'

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { API_BASE_URL } from '@/lib/constants'


interface DataPreviewTableProps {
  rows: any[]
  columns: string[]
}


export default function DataPreviewTable({ rows, columns }: DataPreviewTableProps) {
  const displayRows = rows.slice(0, 50)

  // Generate column distribution charts for table header
  const columnCharts = columns.map(col => {
    const colValues = rows.map(row => row[col]).filter(val => val !== null && val !== undefined && !isNaN(Number(val)))
    if (colValues.length === 0) return null

    const numericValues = colValues.map(v => Number(v)).filter(v => !isNaN(v))
    if (numericValues.length === 0) return null

    const min = Math.min(...numericValues)
    const max = Math.max(...numericValues)
    const avg = numericValues.reduce((a, b) => a + b, 0) / numericValues.length

    const chartConfig = {
      type: 'bar',
      data: {
        labels: ['Min', 'Avg', 'Max'],
        datasets: [{
          label: col.substring(0, 8),
          data: [min, avg, max],
          backgroundColor: ['#ef4444', '#10b981', '#3b82f6'],
          borderRadius: 4
        }]
      },
      options: {
        plugins: {
          legend: { display: false },
          title: { 
            display: false 
          }
        },
        scales: {
          x: { display: false },
          y: { display: false }
        }
      }
    }

    return `${API_BASE_URL}/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&w=80&h=40&f=png`
  })

  return (
    <div className="w-full space-y-4">
      {/* Table with Chart Headers */}
      <ScrollArea className="w-full h-[600px] border rounded-lg border-border/40 bg-card/50">
        <Table>
          <TableHeader>
            <TableRow className="border-border/40 hover:bg-transparent">
              {columns.map((col, idx) => (
                <TableHead 
                  key={col}
                  className="text-foreground font-semibold bg-primary/5 sticky top-0 z-10 text-xs py-3 px-2 max-w-[150px]"
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="font-bold text-primary/90 truncate w-20 text-center">
                      {col.substring(0, 12)}
                    </div>
                    {columnCharts[idx] && (
                      <div className="w-20 h-10 bg-background/80 rounded border border-border/50 p-1">
                        <img
                          src={columnCharts[idx]}
                          alt={`${col} distribution`}
                          className="w-full h-full object-contain rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {displayRows.map((row, idx) => (
              <TableRow key={idx} className="border-b border-border/20 hover:bg-accent/30 transition-colors">
                {columns.map((col) => {
                  const value = row[col]
                  const isMissing = value === null || value === undefined
                  
                  return (
                    <TableCell 
                      key={`${idx}-${col}`} 
                      className="py-3 px-2 text-xs max-w-[150px] truncate"
                    >
                      {isMissing ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-destructive/10 text-destructive/80 rounded-full text-xs font-medium">
                          <span className="w-1.5 h-1.5 bg-destructive/60 rounded-full" />
                          Missing
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="truncate font-mono bg-background/50 px-2 py-1 rounded text-foreground/90">
                            {String(value).substring(0, 30) || '—'}
                          </span>
                          {typeof value === 'number' && (
                            <span className="text-xs text-muted-foreground font-mono">
                              {Number(value).toFixed(1)}
                            </span>
                          )}
                        </div>
                      )}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Summary Footer */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 text-sm bg-card/30 border-t border-border/40 rounded-b-lg">
        <div className="flex-1">
          <span className="font-medium text-foreground">
            Showing first <strong>{displayRows.length}</strong> of <strong>{rows.length.toLocaleString()}</strong> rows
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>Total columns: {columns.length}</span>
          <span>Preview optimized for performance</span>
          <span className="hidden md:inline">📊 Distribution charts powered by QuickChart</span>
        </div>
      </div>
    </div>
  )
}
