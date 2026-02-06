import { apiFetch } from './api';
import { Job } from '@/types/job';

export async function getJobs(): Promise<Job[]> {
  return apiFetch<Job[]>('/jobs/');
}

export async function getJobById(id: string): Promise<Job> {
  return apiFetch<Job>(`/jobs/${id}`);
}
