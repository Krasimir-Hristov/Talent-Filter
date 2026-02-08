from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from supabase import Client
from app.schemas.jobs import (
    JobParseRequest,
    JobParseResponse,
    JobCreateRequest,
    SuggestQuestionRequest,
    GenerateAnswerRequest,
    AIQuestionSchema,
    JobWithQuestionsResponse,
    JobUpdateRequest,
    JobRefineRequest,
    JobRefineResponse,
)
from app.services.ai import AIService
from app.services.job_service import JobService
from app.api.deps import (
    get_current_user,
    get_authenticated_client,
    get_anon_client,
    get_service_role_client,
    rate_limit,
)
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


@router.get("/", response_model=List[JobWithQuestionsResponse])
async def list_jobs(
    user=Depends(get_current_user),
    supabase: Client = Depends(get_authenticated_client),
):
    service = JobService(supabase)
    try:
        jobs = await service.get_recruiter_jobs(user.id)
        return jobs
    except Exception as e:
        print(f"DEBUG: /jobs list error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{job_id}", response_model=JobWithQuestionsResponse)
async def get_job(
    job_id: str,
    user=Depends(get_current_user),
    supabase: Client = Depends(get_authenticated_client),
):
    service = JobService(supabase)
    try:
        job = await service.get_job_by_id(user.id, job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        return job
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: /jobs/{job_id} error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/public/{job_id}", dependencies=[Depends(rate_limit)])
async def get_public_job(
    job_id: str,
    supabase: Client = Depends(get_service_role_client),
):
    """
    Publicly accessible job details (Title, Description).
    Rate limited to prevent scraping/spam.
    """
    service = JobService(supabase)
    try:
        job = await service.get_public_job_details(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found or not active")
        return job
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: /jobs/public/{job_id} error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


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


@router.post("/refine", response_model=JobRefineResponse)
async def refine_job(
    request: JobRefineRequest, ai_service: AIService = Depends(get_ai_service)
):
    try:
        result = await ai_service.refine_job_description(
            description=request.description,
            notes=request.notes,
            locale=request.locale,
        )
        return {
            "refined_description": result.refined_description,
            "refined_title": result.refined_title,
        }
    except Exception as e:
        print(f"DEBUG: /refine error: {e}")
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


@router.delete("/{job_id}")
async def delete_job(
    job_id: str,
    user=Depends(get_current_user),
    supabase: Client = Depends(get_authenticated_client),
):
    """
    Delete a job position. First verifies the job belongs to the user,
    then deletes associated questions and the job itself.
    """
    service = JobService(supabase)
    try:
        # First verify the job belongs to this user
        job = await service.get_job_by_id(user.id, job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        # Delete associated questions first (foreign key constraint)
        supabase.table("questions").delete().eq("job_id", job_id).execute()

        # Delete the job
        supabase.table("jobs").delete().eq("id", job_id).eq(
            "recruiter_id", user.id
        ).execute()

        return {"message": "Job deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: DELETE /jobs/{job_id} error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{job_id}")
async def update_job(
    job_id: str,
    request: JobUpdateRequest,
    user=Depends(get_current_user),
    supabase: Client = Depends(get_authenticated_client),
):
    """
    Update job properties (title, description, notes, status).
    """
    service = JobService(supabase)
    try:
        # First verify the job belongs to this user
        job = await service.get_job_by_id(user.id, job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        # Prepare update data
        update_data = {k: v for k, v in request.model_dump().items() if v is not None}

        if not update_data:
            return {"message": "No changes requested"}

        # Perform update via service (handles questions too)
        updated_job = await service.update_job(user.id, job_id, update_data)

        if not updated_job:
            raise HTTPException(status_code=404, detail="Job not found after update")

        return updated_job
    except HTTPException:
        raise
    except Exception as e:
        print(f"DEBUG: PATCH /jobs/{job_id} error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
