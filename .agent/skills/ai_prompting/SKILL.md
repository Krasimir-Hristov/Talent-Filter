---
name: Gemini AI & Prompt Engineering
description: Expertise in integrating Google Gemini API, designing robust prompts, and ensuring structured JSON outputs for TalentFilter.
---

# Gemini AI & Prompt Engineering Skill

This skill governs all AI-related logic within the TalentFilter platform, specifically focusing on the `AIService` in the backend.

## 1. Google Gemini API Integration

- **Model Versioning**: Always use the most capable version (`gemini-2.5-flash`).
- **Safety Settings**: Configure AI safety settings via the `google-genai` SDK to ensure the AI doesn't refuse valid recruitment/screening tasks while maintaining professional boundaries.
- **Async Execution**: AI calls are high-latency; always use `await` and ensure they are proxied through the FastAPI backend to avoid blocking the main thread.

## 2. Structured Output (JSON Mode)

- **Strict Schema**: Every AI call must use a Pydantic model to define its response structure.
- **JSON Request**: Set the `response_mime_type` to `application/json` in the Gemini config.
- **Validation**: Always wrap the AI parsing logic in a try-except block. If parsing fails, implement a retry mechanism or return a structured error response.
- **Language Awareness**: Every prompt must explicitly specify the output language based on the user's `locale`.
- **Dynamic Scope**: Avoid hardcoding question counts. Instruct the AI to determine the optimal depth (e.g., "Generate as many questions as needed to thoroughly vet this specific role").

## 3. Advanced Prompt Engineering

- **System Instructions**: Clearly define the AI's persona as an "Expert Technical Recruiter" or "Bias-Free Interviewer".
- **Chain-of-Thought**: For complex tasks like grading interviews, use prompts that encourage step-by-step reasoning within the JSON output (e.g., a `reasoning` field before the `final_score`).
- **Context Injection**:
  - **Job Analysis**: Inject raw job description text + specific extraction goals.
  - **Suggest Question**: Inject job description + existing questions (as JSON array) to avoid duplicates. Prompt must explicitly instruct: "Generate ONE new question that is NOT similar to existing ones."
  - **Generate Answer**: Inject job description + specific question text. Prompt should ask for an "ideal answer" that reflects the company's requirements based on the description.
  - **Grading**: Inject Question context + "Ideal Answer" + "Candidate Answer" + "Scoring Rubric".

## 4. Prompt Storage (Clean Code)

- **Separation**: Never hardcode long prompts in Python files.
- **Storage**: Store prompt templates in `backend/app/core/prompts/` as `.txt` or `.md` files.
- **Template Engine**: Use simple string formatting or Jinja2 to inject variables into prompts.

## 5. Cost & Performance

- **Token Optimization**: Be concise in prompts. Avoid redundant instructions.
- **Caching**: If similar requests are expected (e.g., re-analyzing the same job description), check for existing results in Supabase before calling the AI.
