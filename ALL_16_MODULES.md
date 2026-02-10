# DataViz: Complete 16-Module Architecture

## Overview
This document describes all 16 modules that make up the complete DataViz data visualization platform, their responsibilities, and how they integrate together.

---

## MODULE 1-6: Core Foundation (Previously Implemented)

### Module 1: File Upload Module (`components/file-upload.tsx`)
**Purpose:** Handle file upload and validation

**Responsibilities:**
- Drag & drop file upload interface
- File type validation (CSV, XLSX, XLS)
- File size validation (100MB max)
- Upload progress tracking
- Error handling and display

**Key Features:**
- Real-time validation feedback
- Progress bar during upload
- Support for multiple file formats
- Error messages for invalid files

---

### Module 2: File Metadata Module (`components/file-metadata.tsx`)
**Purpose:** Display file information and statistics

**Responsibilities:**
- Show filename and upload timestamp
- Display file size in human-readable format
- Show row and column counts
- Visual metadata cards with icons

**Key Features:**
- Responsive card layout
- Formatted file size display
- Quick statistics overview

---

### Module 3: Data Parsing Module (`server/main.py` + `server/data_processor.py`)
**Purpose:** Parse uploaded files and extract data

**Responsibilities:**
- Read CSV and Excel files
- Detect encoding automatically
- Parse data into structured format
- Detect data types for each column
- Generate statistics and analysis

**Key Features:**
- Automatic format detection
- Column type identification
- Statistical calculations
- Quality scoring

---

### Module 4: Data Preview Module (`components/data-preview-table.tsx`)
**Purpose:** Display raw dataset preview

**Responsibilities:**
- Show first 50 rows of data
- Display all columns with scrolling
- Format null/undefined values
- Show row count indicator
- Responsive horizontal scrolling

**Key Features:**
- Sticky table headers
- Formatted null values
- Responsive design
- Row count display

---

### Module 5: Column Analysis Module (`components/column-summaries.tsx`)
**Purpose:** Analyze individual columns

**Responsibilities:**
- Detect data type (Text, Integer, Decimal, Boolean, Date)
- Calculate missing value percentage
- Count unique values
- Compute statistics (mean, median, std, min, max)
- Display visual type indicators

**Key Features:**
- Type indicators with icons
- Missing value analysis
- Statistical summaries
- Visual statistics cards

---

### Module 6: Visualization Control Module (`components/visualization-control.tsx`)
**Purpose:** Control and configure visualizations

**Responsibilities:**
- Chart type selector (Bar, Line, Scatter, Histogram, Pie)
- X & Y-axis column selectors
- Validation of chart compatibility
- Display warnings for invalid selections
- Provide smart recommendations

**Key Features:**
- Interactive chart type buttons
- Smart column filtering
- Real-time validation
- Usage recommendations

---

## MODULE 7-16: Advanced Features

### Module 7: Chart Generation Module (`components/chart-generator.tsx`)
**Purpose:** Dynamically generate data visualizations

**Responsibilities:**
- Bar charts for categorical data
- Line charts for trends
- Scatter plots for correlations
- Histograms for distributions
- Pie charts for composition
- Interactive charts with zoom and hover

**Key Features:**
- 5 different chart types
- Responsive containers
- Tooltips and legends
- Dark theme styling
- Zoom and hover interactions

---

### Module 8: Correlation Analysis Module (`components/correlation-analysis.tsx`)
**Purpose:** Analyze relationships between numeric columns

**Responsibilities:**
- Calculate Pearson correlation coefficient
- Generate correlation heatmap
- Identify high-correlation pairs (>0.7)
- Color-coded visualization
- Strength classification

**Key Features:**
- Heatmap display with colors
- Strong correlation highlighting
- Automatic column filtering
- Strength indicators (Very Strong/Strong)
- Correlation coefficient display

---

### Module 9: Data Quality Module (`components/data-quality-report.tsx`)
**Purpose:** Assess data cleanliness and quality

**Responsibilities:**
- Calculate overall quality score
- Detect missing values
- Identify duplicate rows
- Report data completeness
- Suggest improvements

**Key Features:**
- Quality score display
- Column-by-column analysis
- Issue alerts and warnings
- Recommendations for improvement
- Visual quality indicators

---

### Module 10: Auto Insights Module (`components/auto-insights.tsx`)
**Purpose:** Generate human-readable insights automatically

**Responsibilities:**
- Detect trends and patterns
- Highlight max/min values
- Identify dominant categories
- Generate plain-English insights
- Classify insights by type (info/warning/trend)

**Key Features:**
- Automatic pattern detection
- Insight categorization
- Color-coded insight cards
- Plain-language explanations
- Actionable recommendations

---

### Module 11: Export & Download Module (`components/export-download.tsx`)
**Purpose:** Allow users to export analysis results

**Responsibilities:**
- Export cleaned dataset as CSV
- Export analysis report as JSON
- Export summary report as TXT
- Handle file downloads
- Provide export status feedback

**Key Features:**
- Multiple export formats
- CSV data export
- JSON analysis export
- Text report generation
- Download status indication

---

### Module 12: API Layer Module (`lib/api-client.ts`)
**Purpose:** Connect frontend to backend services

**Responsibilities:**
- File upload API calls
- Data analysis requests
- Error handling and validation
- Response validation
- Request/response logging

**Key Features:**
- Axios-based HTTP client
- Error interceptors
- Upload progress tracking
- Response validation
- Timeout handling

---

### Module 13: State Management Module (`lib/state-store.ts`)
**Purpose:** Manage application-wide state

**Responsibilities:**
- File upload state management
- Parsed data persistence
- Chart selection state
- UI state (loading, errors, messages)
- Analysis results caching

**Key Features:**
- Zustand state stores
- Separate concerns (file/data/chart/ui)
- Easy state access hooks
- Centralized state management
- Type-safe stores

---

### Module 14: UI Layout & Navigation Module (`components/app-layout.tsx`)
**Purpose:** Provide overall application structure

**Responsibilities:**
- Header with logo and title
- Navigation tabs for sections
- Main content area
- Footer with information
- Responsive layout
- Section-based rendering

**Key Features:**
- Sticky header
- Tab navigation
- Responsive footer
- Mobile-friendly design
- Consistent styling

---

### Module 15: Error Handling & Validation Module (`lib/error-handler.ts`)
**Purpose:** Provide user-friendly error handling

**Responsibilities:**
- File validation (type, size)
- Data validation (structure, dimensions)
- Column validation (naming, duplicates)
- Error message formatting
- Data type detection

**Key Features:**
- Comprehensive validation
- Error severity levels
- Formatted error messages
- Warning detection
- Type detection utilities

---

### Module 16: Security & Limits Module (`lib/security.ts`)
**Purpose:** Enforce security constraints

**Responsibilities:**
- File size limits (100MB max)
- Row limits (1M rows max)
- Column limits (500 columns max)
- Memory limit enforcement
- File type whitelisting
- Rate limiting per user
- Filename sanitization
- Cell value sanitization

**Key Features:**
- Configurable limits
- Rate limiting implementation
- Filename validation
- Cell value sanitization
- Memory estimation
- CSP headers
- CORS configuration

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   USER INTERACTION                          │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────▼────────────┐
        │  Module 1: File Upload  │
        │  + Module 15: Validation│
        │  + Module 16: Security  │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  Module 12: API Layer   │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │ Module 3: Data Parsing  │
        │ (Backend Processing)    │
        └────────────┬────────────┘
                     │
        ┌────────────▼──────────────────────────┐
        │      Analysis Results Returned        │
        └────────────┬──────────────────────────┘
                     │
        ┌────────────▼──────────────────────────┐
        │  Module 13: State Management          │
        │  - File metadata                      │
        │  - Parsed data                        │
        │  - Analysis results                   │
        └────────────┬──────────────────────────┘
                     │
        ┌────────────▼──────────────────────────┐
        │   MODULE VISUALIZATION LAYER          │
        ├──────────────────────────────────────┤
        │ • Module 2: File Metadata             │
        │ • Module 4: Data Preview              │
        │ • Module 5: Column Analysis           │
        │ • Module 6: Visualization Control     │
        │ • Module 7: Chart Generation          │
        │ • Module 8: Correlation Analysis      │
        │ • Module 9: Data Quality              │
        │ • Module 10: Auto Insights            │
        │ • Module 11: Export & Download        │
        └────────────┬──────────────────────────┘
                     │
        ┌────────────▼──────────────────────────┐
        │   Module 14: UI Layout & Navigation   │
        │   (Renders all components)            │
        └────────────┬──────────────────────────┘
                     │
        ┌────────────▼──────────────────────────┐
        │         RENDERED UI TO USER           │
        └─────────────────────────────────────────┘
```

---

## Integration Points

### Frontend Integration
All 14 frontend modules integrate through:
1. **State Management** (Module 13) - Central data store
2. **UI Layout** (Module 14) - Renders all components
3. **API Layer** (Module 12) - Communicates with backend

### Backend Integration
Backend (Modules 3, 16) handles:
- Data parsing and analysis
- Security enforcement
- File processing

### Error Handling
Implemented across:
- Module 15: Validation and error detection
- Module 12: API error handling
- Module 16: Security validation

---

## Configuration

### File Size Limits
```typescript
maxFileSize: 100 * 1024 * 1024 // 100 MB
maxRows: 1000000 // 1 million rows
maxColumns: 500 // 500 columns
```

### Allowed File Types
```typescript
allowedExtensions: ['.csv', '.xls', '.xlsx']
allowedMimeTypes: ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
```

### Chart Types
```typescript
'bar' | 'line' | 'scatter' | 'pie' | 'histogram'
```

---

## Styling

All modules use:
- **Dark Theme**: HSL(10, 20%, 8%) background
- **Primary Color**: HSL(200, 100%, 50%) - Blue accent
- **Tailwind CSS**: Utility-first styling
- **Recharts**: Charting library with dark theme

---

## Usage Examples

### Upload and Analyze File
```typescript
// File uploaded through Module 1
// Processed by Module 3 backend
// Results stored in Module 13 state
// Displayed through Modules 2-11
```

### View Chart
```typescript
// User selects chart type (Module 6)
// Selects X & Y columns (Module 6)
// Module 7 generates chart
// Rendered in dashboard
```

### Export Results
```typescript
// User clicks export button (Module 11)
// Module 11 formats data
// Browser downloads file
// CSV, JSON, or TXT format available
```

---

## Security Features

- File type validation
- File size limits
- Column name sanitization
- Cell value sanitization
- Rate limiting
- Memory limit enforcement
- CSP headers
- CORS configuration

---

## Performance Optimizations

- State management reduces re-renders
- Lazy loading of large datasets
- Memoized calculations
- Efficient data structures
- Responsive design

---

## Future Enhancements

1. **Module Extension**: Add more chart types
2. **Real-time Collaboration**: Multi-user support
3. **Advanced Filtering**: Custom data filters
4. **Machine Learning**: Predictive insights
5. **Custom Themes**: User-selectable themes
6. **Data Connectors**: Direct database connections

---

## Testing

Each module can be tested independently:
- Module 1: File upload functionality
- Module 3: Data parsing accuracy
- Module 7: Chart rendering
- Module 8: Correlation calculations
- Module 10: Insight generation
- Module 13: State persistence

---

## Deployment

All 16 modules are production-ready and can be deployed to:
- Vercel (recommended)
- AWS
- Railway
- Docker containers

See `SETUP.md` for detailed deployment instructions.

