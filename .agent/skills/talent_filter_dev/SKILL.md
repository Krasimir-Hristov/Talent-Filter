---
name: TalentFilter Developer
description: Expert knowledge required to develop features for the TalentFilter SaaS platform, including architecture, security, and tech stack compliance.
---

# TalentFilter Development Skill

Use this skill whenever you are generating code, planning features, or debugging issues for the TalentFilter project. It contains the authoritative architectural decisions and patterns.

## 1. Technology Stack Compliance

### Frontend (User & Recruiter)

- **Framework**: Next.js 16.1.4+ (App Router). **CRITICAL**: Versions below 16.1.4 are vulnerable to RCE and Source Code Exposure (CVE-2025-66478, CVE-2025-55183). Always verify against the latest security advisories.
- **Styling**: Tailwind CSS + Shadcn/UI (Radix primitives). Use `clsx` and `tailwind-merge` for class manipulation.
- **State Management**:
  - **Zustand**: Use for client-side ephemeral state (Timer, Interview Phase, Tab Switching flags).
  - **TanStack Query**: Use for **ALL** server data fetching. No distinct `useEffect` data fetching.
- **Internationalization**: `next-intl` for EN/DE support.
- **Animations**: `framer-motion` for premium micro-interactions.
- **Icons**: Lucide React.

### Backend (API & AI)

- **Framework**: FastAPI (Python 3.10+). Fully async.
- **AI Integration**: Google Gemini API via `google-generativeai`.
  - **Safety**: NEVER call AI from the frontend. Always proxy via Backend `AIService`.
  - **Reliability**: Use JSON Mode for structured outputs.
- **Validation**: Pydantic V2 for all Request/Response models.

### Database & Auth

- **Service**: Supabase.
- **Auth**: Supabase Auth (handled via client/headers).
- **Security**: **Row Level Security (RLS)** is mandatory.
  - Recruiters: `auth.uid() = recruiter_id`
  - Candidates: NO direct DB access. All writes via Backend Service Role.

## 2. Architectural Patterns

### Frontend: Locale-Based Feature Structure

Organize code by business feature within the internationalization wrapper.

- **Routing**: Locale-based routing (`src/app/[locale]`).
- **Proxy**: `proxy.ts` (Next.js 16) for redirects and auth checks.
- **State**: Zustand for client state, TanStack Query for server state.
- **i18n**: All UI text must be in `messages/*.json`. Use `@/i18n/routing` for navigation.

```text
src/components/features/
  interview/       # Timer, Recorder, QuestionCard
  builder/         # JobForm, PromptEditor
```

### Backend: Layered Architecture

Strictly separate concerns.

1.  **Routers** (`app/api/`): Parse input, call service, return response.
2.  **Services** (`app/services/`): Business logic, AI calls, DB transactions.
3.  **Schemas** (`app/schemas/`): Pydantic models.
4.  **Models** (`app/models/`): Database/ORM definitions.

## 3. Security & Anti-Cheating Implementation

**CRITICAL**: This is a competitive screening tool.

1.  **Visibility Tracking**: Use the `visibilitychange` API as detailed in the `security` skill.
2.  **Input Lockdown**: Prevent Copy/Paste on answer fields via the `usePreventCopyPaste` hook.
3.  **Timers**: Trust the Backend timestamp. The frontend timer is just for UI.
4.  **Request Limiting**: All AI-heavy endpoints must implement rate limiting to control costs and prevent abuse.
5.  **Skill Reference**: Always refer to `.agent/skills/security/SKILL.md` for the full implementation details of these measures.

## 4. Development Workflow

1.  **Plan**: Check `ImplementationPlan.md` for current phase.
2.  **Simulate**: Before writing complex logic, briefly outline the component/service structure.
3.  **Implement**: Write clean, typed code (TypeScript/Python).
4.  **Verify**: Ensure RLS policies cover new tables.

## 5. Important References

- `docs/FRONTEND_ARCHITECTURE.md`: Detailed state management patterns.
- `docs/BACKEND_ARCHITECTURE.md`: API design and AI Engine specs.
- `ImplementationPlan.md`: The roadmap.
