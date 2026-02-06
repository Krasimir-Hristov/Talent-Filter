import { apiFetch } from './api';
import { Job } from '@/types/job';

export async function getJobs(): Promise<Job[]> {
  return apiFetch<Job[]>('/jobs/');
}

export async function getJobById(id: string): Promise<Job> {
  return apiFetch<Job>(`/jobs/${id}`);
}

export async function deleteJob(id: string): Promise<void> {
  return apiFetch<void>(`/jobs/${id}`, {
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
  },
): Promise<Job> {
  return apiFetch<Job>(`/jobs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
