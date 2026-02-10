"""
Configuration settings for the DataViz API
"""

import os
from typing import Optional

class Settings:
    """Application settings"""
    
    # API Configuration
    API_VERSION = "1.0.0"
    API_TITLE = "DataViz API"
    API_DESCRIPTION = "Data visualization and analysis API"
    
    # Server Configuration
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 8000))
    DEBUG = os.getenv("DEBUG", "false").lower() == "true"
    
    # Database Configuration
    MONGODB_URI = os.getenv(
        "MONGODB_URI",
        "mongodb://localhost:27017"
    )
    DATABASE_NAME = "dataviz_db"
    
    # File Upload Configuration
    MAX_FILE_SIZE = 100 * 1024 * 1024  # 100 MB
    ALLOWED_EXTENSIONS = {'.csv', '.xlsx', '.xls'}
    
    # Data Processing Configuration
    MAX_ROWS_PREVIEW = 50
    MAX_CHART_POINTS = 100
    MAX_HISTOGRAM_BINS = 20
    
    # Analysis Configuration
    MIN_UNIQUE_FOR_CATEGORICAL = 20
    OUTLIER_Z_SCORE_THRESHOLD = 3
    CORRELATION_THRESHOLD = 0.7
    SKEWNESS_THRESHOLD = 1.0
    
    # Logging Configuration
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # CORS Configuration
    CORS_ORIGINS = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
    ]
    
    # Add production URLs if available
    PRODUCTION_ORIGINS = os.getenv("CORS_ORIGINS", "").split(",")
    if PRODUCTION_ORIGINS and PRODUCTION_ORIGINS[0]:
        CORS_ORIGINS.extend(PRODUCTION_ORIGINS)
    
    CORS_ALLOW_CREDENTIALS = True
    CORS_ALLOW_METHODS = ["*"]
    CORS_ALLOW_HEADERS = ["*"]
    
    # Feature Flags
    ENABLE_MONGODB = os.getenv("ENABLE_MONGODB", "true").lower() == "true"
    ENABLE_SAMPLE_DATA = os.getenv("ENABLE_SAMPLE_DATA", "true").lower() == "true"
    ENABLE_CORRELATION_MATRIX = True
    ENABLE_STATISTICAL_TESTS = False
    
    @classmethod
    def get_mongodb_uri(cls) -> str:
        """Get MongoDB URI"""
        return cls.MONGODB_URI
    
    @classmethod
    def is_development(cls) -> bool:
        """Check if running in development mode"""
        return cls.DEBUG
    
    @classmethod
    def get_cors_origins(cls) -> list:
        """Get CORS allowed origins"""
        if cls.is_development():
            return ["*"]
        return cls.CORS_ORIGINS


# Create settings instance
settings = Settings()
