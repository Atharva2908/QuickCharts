# DataViz Setup Guide

This guide walks you through setting up the complete DataViz application with both frontend and backend.

## Quick Start (5 minutes)

### 1. Frontend Setup

```bash
# Install Node.js dependencies
npm install

# Start development server
npm run dev
```

The frontend will run at: **http://localhost:3000**

### 2. Backend Setup (in a new terminal)

```bash
# Navigate to server directory
cd server

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Run FastAPI server
python main.py
```

The backend will run at: **http://localhost:8000**

**That's it!** You now have the full stack running.

---

## Detailed Setup

### Prerequisites

Before you start, make sure you have:

- **Node.js 18+** - [Download](https://nodejs.org/)
- **Python 3.8+** - [Download](https://www.python.org/downloads/)
- **npm or yarn** - Comes with Node.js
- **MongoDB (Optional)** - For data persistence

### Frontend Details

#### Installation

```bash
npm install
```

This installs all React and Next.js dependencies including:
- React 19.2
- Next.js 16
- Tailwind CSS
- Recharts (charting library)
- shadcn/ui components
- Axios (HTTP client)

#### Development Server

```bash
npm run dev
```

- Opens at `http://localhost:3000`
- Hot reload on file changes
- Turbopack for fast builds

#### Build for Production

```bash
npm run build
npm start
```

#### Browser Access

Once running, you can:
1. Upload CSV or Excel files
2. View instant data analysis
3. Explore interactive visualizations
4. Check data quality reports
5. Review AI-generated insights

---

### Backend Details

#### Installation

```bash
cd server
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate     # Windows

pip install -r requirements.txt
```

This installs:
- FastAPI - Web framework
- Uvicorn - ASGI server
- Pandas - Data manipulation
- NumPy - Numerical computing
- MongoDB drivers - Database access
- Others - See requirements.txt

#### Running the Server

```bash
python main.py
```

Or with Uvicorn directly:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

#### Environment Variables

Create a `.env` file in the `server` directory:

```env
# MongoDB (optional)
MONGODB_URI=mongodb://localhost:27017

# Other configurations
LOG_LEVEL=INFO
```

---

## MongoDB Setup (Optional)

### Local Installation

#### macOS
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Windows
Download installer from [MongoDB Community](https://www.mongodb.com/try/download/community)

#### Linux (Ubuntu)
```bash
curl https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

### Cloud MongoDB (Recommended)

Use **MongoDB Atlas** for free:
1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create free cluster
3. Get connection string
4. Add to `.env`:
   ```env
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dataviz
   ```

---

## Project Structure

```
dataviz/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Styles
├── components/
│   ├── file-upload.tsx
│   ├── data-dashboard.tsx
│   ├── data-preview-table.tsx
│   ├── column-summaries.tsx
│   ├── visualization-charts.tsx
│   ├── data-quality-report.tsx
│   └── insights-panel.tsx
├── server/
│   ├── main.py            # FastAPI app
│   ├── database.py        # MongoDB client
│   └── requirements.txt    # Python deps
├── public/                # Static files
├── package.json           # Node deps
├── README.md             # Documentation
└── SETUP.md             # This file
```

---

## Troubleshooting

### Frontend Issues

#### Port 3000 already in use
```bash
# Use different port
npm run dev -- -p 3001
```

#### Module not found errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Styles not loading
```bash
# Rebuild Tailwind
npm run build
```

### Backend Issues

#### Module not found
```bash
# Make sure virtual env is activated
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate     # Windows

# Reinstall requirements
pip install -r requirements.txt
```

#### Port 8000 already in use
```bash
# Use different port
python -m uvicorn main:app --port 8001
```

#### MongoDB connection error
This is optional - the app works without it. If you want persistence:
1. Make sure MongoDB is running
2. Check connection string in `.env`
3. Verify credentials and network access

#### CORS errors
The backend is configured with CORS enabled. If you still get errors:
1. Ensure backend is running on port 8000
2. Check browser console for exact error
3. Verify frontend is calling `http://localhost:8000`

---

## Testing the Application

### Step 1: Upload Test Data

You can test with:
- **Sample CSV**: Create `sample.csv`
  ```csv
  Date,Sales,Expenses,Users
  2024-01-01,4000,2400,240
  2024-01-02,3000,1398,221
  2024-01-03,2000,9800,229
  ```
- **Sample Excel**: Download or create `.xlsx` file
- **Use sample data**: Click "Download Sample" button (if implemented)

### Step 2: Upload and Analyze

1. Go to http://localhost:3000
2. Drag and drop or click to upload
3. View instant analysis and visualizations

### Step 3: Explore Features

- **Overview**: Key statistics
- **Preview**: First 50 rows
- **Charts**: Multiple visualization types
- **Quality**: Data quality assessment
- **Insights**: AI-generated observations

---

## Performance Tips

1. **For large files** (>50MB):
   - Split into smaller chunks
   - Pre-process in Excel/Python
   - Consider streaming uploads

2. **For slow network**:
   - Upload to local server first
   - Use compression
   - Monitor network tab in DevTools

3. **For production**:
   - Deploy frontend to Vercel
   - Deploy backend to Render, Railway, or AWS
   - Use managed MongoDB (Atlas)

---

## Deployment

### Frontend (Vercel)

```bash
npm run build
# Login and deploy
npm install -g vercel
vercel
```

### Backend (Various Options)

#### Render.com
```bash
git push origin main
# Connect repo to Render
```

#### Railway.app
```bash
railway login
railway link
railway deploy
```

#### AWS / DigitalOcean
```bash
pip install -r server/requirements.txt
gunicorn -w 4 -b 0.0.0.0:8000 main:app
```

---

## Next Steps

1. ✅ Complete setup above
2. 📤 Upload your first data file
3. 📊 Explore visualizations
4. 🔍 Check quality reports
5. 💡 Review insights
6. 🚀 Deploy to production

---

## Support

- **Issues**: Check GitHub issues
- **Questions**: See README.md for details
- **Feedback**: We'd love to hear from you!

---

Happy analyzing! 🎉
