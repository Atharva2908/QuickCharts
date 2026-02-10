# DataViz - Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

- Node.js 18+ ([download](https://nodejs.org/))
- Python 3.8+ ([download](https://www.python.org/))

## 🚀 Fastest Way to Start

### Option 1: With Docker (Recommended)

```bash
# One command to start everything
docker-compose up

# Visit http://localhost:3000
```

### Option 2: Manual Setup

#### Terminal 1 - Frontend

```bash
npm install
npm run dev
```

#### Terminal 2 - Backend

```bash
cd server
python -m venv venv

# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

pip install -r requirements.txt
python main.py
```

#### Terminal 3 (Optional) - MongoDB

```bash
# If you have MongoDB installed locally
mongod

# Or use MongoDB Atlas Cloud (no local install needed)
# Set MONGODB_URI in server/.env
```

## 📍 Access Points

Once running:

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Main app |
| API | http://localhost:8000 | Backend |
| API Docs | http://localhost:8000/docs | Interactive API |
| Swagger | http://localhost:8000/redoc | API reference |

## 📤 Upload Test File

Create `sample.csv`:

```csv
Month,Sales,Expenses,Users
Jan,4000,2400,240
Feb,3000,1398,221
Mar,2000,9800,229
Apr,2780,3908,200
May,1890,4800,229
Jun,2390,3800,220
```

Then:
1. Go to http://localhost:3000
2. Drag the file to upload area or click to select
3. Instant analysis appears!

## 🗂️ Project Structure

```
dataviz/
├── app/              # Frontend pages
├── components/       # React components
├── lib/              # Utilities
├── server/           # Backend API
└── public/           # Assets
```

## ⚙️ Environment Variables

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (`server/.env`)
```env
MONGODB_URI=mongodb://localhost:27017
LOG_LEVEL=INFO
```

## 📊 What You Can Do

1. **Upload Files**
   - CSV files
   - Excel files (.xlsx, .xls)

2. **View Analyses**
   - Data preview (first 50 rows)
   - Column statistics
   - Data quality score
   - Missing values report

3. **Explore Visualizations**
   - Bar charts
   - Line charts
   - Scatter plots
   - Histograms

4. **Read Insights**
   - Automatic anomaly detection
   - Trend analysis
   - Data quality recommendations
   - Correlation findings

## 🛠️ Common Commands

### Frontend
```bash
npm run dev         # Start dev server
npm run build       # Build for production
npm run lint        # Check code quality
```

### Backend
```bash
python main.py              # Start server
python -m uvicorn main:app --reload  # Alternative start
```

### Database
```bash
# If using local MongoDB
mongod              # Start MongoDB
mongosh             # Open MongoDB shell
```

## 🔍 Troubleshooting

### "Cannot find module" error
```bash
npm install
```

### "Port already in use"
```bash
# Use different port
npm run dev -- -p 3001  # Frontend on 3001
python -m uvicorn main:app --port 8001  # Backend on 8001
```

### "Database connection failed"
- Uncomment MongoDB in docker-compose.yml
- Or sign up for MongoDB Atlas (free)
- Or ignore - app works without database

### "CORS error"
- Make sure backend is running on port 8000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Clear browser cache

## 📚 Documentation

- **Full Setup**: `SETUP.md`
- **Architecture**: `PROJECT_GUIDE.md`
- **Complete Info**: `README.md`
- **What's Built**: `COMPLETION_SUMMARY.md`

## 🌐 Deployment

### Frontend to Vercel
```bash
vercel login
vercel
```

### Backend to Railway
```bash
railway login
railway link
railway deploy
```

## 📞 Support

Check the documentation files or look at the issue tracker. The project is fully self-contained and well-documented.

---

**Ready to analyze some data?** Start with the Docker command above! 🎉
