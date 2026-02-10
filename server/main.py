from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
from io import BytesIO
import logging
from typing import Optional, Dict, List, Any
from datetime import datetime
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
import json
from pathlib import Path
import os

# Import database module
import sys
sys.path.append(os.path.dirname(__file__))
from database import init_db, close_db, get_db

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create app FIRST without lifespan
app = FastAPI(
    title="QuickCharts API",
    description="Data visualization and analysis API", 
    version="1.0.0"
)

# ✅ CORS middleware - FIRST after app creation (CRITICAL!)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    try:
        await init_db()
        logger.info("Database initialized on startup")
    except Exception as e:
        logger.warning(f"Database initialization failed: {str(e)}. Continuing without persistence.")

@app.on_event("shutdown")
async def shutdown_event():
    """Close database on shutdown"""
    try:
        await close_db()
        logger.info("Database closed on shutdown")
    except Exception as e:
        logger.warning(f"Database shutdown error: {str(e)}")

class DataAnalyzer:
    """Analyze uploaded data files"""
    
    @staticmethod
    def read_file(file: UploadFile) -> Optional[pd.DataFrame]:
        """Read CSV or Excel file"""
        try:
            filename = file.filename.lower()
            
            # Reset file pointer - CRITICAL FIX!
            file.file.seek(0)
            
            if filename.endswith('.csv'):
                content = file.file.read()
                df = pd.read_csv(BytesIO(content))
            elif filename.endswith(('.xlsx', '.xls')):
                content = file.file.read()
                df = pd.read_excel(BytesIO(content))
            else:
                return None
                
            return df
        except Exception as e:
            logger.error(f"Error reading file: {str(e)}")
            return None
    
    @staticmethod
    def analyze_columns(df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze each column in the dataframe"""
        analysis = {}
        
        for col in df.columns:
            col_data = df[col]
            
            analysis[col] = {
                'dtype': str(col_data.dtype),
                'unique': int(col_data.nunique()),
                'missing': int(col_data.isna().sum()),
                'missing_percent': float(col_data.isna().sum() / len(df)),
            }
            
            # Numeric statistics
            if pd.api.types.is_numeric_dtype(col_data):
                analysis[col].update({
                    'mean': float(col_data.mean()) if not col_data.isna().all() else None,
                    'median': float(col_data.median()) if not col_data.isna().all() else None,
                    'std': float(col_data.std()) if not col_data.isna().all() else None,
                    'min': float(col_data.min()) if not col_data.isna().all() else None,
                    'max': float(col_data.max()) if not col_data.isna().all() else None,
                    '25%': float(col_data.quantile(0.25)) if not col_data.isna().all() else None,
                    '75%': float(col_data.quantile(0.75)) if not col_data.isna().all() else None,
                })
        
        return analysis
    
    @staticmethod
    def generate_insights(df: pd.DataFrame, analysis: Dict) -> List[Dict]:
        """Generate AI-like insights from data"""
        insights = []
        
        # Check for missing values
        total_missing = df.isna().sum().sum()
        if total_missing > 0:
            missing_percent = (total_missing / (len(df) * len(df.columns))) * 100
            insights.append({
                'type': 'alert',
                'title': 'Missing Data Detected',
                'message': f'Found {total_missing:,} missing values ({missing_percent:.1f}% of total data)',
                'description': 'Missing values can affect analysis accuracy. Consider imputation or removal.',
                'recommendation': 'Clean missing values using forward fill, interpolation, or removal strategies.'
            })
        
        # Check for duplicates
        duplicates = df.duplicated().sum()
        if duplicates > 0:
            insights.append({
                'type': 'alert',
                'title': 'Duplicate Rows Found',
                'message': f'Detected {duplicates} duplicate rows',
                'description': 'Duplicate rows can skew analysis results.',
                'recommendation': 'Remove duplicate rows to improve data quality.'
            })
        
        # Numeric column insights
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        
        for col in numeric_cols[:5]:  # Limit to first 5 numeric columns
            col_data = df[col].dropna()
            
            if len(col_data) > 0:
                mean = col_data.mean()
                std = col_data.std()
                
                # Check for outliers (simple z-score)
                if std > 0:
                    z_scores = np.abs((col_data - mean) / std)
                    outliers = (z_scores > 3).sum()
                    
                    if outliers > 0:
                        insights.append({
                            'type': 'general',
                            'title': f'Outliers in {col}',
                            'message': f'Found {outliers} potential outliers (|z-score| > 3)',
                            'description': f'Column "{col}" has {outliers} values that deviate significantly from the mean.',
                            'metrics': {
                                'mean': float(mean),
                                'std_dev': float(std),
                                'outlier_count': int(outliers)
                            }
                        })
        
        # Data completeness
        completeness = 1 - (total_missing / (len(df) * len(df.columns)))
        insights.append({
            'type': 'general',
            'title': 'Data Completeness',
            'message': f'Dataset is {completeness*100:.1f}% complete',
            'description': f'Your dataset has good data quality with {completeness*100:.1f}% completeness.',
            'metrics': {
                'completeness_score': float(completeness)
            }
        })
        
        return insights
    
    @staticmethod
    def assess_data_quality(df: pd.DataFrame) -> Dict:
        """Assess overall data quality"""
        total_cells = len(df) * len(df.columns)
        missing_count = df.isna().sum().sum()
        duplicate_count = df.duplicated().sum()
        
        quality_score = 1 - (missing_count / total_cells) - (duplicate_count / len(df) * 0.1)
        quality_score = max(0, min(1, quality_score))
        
        issues = []
        if missing_count > 0:
            issues.append(f"Contains {missing_count:,} missing values")
        if duplicate_count > 0:
            issues.append(f"Contains {duplicate_count:,} duplicate rows")
        if len(df.columns) > 50:
            issues.append("Dataset has many columns, consider dimensionality reduction")
        if len(df) < 10:
            issues.append("Dataset is very small, analysis may be limited")
        
        return {
            'quality_score': float(quality_score),
            'missing_count': int(missing_count),
            'duplicate_count': int(duplicate_count),
            'completeness': float(1 - (missing_count / total_cells)),
            'issues': issues
        }
    
    @staticmethod
    def prepare_for_frontend(df: pd.DataFrame, filename: str) -> Dict:
        """Prepare data for frontend consumption"""
        # Limit data for preview (first 1000 rows max)
        preview_df = df.head(1000)
        data = preview_df.fillna("").to_dict('records')
        columns = list(df.columns)
        
        # Analyze full dataset
        analysis = DataAnalyzer.analyze_columns(df)
        insights = DataAnalyzer.generate_insights(df, analysis)
        data_quality = DataAnalyzer.assess_data_quality(df)
        
        return {
            'data': data,
            'columns': columns,
            'analysis': analysis,
            'insights': insights,
            'data_quality': data_quality,
            'metadata': {
                'filename': filename,
                'rows': int(len(df)),
                'columns': int(len(df.columns)),
                'uploaded_at': datetime.now().isoformat()
            }
        }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Upload and analyze data file
    
    Accepts CSV or Excel files
    Returns analysis and prepared data
    """
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        
        logger.info(f"Processing file: {file.filename} (size: {file.size})")
        
        # Read file
        df = DataAnalyzer.read_file(file)
        if df is None:
            raise HTTPException(
                status_code=400,
                detail="Invalid file format. Please upload a CSV or Excel file."
            )
        
        # Validate data
        if len(df) == 0:
            raise HTTPException(status_code=400, detail="File is empty")
        
        if len(df.columns) == 0:
            raise HTTPException(status_code=400, detail="File has no columns")
        
        # Prepare response
        result = DataAnalyzer.prepare_for_frontend(df, file.filename)
        
        # Save to MongoDB if available
        try:
            db = await get_db()
            upload_id = await db.save_upload(
                filename=file.filename,
                file_size=file.size or 0,
                metadata={
                    'rows': len(df),
                    'columns': len(df.columns),
                }
            )
            
            # Save analysis results
            analysis_id = await db.save_analysis(upload_id, result)
            result['_id'] = str(analysis_id)
            
            logger.info(f"Saved analysis to MongoDB: {analysis_id}")
        except Exception as db_error:
            logger.warning(f"Database save failed: {str(db_error)}. Continuing without persistence.")
        
        logger.info(f"Successfully processed file: {file.filename} ({len(df)} rows, {len(df.columns)} columns)")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.get("/api/sample-data")
async def get_sample_data():
    """Get sample data for testing"""
    sample_df = pd.DataFrame({
        'Month': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        'Sales': [4000, 3000, 2000, 2780, 1890, 2390],
        'Expenses': [2400, 1398, 9800, 3908, 4800, 3800],
        'Users': [240, 221, 229, 200, 229, 220],
    })
    
    result = DataAnalyzer.prepare_for_frontend(sample_df, "sample_data.csv")
    return result

@app.exception_handler(StarletteHTTPException)
async def custom_404_handler(request, exc):
    """Custom 404 handler for better UX"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": "Endpoint not found",
            "available": {
                "health": "/health", 
                "upload": "/api/upload",
                "sample": "/api/sample-data",
                "docs": "/docs"
            },
            "error": "Check the URL and HTTP method"
        }
    )

@app.get("/")
async def root():
    """Root endpoint - API landing page"""
    return {
        "message": "QuickCharts Data Analysis API ✅",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "upload": "/api/upload (POST CSV/Excel)",
            "sample": "/api/sample-data",
            "docs": "/docs" 
        },
        "status": "healthy - ready for uploads!"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
