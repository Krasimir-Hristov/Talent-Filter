export interface InterviewStartPayload {
  job_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export interface InterviewSession {
  interview_id: string;
  candidate_id: string;
  job_id: string;
  job_title: string;
  total_questions: number;
  start_time: string;
}
