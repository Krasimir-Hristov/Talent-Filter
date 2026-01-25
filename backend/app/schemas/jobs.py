from pydantic import BaseModel
from typing import List, Optional


class JobParseRequest(BaseModel):
    description: str


class AIQuestionSchema(BaseModel):
    text: str
    ideal_answer: str
    time_limit: int
    weight: int


class JobParseResponse(BaseModel):
    title: str
    questions: List[AIQuestionSchema]


class JobCreateRequest(BaseModel):
    title: str
    description: str
    questions: List[AIQuestionSchema]
