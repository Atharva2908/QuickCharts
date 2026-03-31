import os
import pandas as pd
import numpy as np
from io import BytesIO
from typing import Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, Response, Depends
from config import UPLOAD_DIR, logger
from models import CleanRequest, CalculateRequest, CastRequest
from analyzer import DataAnalyzer
from utils import HistoryManager
from database import get_db
from auth import get_current_user

router = APIRouter(prefix="/api")

@router.post("/upload")
async def upload_file(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    """Upload and analyze data file"""
    try:
        if not file.filename: raise HTTPException(status_code=400, detail="No filename provided")
        df = DataAnalyzer.read_file(file)
        if df is None: raise HTTPException(status_code=400, detail="Invalid file format")
        if len(df) == 0: raise HTTPException(status_code=400, detail="File is empty")
        
        result = DataAnalyzer.prepare_for_frontend(df, file.filename)
        db = await get_db()
        upload_id = await db.save_upload(
            filename=file.filename,
            user_id=current_user["id"],
            file_size=file.size or 0,
            metadata={'rows': len(df), 'columns': len(df.columns)}
        )
        file_path = UPLOAD_DIR / f"{upload_id}.csv"
        df.to_csv(file_path, index=False)
        analysis_id = await db.save_analysis(upload_id, result, user_id=current_user["id"])
        result.update({'_id': str(analysis_id), 'upload_id': str(upload_id)})
        return result
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/uploads")
async def get_recent_uploads(current_user: dict = Depends(get_current_user)):
    try:
        db = await get_db()
        uploads = await db.get_user_uploads(user_id=current_user["id"], limit=10)
        for u in uploads: u["_id"] = str(u["_id"])
        return {"uploads": uploads}
    except Exception as e: return {"uploads": [], "error": str(e)}

@router.get("/uploads/{upload_id}")
async def get_upload_data(upload_id: str, current_user: dict = Depends(get_current_user)):
    try:
        db = await get_db()
        upload = await db.get_upload(upload_id)
        if not upload or upload.get("user_id") != current_user["id"]: raise HTTPException(status_code=404, detail="Upload not found")
        file_path = UPLOAD_DIR / f"{upload_id}.csv"
        if not file_path.exists(): raise HTTPException(status_code=404, detail="File lost from server")
        df = pd.read_csv(file_path)
        result = DataAnalyzer.prepare_for_frontend(df, upload["filename"])
        result["upload_id"] = upload_id
        return result
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@router.post("/clean/{upload_id}")
async def clean_data(upload_id: str, request: CleanRequest, current_user: dict = Depends(get_current_user)):
    try:
        db = await get_db()
        upload = await db.get_upload(upload_id)
        if not upload or upload.get("user_id") != current_user["id"]: raise HTTPException(status_code=404, detail="Upload not found")
        file_path = UPLOAD_DIR / f"{upload_id}.csv"
        df = pd.read_csv(file_path)
        HistoryManager.save_version(upload_id)
        if request.action == "drop_na":
            df = df.dropna(subset=[request.column]) if request.column else df.dropna()
        elif request.action == "drop_duplicates": df = df.drop_duplicates()
        elif request.action == "fill_mean":
            if request.column and pd.api.types.is_numeric_dtype(df[request.column]):
                df[request.column] = df[request.column].fillna(df[request.column].mean())
            elif not request.column:
                for col in df.select_dtypes(include=[np.number]).columns: df[col] = df[col].fillna(df[col].mean())
        df.to_csv(file_path, index=False)
        result = DataAnalyzer.prepare_for_frontend(df, upload["filename"])
        result["upload_id"] = upload_id
        return result
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@router.post("/calculate/{upload_id}")
async def calculate_data(upload_id: str, request: CalculateRequest, current_user: dict = Depends(get_current_user)):
    try:
        db = await get_db()
        upload = await db.get_upload(upload_id)
        if not upload or upload.get("user_id") != current_user["id"]: raise HTTPException(status_code=404, detail="Upload not found")
        file_path = UPLOAD_DIR / f"{upload_id}.csv"
        df = pd.read_csv(file_path)
        HistoryManager.save_version(upload_id)
        forbidden = ["import", "eval", "exec", "os", "sys", "__", "builtins", "lambda"]
        if any(f in request.expression for f in forbidden): raise HTTPException(status_code=400, detail="Disallowed expression")
        try:
            try: df[request.new_column] = df.eval(request.expression)
            except: df[request.new_column] = df.eval(request.expression, engine='python')
        except Exception as eval_err: raise HTTPException(status_code=400, detail=f"Expression Error: {str(eval_err)}")
        df.to_csv(file_path, index=False)
        result = DataAnalyzer.prepare_for_frontend(df, upload["filename"])
        result["upload_id"] = upload_id
        return result
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@router.post("/cast/{upload_id}")
async def cast_data(upload_id: str, request: CastRequest, current_user: dict = Depends(get_current_user)):
    try:
        db = await get_db()
        upload = await db.get_upload(upload_id)
        if not upload or upload.get("user_id") != current_user["id"]: raise HTTPException(status_code=404, detail="Upload not found")
        file_path = UPLOAD_DIR / f"{upload_id}.csv"
        df = pd.read_csv(file_path)
        HistoryManager.save_version(upload_id)
        try:
            if request.target_type == "numeric": df[request.column] = pd.to_numeric(df[request.column], errors='coerce')
            elif request.target_type == "datetime": df[request.column] = pd.to_datetime(df[request.column], errors='coerce')
            elif request.target_type == "string": df[request.column] = df[request.column].astype(str)
            else: raise HTTPException(status_code=400, detail="Invalid target type")
        except: raise HTTPException(status_code=400, detail="Casting error")
        df.to_csv(file_path, index=False)
        result = DataAnalyzer.prepare_for_frontend(df, upload["filename"])
        result["upload_id"] = upload_id
        return result
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@router.get("/share/{upload_id}")
async def create_share_link(upload_id: str, current_user: dict = Depends(get_current_user)):
    try:
        db = await get_db()
        upload = await db.get_upload(upload_id)
        if not upload or upload.get("user_id") != current_user["id"]: raise HTTPException(status_code=404, detail="Upload not found")
        share_id = await db.create_share_link(upload_id, user_id=current_user["id"])
        return {"share_id": share_id, "public_url": f"/public/{share_id}"}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@router.get("/public/{share_id}")
async def get_public_dashboard(share_id: str):
    try:
        db = await get_db()
        share = await db.get_share(share_id)
        if not share: raise HTTPException(status_code=404, detail="Not found")
        file_path = UPLOAD_DIR / f"{share['upload_id']}.csv"
        df = pd.read_csv(file_path)
        result = DataAnalyzer.prepare_for_frontend(df, "shared_dashboard.csv")
        result["public"] = True
        return result
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@router.get("/export/{upload_id}/{fmt}")
async def export_data(upload_id: str, fmt: str):
    try:
        file_path = UPLOAD_DIR / f"{upload_id}.csv"
        if not file_path.exists(): raise HTTPException(status_code=404, detail="Not found")
        df = pd.read_csv(file_path)
        if fmt == "csv": return Response(content=df.to_csv(index=False), media_type="text/csv", headers={"Content-Disposition": f"attachment; filename=export.csv"})
        if fmt == "json": return Response(content=df.to_json(orient="records"), media_type="application/json", headers={"Content-Disposition": f"attachment; filename=export.json"})
        if fmt == "excel":
            output = BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer: df.to_excel(writer, index=False)
            return Response(content=output.getvalue(), media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={"Content-Disposition": f"attachment; filename=export.xlsx"})
        raise HTTPException(status_code=400, detail="Invalid format")
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@router.get("/undo/{upload_id}")
async def undo_data(upload_id: str):
    try:
        if HistoryManager.rollback(upload_id):
            db = await get_db()
            upload = await db.get_upload(upload_id)
            df = pd.read_csv(UPLOAD_DIR / f"{upload_id}.csv")
            result = DataAnalyzer.prepare_for_frontend(df, upload["filename"] if upload else "restored.csv")
            result["upload_id"] = upload_id
            return result
        raise HTTPException(status_code=400, detail="No undo steps available")
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))
