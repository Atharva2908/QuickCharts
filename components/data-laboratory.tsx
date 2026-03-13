'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { API_BASE_URL } from '@/lib/constants'
import axios from 'axios'
import { Calculator, Type, Hash, Calendar, Loader2, Sparkles, Undo2, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface DataLaboratoryProps {
  uploadId: string
  columns: string[]
  analysis: Record<string, any>
  onDataUpdateAction: (newData: any) => void
}

export default function DataLaboratory({ uploadId, columns, analysis, onDataUpdateAction }: DataLaboratoryProps) {
  const [newColName, setNewColName] = useState('')
  const [expression, setExpression] = useState('')
  const [isCalculating, setIsCalculating] = useState(false)
  
  const [castColumn, setCastColumn] = useState('')
  const [castType, setCastType] = useState('')
  const [isCasting, setIsCasting] = useState(false)

  const [isSmartCleaning, setIsSmartCleaning] = useState(false)
  const [isUndoing, setIsUndoing] = useState(false)

  const handleCalculate = async () => {
    if (!newColName || !expression || !uploadId) return
    setIsCalculating(true)
    try {
      const response = await axios.post(`${API_BASE_URL}/api/calculate/${uploadId}`, {
        new_column: newColName,
        expression: expression
      })
      onDataUpdateAction(response.data)
      setNewColName('')
      setExpression('')
      toast.success("Calculated column added!")
    } catch (e: any) {
      toast.error(`Calculation failed: ${e.response?.data?.detail || e.message}`)
    } finally {
      setIsCalculating(false)
    }
  }

  const handleCast = async () => {
    if (!castColumn || !castType || !uploadId) return
    setIsCasting(true)
    try {
      const response = await axios.post(`${API_BASE_URL}/api/cast/${uploadId}`, {
        column: castColumn,
        target_type: castType
      })
      onDataUpdateAction(response.data)
      setCastColumn('')
      setCastType('')
      toast.success("Data type updated!")
    } catch (e: any) {
      toast.error(`Casting failed: ${e.response?.data?.detail || e.message}`)
    } finally {
      setIsCasting(false)
    }
  }

  const handleSmartClean = async () => {
    setIsSmartCleaning(true)
    try {
      const response = await axios.post(`${API_BASE_URL}/api/smart-clean/${uploadId}`)
      onDataUpdateAction(response.data)
      toast.success("AI Smart Clean complete!")
    } catch (e: any) {
      toast.error("AI Cleaning failed")
    } finally {
      setIsSmartCleaning(false)
    }
  }

  const handleUndo = async () => {
    setIsUndoing(true)
    try {
      const response = await axios.get(`${API_BASE_URL}/api/undo/${uploadId}`)
      onDataUpdateAction(response.data)
      toast.success("Last action reverted")
    } catch (e: any) {
      toast.error("Nothing to undo")
    } finally {
      setIsUndoing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-muted/30 p-4 rounded-xl border border-border/50">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Laboratory
          </h2>
          <p className="text-sm text-muted-foreground">Transform and clean your data at scale</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleUndo}
            disabled={isUndoing}
          >
            {isUndoing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Undo2 className="w-4 h-4 mr-2" />}
            Undo
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="bg-primary/90 hover:bg-primary shadow-lg shadow-primary/20"
            onClick={handleSmartClean}
            disabled={isSmartCleaning}
          >
            {isSmartCleaning ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
            AI Smart Clean
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-border shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-bold">Formula Builder</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Create calculated columns. Click columns below to insert them.</p>
          
          <div className="flex flex-wrap gap-1.5 mb-2">
             {columns.slice(0, 10).map(col => (
               <Button 
                key={col} 
                variant="secondary" 
                size="sm" 
                className="h-7 text-[10px] px-2 py-0"
                onClick={() => setExpression(prev => prev + ` \`${col}\` `)}
               >
                 <Plus className="w-2.5 h-2.5 mr-1" /> {col}
               </Button>
             ))}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">New Column Name</label>
              <Input 
                value={newColName} 
                onChange={(e) => setNewColName(e.target.value)} 
                placeholder="e.g. TotalProfit"
                className="bg-muted/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Formula Expression</label>
              <Input 
                value={expression} 
                onChange={(e) => setExpression(e.target.value)} 
                placeholder="e.g. Revenue - Cost"
                className="font-mono text-sm bg-muted/20"
              />
            </div>
            <Button 
              className="w-full" 
              onClick={handleCalculate} 
              disabled={isCalculating || !newColName || !expression}
            >
              {isCalculating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Add Calculated Column
            </Button>
          </div>
        </Card>

        <Card className="bg-card border-border shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Type className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-bold">Data Type Casting</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Correct machine-inferred types for better charting.</p>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Select Column</label>
              <Select value={castColumn} onValueChange={setCastColumn}>
                <SelectTrigger className="bg-muted/20">
                  <SelectValue placeholder="Choose a column" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map(col => (
                    <SelectItem key={col} value={col}>
                      {col} <span className="opacity-50 text-[10px]">({analysis[col]?.dtype})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Target Data Type</label>
              <Select value={castType} onValueChange={setCastType}>
                <SelectTrigger className="bg-muted/20">
                  <SelectValue placeholder="Choose new type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="numeric"><div className="flex items-center gap-2"><Hash className="w-4 h-4" /> Numeric</div></SelectItem>
                  <SelectItem value="datetime"><div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Date/Time</div></SelectItem>
                  <SelectItem value="string"><div className="flex items-center gap-2"><Type className="w-4 h-4" /> Text/String</div></SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={handleCast} 
              disabled={isCasting || !castColumn || !castType}
            >
              {isCasting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Update Type
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
