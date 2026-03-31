from pydantic import BaseModel
from typing import Optional

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
