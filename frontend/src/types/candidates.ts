export interface CandidateResult {
  candidate_id: string;
  interview_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  end_time: string | null;
  total_time_spent: number;
  paste_count: number;
  tab_switches: number;
  ai_score: number | null;
}
