import google.generativeai as genai
import json
import os
from typing import List, Optional
from pydantic import BaseModel, Field

# ============================================================================
# STRUCTURED OUTPUT MODELS
# ============================================================================


class AIQuestion(BaseModel):
    text: str = Field(description="The interview question text")
    ideal_answer: str = Field(
        description="A brief description of what a good answer should include"
    )
    time_limit: int = Field(
        description="Suggested time limit in seconds (typically between 60 and 300)"
    )
    weight: int = Field(description="Importance of the question from 1-5")


class JobAnalysis(BaseModel):
    title: str = Field(description="The refined job title")
    questions: List[AIQuestion] = Field(
        description="A list of screening questions optimal for vetting the position"
    )


class SingleQuestionSuggestion(BaseModel):
    question: AIQuestion


class IdealAnswerSuggestion(BaseModel):
    ideal_answer: str


# ============================================================================
# THE AI SERVICE
# ============================================================================


class AIService:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        # Using flash for speed/cost, pro could be used for more complex grading later
        self.model = genai.GenerativeModel("gemini-1.5-flash")

    def _get_language_instruction(self, locale: str) -> str:
        """Helper to ensure output is in the correct language."""
        languages = {"en": "English", "de": "German"}
        target_lang = languages.get(locale, "English")
        return f"IMPORTANT: All responses and content MUST be written in {target_lang}."

    async def generate_questions(
        self, job_description: str, notes: Optional[str] = None, locale: str = "en"
    ) -> JobAnalysis:
        lang_instr = self._get_language_instruction(locale)
        prompt = f"""
        You are an expert technical recruiter and talent analyst.
        Analyze the following job description and optional notes to extract the core competencies required.
        
        GOAL: Generate an OPTIMAL number of screening questions to thoroughly vet the candidate's skills.
        Complexity matters: A senior role might need more questions (8-10), while a junior or simple role might need fewer (3-5). 
        Determine the coverage yourself based on the description quality.
        
        {lang_instr}
        
        Job Description:
        {job_description}
        
        Additional Context/Notes:
        {notes if notes else "No additional notes provided."}
        
        Output the result in strict JSON format.
        """

        response = self.model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                response_schema=JobAnalysis.model_json_schema(),
            ),
        )

        return JobAnalysis.model_validate_json(response.text)

    async def suggest_single_question(
        self,
        job_title: str,
        job_description: str,
        existing_questions: List[str],
        notes: Optional[str] = None,
        locale: str = "en",
    ) -> AIQuestion:
        lang_instr = self._get_language_instruction(locale)
        prompt = f"""
        You are a recruitment assistant. The recruiter wants to add ONE additional question to their interview.
        
        Position: {job_title}
        Description: {job_description}
        Existing Questions: {json.dumps(existing_questions)}
        Additional Notes: {notes if notes else "None"}
        
        CRITICAL: The new question must NOT be similar or redundant to existing ones. Focus on a missing aspect or specific skill.
        {lang_instr}
        
        Return ONLY the new question in JSON format.
        """

        response = self.model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                response_schema=AIQuestion.model_json_schema(),
            ),
        )

        return AIQuestion.model_validate_json(response.text)

    async def generate_ideal_answer(
        self,
        job_title: str,
        job_description: str,
        question_text: str,
        locale: str = "en",
    ) -> str:
        lang_instr = self._get_language_instruction(locale)
        # Since we only want a single string field, we can use a simpler schema or just extract it
        prompt = f"""
        Task: Provide a high-quality 'Ideal Answer' or grading criteria for a specific interview question.
        
        Job Title: {job_title}
        Job Context: {job_description}
        Question: {question_text}
        
        {lang_instr}
        
        Goal: Describe what a perfect candidate should mention in their answer to score 100%. 
        Be concise but thorough regarding key terms or skills expected.
        """

        # Define a small schema for the response to ensure consistency
        class AnswerResponse(BaseModel):
            ideal_answer: str

        response = self.model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                response_schema=AnswerResponse.model_json_schema(),
            ),
        )

        data = AnswerResponse.model_validate_json(response.text)
        return data.ideal_answer

    async def grade_interview(self, question: str, ideal: str, answer: str) -> dict:
        # Placeholder for Phase 5
        pass
