# DataViz - Complete Project Guide

## Overview

DataViz is a full-stack data visualization platform built with React, Next.js, FastAPI, and MongoDB. It enables non-technical users to upload data files and instantly gain insights through interactive visualizations, statistical analysis, and AI-generated observations.

## Architecture

### Frontend Stack
- **React 19.2** - UI rendering
- **Next.js 16** - Framework and server-side features
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Data visualization library
- **shadcn/ui** - Pre-built components
- **Axios** - HTTP client

### Backend Stack
- **FastAPI** - Asynchronous Python web framework
- **Pandas** - Data manipulation and analysis
- **NumPy** - Numerical computing
- **SciPy** - Statistical functions
- **Motor** - Async MongoDB driver
- **Uvicorn** - ASGI server

### Database
- **MongoDB** - NoSQL database for persistence (optional)
- **Supports**: Local MongoDB, MongoDB Atlas (cloud)

## Project Structure

```
dataviz/
│
├── app/                           # Next.js app directory
│   ├── layout.tsx                # Root layout component
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles & theme
│
├── components/                    # React components
│   ├── file-upload.tsx           # File upload interface
│   ├── data-dashboard.tsx        # Main dashboard layout
│   ├── data-preview-table.tsx    # Data table display
│   ├── column-summaries.tsx      # Column statistics
│   ├── visualization-charts.tsx  # Chart components
│   ├── data-quality-report.tsx   # Quality assessment
│   ├── insights-panel.tsx        # Insights display
│   └── ui/                       # shadcn UI components
│
├── lib/                           # Utility functions
│   ├── api.ts                    # API client & types
│   ├── data-utils.ts             # Data processing functions
│   └── utils.ts                  # General utilities
│
├── server/                        # FastAPI backend
│   ├── main.py                   # Main FastAPI application
│   ├── config.py                 # Configuration settings
│   ├── database.py               # MongoDB client & operations
│   ├── data_processor.py         # Advanced analysis
│   ├── requirements.txt           # Python dependencies
│   ├── Dockerfile                # Docker image for backend
│   └── .env                      # Environment variables
│
├── public/                        # Static assets
├── Dockerfile.frontend           # Docker image for frontend
├── docker-compose.yml            # Multi-container orchestration
├── package.json                  # Frontend dependencies
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── next.config.mjs               # Next.js configuration
│
├── README.md                     # Documentation
├── SETUP.md                      # Setup instructions
├── PROJECT_GUIDE.md              # This file
└── .env.example                  # Example environment variables
```

## Key Features

### 1. File Upload
- Drag-and-drop interface
- Support for CSV and Excel (.xlsx, .xls)
- Real-time processing feedback
- Error handling and validation

### 2. Data Analysis
- **Column Detection**: Automatic data type identification
- **Statistical Summary**: Mean, median, std dev, min, max
- **Missing Value Detection**: Count and percentage reporting
- **Unique Value Counting**: Cardinality analysis
- **Outlier Detection**: Z-score and IQR methods

### 3. Visualizations
- **Bar Charts**: Compare categories
- **Line Charts**: Track trends
- **Scatter Plots**: Examine relationships
- **Histograms**: Understand distributions
- **Heatmaps**: Correlation analysis (planned)

### 4. Data Quality Assessment
- Overall quality score (0-100%)
- Missing value report
- Duplicate row detection
- Column-by-column quality metrics
- Actionable recommendations

### 5. AI-Generated Insights
- Missing data alerts
- Anomaly detection
- Distribution analysis (skewness)
- Correlation identification
- Trend observations
- Data completeness summary

## API Endpoints

### Health & Status
```
GET /health
Response: { "status": "ok" }
```

### File Upload
```
POST /api/upload
Content-Type: multipart/form-data

Request:
- file: File (CSV or Excel)

Response: UploadResponse {
  "data": [...],           // Array of records
  "columns": [...],        // Column names
  "analysis": {...},       // Column analysis
  "insights": [...],       // Generated insights
  "data_quality": {...},   // Quality metrics
  "metadata": {...}        // File info
}
```

### Sample Data
```
GET /api/sample-data
Response: UploadResponse (with sample data)
```

## Component Hierarchy

```
App (page.tsx)
├── Header
│   └── Upload Button / Reset Button
├── Main Content (Conditional)
│   ├── FileUploadSection (when no data)
│   └── DataDashboard (when data loaded)
│       ├── Dashboard Tabs
│       │   ├── Overview
│       │   │   ├── Stats Cards
│       │   │   └── ColumnSummaries
│       │   ├── Preview
│       │   │   └── DataPreviewTable
│       │   ├── Charts
│       │   │   └── VisualizationCharts
│       │   ├── Quality
│       │   │   └── DataQualityReport
│       │   └── Insights
│       │       └── InsightsPanel
└── Footer
```

## Data Flow

### Upload Process
1. User uploads file (CSV/Excel)
2. Frontend sends to `/api/upload`
3. Backend reads file with Pandas
4. Data analyzed and statistics calculated
5. Insights generated
6. Quality assessment performed
7. Data saved to MongoDB (if configured)
8. Response returned to frontend
9. Frontend renders dashboard

### Frontend State Management
- React hooks for component state
- Props for data passing
- No external state management (kept simple)

## Authentication & Security

### Current Implementation
- CORS enabled for development
- Input validation on file uploads
- Error handling and logging

### Recommended for Production
- User authentication (Auth.js, Supabase)
- Rate limiting
- File size validation
- Database access control
- HTTPS enforcement
- CSRF protection

## Performance Considerations

### Frontend
- Code splitting with Next.js
- Component lazy loading
- Image optimization
- CSS-in-JS optimization

### Backend
- Asynchronous processing with FastAPI
- Efficient Pandas operations
- Data sampling for large files
- Database indexing

### Limits
- Max file size: 100 MB
- Preview rows: 50
- Chart data points: 100 (scatter)
- Histogram bins: 20

## Development Workflow

### 1. Setup Development Environment
```bash
# Frontend
npm install
npm run dev

# Backend (separate terminal)
cd server
pip install -r requirements.txt
python main.py
```

### 2. Making Changes

**Frontend:**
- Edit files in `/components` or `/app`
- Changes hot-reload automatically
- Check TypeScript errors: `npx tsc --noEmit`

**Backend:**
- Edit files in `/server`
- Server auto-reloads with `--reload` flag
- API docs: http://localhost:8000/docs

### 3. Testing

**Frontend:**
- Manual testing in browser
- Check browser console for errors
- Network tab to monitor API calls

**Backend:**
- Use Swagger UI: http://localhost:8000/docs
- Try sample endpoints
- Check server logs

## Deployment Guide

### Frontend (Vercel - Recommended)

```bash
# Build and deploy
npm run build
vercel

# Set environment variables in Vercel dashboard
# NEXT_PUBLIC_API_URL = https://your-api-domain.com
```

### Backend (Multiple Options)

#### Option 1: Render
1. Push to GitHub
2. Connect Render.com to repo
3. Set environment variables
4. Deploy

#### Option 2: Railway
```bash
railway login
railway link
railway deploy
```

#### Option 3: Docker + Any Cloud
```bash
docker build -t dataviz-backend ./server
docker run -p 8000:8000 dataviz-backend
```

### Database (MongoDB Atlas)

1. Create free cluster at mongodb.com/cloud/atlas
2. Get connection string
3. Set `MONGODB_URI` environment variable
4. Ensure database access is configured

## Customization Guide

### Change Color Scheme

Edit `app/globals.css`:
```css
.dark {
  --background: 10 20% 8%;      /* Dark background */
  --foreground: 0 0% 95%;       /* Light text */
  --primary: 200 100% 50%;      /* Blue accent */
  /* ... other colors */
}
```

### Add New Visualization

1. Create component in `/components`
2. Add to `VisualizationCharts` component
3. Import Recharts or preferred library

### Extend Analysis

1. Add functions to `/server/data_processor.py`
2. Call from main.py analysis functions
3. Return in API response
4. Display in frontend components

### Customize Insights

Edit insight generation in `/server/main.py`:
```python
def generate_insights(df: pd.DataFrame, analysis: Dict) -> List[Dict]:
    # Add your custom insight logic
    insights.append({
        'type': 'custom',
        'title': 'Your Insight',
        'description': 'Description here',
    })
```

## Troubleshooting

### File Upload Fails
- Check file format (CSV or Excel)
- Verify file size < 100 MB
- Check browser console for errors
- Ensure backend is running

### No Data Quality Score
- MongoDB may be disconnected
- Check server logs
- App continues working without persistence

### Charts Not Displaying
- Verify you have numeric columns
- Check selected X/Y axes
- Look for JavaScript errors in console

### Slow Performance
- Reduce file size
- Close other browser tabs
- Check network speed
- Monitor CPU usage

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancements

- User authentication and profiles
- Data export (CSV, PDF)
- Custom chart colors and styling
- Data transformation tools
- Predictive analytics
- Collaborative sharing
- Real-time collaboration
- Advanced filtering
- Time series analysis
- Machine learning predictions

## Contributing

To contribute:
1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request
5. Await review

## License

MIT License - See LICENSE file

## Support & Resources

- **Documentation**: README.md
- **Setup Guide**: SETUP.md
- **API Docs**: http://localhost:8000/docs (when running)
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **React Docs**: https://react.dev/
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind Docs**: https://tailwindcss.com/docs

## Contact

For questions or feedback, please open an issue or contact the development team.

---

**DataViz** - Making data analysis accessible to everyone. Last updated: 2024
