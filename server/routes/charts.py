import httpx
import urllib.parse
from fastapi import APIRouter, HTTPException, Response
from typing import Optional
from config import logger

router = APIRouter()

@router.get("/chart")
async def get_chart(c: str, w: int = 500, h: int = 300, f: str = 'png', v: Optional[str] = '3'):
    """
    Proxy to QuickChart.io for generating chart images
    """
    encoded_c = urllib.parse.quote(c)
    qc_url = f"https://quickchart.io/chart?c={encoded_c}&w={w}&h={h}&f={f}&v={v}"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(qc_url, timeout=15.0)
            if response.status_code == 200:
                media_type = f"image/{f}" if f in ['png', 'jpg', 'jpeg'] else "image/png"
                if f == 'pdf': media_type = "application/pdf"
                return Response(content=response.content, media_type=media_type)
            else:
                logger.error(f"QuickChart API error: {response.status_code} - {response.text}")
                raise HTTPException(status_code=response.status_code, detail=f"Chart generation failed: {response.text}")
    except Exception as e:
        logger.error(f"Error proxying chart request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chart generation error: {str(e)}")
