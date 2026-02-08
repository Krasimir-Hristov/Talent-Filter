import { apiFetch } from './api';
import { Job } from '@/types/job';

export async function getJobs(): Promise<Job[]> {
  return apiFetch<Job[]>('/jobs/');
}

export async function getJobById(id: string): Promise<Job> {
  return apiFetch<Job>(`/jobs/${id}/`);
}

export async function getPublicJobDetails(id: string): Promise<Job> {
  return apiFetch<Job>(`/jobs/public/${id}`);
}

export async function deleteJob(id: string): Promise<void> {
  return apiFetch<void>(`/jobs/${id}/`, {
    method: 'DELETE',
  });
}

export async function updateJob(
  id: string,
  data: {
    title?: string;
    description?: string;
    notes?: string;
    status?: string;
    questions?: any[];
  },
): Promise<Job> {
  return apiFetch<Job>(`/jobs/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function refineJob(data: {
  description: string;
  notes?: string;
  locale: string;
}): Promise<{ refined_description: string; refined_title: string }> {
  return apiFetch<{ refined_description: string; refined_title: string }>(
    '/jobs/refine/',
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  );
}

export async function suggestQuestion(data: {
  job_title: string;
  job_description: string;
  current_questions: string[];
  notes?: string;
  locale: string;
}): Promise<any> {
  return apiFetch<any>('/jobs/suggest-question/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function generateAnswer(data: {
  job_title: string;
  job_description: string;
  question_text: string;
  locale?: string;
}): Promise<{ ideal_answer: string }> {
  return apiFetch<{ ideal_answer: string }>('/jobs/generate-answer/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
