from fastapi import FastAPI, UploadFile, File, HTTPException, Response
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
from pydantic import BaseModel
from pathlib import Path
import os
import sys
from dotenv import load_dotenv
import numexpr
import requests

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables from .env file
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

# Verify API Keys
groq_key = os.getenv("GROQ_API_KEY")
eleven_key = os.getenv("ELEVENLABS_API_KEY")

if groq_key:
    logger.info(f"GROQ_API_KEY found: {groq_key[:4]}...{groq_key[-4:]}")
else:
    logger.warning("GROQ_API_KEY NOT FOUND!")

# Setup local storage for persistence
UPLOAD_DIR = Path(__file__).parent / "uploads"
HISTORY_DIR = Path(__file__).parent / "history"
UPLOAD_DIR.mkdir(exist_ok=True)
HISTORY_DIR.mkdir(exist_ok=True)

class HistoryManager:
    @staticmethod
    def save_version(upload_id: str):
        """Save current state of file to history before modification"""
        source = UPLOAD_DIR / f"{upload_id}.csv"
        if not source.exists():
            return
        
        # Keep up to 5 versions
        version_folder = HISTORY_DIR / upload_id
        version_folder.mkdir(exist_ok=True)
        
        versions = sorted(list(version_folder.glob("*.csv")), key=os.path.getmtime)
        if len(versions) >= 5:
            os.remove(versions[0]) # Delete oldest
            
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        target = version_folder / f"{timestamp}.csv"
        import shutil
        shutil.copy2(source, target)
        logger.info(f"Saved version for {upload_id} at {timestamp}")

    @staticmethod
    def rollback(upload_id: str) -> bool:
        """Restore last version"""
        version_folder = HISTORY_DIR / upload_id
        if not version_folder.exists():
            return False
            
        versions = sorted(list(version_folder.glob("*.csv")), key=os.path.getmtime)
        if not versions:
            return False
            
        last_version = versions[-1]
        target = UPLOAD_DIR / f"{upload_id}.csv"
        import shutil
        shutil.move(str(last_version), str(target))
        logger.info(f"Rolled back {upload_id} to {last_version.name}")
        return True

# Pydantic models for Data ETL
class CleanRequest(BaseModel):
    action: str  # e.g., "drop_na", "fill_mean", "drop_duplicates", "smart_clean"
    column: Optional[str] = None

class CalculateRequest(BaseModel):
    new_column: str
    expression: str  # e.g., "col1 + col2" or "col1 * 1.1"

class CastRequest(BaseModel):
    column: str
    target_type: str

class ChatRequest(BaseModel):
    message: str

# Import database module
import sys
sys.path.append(os.path.dirname(__file__))
from database import init_db, close_db, get_db


# Create app FIRST without lifespan
app = FastAPI(
    title="QuickCharts API",
    description="Data visualization and analysis API", 
    version="1.0.0"
)

# Include Auth Router
from auth import router as auth_router
app.include_router(auth_router)

# ✅ FULL CORS - Deploy immediately
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "https://quick-charts-one.vercel.app",
        "*"  # ← TEMPORARY - allows ALL origins during testing
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS", "PUT", "DELETE"],
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
    def detect_anomalies(df: pd.DataFrame) -> List[Dict]:
        """Detect statistical anomalies in numeric columns"""
        anomalies = []
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        
        for col in numeric_cols:
            col_data = df[col].dropna()
            if len(col_data) < 10: continue
            
            # Simple IQR based anomaly detection
            Q1 = col_data.quantile(0.25)
            Q3 = col_data.quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            outlier_indices = col_data[(col_data < lower_bound) | (col_data > upper_bound)].index.tolist()
            if len(outlier_indices) > 0:
                anomalies.append({
                    "column": col,
                    "count": len(outlier_indices),
                    "percentage": (len(outlier_indices) / len(df)) * 100,
                    "example_indices": outlier_indices[:5]
                })
        return anomalies

    @staticmethod
    async def get_auto_summary(df: pd.DataFrame) -> str:
        """Generate a 3-bullet point TL;DR using Groq (Llama 3)"""
        try:
            head = df.head(10).to_csv(index=False)
            info = df.describe().to_string()
            
            prompt = f"Analyze this dataset and provide exactly 3 bullet points summarizing the most interesting trends or facts. Keep it punchy.\nData Sample:\n{head}\nStats:\n{info}"
            
            api_key = os.getenv("GROQ_API_KEY")
            url = "https://api.groq.com/openai/v1/chat/completions"
            headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
            payload = {
                "model": "llama-3.3-70b-versatile",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.5
            }
            
            response = requests.post(url, json=payload, headers=headers)
            if response.status_code != 200:
                logger.error(f"Groq Summary Error: {response.text}")
                return "Dataset analysis ready."
                
            return response.json()["choices"][0]["message"]["content"]
        except Exception as e:
            logger.error(f"Auto-summary error: {str(e)}")
            return "Dataset uploaded. Ready for analysis."
    
    @staticmethod
    async def get_predictions(df: pd.DataFrame) -> Dict:
        """Generate AI-powered predictions and forecasts"""
        try:
            head = df.head(10).to_csv(index=False)
            stats = df.describe(include='all').to_string()
            
            prompt = f"""You are a predictive analyst. Based on this dataset sample and statistics:
Dataset Sample:
{head}
Stats:
{stats}

Task:
1. Identify the most important numerical trend to forecast.
2. Provide a 'Prediction' (what will happen next).
3. Provide a 'Confidence Score' (0-100%).
4. List 2 'Key Drivers' for this prediction.

Return a JSON object:
{{
  "trend": "string",
  "prediction": "string",
  "confidence": number,
  "drivers": ["string", "string"]
}}
Only return JSON."""
            
            api_key = os.getenv("GROQ_API_KEY")
            url = "https://api.groq.com/openai/v1/chat/completions"
            headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
            payload = {
                "model": "llama-3.3-70b-versatile",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.4,
                "response_format": {"type": "json_object"}
            }
            
            response = requests.post(url, json=payload, headers=headers)
            if response.status_code != 200:
                return {"error": "Prediction engine temporarily offline"}
                
            return json.loads(response.json()["choices"][0]["message"]["content"])
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            return {"error": "Failed to generate predictions"}

    @staticmethod
    async def get_causes_advice(df: pd.DataFrame) -> Dict:
        """Analyze root causes and provide business advice"""
        try:
            head = df.head(10).to_csv(index=False)
            stats = df.describe(include='all').to_string()
            
            prompt = f"""You are a Strategic Business Consultant. Analyze this data:
{stats}

Task:
1. Identify a significant pattern/issue.
2. Explain the likely 'Root Cause'.
3. Provide 3 actionable 'Strategic Advice' points.

Return a JSON object:
{{
  "finding": "string",
  "root_cause": "string",
  "advice": ["string", "string", "string"]
}}
Only return JSON."""
            
            api_key = os.getenv("GROQ_API_KEY")
            url = "https://api.groq.com/openai/v1/chat/completions"
            headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
            payload = {
                "model": "llama-3.3-70b-versatile",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.6,
                "response_format": {"type": "json_object"}
            }
            
            response = requests.post(url, json=payload, headers=headers)
            if response.status_code != 200:
                return {"error": "Consultation service temporarily offline"}
                
            return json.loads(response.json()["choices"][0]["message"]["content"])
        except Exception as e:
            logger.error(f"Advice error: {str(e)}")
            return {"error": "Failed to generate causes and advice"}

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
        anomalies = DataAnalyzer.detect_anomalies(df)
        
        return {
            'data': data,
            'columns': columns,
            'analysis': analysis,
            'insights': insights,
            'data_quality': data_quality,
            'anomalies': anomalies,
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

@app.get("/chart")
async def get_chart(c: str, w: int = 500, h: int = 300, f: str = 'png', v: Optional[str] = '3'):
    """
    Proxy to QuickChart.io for generating chart images
    This allows the frontend to use the local API for chart generation
    """
    import httpx
    import urllib.parse
    from fastapi.responses import Response
    
    # Re-encode the configuration to ensure it's a valid URL parameter
    # The 'c' parameter from FastAPI is already decoded, so we MUST re-encode it
    encoded_c = urllib.parse.quote(c)
    
    # QuickChart.io URL with version support (default to v3 for modern plugins syntax)
    qc_url = f"https://quickchart.io/chart?c={encoded_c}&w={w}&h={h}&f={f}&v={v}"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(qc_url, timeout=15.0)
            if response.status_code == 200:
                media_type = f"image/{f}" if f in ['png', 'jpg', 'jpeg'] else "image/png"
                if f == 'pdf': media_type = "application/pdf"
                
                return Response(content=response.content, media_type=media_type)
            else:
                logger.error(f"QuickChart API error: {response.status_code} - {response.text}")
                raise HTTPException(status_code=response.status_code, detail=f"Chart generation failed: {response.text}")
    except Exception as e:
        logger.error(f"Error proxying chart request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chart generation error: {str(e)}")

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
                user_id="local_user",
                file_size=file.size or 0,
                metadata={
                    'rows': len(df),
                    'columns': len(df.columns),
                }
            )
            
            # Persist data permanently as CSV
            file_path = UPLOAD_DIR / f"{upload_id}.csv"
            df.to_csv(file_path, index=False)
            
            # Save analysis results
            analysis_id = await db.save_analysis(upload_id, result, user_id="local_user")
            result['_id'] = str(analysis_id)
            result['upload_id'] = str(upload_id)  # Pass back to frontend
            
            logger.info(f"Saved analysis to MongoDB: {analysis_id} and disk: {file_path}")
        except Exception as db_error:
            logger.warning(f"Database save failed: {str(db_error)}. Continuing without persistence.")
        
        logger.info(f"Successfully processed file: {file.filename} ({len(df)} rows, {len(df.columns)} columns)")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@app.get("/api/uploads")
async def get_recent_uploads():
    """Get recent file uploads for the user (Option 2)"""
    try:
        db = await get_db()
        uploads = await db.get_user_uploads(user_id="local_user", limit=10)
        for u in uploads:
            u["_id"] = str(u["_id"])
        return {"uploads": uploads}
    except Exception as e:
        logger.error(f"Error fetching uploads: {str(e)}")
        return {"uploads": [], "error": str(e)}

@app.get("/api/uploads/{upload_id}")
async def get_upload_data(upload_id: str):
    """Retrieve existing data without re-uploading (Option 2)"""
    try:
        db = await get_db()
        upload = await db.get_upload(upload_id)
        if not upload:
            raise HTTPException(status_code=404, detail="Upload not found")
        
        file_path = UPLOAD_DIR / f"{upload_id}.csv"
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File lost from server")
            
        df = pd.read_csv(file_path)
        result = DataAnalyzer.prepare_for_frontend(df, upload["filename"])
        result["upload_id"] = upload_id
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving file: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/clean/{upload_id}")
async def clean_data(upload_id: str, request: CleanRequest):
    """Interactively Clean Data (Option 3)"""
    try:
        file_path = UPLOAD_DIR / f"{upload_id}.csv"
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Data file not found")
            
        df = pd.read_csv(file_path)
        
        # Save version before change
        HistoryManager.save_version(upload_id)
        
        # Apply ETL operations
        if request.action == "drop_na":
            if request.column:
                df = df.dropna(subset=[request.column])
            else:
                df = df.dropna()
        elif request.action == "drop_duplicates":
            df = df.drop_duplicates()
        elif request.action == "fill_mean":
            if request.column and pd.api.types.is_numeric_dtype(df[request.column]):
                # Needs numeric, fills with mean
                df[request.column] = df[request.column].fillna(df[request.column].mean())
            elif not request.column:
                # Fill all numeric with mean
                numeric_cols = df.select_dtypes(include=[np.number]).columns
                for col in numeric_cols:
                    df[col] = df[col].fillna(df[col].mean())
        
        # Save modifications permanently back to disk
        df.to_csv(file_path, index=False)
        
        db = await get_db()
        upload = await db.get_upload(upload_id)
        filename = upload["filename"] if upload else f"cleaned_data_{upload_id[:5]}.csv"
        
        # Re-analyze newly cleaned data, return new results
        result = DataAnalyzer.prepare_for_frontend(df, filename)
        result["upload_id"] = upload_id
        return result
        
    except Exception as e:
        logger.error(f"Error cleaning data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/calculate/{upload_id}")
async def calculate_data(upload_id: str, request: CalculateRequest):
    """Create a new column based on an expression (Advanced Module)"""
    try:
        file_path = UPLOAD_DIR / f"{upload_id}.csv"
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Data file not found")
            
        df = pd.read_csv(file_path)
        
        # Save version before change
        HistoryManager.save_version(upload_id)
        
        # Simple security: filter out dangerous characters in expression
        forbidden = ["import", "eval", "exec", "os", "sys", "__", "builtins", "lambda"]
        if any(f in request.expression for f in forbidden):
            raise HTTPException(status_code=400, detail="Disallowed expression")

        # Create localized context matching all column names
        import numexpr
        
        try:
            # First try optimized numexpr engine
            try:
                result = df.eval(request.expression)
                df[request.new_column] = result
            except:
                # Fallback to python engine for more complex expressions or backtick issues
                result = df.eval(request.expression, engine='python')
                df[request.new_column] = result
        except Exception as eval_err:
            logger.error(f"Eval error: {str(eval_err)}")
            raise HTTPException(status_code=400, detail=f"Expression Error: {str(eval_err)}. Tip: Enclose column names with spaces in backticks like `My Column`.")
        
        # Save modifications
        df.to_csv(file_path, index=False)
        
        db = await get_db()
        upload = await db.get_upload(upload_id)
        filename = upload["filename"] if upload else f"calculated_{upload_id[:5]}.csv"
        
        result = DataAnalyzer.prepare_for_frontend(df, filename)
        result["upload_id"] = upload_id
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in calculation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/cast/{upload_id}")
async def cast_data(upload_id: str, request: CastRequest):
    """Change data type of a column (Advanced Module)"""
    try:
        file_path = UPLOAD_DIR / f"{upload_id}.csv"
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Data file not found")
            
        df = pd.read_csv(file_path)
        
        # Save version before change
        HistoryManager.save_version(upload_id)
        
        try:
            if request.target_type == "numeric":
                df[request.column] = pd.to_numeric(df[request.column], errors='coerce')
            elif request.target_type == "datetime":
                df[request.column] = pd.to_datetime(df[request.column], errors='coerce')
            elif request.target_type == "string":
                df[request.column] = df[request.column].astype(str)
            else:
                raise HTTPException(status_code=400, detail="Invalid target type")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Casting error: {str(e)}")
            
        df.to_csv(file_path, index=False)
        db = await get_db()
        upload = await db.get_upload(upload_id)
        filename = upload["filename"] if upload else f"casted_{upload_id[:5]}.csv"
        
        result = DataAnalyzer.prepare_for_frontend(df, filename)
        result["upload_id"] = upload_id
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in casting: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tts")
async def text_to_speech(text: str):
    """Convert text to speech using ElevenLabs"""
    try:
        api_key = os.getenv("ELEVENLABS_API_KEY")
        voice_id = os.getenv("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM") # Default 'Rachel'
        
        if not api_key or api_key == "your_elevenlabs_key_here":
            # Fallback or error if key is missing
            raise HTTPException(status_code=400, detail="ElevenLabs API Key missing")

        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
        
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": api_key
        }

        data = {
            "text": text,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.5
            }
        }

        response = requests.post(url, json=data, headers=headers)
        
        if response.status_code != 200:
            logger.error(f"ElevenLabs error: {response.status_code} - {response.text}")
            # Raise the same status code we got from ElevenLabs
            raise HTTPException(status_code=response.status_code, detail=f"TTS Engine error: {response.text}")

        return Response(content=response.content, media_type="audio/mpeg")

    except HTTPException:
        # Re-raise known HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Unexpected TTS Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error in TTS: {str(e)}")

@app.get("/api/share/{upload_id}")
async def create_share_link(upload_id: str):
    """Create a public shareable link"""
    try:
        db = await get_db()
        share_id = await db.create_share_link(upload_id, user_id="local_user")
        return {"share_id": share_id, "public_url": f"/public/{share_id}"}
    except Exception as e:
        logger.error(f"Share error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/public/{share_id}")
async def get_public_dashboard(share_id: str):
    """Fetch public dashboard data"""
    try:
        db = await get_db()
        share = await db.get_share(share_id)
        if not share:
            raise HTTPException(status_code=404, detail="Public dashboard not found")
            
        upload_id = share["upload_id"]
        file_path = UPLOAD_DIR / f"{upload_id}.csv"
        df = pd.read_csv(file_path)
        
        # Prepare for public (limited metadata)
        result = DataAnalyzer.prepare_for_frontend(df, "shared_dashboard.csv")
        result["public"] = True
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Public access error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat/{upload_id}")
async def chat_with_data(upload_id: str, request: ChatRequest):
    """Chat with your data using Groq (Llama 3) - Supports NL2Viz"""
    try:
        file_path = UPLOAD_DIR / f"{upload_id}.csv"
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Data file not found")
            
        df = pd.read_csv(file_path)
        
        # Prepare context
        df_head = df.head(5).to_csv(index=False)
        df_info = df.dtypes.to_string()
        
        prompt = f"""You are a Pro Data Analyst.
Dataset: {len(df)} rows, {len(df.columns)} columns.
Columns: {df_info}
Sample: {df_head}

User Query: "{request.message}"

Rules:
1. Answer concisely.
2. If visualization is requested or helpful, include a JSON block for QuickChart.io.
3. NEVER use "histogram" as a chart type. Use "bar" with binned labels instead.
4. IMPORTANT: Always populate "labels" and "data" with actual values derived from the dataset provided above. Do not leave them empty.
5. Supported types: bar, line, pie, radar, scatter, doughnut.

Example for a bar chart:
```json
{{
  "chart": {{ 
    "type": "bar", 
    "data": {{ 
      "labels": ["Label1", "Label2"], 
      "datasets": [{{ "label": "Column Name", "data": [10, 20] }}] 
    }} 
  }}
}}
```
"""
        api_key = os.getenv("GROQ_API_KEY")
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7
        }
        
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code != 200:
            logger.error(f"Groq API Error: {response.status_code} - {response.text}")
            raise HTTPException(status_code=response.status_code, detail=f"AI Brain error: {response.text}")
            
        resp_json = response.json()
        if "choices" not in resp_json:
            logger.error(f"Unexpected Groq response: {resp_json}")
            raise HTTPException(status_code=500, detail="AI Brain returned an unexpected response format")
            
        resp_text = resp_json["choices"][0]["message"]["content"]
        
        # Check for chart config
        chart_config = None
        if "```json" in resp_text:
            try:
                json_part = resp_text.split("```json")[1].split("```")[0].strip()
                potential_json = json.loads(json_part)
                if "chart" in potential_json:
                    config = potential_json["chart"]
                    # Basic validation to prevent 400 errors from QuickChart
                    if config.get("data") and config["data"].get("datasets") and len(config["data"]["datasets"]) > 0:
                        chart_config = config
                        resp_text = resp_text.split("```json")[0] + (resp_text.split("```")[2] if len(resp_text.split("```")) > 2 else "")
                    else:
                        logger.warning("AI generated empty chart data. Skipping visualization.")
            except Exception as e:
                logger.error(f"Failed to parse chart JSON: {str(e)}")
                pass

        return {
            "response": resp_text.strip(),
            "chart_config": chart_config
        }
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/export/{upload_id}/{fmt}")
async def export_data(upload_id: str, fmt: str):
    """Export dataset in various formats (Professional Module)"""
    try:
        file_path = UPLOAD_DIR / f"{upload_id}.csv"
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Data file not found")
            
        df = pd.read_csv(file_path)
        
        if fmt == "csv":
            content = df.to_csv(index=False)
            return Response(content=content, media_type="text/csv", headers={"Content-Disposition": f"attachment; filename=export_{upload_id}.csv"})
        elif fmt == "json":
            content = df.to_json(orient="records")
            return Response(content=content, media_type="application/json", headers={"Content-Disposition": f"attachment; filename=export_{upload_id}.json"})
        elif fmt == "excel":
            # Uses openpyxl which is in requirements.txt
            output = BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, index=False)
            content = output.getvalue()
            return Response(content=content, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={"Content-Disposition": f"attachment; filename=export_{upload_id}.xlsx"})
        else:
            raise HTTPException(status_code=400, detail="Unsupported format")
    except Exception as e:
        logger.error(f"Export error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/undo/{upload_id}")
async def undo_data(upload_id: str):
    """Rollback last data modification"""
    try:
        if HistoryManager.rollback(upload_id):
            db = await get_db()
            upload = await db.get_upload(upload_id)
            file_path = UPLOAD_DIR / f"{upload_id}.csv"
            df = pd.read_csv(file_path)
            
            result = DataAnalyzer.prepare_for_frontend(df, upload["filename"] if upload else "restored.csv")
            result["upload_id"] = upload_id
            return result
        else:
            raise HTTPException(status_code=400, detail="No more reversible steps")
    except Exception as e:
        logger.error(f"Undo error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/smart-clean/{upload_id}")
async def smart_clean_data(upload_id: str):
    """AI-powered smart cleaning using Groq (Llama 3)"""
    try:
        file_path = UPLOAD_DIR / f"{upload_id}.csv"
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Data file not found")
            
        df = pd.read_csv(file_path)
        HistoryManager.save_version(upload_id)
        
        # Prepare data sample
        sample = df.head(10).to_csv(index=False)
        cols = list(df.columns)
        
        prompt = f"""You are a senior data engineer. Dataset columns: {cols}
Sample:
{sample}

Provide a JSON object with cleaning steps.
Structure:
{{
  "cleaning_steps": [
    {{"column": "col_name", "action": "strip"}},
    {{"column": "col_name", "action": "title"}},
    {{"column": "col_name", "action": "auto_date"}}
  ]
}}
Only return the JSON.
"""
        api_key = os.getenv("GROQ_API_KEY")
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [{"role": "user", "content": prompt}],
            "response_format": {"type": "json_object"}
        }
        
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code != 200:
            logger.error(f"Groq Clean Error: {response.text}")
            raise HTTPException(status_code=response.status_code, detail="AI Cleaning service unavailable")
            
        steps = response.json()["choices"][0]["message"]["content"]
        
        try:
            steps_dict = json.loads(steps)
            for step in steps_dict.get("cleaning_steps", []):
                col = step.get("column")
                action = step.get("action")
                if col in df.columns:
                    if action == "strip":
                        df[col] = df[col].astype(str).str.strip()
                    elif action == "title":
                        df[col] = df[col].astype(str).str.title()
                    elif action == "auto_date":
                        df[col] = pd.to_datetime(df[col], errors='coerce')
            
            df.to_csv(file_path, index=False)
            db = await get_db()
            upload = await db.get_upload(upload_id)
            result = DataAnalyzer.prepare_for_frontend(df, upload["filename"] if upload else "smart_cleaned.csv")
            result["upload_id"] = upload_id
            result["ai_summary"] = "AI-Driven data standardization complete."
            return result
            
        except Exception as json_err:
            logger.error(f"Failed to parse AI response: {str(json_err)}")
            raise HTTPException(status_code=500, detail="AI returned invalid cleaning instructions")

    except Exception as e:
        logger.error(f"Smart Clean error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/predict/{upload_id}")
async def get_data_predictions(upload_id: str):
    """Fetch AI predictions for a specific dataset"""
    try:
        file_path = UPLOAD_DIR / f"{upload_id}.csv"
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Data file not found")
            
        df = pd.read_csv(file_path)
        predictions = await DataAnalyzer.get_predictions(df)
        return predictions
    except Exception as e:
        logger.error(f"Prediction route error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/advice/{upload_id}")
async def get_data_advice(upload_id: str):
    """Fetch AI root cause analysis and advice"""
    try:
        file_path = UPLOAD_DIR / f"{upload_id}.csv"
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Data file not found")
            
        df = pd.read_csv(file_path)
        advice = await DataAnalyzer.get_causes_advice(df)
        return advice
    except Exception as e:
        logger.error(f"Advice route error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

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
