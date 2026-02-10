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


class SubmitAnswerRequest(BaseModel):
    """Candidate submits an answer to a specific question."""

    question_id: str
    answer_text: str = Field(..., max_length=10000)
    time_spent_seconds: int = Field(0, ge=0)

    # Anti-cheat metadata (collected silently on the frontend)
    paste_count: int = Field(0, ge=0)
    tab_switches: int = Field(0, ge=0)


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


class SessionQuestionOut(BaseModel):
    """A single question as presented to the candidate.

    SECURITY: ideal_answer is intentionally excluded.
    Candidates must never see evaluation criteria in the Network tab.
    """

    id: str
    text: str
    time_limit: int
    order_index: int


class SessionQuestionsResponse(BaseModel):
    """Returned when the candidate loads the interview session."""

    interview_id: str
    job_title: str
    questions: list[SessionQuestionOut]
    total_questions: int


class SubmitAnswerResponse(BaseModel):
    """Confirmation after an answer is recorded."""

    success: bool
    answer_id: str
    next_question_index: int | None = None


class CandidateResult(BaseModel):
    """
    aggregated interview data for the recruiter dashboard.
    """

    candidate_id: str
    interview_id: str
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    status: str
    end_time: datetime | None
    total_time_spent: int  # seconds
    paste_count: int
    tab_switches: int
    ai_score: int | None = None  # Placeholder for future AI grading
