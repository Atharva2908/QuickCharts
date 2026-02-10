# Complete Module Integration Guide

## Quick Start: All 16 Modules Working Together

This guide shows how to use all 16 modules in your application.

---

## Step 1: Setup (First Time)

### Install Dependencies
```bash
npm install
# Includes: recharts, axios, zustand
```

### Configure Environment
Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NODE_ENV=development
```

### Start Services
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
cd server
python main.py
```

---

## Step 2: Import and Use All Modules

### In Your Component

```typescript
'use client'

import { useState } from 'react'
import { useAppState } from '@/lib/state-store'
import { apiClient } from '@/lib/api-client'
import { ErrorHandler, DataValidator } from '@/lib/error-handler'
import { SecurityManager } from '@/lib/security'

// Import all 14 frontend modules
import FileUploadSection from '@/components/file-upload'          // Module 1
import FileMetadata from '@/components/file-metadata'             // Module 2
import DataPreviewTable from '@/components/data-preview-table'    // Module 4
import ColumnSummaries from '@/components/column-summaries'       // Module 5
import VisualizationControl from '@/components/visualization-control' // Module 6
import ChartGenerator from '@/components/chart-generator'         // Module 7
import CorrelationAnalysis from '@/components/correlation-analysis' // Module 8
import DataQualityReport from '@/components/data-quality-report'  // Module 9
import AutoInsights from '@/components/auto-insights'             // Module 10
import ExportDownload from '@/components/export-download'         // Module 11
import AppLayout from '@/components/app-layout'                   // Module 14

export default function DataDashboard() {
  // Module 13: State Management
  const { file, data, chart, ui } = useAppState()
  
  // Upload handler using all modules
  const handleUpload = async (uploadFile: File) => {
    // Module 16: Security validation
    const validation = SecurityManager.validateFile(uploadFile)
    if (!validation.valid) {
      ui.setError(validation.errors.join('\n'))
      return
    }

    // Module 15: Error handling
    const fileValidation = ErrorHandler.validateFile(uploadFile)
    if (!fileValidation.isValid) {
      ui.setError(ErrorHandler.formatValidationErrors(fileValidation.errors))
      return
    }

    ui.setLoading(true)
    
    try {
      // Module 12: API Layer - uploads file
      // Module 3: Backend processes data
      const result = await apiClient.uploadFile(uploadFile, (progress) => {
        console.log(`Upload: ${progress}%`)
      })

      // Module 13: Store parsed data
      data.setParsedData(result.data)
      data.setAnalysis(result.analysis, result.quality)
      data.setColumns(result.columns)
      file.setUploadedFile(uploadFile, uploadFile.name, uploadFile.size)

      // Module 10: Auto generate insights
      ui.setSuccess('File uploaded and analyzed successfully!')
    } catch (error) {
      ui.setError(ErrorHandler.getErrorMessage(error))
    } finally {
      ui.setLoading(false)
    }
  }

  return (
    // Module 14: UI Layout
    <AppLayout headerTitle="DataViz">
      <div className="space-y-6">
        
        {!data.parsedData ? (
          // Module 1: File Upload
          <FileUploadSection onDataUpload={handleUpload} />
        ) : (
          <>
            {/* Module 2: File Metadata */}
            <FileMetadata
              fileName={file.fileName}
              fileSize={file.fileSize}
              uploadedAt={file.uploadedAt}
              rowCount={data.parsedData.length}
              columnCount={data.columns.length}
            />

            {/* Module 4: Data Preview */}
            <DataPreviewTable
              rows={data.parsedData.slice(0, 50)}
              columns={data.columns}
            />

            {/* Module 5: Column Analysis */}
            <ColumnSummaries
              analysis={data.analysis}
              columns={data.columns}
            />

            {/* Module 6: Visualization Control */}
            <VisualizationControl
              columns={data.columns}
              analysis={data.analysis}
              onVisualize={(xCol, yCol, chartType) => {
                chart.setXColumn(xCol)
                chart.setYColumn(yCol)
                chart.setChartType(chartType)
              }}
            />

            {/* Module 7: Chart Generator */}
            {chart.selectedXColumn && chart.selectedYColumn && (
              <ChartGenerator
                data={data.parsedData}
                xColumn={chart.selectedXColumn}
                yColumn={chart.selectedYColumn}
                chartType={chart.selectedChartType}
                title={`${chart.selectedChartType.toUpperCase()}: ${chart.selectedYColumn} by ${chart.selectedXColumn}`}
              />
            )}

            {/* Module 8: Correlation Analysis */}
            <CorrelationAnalysis
              data={data.parsedData}
              columns={data.columns}
            />

            {/* Module 9: Data Quality */}
            <DataQualityReport
              quality={data.quality}
              analysis={data.analysis}
            />

            {/* Module 10: Auto Insights */}
            <AutoInsights
              data={data.parsedData}
              analysis={data.analysis}
              quality={data.quality}
            />

            {/* Module 11: Export & Download */}
            <ExportDownload
              data={data.parsedData}
              fileName={file.fileName}
              analysis={data.analysis}
            />
          </>
        )}
      </div>
    </AppLayout>
  )
}
```

---

## Step 3: Module Responsibilities

### Module Flow

```
User Action
    ↓
Module 1 (Upload)
    ↓
Module 16 (Security Check)
    ↓
Module 15 (Validation)
    ↓
Module 12 (API Call)
    ↓
Module 3 (Parse Data - Backend)
    ↓
Module 13 (Store State)
    ↓
Modules 2-11 (Display Results)
    ↓
Module 14 (Render UI)
    ↓
Module 11 (Export if needed)
```

---

## Step 4: Configuration

### Security Limits (Module 16)
```typescript
import { DEFAULT_LIMITS, SecurityManager } from '@/lib/security'

// Use custom limits
const customLimits = {
  ...DEFAULT_LIMITS,
  maxFileSize: 50 * 1024 * 1024, // 50MB instead of 100MB
  rateLimitPerMinute: 30,
}

const validation = SecurityManager.validateFile(file, customLimits)
```

### Error Handling (Module 15)
```typescript
import { ErrorHandler, DataValidator } from '@/lib/error-handler'

// Validate file
const validation = ErrorHandler.validateFile(file)
if (!validation.isValid) {
  const errors = ErrorHandler.formatValidationErrors(validation.errors)
  console.log(errors)
}

// Detect data type
const values = data.map(row => row.columnName)
const dataType = DataValidator.detectType(values)
```

### State Management (Module 13)
```typescript
import { useFileStore, useDataStore, useChartStore, useUIStore } from '@/lib/state-store'

// Use individual stores
const fileState = useFileStore()
const dataState = useDataStore()
const chartState = useChartStore()
const uiState = useUIStore()

// Or use combined hook
import { useAppState } from '@/lib/state-store'
const { file, data, chart, ui } = useAppState()
```

### API Configuration (Module 12)
```typescript
import { apiClient } from '@/lib/api-client'

// Upload file with progress
const result = await apiClient.uploadFile(file, (progress) => {
  console.log(`Progress: ${progress}%`)
})

// Health check
const health = await apiClient.healthCheck()
```

---

## Step 5: Common Workflows

### Workflow 1: Simple File Upload & Preview
```typescript
// Uses: Modules 1, 2, 4, 12, 13, 14, 15, 16
const handleSimpleUpload = async (file: File) => {
  const validation = ErrorHandler.validateFile(file)
  if (!validation.isValid) return

  const result = await apiClient.uploadFile(file)
  data.setParsedData(result.data)
  data.setColumns(result.columns)
}
```

### Workflow 2: Full Analysis
```typescript
// Uses: All 16 modules
const handleFullAnalysis = async (file: File) => {
  const validation = SecurityManager.validateFile(file)
  if (!validation.valid) return

  const result = await apiClient.uploadFile(file)
  data.setParsedData(result.data)
  data.setAnalysis(result.analysis, result.quality)
  data.setColumns(result.columns)
  
  // All modules now auto-render
}
```

### Workflow 3: Export Results
```typescript
// Uses: Modules 11, 13
const handleExport = () => {
  // User clicks export button
  // Module 11 handles all export logic
  // Supports CSV, JSON, TXT formats
}
```

---

## Step 6: Testing Each Module

### Test Module 1: Upload
```bash
# Go to app, drag & drop a CSV file
# Check console for upload progress
```

### Test Module 7: Chart Generation
```bash
# After upload, select chart type from Module 6
# Select X and Y columns
# Verify chart renders in Module 7
```

### Test Module 8: Correlation
```bash
# Scroll to correlation section
# Verify heatmap shows strong correlations
# Check strong pairs list
```

### Test Module 10: Insights
```bash
# Scroll to auto-insights section
# Verify insights are generated based on data
# Check different insight types (info/warning/trend)
```

### Test Module 11: Export
```bash
# Click export buttons
# Verify downloads in CSV, JSON, TXT formats
```

---

## Step 7: Troubleshooting

### Issue: White page
**Solution:** Check that dark theme is applied in layout.tsx
```typescript
<html lang="en" className="dark" suppressHydrationWarning>
  <body style={{ backgroundColor: 'hsl(10, 20%, 8%)', color: 'hsl(0, 0%, 95%)' }}>
```

### Issue: Upload fails
**Solution:** Check backend is running and API URL is correct
```bash
# Verify backend
curl http://localhost:8000/health

# Check .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Issue: Charts don't render
**Solution:** Verify data has numeric columns
- Use Module 15 to detect column types
- Ensure Y column is numeric for bar/line charts

### Issue: State not persisting
**Solution:** Zustand stores are in-memory only
- For persistence, add localStorage support to Module 13
- For server persistence, save to MongoDB via backend

---

## Step 8: Performance Tips

1. **Lazy load large tables** (Module 4)
   - Show first 50 rows, load more on scroll

2. **Memoize calculations** (Module 8)
   - Correlation calculations are expensive

3. **Debounce chart updates** (Module 6, 7)
   - Don't regenerate on every keystroke

4. **Optimize data storage** (Module 13)
   - Store only necessary fields in state

---

## Step 9: Production Deployment

### Environment Variables
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NODE_ENV=production
```

### Enable Security Headers (Module 16)
```typescript
// In next.config.mjs
headers: [
  {
    source: '/:path*',
    headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
    ],
  },
]
```

### Deploy
```bash
# Vercel (recommended)
vercel deploy

# Or Docker
docker-compose up -d
```

---

## Summary

All 16 modules work together seamlessly:
- **Modules 1-6**: Core data handling
- **Modules 7-11**: Analysis and visualization
- **Module 12**: API communication
- **Module 13**: State management
- **Module 14**: UI structure
- **Modules 15-16**: Validation and security

Each module is independent but integrated through Module 13 (State) and Module 12 (API).

