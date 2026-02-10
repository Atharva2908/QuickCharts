from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase, AsyncIOMotorCollection
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from contextlib import asynccontextmanager
from typing import Optional, Dict, Any, List
import logging
import os
from datetime import datetime

logger = logging.getLogger(__name__)

class MongoDB:
    """MongoDB connection and operations handler"""
    
    def __init__(self, connection_string: Optional[str] = None):
        """Initialize MongoDB client"""
        self.connection_string = connection_string or os.getenv(
            "MONGODB_URI",
            "mongodb+srv://ganganeatharv29_db_user:86QN7qcMsLRnWK02@cluster0.xfbdxfr.mongodb.net/"
        )
        self.client: Optional[AsyncIOMotorClient] = None
        self.db: Optional[AsyncIOMotorDatabase] = None

    
    async def connect(self):
        """Connect to MongoDB"""
        try:
            self.client = AsyncIOMotorClient(self.connection_string)
            self.db = self.client["dataviz_db"]
            
            # Verify connection
            await self.client.admin.command('ping')
            logger.info("Connected to MongoDB successfully")
            
            # Create indexes
            await self._create_indexes()
            
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            logger.error(f"Failed to connect to MongoDB: {str(e)}")
            raise
    
    async def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
            logger.info("Disconnected from MongoDB")
    
    async def _create_indexes(self):
        """Create necessary indexes"""
        if self.db is None:
            return
        
        # Index for uploads collection
        await self.db["uploads"].create_index("created_at")
        await self.db["uploads"].create_index("user_id")
        await self.db["uploads"].create_index("filename")
        
        # Index for analyses collection
        await self.db["analyses"].create_index("upload_id")
        await self.db["analyses"].create_index("created_at")
        await self.db["analyses"].create_index("user_id")
    
    async def save_upload(
        self,
        filename: str,
        user_id: Optional[str] = None,
        file_size: int = 0,
        metadata: Optional[Dict] = None
    ) -> str:
        """Save file upload record"""
        if not self.db:
            raise RuntimeError("Database not connected")
        
        upload_doc = {
            "filename": filename,
            "user_id": user_id,
            "file_size": file_size,
            "metadata": metadata or {},
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await self.db["uploads"].insert_one(upload_doc)
        logger.info(f"Saved upload: {filename} (ID: {result.inserted_id})")
        
        return str(result.inserted_id)
    
    async def save_analysis(
        self,
        upload_id: str,
        analysis_data: Dict[str, Any],
        user_id: Optional[str] = None
    ) -> str:
        """Save data analysis results"""
        if not self.db:
            raise RuntimeError("Database not connected")
        
        analysis_doc = {
            "upload_id": upload_id,
            "user_id": user_id,
            "analysis": analysis_data,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await self.db["analyses"].insert_one(analysis_doc)
        logger.info(f"Saved analysis for upload: {upload_id}")
        
        return str(result.inserted_id)
    
    async def get_upload(self, upload_id: str) -> Optional[Dict]:
        """Get upload record by ID"""
        if not self.db:
            raise RuntimeError("Database not connected")
        
        upload = await self.db["uploads"].find_one({"_id": upload_id})
        return upload
    
    async def get_analysis(self, analysis_id: str) -> Optional[Dict]:
        """Get analysis record by ID"""
        if not self.db:
            raise RuntimeError("Database not connected")
        
        analysis = await self.db["analyses"].find_one({"_id": analysis_id})
        return analysis
    
    async def get_user_uploads(
        self,
        user_id: str,
        limit: int = 50,
        skip: int = 0
    ) -> List[Dict]:
        """Get all uploads for a user"""
        if not self.db:
            raise RuntimeError("Database not connected")
        
        uploads = await self.db["uploads"].find(
            {"user_id": user_id}
        ).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)
        
        return uploads
    
    async def get_user_analyses(
        self,
        user_id: str,
        limit: int = 50,
        skip: int = 0
    ) -> List[Dict]:
        """Get all analyses for a user"""
        if not self.db:
            raise RuntimeError("Database not connected")
        
        analyses = await self.db["analyses"].find(
            {"user_id": user_id}
        ).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)
        
        return analyses
    
    async def delete_upload(self, upload_id: str) -> bool:
        """Delete an upload record"""
        if not self.db:
            raise RuntimeError("Database not connected")
        
        result = await self.db["uploads"].delete_one({"_id": upload_id})
        return result.deleted_count > 0
    
    async def update_upload(
        self,
        upload_id: str,
        updates: Dict[str, Any]
    ) -> bool:
        """Update an upload record"""
        if not self.db:
            raise RuntimeError("Database not connected")
        
        updates["updated_at"] = datetime.utcnow()
        result = await self.db["uploads"].update_one(
            {"_id": upload_id},
            {"$set": updates}
        )
        
        return result.modified_count > 0
    
    async def get_stats(self) -> Dict[str, Any]:
        """Get database statistics"""
        if not self.db:
            raise RuntimeError("Database not connected")
        
        upload_count = await self.db["uploads"].count_documents({})
        analysis_count = await self.db["analyses"].count_documents({})
        
        return {
            "total_uploads": upload_count,
            "total_analyses": analysis_count,
            "collections": ["uploads", "analyses"]
        }


# Global database instance
_db: Optional[MongoDB] = None


async def init_db(connection_string: Optional[str] = None):
    """Initialize global database instance"""
    global _db
    _db = MongoDB(connection_string)
    await _db.connect()


async def get_db() -> MongoDB:
    """Get global database instance"""
    if _db is None:
        raise RuntimeError("Database not initialized")
    return _db


async def close_db():
    """Close global database instance"""
    global _db
    if _db:
        await _db.disconnect()
        _db = None


@asynccontextmanager
async def get_db_context(connection_string: Optional[str] = None):
    """Context manager for database operations"""
    db = MongoDB(connection_string)
    await db.connect()
    try:
        yield db
    finally:
        await db.disconnect()
