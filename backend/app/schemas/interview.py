from pydantic import BaseModel, Field, EmailStr
from datetime import datetime

# ============================================================================
# REQUEST SCHEMAS
# ============================================================================


class InterviewStartRequest(BaseModel):
    """Candidate registration + interview session creation."""

    job_id: str
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=1, max_length=30)


# ============================================================================
# RESPONSE SCHEMAS
# ============================================================================


class InterviewStartResponse(BaseModel):
    """Returned after successful candidate registration."""

    interview_id: str
    candidate_id: str
    job_id: str
    job_title: str
    total_questions: int
    start_time: str
