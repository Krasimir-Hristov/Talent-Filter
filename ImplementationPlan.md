# Implementation Plan: TalentFilter (QuickScreen)

This document outlines the step-by-step roadmap for building the MVP.

## Phase 1: Project Skeleton & Configuration

**Goal**: Establish the repository structure for the Monorepo (Frontend + Backend) and connect to cloud services.

- [x] **1.1. Monorepo Init**
  - Create root folder structure (`frontend`, `backend`).
  - Initialize Git repository.
  - Set up `.gitignore` for Python and Node.

- [x] **1.2. Backend (FastAPI) Setup**
  - Initialize poetry or pip requirements (`fastapi`, `uvicorn`, `pydantic`, `google-generativeai`, `supabase`).
  - Create `app/main.py` "Hello World".
  - Configure CORS to allow `localhost:3000`.

- [x] **1.3. Frontend (Next.js) Setup**
  - `npx create-next-app` (TypeScript, Tailwind, App Router).
  - Install dependencies: `zustand`, `@tanstack/react-query`, `lucide-react`, `clsx`, `tailwind-merge`.
  - Initialize Shadcn/UI (`npx shadcn-ui@latest init`).

- [x] **1.4. Supabase Setup**
  - Create new Supabase Project.
  - Run SQL script to create `profiles`, `jobs` tables.
  - Get API Keys (Publishable, Secret) and add to `.env` files in both frontend and backend.

## Phase 2: Core Backend & AI Engine

**Goal**: Enable the backend to generate questions from descriptions and create jobs.

- [x] **2.1. AI Service Implementation**
  - Create `AIService` class in `backend/app/services/ai.py`.
  - Implement `generate_questions(text: str)` using Gemini API.
  - Create Pydantic models for `Question` output to ensure strict JSON structure.

- [x] **2.2. Job Management API**
  - `POST /jobs/analyze`: Endpoint receiving text, calling AI, returning list of questions.
  - `POST /jobs/create`: Endpoint to save the confirmed Job + Questions to Supabase.

- [x] **2.3. Database Security**
  - Write RLS policies in Supabase: "Users can only select their own jobs".

## Phase 3: Recruiter Dashboard (Frontend)

**Goal**: Allow a recruiter to log in and create an automated interview.

- [ ] **3.1. Auth Implementation**
  - Set up Supabase Auth Helpers for Next.js.
  - Create Login Page (`/login`) and Protected Layout.

- [ ] **3.2. "Create Job" Flow**
  - Step 1: Input Job Description (Text Area).
  - Step 2: "Generating..." Loader (Call Backend API).
  - Step 3: Review Questions (Edit/Delete generated questions).
  - Step 4: Publish -> Get Unique Link.

## Phase 4: Candidate Experience (Interview Room)

**Goal**: The core value proposition - the automated interview.

- [ ] **4.1. Access Control**
  - Public route `/interview/[jobId]`.
  - Step 1: Candidate Registration (Name, Email, Phone).
  - Step 2: On submission, Backend creates `candidate` and `interview` records.
  - Step 3: Show "Welcome" screen.

- [ ] **4.2. Interview State Machine (Zustand)**
  - Store: `currentStep`, `timer`, `answers`.
  - Logic: Auto-advance when timer hits 0.

- [ ] **4.3. Anti-Cheat Hooks**
  - Implement `usePageVisibility` to detect tab switching.
  - Implement copy-paste blocker on `Textarea` components.

- [ ] **4.4. Submission**
  - `POST /interviews/submit` on completion.
  - Show "Thank you" screen.

## Phase 5: Analysis & Reporting

**Goal**: Show the results to the recruiter.

- [ ] **5.1. Auto-Grading Trigger**
  - On submission, Backend triggers `AIService.grade_interview()`.
  - Updates database record with `score` and `summary`.

- [ ] **5.2. Dashboard Results View**
  - List candidates who have completed an interview for a specific Job.
  - Detail View: Show parsed strengths/weaknesses, score, and contact info (Email, Phone).

## Phase 6: Polish & Deployment (MVP Release)

- [ ] **6.1. Deployment**
  - Frontend -> Vercel.
  - Backend -> Render (Dockerized or Python Environment).
- [ ] **6.2. Final Testing**
  - End-to-end flow test.
