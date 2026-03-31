from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException
import os
import shutil

# Import from local modules
from config import logger, API_BASE_URL, PROFILE_PHOTOS_DIR
from database import init_db, close_db, get_db
from auth import router as auth_router, get_current_user

# Import specific route modules
from routes.data import router as data_router
from routes.ai import router as ai_router
from routes.charts import router as chart_router

app = FastAPI(
    title="DataGraphy API",
    description="Refactored Data visualization and analysis API", 
    version="2.0.0"
)

# Exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global Exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "error": str(exc)},
        headers={"Access-Control-Allow-Origin": request.headers.get("origin", "*")}
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers={"Access-Control-Allow-Origin": request.headers.get("origin", "*")}
    )

@app.exception_handler(StarletteHTTPException)
async def custom_404_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": "Endpoint not found", "available": ["/health", "/docs", "/api/upload"]}
    )

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # More permissive for dev, restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for profile photos
app.mount("/profile_photos", StaticFiles(directory=PROFILE_PHOTOS_DIR), name="profile_photos")

# Include Routers
app.include_router(auth_router)
app.include_router(data_router)
app.include_router(ai_router)
app.include_router(chart_router)

# Profile Photo upload (kept here as it's a mix of user/photo logic)
@app.post("/api/auth/profile-photo")
async def upload_profile_photo(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    ext = file.filename.split(".")[-1]
    file_path = PROFILE_PHOTOS_DIR / f"{current_user['id']}.{ext}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    db = await get_db()
    photo_url = f"{API_BASE_URL}/profile_photos/{current_user['id']}.{ext}"
    await db.update_user(current_user["email"], {"profile_photo": photo_url})
    return {"photo_url": photo_url}

# Lifecycle events
@app.on_event("startup")
async def startup_event():
    await init_db()
    logger.info("Server started - DB initialized")

@app.on_event("shutdown")
async def shutdown_event():
    await close_db()
    logger.info("Server stopped - DB closed")

@app.get("/health")
async def health_check():
    db = await get_db()
    await db.client.admin.command('ping')
    return {"status": "ok", "database": "connected"}

@app.get("/")
async def root():
    return {"message": "DataGraphy Refactored API ✅", "docs": "/docs", "status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
