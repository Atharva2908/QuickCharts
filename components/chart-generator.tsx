'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  HistogramChart,
  Tooltip,
  Legend,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

interface ChartGeneratorProps {
  data: any[]
  xColumn: string
  yColumn: string
  chartType: 'bar' | 'line' | 'scatter' | 'pie' | 'histogram'
  title?: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function ChartGenerator({
  data,
  xColumn,
  yColumn,
  chartType,
  title,
}: ChartGeneratorProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    try {
      if (chartType === 'pie') {
        return data.map((row) => ({
          name: String(row[xColumn]),
          value: Number(row[yColumn]) || 0,
        }))
      }

      if (chartType === 'histogram') {
        const bins: Record<string, number> = {}
        data.forEach((row) => {
          const val = Number(row[yColumn])
          if (!isNaN(val)) {
            const binSize = 10
            const binKey = `${Math.floor(val / binSize) * binSize}-${Math.floor(val / binSize) * binSize + binSize}`
            bins[binKey] = (bins[binKey] || 0) + 1
          }
        })
        return Object.entries(bins).map(([range, count]) => ({
          name: range,
          count,
        }))
      }

      return data.map((row) => ({
        [xColumn]: String(row[xColumn]),
        [yColumn]: Number(row[yColumn]) || 0,
      }))
    } catch (error) {
      console.error('[v0] Error preparing chart data:', error)
      return []
    }
  }, [data, xColumn, yColumn, chartType])

  if (!chartData || chartData.length === 0) {
    return (
      <Card className="p-8 border-border/40 bg-card/50 text-center">
        <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground">No data available for {chartType} chart</p>
      </Card>
    )
  }

  return (
    <Card className="p-6 border-border/40 bg-card/50">
      {title && <h3 className="text-lg font-semibold mb-4 text-foreground">{title}</h3>}
      <ResponsiveContainer width="100%" height={400}>
        {chartType === 'bar' && (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(10, 20%, 20%)" />
            <XAxis dataKey={xColumn} stroke="hsl(0, 0%, 60%)" />
            <YAxis stroke="hsl(0, 0%, 60%)" />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(10, 20%, 12%)', border: '1px solid hsl(10, 20%, 20%)' }}
              labelStyle={{ color: 'hsl(0, 0%, 95%)' }}
            />
            <Legend />
            <Bar dataKey={yColumn} fill="#0088FE" radius={[8, 8, 0, 0]} />
          </BarChart>
        )}

        {chartType === 'line' && (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(10, 20%, 20%)" />
            <XAxis dataKey={xColumn} stroke="hsl(0, 0%, 60%)" />
            <YAxis stroke="hsl(0, 0%, 60%)" />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(10, 20%, 12%)', border: '1px solid hsl(10, 20%, 20%)' }}
              labelStyle={{ color: 'hsl(0, 0%, 95%)' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey={yColumn}
              stroke="#0088FE"
              strokeWidth={2}
              dot={{ fill: '#0088FE', r: 4 }}
            />
          </LineChart>
        )}

        {chartType === 'scatter' && (
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(10, 20%, 20%)" />
            <XAxis type="number" dataKey={xColumn} stroke="hsl(0, 0%, 60%)" />
            <YAxis type="number" dataKey={yColumn} stroke="hsl(0, 0%, 60%)" />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(10, 20%, 12%)', border: '1px solid hsl(10, 20%, 20%)' }}
              labelStyle={{ color: 'hsl(0, 0%, 95%)' }}
            />
            <Scatter name={yColumn} data={chartData} fill="#0088FE" />
          </ScatterChart>
        )}

        {chartType === 'pie' && (
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(10, 20%, 12%)', border: '1px solid hsl(10, 20%, 20%)' }}
              labelStyle={{ color: 'hsl(0, 0%, 95%)' }}
            />
          </PieChart>
        )}

        {chartType === 'histogram' && (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(10, 20%, 20%)" />
            <XAxis dataKey="name" stroke="hsl(0, 0%, 60%)" />
            <YAxis stroke="hsl(0, 0%, 60%)" />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(10, 20%, 12%)', border: '1px solid hsl(10, 20%, 20%)' }}
              labelStyle={{ color: 'hsl(0, 0%, 95%)' }}
            />
            <Bar dataKey="count" fill="#00C49F" radius={[8, 8, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </Card>
  )
}
