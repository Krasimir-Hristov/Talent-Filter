from fastapi import APIRouter, Depends
from supabase import Client
from app.schemas.interview import InterviewStartRequest, InterviewStartResponse
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
