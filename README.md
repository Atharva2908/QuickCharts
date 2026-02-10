# DataViz - Smart Data Visualization Platform

A modern, full-stack data visualization application that helps users understand their data without technical expertise. Upload CSV or Excel files and get instant insights, interactive visualizations, and detailed analysis reports.

## Features

- **Easy File Upload**: Drag-and-drop or click to upload CSV and Excel files
- **Automatic Analysis**: Instant detection of data types, missing values, and unique entries
- **Interactive Visualizations**: 
  - Bar charts
  - Line charts
  - Scatter plots
  - Histograms
- **Data Quality Reports**: Assess completeness, identify issues, and get recommendations
- **AI-Generated Insights**: Auto-generated insights highlighting trends and patterns
- **Column Summaries**: Detailed statistics for each column
- **Data Preview**: Interactive table preview of your data

## Tech Stack

### Frontend
- **React 19.2** - UI library
- **Next.js 16** - Framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **shadcn/ui** - Component library
- **Axios** - HTTP client

### Backend
- **FastAPI** - Modern Python web framework
- **Pandas** - Data processing
- **NumPy** - Numerical computing
- **MongoDB** - Database (optional)

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.8+
- MongoDB (optional, for data persistence)

### Installation

#### 1. Frontend Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

#### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI server
python main.py
```

The API will be available at `http://localhost:8000`

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB connection string (optional)
MONGODB_URI=mongodb://localhost:27017
```

## Project Structure

```
dataviz/
├── app/                          # Next.js app directory
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── file-upload.tsx          # File upload component
│   ├── data-dashboard.tsx       # Main dashboard
│   ├── data-preview-table.tsx   # Data table
│   ├── column-summaries.tsx     # Column statistics
│   ├── visualization-charts.tsx # Chart components
│   ├── data-quality-report.tsx  # Quality assessment
│   └── insights-panel.tsx       # Insights display
├── server/                       # FastAPI backend
│   ├── main.py                  # Main FastAPI app
│   ├── database.py              # MongoDB integration
│   └── requirements.txt          # Python dependencies
├── public/                       # Static assets
└── package.json                 # Frontend dependencies
```

## API Endpoints

### Health Check
```
GET /health
```

### Upload and Analyze File
```
POST /api/upload
Content-Type: multipart/form-data

Parameters:
- file: File (CSV or Excel)

Response:
{
  "data": [...],                 // Array of data records
  "columns": [...],              // Column names
  "analysis": {...},             // Column analysis
  "insights": [...],             // Generated insights
  "data_quality": {...},         // Quality assessment
  "metadata": {...}              // File metadata
}
```

### Get Sample Data
```
GET /api/sample-data
```

## Data Analysis Features

### Column Analysis
- Data type detection (integer, float, string, date, boolean)
- Unique value count
- Missing value detection
- Statistical measures (mean, median, std, min, max)
- Quartile calculations

### Data Quality Assessment
- Quality score (0-100%)
- Missing value count
- Duplicate row detection
- Completeness percentage
- Issue identification

### Auto-Generated Insights
- Missing data alerts
- Duplicate row detection
- Outlier identification (z-score > 3)
- Distribution skewness analysis
- Correlation detection
- Data completeness summary

### Visualizations
- **Bar Charts**: Compare categories
- **Line Charts**: Track trends over time
- **Scatter Plots**: Examine relationships
- **Histograms**: View data distributions

## Deployment

### Frontend (Vercel)
```bash
npm run build
# Deploy to Vercel
vercel
```

### Backend (Any Python Host)
```bash
# Using Uvicorn
pip install -r server/requirements.txt
cd server
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Considerations

- Maximum file size: 100MB (configurable)
- Maximum rows displayed in preview: 50
- Maximum chart data points: 100 (scatter plots)
- Automatic data sampling for large datasets

## Security

- CORS enabled for development
- Input validation on file uploads
- Error handling and logging
- Secure file processing

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT

## Support

For issues or questions, please create an issue in the repository or contact support.

---

**DataViz** - Making data analysis accessible to everyone ✨
