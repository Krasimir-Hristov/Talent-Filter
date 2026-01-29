export interface Job {
  id: string;
  recruiter_id: string;
  title: string;
  description: string;
  status: 'draft' | 'published' | 'closed';
  created_at: string;
}
