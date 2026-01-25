import google.generativeai as genai
import json
import os
from typing import List, Optional
from pydantic import BaseModel, Field

# 1. DEFINE STRUCTURED OUTPUT MODELS
class AIQuestion(BaseModel):
    text: str = Field(description="The interview question text")
    ideal_answer: str = Field(description="A brief description of what a good answer should include")
    time_limit: int = Field(description="Suggested time limit in seconds (default 180)")
    weight: int = Field(description="Importance of the question from 1-5")

class JobAnalysis(BaseModel):
    title: str = Field(description="The refined job title")
    questions: List[AIQuestion] = Field(description="A list of 3-5 screening questions")

# 2. THE AI SERVICE
class AIService:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    async def generate_questions(self, job_description: str) -> JobAnalysis:
        prompt = f"""
        You are an expert technical recruiter. Analyze the following job description and generate 
        a refined job title and 3-5 high-impact screening questions.
        
        For each question, provide:
        1. The question text itself.
        2. A brief 'ideal answer' description for later grading.
        3. A suggested time limit in seconds.
        4. A weight from 1 (lowest) to 5 (highest) based on importance.
        
        Job Description:
        {job_description}
        
        Output the result in strict JSON format according to the provided schema.
        """
        
        response = self.model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                response_schema=JobAnalysis.model_json_schema()
            )
        )
        
        # Parse and return the structured data
        return JobAnalysis.model_validate_json(response.text)

    async def grade_interview(self, question: str, ideal: str, answer: str) -> dict:
        # Placeholder for the grading logic (Phase 5)
        pass
