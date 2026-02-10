import { CandidateResult } from '@/types/candidates';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const fetchJobCandidates = async (
  jobId: string,
  token: string,
): Promise<CandidateResult[]> => {
  const res = await fetch(`${API_URL}/jobs/${jobId}/candidates`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch candidates');
  return res.json();
};
