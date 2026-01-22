---
name: TalentFilter Developer
description: Expert knowledge required to develop features for the TalentFilter SaaS platform, including architecture, security, and tech stack compliance.
---

# TalentFilter Development Skill

Use this skill whenever you are generating code, planning features, or debugging issues for the TalentFilter project. It contains the authoritative architectural decisions and patterns.

## 1. Technology Stack Compliance

### Frontend (User & Recruiter)

- **Framework**: Next.js 16+ (App Router). Always check for security updates.
- **Styling**: Tailwind CSS + Shadcn/UI (Radix primitives). Use `clsx` and `tailwind-merge` for class manipulation.
- **State Management**:
  - **Zustand**: Use for client-side ephemeral state (Timer, Interview Phase, Tab Switching flags).
  - **TanStack Query**: Use for **ALL** server data fetching. No distinct `useEffect` data fetching.
- **Internationalization**: `next-intl` for EN/DE support.
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

### Frontend: Feature-Based Structure

Organize code by business feature, not just technical role.

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

1.  **Visibility Tracking**: Use the `visibilitychange` API. If `document.hidden` is true, increment a `tab_switches` counter.
2.  **Input Lockdown**: Prevent Copy/Paste on answer fields.
3.  **Timers**: Trust the Backend timestamp. The frontend timer is just for UI. Validate `submission_time - start_time` on the server.

## 4. Development Workflow

1.  **Plan**: Check `ImplementationPlan.md` for current phase.
2.  **Simulate**: Before writing complex logic, briefly outline the component/service structure.
3.  **Implement**: Write clean, typed code (TypeScript/Python).
4.  **Verify**: Ensure RLS policies cover new tables.

## 5. Important References

- `docs/FRONTEND_ARCHITECTURE.md`: Detailed state management patterns.
- `docs/BACKEND_ARCHITECTURE.md`: API design and AI Engine specs.
- `ImplementationPlan.md`: The roadmap.
