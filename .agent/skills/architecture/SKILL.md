---
name: TalentFilter Architecture & Scalability
description: Master architectural patterns for both Frontend (Next.js) and Backend (FastAPI), ensuring a clean, modular, and testable codebase.
---

# TalentFilter Architecture & Scalability Skill

This skill governs the structural integrity of the TalentFilter monorepo. It ensures that the project remains manageable as it grows from MVP to a full SaaS platform.

## 1. Frontend Architecture (Feature-Sliced Design Lite)

To avoid a "component junk drawer," we organize the `src` directory by feature.

### Directory Structure:

- `src/app/`: Next.js App Router (pages and layouts only).
- `src/features/`: The core of the application logic. Each feature (e.g., `interview-room`, `job-builder`, `dashboard-stats`) contains:
  - `/components`: Feature-specific UI components.
  - `/hooks`: Custom React hooks for this feature.
  - `/services`: API call abstractions.
  - `/types`: TypeScript definitions.
  - `/store`: If it needs a dedicated Zustand slice.
- `src/components/ui/`: Shared Shadcn primitives.
- `src/lib/`: Shared utilities, API clients (Axios/Supabase), and global constants.

## 2. Backend Architecture (Layered FastAPI)

The backend follows a strict separation of concerns to ensure business logic is decoupled from the API layer.

### Directory Structure:

- `app/api/v1/`: **Routers**. Only handle request parsing, calling services, and returning responses. No business logic here.
- `app/services/`: **Business Logic**. The "Service Layer." This is where AI calls, complex calculations, and multi-table transactions happen.
- `app/repositories/`: **Data Access**. Direct database interactions using the Supabase client.
- `app/schemas/`: **Pydantic Models**. Request/Response validation.
- `app/models/`: **DB Entities**. Internal representations if needed (SQLModel/SQLAlchemy).
- `app/core/`: Security, config, and global dependencies.

## 3. Dependency Injection (DI)

- **Backend**: Use FastAPI's `Depends` for passing the database client or the `AIService` into routers. This makes testing and mocking easier.
- **Frontend**: Centralize API clients in `src/lib/api`. Use TanStack Query hooks as the primary way to "inject" server data into components.

## 4. Naming Conventions

- **Frontend**:
  - Components: `PascalCase.tsx` (e.g., `QuestionCard.tsx`).
  - Hooks: `camelCase.ts` (e.g., `useTimer.ts`).
  - Feature folders: `kebab-case`.
- **Backend**:
  - Files: `snake_case.py`.
  - Classes: `PascalCase`.
  - Functions: `snake_case`.

## 5. Scalability Principles

- **DRY (Don't Repeat Yourself)**: If a piece of logic (like score calculation) is used in multiple places, it MUST live in a service.
- **Single Responsibility**: Each component/function should do one thing well.
- **Async First**: All I/O operations (DB, AI, Webhooks) must be `async/await` to maximize FastAPI's performance.
