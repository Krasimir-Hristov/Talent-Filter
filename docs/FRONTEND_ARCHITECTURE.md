# Frontend Architecture & Technical Specifications

## Overview

The frontend is built with **Next.js (App Router) (check the newst version to avoid security vulnerabilities)** to leverage server-side rendering for performance and SEO, combined with **Tailwind CSS** and **Shadcn/UI** for a premium, professional look. The application serves two distinct user groups: **Recruiters** (Dashboard) and **Candidates** (Interview Room).

## Core Technologies

- **Framework**: Next.js 16+ (App Router)
- **Styling**: Tailwind CSS, Shadcn/UI (Radix Primitives), Lucide React
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Internationalization**: next-intl
- **Forms**: React Hook Form + Zod

## 1. State Management (Zustand)

We use Zustand for global client-side state that doesn't need to persist in the URL or server cache.

### `useInterviewStore`

Manages the active state of a candidate's interview session.

```typescript
interface InterviewState {
  currentPhase: 'instruction' | 'interview' | 'completed';
  currentQuestionIndex: number;
  answers: Record<string, string>; // questionId -> answer
  timeLeft: number; // Seconds remaining for current question/phase
  flags: {
    tabSwitches: number;
    copyPasteAttempts: number;
  };
  actions: {
    startInterview: () => void;
    submitAnswer: (questionId: string, answer: string) => void;
    tickTimer: () => void;
    recordViolation: (type: 'tab' | 'paste') => void;
  };
}
```

### `useUIStore`

Manages transient UI states like sidebar expansion, active modals, and theme preferences.

## 2. Data Flow (TanStack Query)

Server state is managed exclusively by React Query to ensure synchronization and efficient caching.

- **Queries**:
  - `useJobQuery`: Fetches job details and questions (Candidate View).
  - `useCandidatesQuery`: Fetches list of candidates for a job (Recruiter View).
- **Mutations**:
  - `useCreateJobMutation`: Sends Job Description to Backend -> Trigger AI generation.
  - `useSubmitInterviewMutation`: Batches answers or sends final submission to Backend.

### Optimistic Updates

For the Recruiter Dashboard, when marking a candidate as "Reviewed" or "Rejected", the UI updates immediately before the API confirms, providing a snappy experience.

## 3. Anti-Cheating & Security Implementation

The candidate interface enforces strict environment controls.

### Visibility API (Tab Switching)

A custom hook `usePageVisibility` listens for `document.visibilitychange`.

- **Logic**: If `document.hidden` becomes true, increment `tabSwitches` in the store.
- **Consequence**: If switches > limit, warn the user or flag the interview for the recruiter.

### Copy-Paste Blocking

A custom hook `usePreventCopyPaste` attaches event listeners to text areas.

- **Events**: `onPaste`, `onCopy`, `onCut`.
- **Action**: `e.preventDefault()` and trigger a toast warning.

### Time Enforcement

- **Client-side**: Zustand timer decrements every second. When 0, automatically move to next question or submit.
- **Server-side**: The backend validates the timestamp of submission vs. start time to ensure the candidate didn't manipulate the client timer.

## 4. Internationalization (i18n)

Using `next-intl`.

- **Routing**: `/[locale]/dashboard/...`
- **Middleware**: Detects browser language or cookie.
- **Structure**:
  - `messages/en.json`
  - `messages/de.json`

## 5. Folder Structure (Feature-based)

```
src/
  app/
    [locale]/
      dashboard/      # Recruiter App
      interview/      # Candidate App
  components/
    ui/               # Shadcn primitives
    features/
      interview/      # Interview-specific components (Timer, Recorder)
      builder/        # Job Builder components
  lib/
    api/              # Axios/Fetch clients
    hooks/            # Custom hooks
    store/            # Zustand stores
```
