from pydantic import BaseModel, Field
from typing import List, Optional

# ============================================================================
# REQUEST SCHEMAS
# ============================================================================


class JobRefineRequest(BaseModel):
    description: str
    notes: Optional[str] = None
    locale: str = "en"


class JobParseRequest(BaseModel):
    description: str
    notes: Optional[str] = None
    locale: str = "en"


class JobRefineResponse(BaseModel):
    refined_description: str
    refined_title: Optional[str] = None


class SuggestQuestionRequest(BaseModel):
    job_title: str
    job_description: str
    current_questions: List[str]  # List of question texts to avoid duplicates
    notes: Optional[str] = None
    locale: str = "en"


class GenerateAnswerRequest(BaseModel):
    job_title: str
    job_description: str
    question_text: str
    locale: str = "en"


# ============================================================================
# DATA SCHEMAS
# ============================================================================


class AIQuestionSchema(BaseModel):
    text: str = Field(..., min_length=1)
    ideal_answer: str
    time_limit: int = 120
    weight: int = Field(1, ge=0, le=10)


class QuestionResponseSchema(AIQuestionSchema):
    id: str
    job_id: str


# ============================================================================
# RESPONSE SCHEMAS
# ============================================================================


class JobParseResponse(BaseModel):
    title: str
    questions: List[AIQuestionSchema]


class JobWithQuestionsResponse(BaseModel):
    id: str
    title: str
    description: str
    status: str
    created_at: str
    notes: Optional[str] = None
    questions: List[QuestionResponseSchema] = []


class JobCreateRequest(BaseModel):
    title: str
    description: str
    notes: Optional[str] = None
    questions: List[AIQuestionSchema]


class JobUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None
    questions: Optional[List[AIQuestionSchema]] = None
