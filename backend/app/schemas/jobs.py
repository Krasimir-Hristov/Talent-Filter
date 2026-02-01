from pydantic import BaseModel
from typing import List, Optional

# ============================================================================
# REQUEST SCHEMAS
# ============================================================================


class JobParseRequest(BaseModel):
    description: str
    notes: Optional[str] = None
    locale: str = "en"  # Default to English


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
    text: str
    ideal_answer: str
    time_limit: int = 120
    weight: int = 1


# ============================================================================
# RESPONSE SCHEMAS
# ============================================================================


class JobParseResponse(BaseModel):
    title: str
    questions: List[AIQuestionSchema]


class JobCreateRequest(BaseModel):
    title: str
    description: str
    notes: Optional[str] = None
    questions: List[AIQuestionSchema]
