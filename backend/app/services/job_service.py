from typing import List, Dict, Any, Optional
import uuid
from supabase import Client
from app.schemas.jobs import JobCreateRequest


class JobService:
    def __init__(self, supabase: Client):
        self.supabase = supabase

    async def create_job(
        self, user_id: str, job_data: JobCreateRequest
    ) -> Dict[str, Any]:
        # 1. Create the Job
        job_payload = {
            "recruiter_id": user_id,
            "title": job_data.title,
            "description": job_data.description,
            "notes": job_data.notes,  # Added notes
            "status": "published",
        }

        # Using .execute() directly as supabase-py handles async differently depending on version,
        # but standard client is often synchronous wrapper. We wrap logic here.
        job_response = self.supabase.table("jobs").insert(job_payload).execute()

        if not job_response.data:
            raise Exception("Failed to create job record")

        new_job = job_response.data[0]
        job_id = new_job["id"]

        # 2. Create the Questions (Bulk Insert)
        questions_payload = []
        for idx, q in enumerate(job_data.questions):
            questions_payload.append(
                {
                    "job_id": job_id,
                    "text": q.text,
                    "ideal_answer": q.ideal_answer,
                    "time_limit": q.time_limit,
                    "weight": q.weight,
                    "order_index": idx
                    * 10,  # Store order with gaps for future insertions
                }
            )

        if questions_payload:
            self.supabase.table("questions").insert(questions_payload).execute()

        return new_job

    async def get_recruiter_jobs(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Fetches all jobs for a recruiter, including their associated questions.
        """
        response = (
            self.supabase.table("jobs")
            .select("*, questions(*)")
            .eq("recruiter_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        return response.data

    async def get_job_by_id(
        self, user_id: str, job_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Fetches a single job by ID, including its associated questions.
        Ensures the job belongs to the requesting recruiter.
        """
        response = (
            self.supabase.table("jobs")
            .select("*, questions(*)")
            .eq("id", job_id)
            .eq("recruiter_id", user_id)
            .execute()
        )
        return response.data[0] if response.data else None
