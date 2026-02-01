---
description: Step-by-step plan for implementing the Unified Hybrid AI Wizard
---

# Unified Hybrid AI Wizard - Implementation Plan

This workflow outlines the complete implementation of the new Job Creation Wizard approach.

## Overview

**Goal**: Create a single, intelligent workflow where AI generates the initial interview structure, and the recruiter can refine it with real-time AI assistance.

**Key Principles**:

- No "Manual vs AI" fork - all jobs start with AI generation
- Dynamic question cards (no fixed count)
- Real-time AI assistance for suggestions and answer generation
- Full manual editing capability

---

## Phase 1: Backend - AI Service Enhancement

### Step 1.1: Update Schemas (`backend/app/schemas/jobs.py`)

Add new request/response models:

```python
class JobSuggestQuestionRequest(BaseModel):
    description: str
    existing_questions: List[str]  # Array of question texts to avoid duplicates

class JobGenerateAnswerRequest(BaseModel):
    description: str
    question: str

class JobGenerateAnswerResponse(BaseModel):
    ideal_answer: str
```

### Step 1.2: Enhance AI Service (`backend/app/services/ai.py`)

Add two new methods to `AIService`:

**A. `suggest_question()`**

- Input: job description + existing questions
- Prompt: "Generate ONE new screening question that is NOT similar to existing ones"
- Output: Single `AIQuestion` object (text, ideal_answer, time_limit, weight)

**B. `generate_answer()`**

- Input: job description + question text
- Prompt: "Based on this job description, what would be the ideal answer to this question?"
- Output: `AIAnswer` object (ideal_answer field)

Both use Gemini's `response_schema` for structured JSON output.

### Step 1.3: Create API Endpoints (`backend/app/api/v1/jobs.py`)

Add two new routes:

- `POST /jobs/suggest-question`: Calls `suggest_question()`, returns `AIQuestionSchema`
- `POST /jobs/generate-answer`: Calls `generate_answer()`, returns `JobGenerateAnswerResponse`

Both require authentication (use existing `get_current_user` dependency).

---

## Phase 2: Frontend - Wizard Restructuring

### Step 2.1: Simplify Initial Screen

**File**: `frontend/src/components/features/dashboard/job-creation-wizard.tsx`

**Changes**:

- Remove step indicator (no more multi-step)
- Single screen with three fields:
  - Job Title (text input)
  - Job Description (large textarea, required)
  - Additional Notes/Context (optional textarea)
- Big "Generate Interview" button with premium animation

### Step 2.2: Dynamic Question Cards

**State Structure**:

```typescript
interface Question {
  id: string; // UUID for React keys
  text: string;
  ideal_answer: string;
  time_limit: number;
  weight: number;
}

const [questions, setQuestions] = useState<Question[]>([]);
```

**Rendering**:

- Map over `questions` array
- Each card shows all editable fields
- No fixed count - supports 1 to 50+ questions

### Step 2.3: AI Assistance Buttons

**A. "Suggest Question" Button** (below question list)

- Calls `/jobs/suggest-question` with:
  - `description`: current job description
  - `existing_questions`: `questions.map(q => q.text)`
- On success: Add returned question to `questions` array
- Loading state: Show skeleton card with "AI is thinking..." animation

**B. "Generate Answer" Button** (per question card)

- Small magic wand icon next to `ideal_answer` field
- Calls `/jobs/generate-answer` with:
  - `description`: current job description
  - `question`: current question text
- On success: Update that specific question's `ideal_answer`
- Loading state: Shimmer effect on answer field

### Step 2.4: Premium UX Polish

**Animations** (using `framer-motion`):

- Question cards fade in with stagger effect
- "Thinking" state: Pulsing gradient border
- Success: Green checkmark animation

**Validation**:

- Disable "Save" if no questions exist
- Warn if any question has empty `text`
- Optional: Suggest time limits if user sets to 0

---

## Phase 3: Integration & Testing

### Step 3.1: End-to-End Flow Test

1. Navigate to `/dashboard/jobs/new`
2. Enter job description (e.g., "Senior React Developer")
3. Click "Generate Interview"
4. Verify 3-5 questions appear with all fields populated
5. Click "Suggest Question" → verify new unique question appears
6. Edit a question manually
7. Click "Generate Answer" → verify answer updates
8. Click "Save" → verify redirect to dashboard
9. Check Supabase: verify job + questions saved correctly

### Step 3.2: Edge Cases

- Empty description → show validation error
- AI returns duplicate question → frontend should still allow (recruiter decides)
- Network error during AI call → show toast, don't crash
- Very long description (5000+ chars) → ensure Gemini handles it

---

## Phase 4: Documentation Update

### Step 4.1: Update README

Add section explaining the Unified Wizard approach and its benefits.

### Step 4.2: Update Skills

- ✅ Already updated `ai_prompting/SKILL.md`
- ✅ Already updated `architecture/SKILL.md`
- ✅ Already updated `ImplementationPlan.md`

---

## Success Criteria

- [ ] Recruiter can create a job with AI-generated questions in under 2 minutes
- [ ] Recruiter can add custom questions without leaving the wizard
- [ ] AI suggestions are contextually relevant and non-repetitive
- [ ] All fields are editable (no "locked" AI outputs)
- [ ] Premium animations make the experience feel polished
- [ ] No console errors or TypeScript warnings

---

## Notes

- **No LangChain/LangGraph needed**: Gemini's structured output is sufficient
- **State is simple**: Just a questions array in React state
- **Backend is stateless**: Each AI call is independent
- **Scalability**: This pattern works for 5 or 50 questions without code changes
