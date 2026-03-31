import os
import json
import requests
import pandas as pd
from fastapi import APIRouter, HTTPException, Response, Depends
from config import GROQ_API_KEY, ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID, UPLOAD_DIR, logger
from models import ChatRequest
from analyzer import DataAnalyzer
from utils import HistoryManager
from database import get_db

router = APIRouter(prefix="/api")

@router.get("/tts")
async def text_to_speech(text: str):
    """Convert text to speech using ElevenLabs"""
    try:
        if not ELEVENLABS_API_KEY or ELEVENLABS_API_KEY == "your_elevenlabs_key_here":
            raise HTTPException(status_code=400, detail="ElevenLabs API Key missing")
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}"
        headers = {"Accept": "audio/mpeg", "Content-Type": "application/json", "xi-api-key": ELEVENLABS_API_KEY}
        data = {"text": text, "model_id": "eleven_monolingual_v1", "voice_settings": {"stability": 0.5, "similarity_boost": 0.5}}
        response = requests.post(url, json=data, headers=headers)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"TTS Engine error: {response.text}")
        return Response(content=response.content, media_type="audio/mpeg")
    except HTTPException: raise
    except Exception as e:
        logger.error(f"Unexpected TTS Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat/{upload_id}")
async def chat_with_data(upload_id: str, request: ChatRequest):
    """Chat with your data using Groq (Llama 3) - Supports NL2Viz"""
    try:
        file_path = UPLOAD_DIR / f"{upload_id}.csv"
        if not file_path.exists(): raise HTTPException(status_code=404, detail="Data file not found")
        df = pd.read_csv(file_path)
        prompt = f"Dataset: {len(df)} rows, {len(df.columns)} columns. Columns: {df.dtypes.to_string()}\nSample: {df.head(5).to_csv(index=False)}\nUser Query: \"{request.message}\""
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}
        payload = {"model": "llama-3.3-70b-versatile", "messages": [{"role": "user", "content": prompt}], "temperature": 0.7}
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code != 200: raise HTTPException(status_code=response.status_code, detail=response.text)
        resp_text = response.json()["choices"][0]["message"]["content"]
        chart_config = None
        if "```json" in resp_text:
            try:
                json_part = resp_text.split("```json")[1].split("```")[0].strip()
                potential_json = json.loads(json_part)
                if "chart" in potential_json: chart_config = potential_json["chart"]
            except: pass
        return {"response": resp_text.strip(), "chart_config": chart_config}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@router.post("/smart-clean/{upload_id}")
async def smart_clean_data(upload_id: str):
    """AI-powered smart cleaning using Groq"""
    try:
        file_path = UPLOAD_DIR / f"{upload_id}.csv"
        if not file_path.exists(): raise HTTPException(status_code=404, detail="Data file not found")
        df = pd.read_csv(file_path)
        HistoryManager.save_version(upload_id)
        prompt = f"Senior data engineer. Dataset columns: {list(df.columns)}\nSample: {df.head(10).to_csv(index=False)}"
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}
        payload = {"model": "llama-3.3-70b-versatile", "messages": [{"role": "user", "content": prompt}], "response_format": {"type": "json_object"}}
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code != 200: raise HTTPException(status_code=response.status_code, detail="AI Clean failed")
        steps = json.loads(response.json()["choices"][0]["message"]["content"])
        for step in steps.get("cleaning_steps", []):
            col, action = step.get("column"), step.get("action")
            if col in df.columns:
                if action == "strip": df[col] = df[col].astype(str).str.strip()
                elif action == "title": df[col] = df[col].astype(str).str.title()
                elif action == "auto_date": df[col] = pd.to_datetime(df[col], errors='coerce')
        df.to_csv(file_path, index=False)
        db = await get_db()
        upload = await db.get_upload(upload_id)
        result = DataAnalyzer.prepare_for_frontend(df, upload["filename"] if upload else "smart_cleaned.csv")
        result.update({"upload_id": upload_id, "ai_summary": "AI standardization complete."})
        return result
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@router.get("/predict/{upload_id}")
async def get_data_predictions(upload_id: str):
    file_path = UPLOAD_DIR / f"{upload_id}.csv"
    if not file_path.exists(): raise HTTPException(status_code=404, detail="Data file not found")
    df = pd.read_csv(file_path)
    return await DataAnalyzer.get_predictions(df)

@router.get("/advice/{upload_id}")
async def get_data_advice(upload_id: str):
    file_path = UPLOAD_DIR / f"{upload_id}.csv"
    if not file_path.exists(): raise HTTPException(status_code=404, detail="Data file not found")
    df = pd.read_csv(file_path)
    return await DataAnalyzer.get_causes_advice(df)
