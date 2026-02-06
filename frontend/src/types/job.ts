export interface Question {
  id: string;
  text: string;
  ideal_answer: string;
  time_limit: number;
  weight: number;
}

export interface Job {
  id: string;
  recruiter_id: string;
  title: string;
  description: string;
  notes?: string;
  status: 'draft' | 'published' | 'closed';
  created_at: string;
  questions?: Question[];
}
