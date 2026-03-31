import os
import shutil
from datetime import datetime
from config import UPLOAD_DIR, HISTORY_DIR, logger

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
        shutil.move(str(last_version), str(target))
        logger.info(f"Rolled back {upload_id} to {last_version.name}")
        return True
