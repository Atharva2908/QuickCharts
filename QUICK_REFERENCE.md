# DataViz - Quick Reference Guide

## 6 Modules at a Glance

### 1️⃣ File Upload Module
**File:** `components/file-upload.tsx`  
**What it does:** Accepts CSV/Excel files via drag-drop  
**Key function:** `validateFile()`, `processFile()`  
**Sends to:** `POST /api/upload`

### 2️⃣ File Metadata Module
**File:** `components/file-metadata.tsx`  
**What it does:** Shows file info (size, rows, cols, date)  
**Key props:** `fileName`, `rowCount`, `columnCount`, `fileSize`  
**Display:** 4 metric cards with icons

### 3️⃣ Data Parsing Module (Backend)
**File:** `server/main.py`  
**What it does:** Reads/parses CSV and Excel files  
**Key function:** `DataAnalyzer.read_file()`, `analyze_columns()`  
**Returns:** JSON with columns, data, analysis, insights

### 4️⃣ Data Preview Module
**File:** `components/data-preview-table.tsx`  
**What it does:** Shows first 50 rows in a table  
**Features:** Scrollable, sticky headers, null formatting  
**Display:** Horizontal scrollable table

### 5️⃣ Column Analysis Module
**File:** `components/column-summaries.tsx`  
**What it does:** Analyzes each column (type, stats, missing)  
**Shows:** Type, Unique, Missing %, Mean, Median, Std, Min, Max  
**Display:** Grid of cards (1 per column)

### 6️⃣ Visualization Control Module
**File:** `components/visualization-control.tsx`  
**What it does:** Lets users select chart type and columns  
**Chart types:** Bar, Line, Scatter, Histogram  
**Validation:** Real-time compatibility checking

---

## Getting Started

```bash
# Terminal 1: Frontend
npm install
npm run dev

# Terminal 2: Backend (in server folder)
pip install -r requirements.txt
python main.py
```

Open: `http://localhost:3000`

---

## File Upload Flow

```
User Uploads CSV
        ↓
Module 1 validates
        ↓
Sends to /api/upload
        ↓
Module 3 parses on backend
        ↓
Returns JSON response
        ↓
Modules 2,4,5,6 display results
```

---

## Module Interaction

```
┌──────────────────────────┐
│      Page Component      │
│   (app/page.tsx)         │
└────────────┬─────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
Module 1:        DataDashboard
File Upload      ├─ Module 2: Metadata
                 ├─ Module 4: Preview
                 ├─ Module 5: Analysis
                 └─ Module 6: Controls
```

---

## Test CSV File

Save as `test.csv`:
```csv
Name,Age,Salary,Department
Alice,28,50000,Engineering
Bob,35,65000,Sales
Charlie,42,75000,Management
Diana,31,55000,Engineering
Eve,29,52000,HR
```

Then upload to test all modules!

---

## API Endpoint

### POST /api/upload
```
Input: multipart/form-data with file

Output: JSON
{
  "columns": ["Name", "Age"],
  "data": [{"Name":"Alice", "Age":28}],
  "analysis": {...},
  "data_quality": {...},
  "insights": [...]
}
```

---

## Component Props

### Module 1: FileUploadSection
```typescript
interface FileUploadProps {
  onDataUpload: (data: any, fileName: string) => void
}
```

### Module 2: FileMetadata
```typescript
interface FileMetadataProps {
  fileName: string
  fileSize?: number
  uploadedAt?: string
  rowCount: number
  columnCount: number
}
```

### Module 4: DataPreviewTable
```typescript
interface DataPreviewTableProps {
  rows: any[]
  columns: string[]
}
```

### Module 5: ColumnSummaries
```typescript
interface ColumnSummariesProps {
  analysis: Record<string, any>
  columns: string[]
}
```

### Module 6: VisualizationControl
```typescript
interface VisualizationControlProps {
  columns: string[]
  analysis: Record<string, any>
  onVisualize: (xCol, yCol, chartType) => void
  isLoading?: boolean
}
```

---

## Common Tasks

### Change API URL
**File:** `lib/api.ts`
```typescript
const API_BASE_URL = 'http://localhost:8000'
```

### Add New Chart Type
**File:** `components/visualization-control.tsx`
```typescript
type ChartType = 'bar' | 'line' | 'scatter' | 'histogram' | 'NEW_TYPE'
```

### Change Theme Color
**File:** `app/globals.css`
```css
--primary: 200 100% 50%;  /* Change this value */
```

### Increase File Size Limit
**File:** `components/file-upload.tsx`
```typescript
const maxSize = 200 * 1024 * 1024  // 200MB instead of 100MB
```

---

## Data Types

```
Backend sends in analysis:
├── int64 / int32 → displayed as "Integer"
├── float → displayed as "Decimal"
├── object / str → displayed as "Text"
├── bool → displayed as "Boolean"
├── datetime / date → displayed as "Date"
└── other → displayed as "Other"
```

---

## Error Messages

| Error | Module | Cause |
|-------|--------|-------|
| "Invalid file type" | 1 | Not CSV/XLSX/XLS |
| "File size exceeds" | 1 | > 100MB |
| "Failed to process" | 1 | Backend error |
| "Both axes must be numeric" | 6 | Invalid chart type selection |

---

## Keyboard Shortcuts

| Action | Key |
|--------|-----|
| Focus upload | Tab |
| Select file | Enter (on button) |
| Navigate tabs | Tab / Shift+Tab |
| Activate button | Enter / Space |

---

## Database (Optional)

### MongoDB Setup
```
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=dataviz
```

### Collections
- `uploads` - File uploads
- `analyses` - Analysis results

---

## Performance Tips

1. **Large Files:** Use CSV instead of Excel
2. **Many Columns:** Scroll horizontally
3. **Slow Backend:** Check MongoDB connection
4. **Slow Frontend:** Check network tab

---

## Documentation

- `MODULES_ARCHITECTURE.md` - How it works
- `MODULES_TESTING.md` - How to test
- `MODULES_VALIDATION.md` - What's implemented
- `MODULES_SUMMARY.md` - Complete details
- `DELIVERY_SUMMARY.md` - Project overview

---

## File Locations

```
Frontend:
✓ Main page: app/page.tsx
✓ Layout: app/layout.tsx
✓ Styles: app/globals.css

Modules:
✓ Module 1: components/file-upload.tsx
✓ Module 2: components/file-metadata.tsx
✓ Module 3: server/main.py
✓ Module 4: components/data-preview-table.tsx
✓ Module 5: components/column-summaries.tsx
✓ Module 6: components/visualization-control.tsx

Utils:
✓ API: lib/api.ts
✓ Data: lib/data-utils.ts

Config:
✓ Backend: server/config.py
✓ Database: server/database.py
```

---

## Troubleshooting Quick Fix

### Frontend won't load
```bash
npm install
npm run dev
```

### Backend won't start
```bash
cd server
pip install -r requirements.txt
python main.py
```

### File won't upload
1. Check file size (< 100MB)
2. Check file type (CSV/XLSX/XLS)
3. Check backend is running
4. Check firewall/CORS

### Data won't display
1. Check backend response in Network tab
2. Check console for errors
3. Verify file format
4. Try test.csv

---

## Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Upload complete |
| 400 | Bad request | Check file format |
| 413 | File too large | Reduce file size |
| 500 | Server error | Check backend logs |
| CORS error | Network blocked | Check CORS config |

---

## Quick Deploy

### Vercel (Frontend)
```bash
npm install -g vercel
vercel
```

### Railway (Backend)
1. Push to GitHub
2. Connect to Railway
3. Set environment variables
4. Deploy

### Docker
```bash
docker-compose up
```

---

## Resources

- **Next.js:** nextjs.org
- **FastAPI:** fastapi.tiangolo.com
- **Pandas:** pandas.pydata.org
- **Recharts:** recharts.org
- **Tailwind:** tailwindcss.com
- **MongoDB:** mongodb.com

---

## Version Info

```
Node: 18+
Python: 3.9+
React: 19.2.3
Next.js: 16.1.6
FastAPI: 0.104+
```

---

## Module Checklist

Use this to verify everything works:

- [ ] Module 1: Can upload CSV file
- [ ] Module 2: See file metadata
- [ ] Module 3: Backend parses correctly
- [ ] Module 4: See data preview
- [ ] Module 5: See column statistics
- [ ] Module 6: Can select chart type
- [ ] Full flow: Upload → Dashboard → Visualization

---

## Support & Questions

See the detailed documentation:
- Architecture: `MODULES_ARCHITECTURE.md`
- Testing: `MODULES_TESTING.md`
- Validation: `MODULES_VALIDATION.md`
- Summary: `MODULES_SUMMARY.md`

---

**Ready to use!** 🚀
