from google import genai
from google.genai import types
import json
import os
import asyncio
from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.jobs import AIQuestionSchema

# ============================================================================
# PYDANTIC MODELS
# ============================================================================


class JobAnalysis(BaseModel):
    title: str = Field(description="The refined job title")
    questions: List[AIQuestionSchema] = Field(
        description="A list of screening questions optimal for vetting the position"
    )


class SingleQuestionResponse(BaseModel):
    question: AIQuestionSchema


class IdealAnswerResponse(BaseModel):
    ideal_answer: str


# ============================================================================
# THE AI SERVICE (Using google-genai SDK)
# ============================================================================


class AIService:
    def __init__(self, api_key: str):
        # Initialize the new GenAI client
        self.client = genai.Client(api_key=api_key)
        # Using the latest 2.5-flash model
        self.model_name = "gemini-2.5-flash"

    def _get_language_instruction(self, locale: str) -> str:
        languages = {"en": "English", "de": "German"}
        target_lang = languages.get(locale, "English")
        return f"IMPORTANT: All responses and content MUST be written in {target_lang}."

    async def _generate_with_retry(self, prompt: str, schema):
        """
        Executes generation with retry logic using the new google-genai SDK.
        """
        max_retries = 3
        base_delay = 2

        for attempt in range(max_retries):
            try:
                # Use the asynchronous client under self.client.aio
                response = await self.client.aio.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        response_schema=schema,  # Passing Pydantic class directly!
                    ),
                )

                # The response object in the new SDK might have different structure.
                # response.text is usually available, or response.parsed if we trust it.
                # Let's verify what we get. The docs say print(response.parsed)works.
                return response
            except Exception as e:
                error_str = str(e)
                if (
                    "429" in error_str or "429" in str(getattr(e, "code", ""))
                ) and attempt < max_retries - 1:
                    wait_time = base_delay * (2**attempt)
                    print(
                        f"DEBUG: 429 Rate Limit hit. Retrying in {wait_time}s... (Attempt {attempt + 1}/{max_retries})"
                    )
                    await asyncio.sleep(wait_time)
                    continue
                else:
                    print(f"AI Generation Error (Attempt {attempt + 1}): {e}")
                    raise

    async def generate_questions(
        self, job_description: str, notes: Optional[str] = None, locale: str = "en"
    ) -> JobAnalysis:
        lang_instr = self._get_language_instruction(locale)
        prompt = f"""
        You are an expert technical recruiter. Analyze the job description and extract core competencies.
        
        GOAL: Generate an OPTIMAL number of screening questions. 
        Determine the coverage yourself based on complexity.
        
        {lang_instr}
        
        Job Description:
        {job_description}
        
        Additional Context/Notes:
        {notes if notes else "No additional notes provided."}
        """

        # New SDK supports parsing directly into Pydantic model via .parsed
        response = await self._generate_with_retry(prompt, JobAnalysis)
        # Handle cases where parsed might be None if JSON fails
        if response.parsed:
            # The SDK returns an instance of the Pydantic model directly!
            return response.parsed
        else:
            # Fallback to manual parsing if needed
            return JobAnalysis.model_validate_json(response.text)

    async def suggest_single_question(
        self,
        job_title: str,
        job_description: str,
        existing_questions: List[str],
        notes: Optional[str] = None,
        locale: str = "en",
    ) -> AIQuestionSchema:
        lang_instr = self._get_language_instruction(locale)
        prompt = f"""
        Generate ONE new question object. Position: {job_title}. Description: {job_description}.
        Existing Questions: {json.dumps(existing_questions)}
        {lang_instr}
        """
        response = await self._generate_with_retry(prompt, AIQuestionSchema)
        if response.parsed:
            return response.parsed
        return AIQuestionSchema.model_validate_json(response.text)

    async def generate_ideal_answer(
        self,
        job_title: str,
        job_description: str,
        question_text: str,
        locale: str = "en",
    ) -> str:
        lang_instr = self._get_language_instruction(locale)
        prompt = f"""
        Provide an ideal answer for: {question_text}. Job: {job_title}. Context: {job_description}.
        
        IMPORTANT: Keep the answer CONCISE. Maximum 2-4 sentences. It should be a bullet point summary or a short paragraph.
        {lang_instr}
        """

        response = await self._generate_with_retry(prompt, IdealAnswerResponse)
        if response.parsed:
            return response.parsed.ideal_answer
        return IdealAnswerResponse.model_validate_json(response.text).ideal_answer
