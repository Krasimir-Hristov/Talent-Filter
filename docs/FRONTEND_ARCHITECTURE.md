# Frontend Architecture & Technical Specifications

## Overview

The frontend is built with **Next.js (App Router) (check the newst version to avoid security vulnerabilities)** to leverage server-side rendering for performance and SEO, combined with **Tailwind CSS** and **Shadcn/UI** for a premium, professional look. The application serves two distinct user groups: **Recruiters** (Dashboard) and **Candidates** (Interview Room).

## Core Technologies

- **Framework**: Next.js 16+ (App Router)
- **Styling**: Tailwind CSS v4, Shadcn/UI (Radix Primitives), Lucide React. Always follow the v4 syntax guidelines in `.agent/skills/design_system/SKILL.md`.
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Internationalization**: `next-intl` (Locale-based routing)
- **Forms**: React Hook Form + Zod

## Directory Structure

```text
src/
├── app/
│   ├── [locale]/            # Internationalized routes
│   │   ├── layout.tsx       # Locale-specific root layout
│   │   ├── dashboard/       # Recruiter Dashboard
│   │   └── auth/            # Login/Register pages
│   ├── layout.tsx           # Global root wrapper
│   └── globals.css          # Tailwind & global styles
├── i18n/
│   ├── routing.ts           # next-intl configuration
│   └── request.ts           # Loading localized messages
├── proxy.ts                 # Next.js 16 Proxy layer (replacing middleware)
├── components/
│   ├── ui/                  # Shadcn UI (atomic components)
│   └── features/            # Business-logic specific components
├── hooks/                   # Custom reusable hooks
├── messages/                # Translation JSON files (en, de)
└── lib/                     # Utils, constants, API client
```

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

## 2. Animations (Framer Motion)

We use Framer Motion for premium, non-distractive animations that enhance the user experience.

- **Micro-interactions**: Subtle hover effects, spring-based transitions for progress bars, and status indicators.
- **Layout Transitions**: `AnimatePresence` is used for smooth entry/exit of components, especially in the Interview Room and Dashboard widgets.
- **Principles**: Keep animations short (0.2s-0.3s) and purposeful. Avoid over-animating; focus on guiding the user's attention.

## 3. Data Flow (TanStack Query)

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
      interview/      # Candidate App (Registration & Interview Room)
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

## 6. Internationalization (i18n)

We use `next-intl` for robust, SEO-friendly multi-language support (English and German).

### Key Features:

1. **Locale-based Routing**: URLs include the locale prefix (e.g., `/en/dashboard`, `/de/dashboard`).
2. **Middleware Detection**: Automatically detects user preference and redirects to the correct locale.
3. **Type-Safe Routing**: Custom `Link` and `useRouter` hooks from `@/i18n/routing` ensure correct locale persistence.
4. **Server & Client Support**: Translations work in both Server and Client Components.

### Usage:

- **Server Components**: Use `await getMessages()` and `NextIntlClientProvider` in layouts.
- **Client Components**: Use the `useTranslations` hook.
- **Navigation**: Always use `@/i18n/routing` instead of `next/link`.
