import { InterviewStartPayload, InterviewSession } from '@/types/interview';

const API_BASE_URL =
  typeof window === 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1'
    : '/api/v1';

/**
 * Start an interview session by registering a candidate.
 * This is a PUBLIC endpoint (no auth cookie needed).
 *
 * Unlike apiFetch, this does NOT call unauthorized() on 401
 * because candidates are anonymous users.
 */
export async function startInterviewSession(
  data: InterviewStartPayload,
): Promise<InterviewSession> {
  const response = await fetch(`${API_BASE_URL}/interviews/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: any = new Error(
      errorData.detail || `Registration failed: ${response.statusText}`,
    );
    error.status = response.status;
    throw error;
  }

  return response.json();
}
