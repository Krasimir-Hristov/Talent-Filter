---
name: Supabase & State Synchronization
description: expert patterns for managing server-side data with Supabase and TanStack Query, and client-side state with Zustand.
---

# Supabase & State Synchronization Skill

This skill ensures reliable data flow and state management across the Monorepo.

## 1. Supabase Integration (Backend & Frontend)

- **Type Safety**: Use the Supabase CLI to generate TypeScript types from the database schema. Import these types into the frontend for generic `SupabaseClient` usage.
- **Client Management**:
  - **Frontend**: Use the `@supabase/auth-helpers-nextjs` (or newest equivalent) for unified auth/client management in SSR and CSR.
  - **Backend**: Use `supabase-py` with the `service_role` key for administrative tasks (like writing interview results) and proper RLS context for recruiter tasks.

## 2. Data Fetching (TanStack Query)

- **The Gold Rule**: **NEVER** use `useEffect` for data fetching. Use `useQuery` or `useMutation`.
- **Query Keys**: Standardize query keys in a central file (`src/lib/api/query-keys.ts`) to avoid typos and ensure efficient cache invalidation.
- **Automatic Invalidation**: Ensure that mutations (e.g., `createJob`) automatically call `queryClient.invalidateQueries` for the relevant list or detail view.

## 3. Global State (Zustand)

- **Persistence**: Only use Zustand for ephemeral state (current interview question, tab switch flags, UI toggles).
- **Strict Actions**: Always define state and actions separately within the store to maintain a clean API.
- **Selectors**: Always use selectors (`const value = useStore(state => state.value)`) to avoid unnecessary re-renders when other parts of the store change.

## 4. Error Handling & Loading

- **Generic Wrappers**: Use consistent `Loading` and `Error` boundary components across the application.
- **Pessimistic vs. Optimistic**:
  - Use **Optimistic Updates** for rapid interactions (e.g., deleting a draft job).
  - Use **Pessimistic Updates** for high-integrity actions (e.g., submitting a final interview) to ensure server confirmation before updating the UI.

## 5. Security Context

- **Middleware Validation**: Ensure Next.js middleware checks for active Supabase sessions before allowing access to `/dashboard`.
- **Sanitization**: On the backend, always validate that `auth.uid()` matches the `recruiter_id` of the record being modified, even if RLS is also in place (defense in depth).
