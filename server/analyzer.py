import os
import json
import pandas as pd
import numpy as np
import requests
from io import BytesIO
from typing import Optional, Dict, List, Any
from datetime import datetime
from fastapi import UploadFile
from config import GROQ_API_KEY, logger

class DataAnalyzer:
    """Analyze uploaded data files"""
    
    @staticmethod
    def read_file(file: UploadFile) -> Optional[pd.DataFrame]:
        """Read CSV or Excel file"""
        try:
            filename = file.filename.lower()
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
            if pd.api.types.is_numeric_dtype(col_data) and not pd.api.types.is_bool_dtype(col_data):
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
        duplicates = df.duplicated().sum()
        if duplicates > 0:
            insights.append({
                'type': 'alert',
                'title': 'Duplicate Rows Found',
                'message': f'Detected {duplicates} duplicate rows',
                'description': 'Duplicate rows can skew analysis results.',
                'recommendation': 'Remove duplicate rows to improve data quality.'
            })
        numeric_cols = df.select_dtypes(include=['number']).columns
        for col in numeric_cols[:5]:
            col_data = df[col].dropna()
            if len(col_data) > 0:
                mean = col_data.mean()
                std = col_data.std()
                if std > 0:
                    z_scores = np.abs((col_data - mean) / std)
                    outliers = (z_scores > 3).sum()
                    if outliers > 0:
                        insights.append({
                            'type': 'general',
                            'title': f'Outliers in {col}',
                            'message': f'Found {outliers} potential outliers (|z-score| > 3)',
                            'description': f'Column "{col}" has {outliers} values that deviate significantly from the mean.',
                            'metrics': {'mean': float(mean), 'std_dev': float(std), 'outlier_count': int(outliers)}
                        })
        completeness = 1 - (total_missing / (len(df) * len(df.columns)))
        insights.append({
            'type': 'general',
            'title': 'Data Completeness',
            'message': f'Dataset is {completeness*100:.1f}% complete',
            'description': f'Your dataset has good data quality with {completeness*100:.1f}% completeness.',
            'metrics': {'completeness_score': float(completeness)}
        })
        return insights
    
    @staticmethod
    def detect_anomalies(df: pd.DataFrame) -> List[Dict]:
        """Detect statistical anomalies in numeric columns"""
        anomalies = []
        numeric_cols = df.select_dtypes(include=['number']).columns
        for col in numeric_cols:
            col_data = df[col].dropna()
            if len(col_data) < 10: continue
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
            url = "https://api.groq.com/openai/v1/chat/completions"
            headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}
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
            url = "https://api.groq.com/openai/v1/chat/completions"
            headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}
            payload = {
                "model": "llama-3.3-70b-versatile",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.4,
                "response_format": {"type": "json_object"}
            }
            response = requests.post(url, json=payload, headers=headers)
            if response.status_code != 200: return {"error": "Prediction engine temporarily offline"}
            return json.loads(response.json()["choices"][0]["message"]["content"])
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            return {"error": "Failed to generate predictions"}

    @staticmethod
    async def get_causes_advice(df: pd.DataFrame) -> Dict:
        """Analyze root causes and provide business advice"""
        try:
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
            url = "https://api.groq.com/openai/v1/chat/completions"
            headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}
            payload = {
                "model": "llama-3.3-70b-versatile",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.6,
                "response_format": {"type": "json_object"}
            }
            response = requests.post(url, json=payload, headers=headers)
            if response.status_code != 200: return {"error": "Consultation service temporarily offline"}
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
        quality_score = max(0, min(1, 1 - (missing_count / total_cells) - (duplicate_count / len(df) * 0.1)))
        issues = []
        if missing_count > 0: issues.append(f"Contains {missing_count:,} missing values")
        if duplicate_count > 0: issues.append(f"Contains {duplicate_count:,} duplicate rows")
        if len(df.columns) > 50: issues.append("Dataset has many columns, consider dimensionality reduction")
        if len(df) < 10: issues.append("Dataset is very small, analysis may be limited")
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
        preview_df = df.head(1000)
        data = preview_df.fillna("").to_dict('records')
        analysis = DataAnalyzer.analyze_columns(df)
        return {
            'data': data,
            'columns': list(df.columns),
            'analysis': analysis,
            'insights': DataAnalyzer.generate_insights(df, analysis),
            'data_quality': DataAnalyzer.assess_data_quality(df),
            'anomalies': DataAnalyzer.detect_anomalies(df),
            'metadata': {
                'filename': filename,
                'rows': int(len(df)),
                'columns': int(len(df.columns)),
                'uploaded_at': datetime.now().isoformat()
            }
        }
