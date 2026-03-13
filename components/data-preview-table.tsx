'use client'

import { useState, useMemo } from 'react'
import { 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  ChevronLeft, 
  ChevronRight, 
  Columns, 
  Download,
  Filter,
  MoreHorizontal,
  Type,
  Hash,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { API_BASE_URL } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface DataPreviewTableProps {
  rows: any[]
  columns: string[]
}

type SortConfig = {
  key: string | null
  direction: 'asc' | 'desc' | null
}

export default function DataPreviewTable({ rows, columns }: DataPreviewTableProps) {
  // State
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [visibleColumns, setVisibleColumns] = useState<string[]>(columns)

  // Handlers
  const handleSort = (column: string) => {
    let direction: 'asc' | 'desc' | null = 'asc'
    if (sortConfig.key === column && sortConfig.direction === 'asc') {
      direction = 'desc'
    } else if (sortConfig.key === column && sortConfig.direction === 'desc') {
      direction = null
    }
    setSortConfig({ key: direction ? column : null, direction })
  }

  const toggleColumn = (column: string) => {
    setVisibleColumns(prev => 
      prev.includes(column) 
        ? prev.filter(c => c !== column) 
        : [...prev, column]
    )
  }

  // Derived Data
  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows
    const term = searchTerm.toLowerCase()
    return rows.filter(row => 
      columns.some(col => 
        String(row[col]).toLowerCase().includes(term)
      )
    )
  }, [rows, searchTerm, columns])

  const sortedRows = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return filteredRows

    return [...filteredRows].sort((a, b) => {
      const aVal = a[sortConfig.key!]
      const bVal = b[sortConfig.key!]

      if (aVal === bVal) return 0
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      const result = aVal < bVal ? -1 : 1
      return sortConfig.direction === 'asc' ? result : -result
    })
  }, [filteredRows, sortConfig])

  const totalPages = Math.ceil(sortedRows.length / pageSize)
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedRows.slice(start, start + pageSize)
  }, [sortedRows, currentPage, pageSize])

  // Chart Generation logic (Memozied)
  const columnCharts = useMemo(() => {
    return columns.reduce((acc, col) => {
      const colValues = rows.map(row => row[col]).filter(val => val !== null && val !== undefined && !isNaN(Number(val)))
      if (colValues.length === 0) {
        acc[col] = null
        return acc
      }

      const numericValues = colValues.map(v => Number(v)).filter(v => !isNaN(v))
      if (numericValues.length === 0) {
        acc[col] = null
        return acc
      }

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
          legend: { display: false },
          title: { display: false },
          scales: {
            xAxes: [{ display: false }],
            yAxes: [{ display: false }]
          }
        }
      }

      acc[col] = `${API_BASE_URL}/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&w=80&h=40&f=png`
      return acc
    }, {} as Record<string, string | null>)
  }, [rows, columns])

  const getTypeIcon = (value: any) => {
    if (value === null || value === undefined) return <AlertCircle className="w-3 h-3 text-destructive" />
    if (typeof value === 'number') return <Hash className="w-3 h-3 text-blue-500" />
    if (typeof value === 'boolean') return value ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-500" />
    if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)) && /^\d{4}-\d{2}-\d{2}/.test(value))) return <Calendar className="w-3 h-3 text-purple-500" />
    return <Type className="w-3 h-3 text-gray-400" />
  }

  const exportToCSV = () => {
    const csvContent = [
      columns.join(','),
      ...sortedRows.map(row => columns.map(col => `"${String(row[col]).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'data_preview_export.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="w-full space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/50 p-3 rounded-lg border border-border/40 backdrop-blur-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search rows..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-9 bg-background/50 border-border/50 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2">
                <Columns className="w-4 h-4" />
                Columns
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                  {visibleColumns.length}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 max-h-[400px] overflow-y-auto">
              <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {columns.map(col => (
                <DropdownMenuCheckboxItem
                  key={col}
                  checked={visibleColumns.includes(col)}
                  onCheckedChange={() => toggleColumn(col)}
                >
                  {col}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 gap-2"
            onClick={exportToCSV}
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Table Area */}
      <ScrollArea className="w-full h-[600px] rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/40 hover:bg-transparent bg-muted/30">
              {visibleColumns.map((col) => (
                <TableHead
                  key={col}
                  className="text-foreground font-semibold sticky top-0 z-10 text-xs py-3 px-2 min-w-[120px]"
                >
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => handleSort(col)}
                      className="flex items-center gap-2 hover:text-primary transition-colors group text-left w-full"
                    >
                      <span className="truncate font-bold text-primary/90">
                        {col}
                      </span>
                      <div className="flex-shrink-0">
                        {sortConfig.key === col ? (
                          sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-primary" /> : <ArrowDown className="w-3 h-3 text-primary" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-muted-foreground/30 group-hover:text-muted-foreground" />
                        )}
                      </div>
                    </button>
                    
                    {columnCharts[col] && (
                      <div className="w-full h-10 bg-background/80 rounded border border-border/50 p-1">
                        <img
                          src={columnCharts[col]!}
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
            {paginatedRows.length > 0 ? (
              paginatedRows.map((row, idx) => (
                <TableRow key={idx} className="border-b border-border/20 hover:bg-accent/30 transition-colors">
                  {visibleColumns.map((col) => {
                    const value = row[col]
                    const isMissing = value === null || value === undefined

                    return (
                      <TableCell
                        key={`${idx}-${col}`}
                        className="py-3 px-2 text-xs truncate max-w-[200px]"
                      >
                        {isMissing ? (
                          <Badge variant="destructive" className="font-normal bg-destructive/10 text-destructive hover:bg-destructive/20 border-none px-2 py-0">
                            Missing
                          </Badge>
                        ) : (
                          <div className="flex items-center gap-2 group">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex-shrink-0">
                                    {getTypeIcon(value)}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p className="text-[10px] capitalize">{typeof value === 'object' ? 'Date/Object' : typeof value}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <span className="truncate font-mono bg-background/50 px-1.5 py-0.5 rounded text-foreground/80 group-hover:text-foreground transition-colors">
                              {String(value).substring(0, 50) || '—'}
                            </span>
                          </div>
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={visibleColumns.length} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <Filter className="w-8 h-8 opacity-20" />
                    <p>No results found for "{searchTerm}"</p>
                    <Button variant="ghost" size="sm" onClick={() => setSearchTerm('')}>
                      Clear Search
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Pagination & Summary */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-muted/20 p-4 rounded-lg border border-border/30">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">
            Showing {Math.min(paginatedRows.length, (currentPage - 1) * pageSize + 1)} - {Math.min(currentPage * pageSize, sortedRows.length)} of {sortedRows.length.toLocaleString()} rows
          </p>
          <p className="text-[10px] text-muted-foreground">
            Total Columns: {columns.length} ({visibleColumns.length} visible)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Rows per page:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => {
                setPageSize(Number(val))
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[70px] h-8 text-xs bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100].map(size => (
                  <SelectItem key={size} value={String(size)} className="text-xs">
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-1 px-2">
              <span className="text-xs font-medium">{currentPage}</span>
              <span className="text-xs text-muted-foreground">/</span>
              <span className="text-xs text-muted-foreground">{totalPages || 1}</span>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

