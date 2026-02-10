from fastapi import APIRouter, Depends
from supabase import Client
from app.schemas.interview import (
    InterviewStartRequest,
    InterviewStartResponse,
    SessionQuestionsResponse,
    SubmitAnswerRequest,
    SubmitAnswerResponse,
)
from app.services.interview_service import InterviewService
from app.api.deps import get_service_role_client, rate_limit

router = APIRouter()

# ============================================================================
# DEPENDENCIES
# ============================================================================


def get_interview_service(
    supabase: Client = Depends(get_service_role_client),
) -> InterviewService:
    """
    Interview operations use the Service Role client because
    candidates are anonymous — they have no Supabase Auth session.
    """
    return InterviewService(supabase)


# ============================================================================
# ENDPOINTS
# ============================================================================


@router.post(
    "/start",
    response_model=InterviewStartResponse,
    dependencies=[Depends(rate_limit)],
)
async def start_interview(
    request: InterviewStartRequest,
    service: InterviewService = Depends(get_interview_service),
):
    """
    Register a candidate and create an interview session.

    Public endpoint (no auth required). Rate limited.

    Returns session data needed to begin the interview flow.
    Raises:
        404: Job not found or closed
        409: Candidate already applied with this email
        429: Rate limit exceeded
    """
    result = await service.start_session(
        job_id=request.job_id,
        first_name=request.first_name,
        last_name=request.last_name,
        email=request.email,
        phone=request.phone,
    )
    return result


@router.get(
    "/{interview_id}/session",
    response_model=SessionQuestionsResponse,
    dependencies=[Depends(rate_limit)],
)
async def get_session_questions(
    interview_id: str,
    service: InterviewService = Depends(get_interview_service),
):
    """
    Fetch the questions for an active interview session.

    Public endpoint (no auth required). Rate limited.

    SECURITY: Only returns question text + time limits.
    Ideal answers and weights are never exposed to the candidate.

    Raises:
        404: Interview not found
        410: Interview already completed or abandoned
        429: Rate limit exceeded
    """
    return await service.get_session_questions(interview_id)


@router.post(
    "/{interview_id}/submit-answer",
    response_model=SubmitAnswerResponse,
    dependencies=[Depends(rate_limit)],
)
async def submit_answer(
    interview_id: str,
    request: SubmitAnswerRequest,
    service: InterviewService = Depends(get_interview_service),
):
    """
    Submit an answer for a specific question in an interview session.

    Public endpoint (no auth required). Rate limited.

    Accepts the answer text along with anti-cheat metadata
    (paste_count, tab_switches) which is silently stored.

    Raises:
        404: Interview not found
        410: Interview no longer active
        429: Rate limit exceeded
    """
    return await service.submit_answer(
        interview_id=interview_id,
        question_id=request.question_id,
        answer_text=request.answer_text,
        time_spent_seconds=request.time_spent_seconds,
        paste_count=request.paste_count,
        tab_switches=request.tab_switches,
    )
