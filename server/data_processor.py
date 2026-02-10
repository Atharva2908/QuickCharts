"""
Advanced data processing and analysis module
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Tuple, Optional
from scipy import stats
import logging

logger = logging.getLogger(__name__)


class AdvancedAnalyzer:
    """Advanced statistical analysis for data"""
    
    @staticmethod
    def calculate_correlation_matrix(df: pd.DataFrame) -> Dict[str, Any]:
        """Calculate correlation matrix for numeric columns"""
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        
        if len(numeric_cols) < 2:
            return {'correlations': [], 'matrix': []}
        
        corr_matrix = df[numeric_cols].corr()
        
        # Find strong correlations
        strong_corrs = []
        for i in range(len(numeric_cols)):
            for j in range(i + 1, len(numeric_cols)):
                corr_value = corr_matrix.iloc[i, j]
                if abs(corr_value) > 0.7:
                    strong_corrs.append({
                        'col1': numeric_cols[i],
                        'col2': numeric_cols[j],
                        'correlation': float(corr_value),
                    })
        
        return {
            'correlations': strong_corrs,
            'matrix': corr_matrix.to_dict(),
            'numeric_columns': numeric_cols,
        }
    
    @staticmethod
    def detect_distribution(values: np.ndarray) -> Dict[str, Any]:
        """Detect distribution type of numeric values"""
        if len(values) < 3:
            return {'type': 'insufficient_data', 'skewness': 0, 'kurtosis': 0}
        
        try:
            skewness = float(stats.skew(values))
            kurtosis = float(stats.kurtosis(values))
            
            # Determine distribution type
            if abs(skewness) < 0.5 and abs(kurtosis) < 3:
                dist_type = 'normal'
            elif skewness > 1:
                dist_type = 'right_skewed'
            elif skewness < -1:
                dist_type = 'left_skewed'
            else:
                dist_type = 'other'
            
            return {
                'type': dist_type,
                'skewness': skewness,
                'kurtosis': kurtosis,
            }
        except Exception as e:
            logger.warning(f"Distribution detection failed: {str(e)}")
            return {'type': 'unknown', 'skewness': 0, 'kurtosis': 0}
    
    @staticmethod
    def detect_anomalies(values: np.ndarray, method: str = 'zscore') -> List[int]:
        """Detect anomalies in numeric data"""
        if len(values) < 3:
            return []
        
        try:
            if method == 'zscore':
                z_scores = np.abs(stats.zscore(values, nan_policy='omit'))
                anomaly_indices = np.where(z_scores > 3)[0].tolist()
            elif method == 'iqr':
                q1 = np.percentile(values, 25)
                q3 = np.percentile(values, 75)
                iqr = q3 - q1
                lower_bound = q1 - 1.5 * iqr
                upper_bound = q3 + 1.5 * iqr
                anomaly_indices = np.where((values < lower_bound) | (values > upper_bound))[0].tolist()
            else:
                return []
            
            return anomaly_indices
        except Exception as e:
            logger.warning(f"Anomaly detection failed: {str(e)}")
            return []
    
    @staticmethod
    def calculate_entropy(series: pd.Series) -> float:
        """Calculate Shannon entropy for categorical data"""
        value_counts = series.value_counts(normalize=True)
        entropy = -sum(value_counts * np.log2(value_counts + 1e-10))
        return float(entropy)
    
    @staticmethod
    def detect_relationships(df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Detect potential relationships between columns"""
        relationships = []
        
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
        
        # Check numeric correlations
        if len(numeric_cols) > 1:
            corr_matrix = df[numeric_cols].corr()
            for i in range(len(numeric_cols)):
                for j in range(i + 1, len(numeric_cols)):
                    corr = abs(corr_matrix.iloc[i, j])
                    if corr > 0.7:
                        relationships.append({
                            'type': 'strong_correlation',
                            'columns': [numeric_cols[i], numeric_cols[j]],
                            'strength': float(corr),
                        })
        
        # Check if numeric varies by category
        for cat_col in categorical_cols[:5]:  # Limit to avoid slow processing
            for num_col in numeric_cols[:5]:
                try:
                    groups = df.groupby(cat_col)[num_col].mean()
                    if groups.std() / groups.mean() > 0.3:  # High variance
                        relationships.append({
                            'type': 'categorical_numeric_relationship',
                            'categorical': cat_col,
                            'numeric': num_col,
                            'strength': 'moderate',
                        })
                except:
                    pass
        
        return relationships[:10]  # Return top 10
    
    @staticmethod
    def suggest_visualizations(df: pd.DataFrame, analysis: Dict) -> List[str]:
        """Suggest appropriate visualizations based on data"""
        suggestions = []
        
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
        
        # Basic suggestions
        if len(numeric_cols) > 0:
            suggestions.append('histogram')
            suggestions.append('box_plot')
        
        if len(categorical_cols) > 0:
            suggestions.append('bar_chart')
            suggestions.append('pie_chart')
        
        if len(numeric_cols) > 1:
            suggestions.append('scatter_plot')
            suggestions.append('line_chart')
        
        if len(numeric_cols) > 1 and len(categorical_cols) > 0:
            suggestions.append('grouped_bar_chart')
        
        if len(numeric_cols) > 2:
            suggestions.append('heatmap')
            suggestions.append('3d_scatter')
        
        return list(set(suggestions))


class DataValidator:
    """Validate and clean data"""
    
    @staticmethod
    def validate_dataframe(df: pd.DataFrame) -> Dict[str, Any]:
        """Validate dataframe and return issues"""
        issues = []
        warnings = []
        
        # Check empty dataframe
        if len(df) == 0:
            issues.append('Empty dataframe')
        
        # Check for all null columns
        for col in df.columns:
            if df[col].isna().all():
                issues.append(f'Column "{col}" is entirely null')
        
        # Check for high cardinality
        for col in df.select_dtypes(include=['object']).columns:
            unique_ratio = df[col].nunique() / len(df)
            if unique_ratio > 0.9:
                warnings.append(f'Column "{col}" has very high cardinality ({unique_ratio*100:.1f}%)')
        
        # Check for large number of columns
        if len(df.columns) > 100:
            warnings.append(f'Dataset has {len(df.columns)} columns, which may be difficult to analyze')
        
        # Check for single value columns
        for col in df.columns:
            if df[col].nunique() == 1:
                warnings.append(f'Column "{col}" has only one unique value')
        
        return {
            'is_valid': len(issues) == 0,
            'issues': issues,
            'warnings': warnings,
        }
    
    @staticmethod
    def get_data_types(df: pd.DataFrame) -> Dict[str, int]:
        """Get count of each data type"""
        dtype_counts = {}
        
        for col in df.columns:
            dtype = str(df[col].dtype)
            
            if 'int' in dtype:
                dtype_counts['integer'] = dtype_counts.get('integer', 0) + 1
            elif 'float' in dtype:
                dtype_counts['decimal'] = dtype_counts.get('decimal', 0) + 1
            elif 'bool' in dtype:
                dtype_counts['boolean'] = dtype_counts.get('boolean', 0) + 1
            elif 'datetime' in dtype or 'date' in dtype:
                dtype_counts['datetime'] = dtype_counts.get('datetime', 0) + 1
            else:
                dtype_counts['text'] = dtype_counts.get('text', 0) + 1
        
        return dtype_counts


class CorrelationAnalyzer:
    """Advanced correlation analysis"""
    
    @staticmethod
    def calculate_pairwise_correlations(df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Calculate pairwise correlations between all numeric columns"""
        numeric_df = df.select_dtypes(include=[np.number])
        
        if len(numeric_df.columns) < 2:
            return []
        
        correlations = []
        
        for i, col1 in enumerate(numeric_df.columns):
            for col2 in numeric_df.columns[i+1:]:
                try:
                    corr = numeric_df[col1].corr(numeric_df[col2])
                    if not pd.isna(corr):
                        correlations.append({
                            'col1': col1,
                            'col2': col2,
                            'pearson': float(corr),
                        })
                except:
                    pass
        
        return sorted(correlations, key=lambda x: abs(x['pearson']), reverse=True)
    
    @staticmethod
    def find_highly_correlated(correlations: List[Dict], threshold: float = 0.7) -> List[Dict]:
        """Find highly correlated column pairs"""
        return [c for c in correlations if abs(c['pearson']) > threshold]
