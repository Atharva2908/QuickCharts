'use client'

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface DataPreviewTableProps {
  rows: any[]
  columns: string[]
}

export default function DataPreviewTable({ rows, columns }: DataPreviewTableProps) {
  const displayRows = rows.slice(0, 50)

  return (
    <div className="w-full">
      <ScrollArea className="w-full h-full">
        <Table>
          <TableHeader>
            <TableRow className="border-border/40 hover:bg-transparent">
              {columns.map((col) => (
                <TableHead 
                  key={col}
                  className="text-foreground font-semibold bg-card/50 sticky top-0"
                >
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayRows.map((row, idx) => (
              <TableRow key={idx} className="border-border/40 hover:bg-primary/5">
                {columns.map((col) => (
                  <TableCell key={`${idx}-${col}`} className="text-muted-foreground">
                    {row[col] !== null && row[col] !== undefined 
                      ? String(row[col]).substring(0, 50)
                      : <span className="italic text-muted-foreground/50">null</span>
                    }
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      {rows.length > 50 && (
        <div className="p-4 text-sm text-muted-foreground bg-card/30 border-t border-border/40">
          Showing first 50 rows of {rows.length.toLocaleString()} total rows
        </div>
      )}
    </div>
  )
}
