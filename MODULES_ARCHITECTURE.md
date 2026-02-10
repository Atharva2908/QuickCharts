# DataViz - 6 Module Architecture

This document outlines the 6 core modules that comprise the DataViz data visualization platform.

## Overview

The application follows a modular architecture where each component handles specific responsibilities in the data upload and visualization workflow.

---

## 1️⃣ File Upload Module

**Location:** `/components/file-upload.tsx`  
**Purpose:** Handle file upload from users (CSV/Excel)

### Responsibilities:
- ✓ Drag & drop file upload interface
- ✓ File type validation (CSV, XLSX, XLS)
- ✓ File size validation (max 100MB)
- ✓ Upload progress indicator
- ✓ Send file to backend API
- ✓ Error handling with user-friendly messages

### Key Features:
```typescript
- validateFile(file): Validates file type and size
- processFile(file): Handles upload and communicates with backend
- handleDrop(e): Drag and drop functionality
- handleFileInput(e): File input selection
```

### Integration:
```
User Upload → File Validation → Backend Processing → Data Response
```

---

## 2️⃣ File Metadata Module

**Location:** `/components/file-metadata.tsx`  
**Purpose:** Display basic information about uploaded file

### Responsibilities:
- ✓ File name display
- ✓ File size display
- ✓ Upload timestamp
- ✓ Number of rows & columns (from backend)
- ✓ File type icon indicator
- ✓ Visual metadata cards

### Key Props:
```typescript
interface FileMetadataProps {
  fileName: string           // Original file name
  fileSize?: number          // File size in bytes
  uploadedAt?: string        // Upload timestamp
  rowCount: number           // Total rows in dataset
  columnCount: number        // Total columns in dataset
}
```

### Integration:
```
Data Dashboard → File Metadata Display
```

---

## 3️⃣ Data Parsing Module (Backend)

**Location:** `/server/main.py` → `DataAnalyzer.read_file()`  
**Purpose:** Read and parse uploaded files

### Responsibilities:
- ✓ Parse CSV files with various encodings
- ✓ Parse Excel files (XLSX/XLS)
- ✓ Convert data into structured JSON format
- ✓ Handle encoding errors gracefully
- ✓ Return sample rows for preview
- ✓ Return full analysis metadata

### Implementation:
```python
@staticmethod
def read_file(file: UploadFile) -> Optional[pd.DataFrame]:
    """Read CSV or Excel file"""
    if filename.endswith('.csv'):
        df = pd.read_csv(BytesIO(content))
    elif filename.endswith(('.xlsx', '.xls')):
        df = pd.read_excel(BytesIO(content))
    return df
```

### Output Structure:
```json
{
  "columns": ["col1", "col2", "col3"],
  "data": [
    {"col1": "val1", "col2": 123, "col3": "val3"},
    {"col1": "val2", "col2": 456, "col3": "val4"}
  ],
  "analysis": { ... },
  "data_quality": { ... },
  "insights": [ ... ]
}
```

---

## 4️⃣ Data Preview Module

**Location:** `/components/data-preview-table.tsx`  
**Purpose:** Show tabular preview of uploaded data

### Responsibilities:
- ✓ Display first N rows (50 rows default)
- ✓ Scrollable & paginated table
- ✓ Column headers auto-generated
- ✓ Responsive layout for mobile
- ✓ Handle null/undefined values gracefully
- ✓ Show total row count indicator

### Key Features:
```typescript
- Horizontal scroll for wide datasets
- First 50 rows display
- Null value handling with visual indicators
- Row count information display
```

### Data Flow:
```
Backend Response → DataPreviewTable Component
                → Displays first 50 rows
                → Shows "Showing X of Y rows" indicator
```

---

## 5️⃣ Column Analysis Module

**Location:** `/components/column-summaries.tsx`  
**Purpose:** Analyze each column's properties

### Responsibilities:
- ✓ Detect data type (numeric, categorical, date, boolean)
- ✓ Count missing values and calculate percentage
- ✓ Count unique values per column
- ✓ Calculate statistical measures for numeric columns
- ✓ Display analysis in card-based layout
- ✓ Visual type indicators (icons for each data type)

### Statistics Calculated:
```typescript
For Numeric Columns:
  - Mean
  - Median
  - Standard Deviation
  - Min
  - Max
  - Quartiles (Q1, Q2, Q3)

For All Columns:
  - Data Type
  - Unique Count
  - Missing Count
  - Missing Percentage
```

### Type Detection:
```typescript
- Integer: int64, int32
- Decimal: float, float64
- Text: object, string
- Boolean: bool
- Date: datetime, date
- Other: remaining types
```

---

## 6️⃣ Visualization Control Module

**Location:** `/components/visualization-control.tsx`  
**Purpose:** Allow user to choose visualization settings

### Responsibilities:
- ✓ Column selector dropdown for X-axis
- ✓ Column selector dropdown for Y-axis
- ✓ Chart type selector (bar, line, scatter, histogram)
- ✓ Chart type validation with column types
- ✓ Compatibility warnings when selection invalid
- ✓ Recommendations for chart types
- ✓ Trigger chart generation

### Chart Type Validation:
```typescript
Bar Chart:     Any column types (always compatible)
Line Chart:    Y-axis must be numeric
Scatter Plot:  Both X and Y must be numeric
Histogram:     Y-axis must be numeric
```

### Validation Example:
```typescript
const validateChartType = (type, xCol, yCol) => {
  if (type === 'scatter') {
    // Both must be numeric
    if (!xIsNumeric || !yIsNumeric) {
      return {
        compatible: false,
        reason: 'Both axes must be numeric'
      }
    }
  }
}
```

---

## Complete Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    📤 USER UPLOAD                            │
└────────────────────────────┬────────────────────────────────┘
                             │
                    MODULE 1: FILE UPLOAD
                    ├─ Drag & Drop
                    ├─ File Validation
                    └─ Progress Tracking
                             │
                    ┌────────▼────────┐
                    │    FastAPI      │
                    │   Backend API   │
                    │    :8000        │
                    └────────┬────────┘
                             │
                    MODULE 3: DATA PARSING
                    ├─ Read CSV/Excel
                    ├─ Parse to DataFrame
                    └─ Generate Analysis
                             │
                    ┌────────▼────────┐
                    │  JSON Response  │
                    └────────┬────────┘
                             │
                    MODULE 2: FILE METADATA
                    ├─ Display File Info
                    ├─ Show Row/Col Counts
                    └─ File Size Display
                             │
                    MODULE 4: DATA PREVIEW
                    ├─ Show First 50 Rows
                    ├─ Scrollable Table
                    └─ Null Handling
                             │
                    MODULE 5: COLUMN ANALYSIS
                    ├─ Detect Data Types
                    ├─ Calculate Statistics
                    └─ Show Quality Metrics
                             │
                    MODULE 6: VISUALIZATION CONTROL
                    ├─ Column Selection
                    ├─ Chart Type Selection
                    ├─ Type Validation
                    └─ Generate Charts
                             │
                    ┌────────▼────────┐
                    │   Interactive   │
                    │  Visualizations │
                    └─────────────────┘
```

---

## Component Dependencies

```
app/page.tsx
├── FileUploadSection (Module 1)
│
└── DataDashboard
    ├── FileMetadata (Module 2)
    ├── DataPreviewTable (Module 4)
    ├── ColumnSummaries (Module 5)
    ├── VisualizationControl (Module 6)
    ├── VisualizationCharts
    ├── DataQualityReport
    └── InsightsPanel
```

---

## Backend API Endpoints

### POST `/api/upload`
Handles file upload and returns complete analysis.

**Request:**
```
multipart/form-data
- file: File (CSV/XLSX/XLS)
```

**Response:**
```json
{
  "columns": ["col1", "col2"],
  "data": [{"col1": "value1", "col2": "value2"}],
  "analysis": {
    "col1": {
      "dtype": "object",
      "unique": 100,
      "missing": 5,
      "missing_percent": 0.05
    }
  },
  "data_quality": {
    "quality_score": 0.95,
    "missing_count": 5,
    "duplicate_rows": 0
  },
  "insights": ["Insight 1", "Insight 2"]
}
```

---

## Error Handling

Each module includes error handling:

### Module 1 (Upload)
- Invalid file type → User-friendly error
- File too large → Size limit error
- Upload failure → Retry prompt

### Module 3 (Parsing)
- Encoding errors → Auto-detection
- Corrupted file → Detailed error message
- Empty file → Validation error

### Module 6 (Visualization)
- Invalid column types → Compatibility warning
- No numeric data → Chart type restriction
- Selection validation → Real-time feedback

---

## Performance Considerations

1. **File Upload**: Progress tracking for large files
2. **Data Parsing**: Efficient pandas operations
3. **Preview Display**: Limited to first 50 rows
4. **Column Analysis**: Pre-computed statistics
5. **Visualization**: Lazy rendering on chart selection

---

## Configuration

### Backend Environment Variables
```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=dataviz
API_PORT=8000
```

### Frontend API Base URL
```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000'
```

---

## Testing the Modules

### Test File 1: Sales Data (Module 1-3 Test)
```csv
Product,Region,Sales,Date,Category
Apple,North,1500,2024-01-15,Fruit
Orange,South,2000,2024-01-16,Fruit
```

### Test File 2: Customer Data (Module 5-6 Test)
```csv
CustomerID,Age,Income,Purchases,LastVisit
1,25,50000,5,2024-01-20
2,35,75000,10,2024-01-21
```

---

## Best Practices

1. **Always validate files** before processing (Module 1)
2. **Show metadata immediately** after upload (Module 2)
3. **Handle large datasets** with pagination (Module 4)
4. **Pre-compute statistics** for performance (Module 5)
5. **Validate visualizations** before rendering (Module 6)

---

## Future Enhancements

- [ ] Real-time data filtering in Module 4
- [ ] Advanced statistics in Module 5
- [ ] More chart types in Module 6
- [ ] Data export functionality
- [ ] Collaborative features
- [ ] Real-time collaboration
