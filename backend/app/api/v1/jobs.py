from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from app.schemas.jobs import (
    JobParseRequest,
    JobParseResponse,
    JobCreateRequest,
    SuggestQuestionRequest,
    GenerateAnswerRequest,
    AIQuestionSchema,
)
from app.services.ai import AIService
from app.services.job_service import JobService
from app.api.deps import get_current_user, get_authenticated_client
import os

router = APIRouter()

# ============================================================================
# DEPENDENCIES
# ============================================================================


def get_ai_service():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Gemini API Key not configured")
    return AIService(api_key=api_key)


# ============================================================================
# ENDPOINTS
# ============================================================================


@router.post("/analyze", response_model=JobParseResponse)
async def analyze_job(
    request: JobParseRequest, ai_service: AIService = Depends(get_ai_service)
):
    try:
        # Now passing optional notes and locale
        result = await ai_service.generate_questions(
            job_description=request.description,
            notes=request.notes,
            locale=request.locale,
        )
        return result
    except Exception as e:
        print(f"DEBUG: /analyze error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/suggest-question", response_model=AIQuestionSchema)
async def suggest_question(
    request: SuggestQuestionRequest, ai_service: AIService = Depends(get_ai_service)
):
    try:
        result = await ai_service.suggest_single_question(
            job_title=request.job_title,
            job_description=request.job_description,
            existing_questions=request.current_questions,
            notes=request.notes,
            locale=request.locale,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-answer")
async def generate_answer(
    request: GenerateAnswerRequest, ai_service: AIService = Depends(get_ai_service)
):
    try:
        answer = await ai_service.generate_ideal_answer(
            job_title=request.job_title,
            job_description=request.job_description,
            question_text=request.question_text,
            notes=request.notes if hasattr(request, "notes") else None,  # Safer Check
            locale=request.locale,
        )
        return {"ideal_answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/create")
async def create_job(
    request: JobCreateRequest,
    user=Depends(get_current_user),
    supabase: Client = Depends(get_authenticated_client),
):
    service = JobService(supabase)
    try:
        # User object from Supabase auth token
        new_job = await service.create_job(user.id, request)
        return {"message": "Job created successfully", "job_id": new_job["id"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
