# Implementation Plan: TalentFilter (QuickScreen)

This document outlines the step-by-step roadmap for building the MVP.

## Phase 1: Project Skeleton & Configuration

**Goal**: Establish the repository structure for the Monorepo (Frontend + Backend) and connect to cloud services.

- [x] **1.1. Monorepo Init**
  - Create root folder structure (`frontend`, `backend`).
  - Initialize Git repository.
  - Set up `.gitignore` for Python and Node.

- [x] **1.2. Backend (FastAPI) Setup**
  - Initialize poetry or pip requirements (`fastapi`, `uvicorn`, `pydantic`, `google-genai`, `supabase`).
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
  - Implement `generate_questions(text: str)` using Gemini 2.5 Flash API.
  - Create Pydantic models for `Question` output to ensure strict JSON structure.

- [x] **2.2. Job Management API**
  - `POST /jobs/analyze`: Endpoint receiving text, calling AI, returning list of questions.
  - `POST /jobs/create`: Endpoint to save the confirmed Job + Questions to Supabase.

- [x] **2.3. Database Security**
  - Write RLS policies in Supabase: "Users can only select their own jobs".

## Phase 3: Recruiter Dashboard (Frontend)

**Goal**: Allow a recruiter to log in and create an automated interview.

- [x] **Phase 3: Frontend Development (Next.js)**
  - [x] **3.1. Branding & Global Styling**
    - Configure Tailwind colors (Midnight & Indigo).
    - Set up fonts (Plus Jakarta Sans & Inter).
    - Configure Dark Mode via `next-themes`.
    - Install and configure `framer-motion` for animations.
  - [x] **3.2. Layout & Sidebar Setup**
    - Install Shadcn Sidebar (via CLI).
    - Create responsive Dashboard Layout.
    - Set up Lucide icons (strokeWidth: 1.5).
  - [x] **3.3. Internationalization (i18n) Setup**
    - Configure `next-intl` with locale-based routing.
    - Setup English and German translation files.
    - Configure `proxy.ts` (consistent with Next.js 15 prefix approach).
  - [x] **3.4. Landing Page Development**
    - Create a premium "Midnight & Indigo" hero section.
    - Implement CTA buttons for Login and Register.
    - Add localized copy (EN/DE).
  - [x] **3.5. Authentication UI**
    - Design Login page (Glassmorphism).
    - Design Register page.
  - [x] **3.6. Auth Logic & Integration (The Secure Path)**
    - Implement `tf_session` HTTP-Only cookies for secure session management.
    - Implement **Server-Side Route Protection** in `layout.tsx` to prevent Middleware bypass (CVE-2025-29927).
    - Set up Zustand Auth Store for client-side state sync.
    - Connect Login/Register to FastAPI endpoints + Cookie synchronization.
  - [ ] **3.7. Job Creation Wizard (Unified Hybrid AI Wizard)**
    - [x] **3.7.1. Unified Input Interface**
      - Single entry point: Title, Description, and optional "Notes/Context" field (Implemented with Zustand).
      - Remove "Manual vs AI" fork; all jobs start with AI generation.
    - [x] **3.7.2. Smart Card Generation**
      - AI returns structured JSON (title, questions with text/ideal_answer/time_limit/weight).
      - Frontend dynamically renders `QuestionCard` components based on API response.
    - [x] **3.7.3. Real-Time AI Assistance**
      - [x] **Suggest Question**: Context-aware generation (description + existing questions + language).
      - [x] **Generate Answer**: Auto-fill `ideal_answer` based on question text and job context.
      - [x] **Multi-Language Support**: All AI outputs match the requested `locale`.
      - [x] **Smart Depth**: AI determines the optimal number of questions.
    - [x] **3.7.4. Hybrid Refinement**
      - [x] Full manual editing: recruiter can modify any field via Zustand actions.
      - [x] Add/remove/update questions functionality.
      - [x] Store reset on unmount to prevent stale data.
    - [x] **3.7.5. Final Save to Supabase**
      - [x] Validate required fields (Title, Description).
      - [x] POST to `/jobs/create` with complete payload.
      - [x] Success/Error toast notifications and redirection.
  - [x] **3.9. Job Details View (`/dashboard/jobs/[id]`)**
    - [x] Full Localization (EN/DE).

- [x] **3.10. Robust Authentication & Session Management**
  - [x] Implemented native Next.js `unauthorized()` pattern with `authInterrupts` for secure token expiration handling.
  - [x] Created `unauthorized.tsx` custom handler for clean session reset and redirection to Login.
  - [x] Simplified Job Status system (Active / Closed) for better UX and data integrity.
  - [x] Migrated existing Supabase data to the new status schema with updated CHECK constraints.

## Phase 4: Candidate Experience (The Automated Interview)

**Goal**: A secure, "one-way" interview process that handles interruptions gracefully but prevents cheating.

- [x] **4.1. Database Schema & Security Foundation**
  - [x] **4.1.1. Create `candidates` Table**
    - Fields: `id`, `job_id`, `first_name`, `last_name`, `email`, `phone` (optional), `created_at`.
    - **Constraint**: Unique constraint on (`job_id`, `email`) AND (`job_id`, `phone`) to prevent duplicate applications.
  - [x] **4.1.2. Create `interviews` Table (Session Tracking)**
    - Fields: `id`, `candidate_id`, `job_id`, `status` (in_progress, completed, abandoned), `start_time`, `end_time`.
    - **Logic**: Tracks the _actual_ start time to calculate the "running clock" regardless of browser restarts.
  - [x] **4.1.3. Create `interview_answers` Table**
    - Fields: `interview_id`, `question_id`, `answer_text`, `time_spent_seconds`.
    - **Integrity Flags**: `paste_count` (integer), `tab_switches` (integer), `off_screen_seconds` (integer).

- [x] **4.2. Public Interview Access (The Link)**
  - [x] **4.2.1. Route Setup**: create `/interview/[jobId]` (Public).
  - [x] **4.2.2. Landing Screen**: Fetch Job Title/Description. Show **Interview Rules** (Timers, Auto-submit, No-back).
  - [x] **4.2.3. Rate Limiting**: Implement backend-level rate limiting (IP-based).
  - [x] **4.2.4. Internationalization**: Added Language Switcher (EN/DE).

- [x] **4.3. Registration & Immediate Start**
  - [x] **4.3.1. Registration Form**: Name, Email, Phone (Required). Shown immediately after landing CTA.
  - [x] **4.3.2. Uniqueness Check**: Verify if `email` or `phone` exists for this `job_id`.
  - [x] **4.3.3. Create Candidate & Interview**: Insert records and redirect to the interview session.
  - [x] **4.3.4. Closed Status Handling**: If job status is `closed`, show "Position Filled" banner.

- [ ] **4.4. The Interview Flow (One-Way Ticket)**
  - [ ] **4.4.1. "Lobby" / Instructions**: Clear rules before start:
    - Individual timers per question.
    - Auto-submission on timeout.
    - No going back (one-way flow).
  - [ ] **4.4.2. Question View & Timer**:
    - Fetch current question with its specific `time_limit`.
    - **Server-Sync Timer**: Calculate remaining time based on `server_start_time`.
    - Auto-forward logic when timer hits zero.
  - [ ] **4.4.3. Answer Submission**:
    - Silent integrity tracking (paste detection, tab switching) — _No UI indicators_.
    - Mark question as "completed" in DB.

- [ ] **4.5. Anti-Cheat & Integrity Mechanisms (Stealth Mode)**
  - [ ] **4.5.1. Massive Insert Detection**: Silent flag in `interview_answers`.
  - [ ] **4.5.2. Focus Tracking**: Silent `tab_switches` increment.
  - [ ] **4.5.3. UI Hardening**: Disable context menu/copy-paste on question text.

- [ ] **4.6. Recruitment Intelligence (Prep)**
  - [ ] Candidate Table (sortable) - _Pending Implementation_. (Moved from Phase 3)

## Phase 5: AI Grading & Recruiter Insights

**Goal**: Transform raw answers into actionable hiring data.

- [ ] **5.1. Automated Grading Engine**
  - `POST /interviews/submit` triggers `AIService.grade_interview()`.
  - Compare candidate answer against `ideal_answer` using semantic similarity.
  - Output: Score (0-100), Summary of strengths/gaps.

- [ ] **5.2. Recruiter Intelligence View**
  - Candidate table with status (Pending, Completed, Flagged).
  - PDF/Summary Export for sharing with hiring managers.
  - Localized feedback for global teams.

## Phase 6: Polish, Performance & Deployment

- [ ] **6.1. Deployment Strategy**
  - Frontend -> Vercel (Production environment).
  - Backend -> Dockerized deployment on Fly.io or Render.
  - Supabase Database Migrations verification.

- [ ] **6.2. Quality Assurance**
  - End-to-end testing of the Candidate -> AI -> Recruiter loop.
  - Stress test for concurrent interview sessions.
