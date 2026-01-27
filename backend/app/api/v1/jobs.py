from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from app.schemas.jobs import JobParseRequest, JobParseResponse, JobCreateRequest
from app.services.ai import AIService
from app.services.job_service import JobService
from app.api.deps import get_current_user, get_supabase_client
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
async def create_job(
    request: JobCreateRequest,
    user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    service = JobService(supabase)
    try:
        # User object from Supabase has an 'id' attribute
        new_job = await service.create_job(user.id, request)
        return {"message": "Job created successfully", "job_id": new_job["id"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
