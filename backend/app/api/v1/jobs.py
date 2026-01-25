from fastapi import APIRouter, Depends, HTTPException
from app.schemas.jobs import JobParseRequest, JobParseResponse, JobCreateRequest
from app.services.ai import AIService
import os

router = APIRouter()


# Dependency to get AIService
def get_ai_service():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Gemini API Key not configured")
    return AIService(api_key=api_key)


@router.post("/analyze", response_model=JobParseResponse)
async def analyze_job(
    request: JobParseRequest, ai_service: AIService = Depends(get_ai_service)
):
    try:
        result = await ai_service.generate_questions(request.description)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/create")
async def create_job(request: JobCreateRequest):
    # This will be implemented in Step 2.2 fully with Supabase integration
    return {"message": "Job received", "title": request.title}
