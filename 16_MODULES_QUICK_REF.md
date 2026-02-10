# 16 Modules Quick Reference Card

## All Modules at a Glance

| # | Module | File | Purpose | Status |
|---|--------|------|---------|--------|
| 1 | File Upload | `components/file-upload.tsx` | Handle file uploads | ✅ Done |
| 2 | File Metadata | `components/file-metadata.tsx` | Display file info | ✅ Done |
| 3 | Data Parsing | `server/main.py` | Parse uploaded files | ✅ Done |
| 4 | Data Preview | `components/data-preview-table.tsx` | Show data table | ✅ Done |
| 5 | Column Analysis | `components/column-summaries.tsx` | Analyze columns | ✅ Done |
| 6 | Viz Control | `components/visualization-control.tsx` | Control charts | ✅ Done |
| 7 | Chart Generation | `components/chart-generator.tsx` | Generate charts | ✅ Done |
| 8 | Correlation | `components/correlation-analysis.tsx` | Show correlations | ✅ Done |
| 9 | Data Quality | `components/data-quality-report.tsx` | Quality report | ✅ Done |
| 10 | Auto Insights | `components/auto-insights.tsx` | Generate insights | ✅ Done |
| 11 | Export/Download | `components/export-download.tsx` | Export results | ✅ Done |
| 12 | API Layer | `lib/api-client.ts` | API communication | ✅ Done |
| 13 | State Mgmt | `lib/state-store.ts` | State management | ✅ Done |
| 14 | UI Layout | `components/app-layout.tsx` | App structure | ✅ Done |
| 15 | Error Handler | `lib/error-handler.ts` | Error handling | ✅ Done |
| 16 | Security | `lib/security.ts` | Security checks | ✅ Done |

---

## Module Imports

```typescript
// Module 1: File Upload
import FileUploadSection from '@/components/file-upload'

// Module 2: File Metadata
import FileMetadata from '@/components/file-metadata'

// Module 4: Data Preview
import DataPreviewTable from '@/components/data-preview-table'

// Module 5: Column Analysis
import ColumnSummaries from '@/components/column-summaries'

// Module 6: Visualization Control
import VisualizationControl from '@/components/visualization-control'

// Module 7: Chart Generation
import ChartGenerator from '@/components/chart-generator'

// Module 8: Correlation Analysis
import CorrelationAnalysis from '@/components/correlation-analysis'

// Module 9: Data Quality
import DataQualityReport from '@/components/data-quality-report'

// Module 10: Auto Insights
import AutoInsights from '@/components/auto-insights'

// Module 11: Export & Download
import ExportDownload from '@/components/export-download'

// Module 12: API Layer
import { apiClient } from '@/lib/api-client'

// Module 13: State Management
import { useAppState, useFileStore, useDataStore, useChartStore, useUIStore } from '@/lib/state-store'

// Module 14: UI Layout
import AppLayout from '@/components/app-layout'

// Module 15: Error Handler
import { ErrorHandler, DataValidator } from '@/lib/error-handler'

// Module 16: Security
import { SecurityManager, DEFAULT_LIMITS } from '@/lib/security'
```

---

## Usage Examples

### Module 1: Upload File
```typescript
<FileUploadSection onDataUpload={(data, name) => {
  setUploadedData(data)
  setFileName(name)
}} />
```

### Module 2: Show Metadata
```typescript
<FileMetadata
  fileName="data.csv"
  fileSize={102400}
  uploadedAt={new Date().toISOString()}
  rowCount={1000}
  columnCount={15}
/>
```

### Module 4: Preview Data
```typescript
<DataPreviewTable
  rows={data.slice(0, 50)}
  columns={columns}
/>
```

### Module 5: Column Stats
```typescript
<ColumnSummaries
  analysis={analysis}
  columns={columns}
/>
```

### Module 6: Chart Controls
```typescript
<VisualizationControl
  columns={columns}
  analysis={analysis}
  onVisualize={(xCol, yCol, type) => {
    // Handle chart selection
  }}
/>
```

### Module 7: Generate Chart
```typescript
<ChartGenerator
  data={parsedData}
  xColumn="Month"
  yColumn="Sales"
  chartType="bar"
  title="Sales by Month"
/>
```

### Module 8: Show Correlation
```typescript
<CorrelationAnalysis
  data={parsedData}
  columns={columns}
/>
```

### Module 9: Quality Report
```typescript
<DataQualityReport
  quality={quality}
  analysis={analysis}
/>
```

### Module 10: Auto Insights
```typescript
<AutoInsights
  data={parsedData}
  analysis={analysis}
  quality={quality}
/>
```

### Module 11: Export Options
```typescript
<ExportDownload
  data={parsedData}
  fileName="analysis"
  analysis={analysis}
/>
```

### Module 12: Upload File
```typescript
const result = await apiClient.uploadFile(file, (progress) => {
  console.log(`Progress: ${progress}%`)
})
```

### Module 13: Use State
```typescript
const { file, data, chart, ui } = useAppState()
data.setParsedData(newData)
chart.setChartType('line')
ui.setError('Error message')
```

### Module 14: App Layout
```typescript
<AppLayout headerTitle="DataViz">
  {/* Content */}
</AppLayout>
```

### Module 15: Validate
```typescript
const validation = ErrorHandler.validateFile(file)
if (!validation.isValid) {
  console.log(validation.errors)
}
```

### Module 16: Security Check
```typescript
const result = SecurityManager.validateFile(file)
if (!result.valid) {
  console.log(result.errors)
}
```

---

## Configuration

### Limits (Module 16)
```typescript
DEFAULT_LIMITS = {
  maxFileSize: 100MB,
  maxRows: 1,000,000,
  maxColumns: 500,
  maxMemory: 500MB,
  rateLimitPerMinute: 60
}
```

### Allowed File Types
```typescript
CSV, XLS, XLSX
```

### Chart Types (Module 7)
```typescript
'bar' | 'line' | 'scatter' | 'pie' | 'histogram'
```

---

## Styling (Dark Theme)

```css
/* Background */
background: hsl(10, 20%, 8%)

/* Text */
color: hsl(0, 0%, 95%)

/* Primary Accent */
color: hsl(200, 100%, 50%)

/* Cards */
background: hsl(10, 20%, 12%)
```

---

## Common Workflows

### 1. Upload & Preview
```
User Uploads File → Module 1
↓
Module 16 (Security Check)
↓
Module 15 (Validation)
↓
Module 12 (API Call)
↓
Module 3 (Parse - Backend)
↓
Module 13 (Store State)
↓
Module 4 (Show Preview)
```

### 2. Full Analysis
```
Upload → Parse → Display
Module 2 (Metadata)
Module 4 (Preview)
Module 5 (Column Stats)
Module 8 (Correlation)
Module 9 (Quality)
Module 10 (Insights)
```

### 3. Visualizations
```
Module 6 (Select Chart)
↓
Module 7 (Generate)
↓
Display Chart
```

### 4. Export Results
```
Module 11 (Select Format)
↓
Format Data
↓
Download File
```

---

## Props Reference

### Module 1: FileUploadSection
```typescript
onDataUpload: (data: any[], name: string) => void
```

### Module 2: FileMetadata
```typescript
fileName: string
fileSize: number
uploadedAt: string | null
rowCount: number
columnCount: number
```

### Module 4: DataPreviewTable
```typescript
rows: any[]
columns: string[]
```

### Module 5: ColumnSummaries
```typescript
analysis: Record<string, any>
columns: string[]
```

### Module 6: VisualizationControl
```typescript
columns: string[]
analysis: Record<string, any>
onVisualize: (xCol: string, yCol: string, chartType: string) => void
```

### Module 7: ChartGenerator
```typescript
data: any[]
xColumn: string
yColumn: string
chartType: 'bar' | 'line' | 'scatter' | 'pie' | 'histogram'
title?: string
```

### Module 8: CorrelationAnalysis
```typescript
data: any[]
columns: string[]
```

### Module 9: DataQualityReport
```typescript
quality: Record<string, any>
analysis: Record<string, any>
```

### Module 10: AutoInsights
```typescript
data: any[]
analysis: Record<string, any>
quality: Record<string, any>
```

### Module 11: ExportDownload
```typescript
data: any[]
fileName: string
analysis: Record<string, any>
```

### Module 14: AppLayout
```typescript
children: ReactNode
headerTitle?: string
showUploadButton?: boolean
onReset?: () => void
activeSection?: 'home' | 'upload' | 'analysis' | 'settings'
```

---

## State Store API (Module 13)

### File Store
```typescript
const fileStore = useFileStore()
fileStore.setUploadedFile(file, name, size)
fileStore.setUploading(bool)
fileStore.setUploadProgress(percent)
fileStore.setUploadError(message)
fileStore.clearFile()
```

### Data Store
```typescript
const dataStore = useDataStore()
dataStore.setParsedData(data)
dataStore.setAnalysis(analysis, quality)
dataStore.setColumns(cols)
dataStore.setAnalyzing(bool)
dataStore.setAnalysisError(message)
dataStore.clearData()
```

### Chart Store
```typescript
const chartStore = useChartStore()
chartStore.setChartType(type)
chartStore.setXColumn(col)
chartStore.setYColumn(col)
chartStore.clearChart()
```

### UI Store
```typescript
const uiStore = useUIStore()
uiStore.setActiveTab(tab)
uiStore.setLoading(bool)
uiStore.setError(message)
uiStore.setSuccess(message)
uiStore.clear()
```

---

## API Methods (Module 12)

```typescript
// Upload file
await apiClient.uploadFile(file, onProgress?)

// Get sample
await apiClient.getSampleData()

// Health check
await apiClient.healthCheck()
```

---

## Error Handling (Module 15)

```typescript
// Validate file
ErrorHandler.validateFile(file)

// Validate data
ErrorHandler.validateData(data)

// Validate columns
ErrorHandler.validateColumns(columns)

// Get error message
ErrorHandler.getErrorMessage(error)

// Format errors
ErrorHandler.formatValidationErrors(errors)

// Detect type
DataValidator.detectType(values)
```

---

## Security (Module 16)

```typescript
// Validate file
SecurityManager.validateFile(file, limits?)

// Validate dimensions
SecurityManager.validateDataDimensions(rows, cols, limits?)

// Check rate limit
SecurityManager.checkRateLimit(clientId, limits?)

// Sanitize column name
SecurityManager.sanitizeColumnName(name)

// Sanitize cell value
SecurityManager.sanitizeCellValue(value)
```

---

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NODE_ENV=development
```

---

## Quick Testing

1. **Upload**: Drag CSV file onto app
2. **Preview**: Click Preview tab
3. **Charts**: Select chart type and columns
4. **Export**: Click export button
5. **Insights**: Scroll to insights section

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| White page | Check dark theme in layout.tsx |
| Upload fails | Verify backend running on port 8000 |
| Charts don't show | Ensure Y column is numeric |
| State not saving | Use localStorage or MongoDB |
| Slow performance | Reduce data size or rows |

---

## Links

- **Main Docs**: `ALL_16_MODULES.md`
- **Integration**: `MODULES_INTEGRATION_GUIDE.md`
- **Setup**: `SETUP.md`
- **Delivery**: `COMPLETE_DELIVERY.md`

---

## Quick Start Command

```bash
# 1. Install
npm install

# 2. Start backend
cd server && python main.py

# 3. Start frontend (new terminal)
npm run dev

# 4. Open browser
# http://localhost:3000
```

---

**All 16 modules are production-ready and working!** ✅

