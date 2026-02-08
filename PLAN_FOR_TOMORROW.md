# Plan for Next Session: Candidate Experience & Interview Flow

This document outlines the tasks for our next development session, focusing on the Candidate's journey from registration to interview completion.

## 1. Candidate Registration & Session Start

**Goal**: Allow candidates to register for a specific job and start their interview session.

- [ ] **1.1. Create Registration Page (`/interview/[jobId]/apply`)**
  - Design a simple, clean form (Name, Email, Phone - Optional).
  - Use server-side validation for inputs.
  - Check if candidate already applied for this `jobId` (prevent duplicates).

- [ ] **1.2. Backend Logic for Session Start**
  - Implement `POST /api/v1/interviews/start`.
  - Create `Candidate` record in Supabase.
  - Create `Interview` record (status: `in_progress`, start_time: `now()`).
  - Return `interviewId` and redirect to the first question.

## 2. Active Interview Interface (The "Exam" Mode)

**Goal**: A secure, focused environment for answering questions.

- [ ] **2.1. Question View Component**
  - Fetch only the _current_ pending question (do not expose all questions to client).
  - Display question text clearly.
  - Rich Text Editor or simple Text Area for answers.

- [ ] **2.2. Robust Timer Implementation**
  - Server-side start time tracking (to prevent client-side manipulation).
  - Client-side countdown visualization.
  - Auto-submit logic when time expires.
  - Handling page refreshes (timer should continue from correct server time).

- [ ] **2.3. Anti-Cheating Features**
  - **Tab Focus Tracking**: Detect when candidate leaves the tab/window. Count `tab_switches`.
  - **Copy/Paste Prevention**: Disable paste events on the answer input (or flag them).
  - **Right-Click Block**: Prevent context menu on question text.

## 3. Answer Submission & Progression

**Goal**: reliably save answers and move to the next step.

- [ ] **3.1. Submission Logic**
  - `POST /api/v1/interviews/[interviewId]/answer`.
  - Save answer text and integrity metadata (time spent, paste count, tab switches).
  - Mark question as completed.
  - Fetch next question or trigger "Interview Completed" state.

- [ ] **3.2. Completion Screen**
  - "Thank you" page after final question.
  - Explanation of next steps.

## 4. Backend AI Integration (If time permits)

- [ ] **4.1. Auto-Grading Trigger**
  - Upon interview completion, trigger background job to grade answers with Gemini AI.
  - Store score and feedback in `interviews` table.
