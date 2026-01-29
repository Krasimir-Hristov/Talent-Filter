---
name: TalentFilter Security & Integrity
description: Comprehensive security standards for TalentFilter, including anti-cheating, request limiting, and application-level protection.
---

# TalentFilter Security & Integrity Skill

This skill provides the authoritative security guidelines for the TalentFilter platform. It covers everything from preventing candidate cheating to protecting the platform against abuse and hacking.

## 1. Anti-Cheating Implementation (Candidate Side)

To ensure the integrity of the screening process, all candidate interfaces must implement these measures:

- **Visibility Monitoring**:
  - Use the `visibilitychange` API to track if a candidate switches tabs or minimizes the browser.
  - **Action**: Increment a `tab_switches` counter in the `useInterviewStore`. If a pre-defined threshold is reached, notify the recruiter via a flag in the database.
- **Input Lockdown**:
  - Ensure all answer `Textarea` components are wrapped in the `usePreventCopyPaste` hook.
  - **Action**: Prevent `copy`, `paste`, and `cut` events to ensure candidates type their own responses.
- **Backend Time Validation**:
  - Never trust the client-side timer for final submission logic.
  - **Action**: The backend must calculate the interview duration as `submission_time - start_time` and flag any discrepancies.

## 2. Request Limits & API Throttling (Cost & Abuse Prevention)

To prevent budget overruns from AI usage and protect the platform from bot abuse:

- **Endpoint Throttling**:
  - Implement rate limiting (e.g., using `slowapi` or similar) on all AI-heavy endpoints:
    - `POST /jobs/analyze`
    - `POST /interviews/submit`
- **Session-Based Capping**:
  - Limit the number of job analysis requests a single recruiter can make within a 24-hour period.
  - Limit the number of interview submission attempts per candidate token.
- **AI Token Management**:
  - Centralize all AI calls through the `AIService` and log token usage per recruiter/job to monitor costs and prevent spikes.

## 3. Application Security (Hacking Prevention)

Protect the platform against common web vulnerabilities:

- **Input Sanitization**:
  - All user inputs must be validated using Pydantic (Backend) and Zod (Frontend) to prevent injection attacks (SQL, XSS).
- **Secure File Handling**:
  - If any file uploads are implemented (e.g., CVs), strictly validate file types and sizes. Scan for malware before processing.
- **Framework Monitoring**:
  - Actively monitor security advisories for Next.js (especially router-level vulnerabilities) and FastAPI.
  - **Action**: Always prioritize the latest stable versions (e.g., Next.js 15+ with the latest patches) and verify implementation against current official security documentation.
- **Environment Integrity**:
  - Keep Next.js and FastAPI dependencies updated to the latest stable versions to mitigate known CVEs.
  - Use CORS to restrict backend access to the authorized frontend domain.
- **Secure Routing & Bypass Prevention (Next.js 15/16)**:
  - **The "Bypass" Risk**: Do not rely strictly on `middleware.ts` for route protection due to potential bypasses (e.g., CVE-2025-29927).
  - **Strategy**: Implement protection in **Server-Side Layouts**. Check for authentication (via HTTP-Only cookies) directly in `layout.tsx`. If unauthorized, use `redirect()` before any HTML is sent to the client.
  - **Session Storage**: Use `HTTP-Only` cookies for the primary authentication token (`tf_session`). This prevents XSS access to the token and allows the server to validate requests without client-side hydration.

## 4. Secure Data Access & RLS

- **Strict Isolation**:
  - **Recruiters**: Mandatory RLS policy: `auth.uid() = recruiter_id`. They must never be able to see another recruiter's data.
  - **Candidates**: Zero-Trust access. No candidate should have direct access to Supabase tables. All interactions must be proxied via the FastAPI backend using `service_role` keys.
- **Response Scrubbing**:
  - Public-facing endpoints (e.g., `/session/{token}`) must explicitly exclude sensitive data like `ideal_answer` or `scoring_criteria`.

## 5. Security Workflow

1. **Verify**: Before deploying any new feature, verify that RLS policies are in place.
2. **Audit**: Regularly audit AI usage logs to identify potential abuse.
3. **Throttling**: Ensure all new public-facing endpoints have appropriate rate limits.
