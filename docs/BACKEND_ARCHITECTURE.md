# Backend Architecture & Technical Specifications

## Overview

The backend is a high-performance **FastAPI** application designed to handle asynchronous AI operations and real-time data processing. It serves as the orchestrator between the Frontend, the Database (Supabase), and the AI Engine (Gemini).

## Core Technologies

- **Framework**: FastAPI (Python 3.10+)
- **AI Integration**: Google Gemini API (via `google-generativeai`)
- **Database**: Supabase (PostgreSQL) via `supabase-py`
- **Validation**: Pydantic V2
- **Testing**: Pytest

## 1. API Design & Routing

The API follows a RESTful structure, versioned for future compatibility.

### Route Structure (`app/api/v1`)

- **/auth**: Handles detailed user profile management (Auth logic is primarily detailed to Supabase Auth, but backend validates tokens).
- **/jobs**:
  - `POST /analyze`: Accepts a Raw Job Description -> Returns AI-extracted criteria and suggested questions.
  - `POST /create`: Saves a finalized Job -> Generates a shareable public link.
- **/interviews**:
  - `GET /jobs/{id}/public`: Returns safe public job data for the interview welcome screen.
  - `POST /interviews/start`: Accepts candidate info -> Creates session -> Returns interview data.
  - `POST /submit`: Accepts candidate answers -> Triggers async grading.
- **/webhooks**: Listeners for Supabase database events (if needed for async triggers).

## 2. AI Engine (`AIService`)

The core intellectual property of the platform. Encapsulates all interactions with LLMs.

### Service Layer: `app/services/ai_service.py`

This service is responsible for:

1.  **Prompt Engineering**: Loading strictly typed prompts from `app/core/prompts/`.
2.  **Structured Output**: Using Gemini’s JSON mode (or strict parsing) to ensure the API always returns valid JSON, not free text.
3.  **Grading Logic**:
    - **Input**: Question Context + "Ideal Answer" + Candidate Answer.
    - **Output**: `Score` (0-100), `Strengths` (List), `Weaknesses` (List), `Summary`.

### Async Processing

AI operations can be slow. Heavy analysis (like grading full interviews) runs as background tasks (`BackgroundTasks` in FastAPI) to return an immediate "Received" response to the UI.

## 3. Database & Security (Supabase)

We use Supabase as a "Backend-as-a-Service" for the datastore and authentication, but the FastAPI backend holds administrative privileges.

### Schema (Key Tables)

- **`profiles`**: Linked to `auth.users`. Contains role (recruiter/admin).
- **`jobs`**: The positions created by recruiters.
  - Columns: `id`, `recruiter_id`, `title`, `description`, `status`.
- **`questions`**:
  - Columns: `id`, `job_id`, `text`, `ideal_answer`, `time_limit`, `weight`.
- **`candidates`**: People who applied.
- **`interviews`**: The actual session.
  - Columns: `id`, `candidate_id`, `job_id`, `score`, `ai_summary`, `flags`.

### Row Level Security (RLS)

- **Recruiters**: Can only `SELECT/UPDATE` their own jobs (`auth.uid() = recruiter_id`).
- **Candidates**: Have NO direct access to tables. They interact ONLY via the FastAPI endpoints, which use a `service_role` key to write answers safely. This prevents anyone from inspecting other candidates' data via the browser console.

## 4. Directory Structure (Layered)

```
backend/
  app/
    api/              # Endpoints (Routers)
    core/             # Config, Secrets, Security Dependencies
    models/           # Supabase/DB Models (if using ORM like SQLModel)
    schemas/          # Pydantic Request/Response Models
    services/         # Business Logic (AIService, JobService)
    utils/            # Helpers
  tests/              # Integrated tests
```
