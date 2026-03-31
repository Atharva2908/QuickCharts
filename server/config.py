import os
import logging
from pathlib import Path
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")

# Setup local storage
UPLOAD_DIR = Path(__file__).parent / "uploads"
HISTORY_DIR = Path(__file__).parent / "history"
PROFILE_PHOTOS_DIR = Path(__file__).parent / "profile_photos"

UPLOAD_DIR.mkdir(exist_ok=True)
HISTORY_DIR.mkdir(exist_ok=True)
PROFILE_PHOTOS_DIR.mkdir(exist_ok=True)

if GROQ_API_KEY:
    logger.info(f"GROQ_API_KEY found: {GROQ_API_KEY[:4]}...{GROQ_API_KEY[-4:]}")
else:
    logger.warning("GROQ_API_KEY NOT FOUND!")
