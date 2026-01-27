from supabase import Client
from app.schemas.jobs import JobCreateRequest
from typing import List, Dict, Any
import uuid


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
        for q in job_data.questions:
            questions_payload.append(
                {
                    "job_id": job_id,
                    "text": q.text,
                    "ideal_answer": q.ideal_answer,
                    "time_limit": q.time_limit,
                    "weight": q.weight,
                }
            )

        if questions_payload:
            self.supabase.table("questions").insert(questions_payload).execute()

        return new_job
