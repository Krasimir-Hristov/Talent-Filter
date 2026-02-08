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
            "status": "active",
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

    async def get_public_job_details(self, job_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetches job title and description for anyone (public).
        """
        response = (
            self.supabase.table("jobs")
            .select("id, title, description, status")
            .eq("id", job_id)
            .eq("status", "active")
            .execute()
        )
        return response.data[0] if response.data else None

    async def update_job(
        self, user_id: str, job_id: str, update_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Updates job info and replaces questions if provided.
        """
        try:
            # 1. Update Job basic info
            questions = update_data.pop("questions", None)

            if update_data:
                print(f"DEBUG: Updating job {job_id} with {update_data}")
                self.supabase.table("jobs").update(update_data).eq("id", job_id).eq(
                    "recruiter_id", user_id
                ).execute()

            # 2. Handle Questions if provided (Full Replace Pattern)
            if questions is not None:
                print(
                    f"DEBUG: Replacing questions for job {job_id}. Count: {len(questions)}"
                )
                # Delete old questions
                self.supabase.table("questions").delete().eq("job_id", job_id).execute()

                # Insert new ones
                if questions:
                    questions_payload = []
                    for idx, q in enumerate(questions):
                        is_dict = isinstance(q, dict)
                        raw_weight = (
                            q.get("weight", 1) if is_dict else getattr(q, "weight", 1)
                        )
                        # CLAMP WEIGHT: Ensure it's between 0 and 10 to satisfy DB constraint
                        safe_weight = max(
                            0, min(10, int(raw_weight if raw_weight is not None else 1))
                        )

                        questions_payload.append(
                            {
                                "job_id": job_id,
                                "text": q["text"] if is_dict else q.text,
                                "ideal_answer": (
                                    q["ideal_answer"] if is_dict else q.ideal_answer
                                ),
                                "time_limit": (
                                    q.get("time_limit", 120)
                                    if is_dict
                                    else getattr(q, "time_limit", 120)
                                ),
                                "weight": safe_weight,
                                "order_index": idx * 10,
                            }
                        )
                    print(f"DEBUG: Inserting {len(questions_payload)} new questions")
                    self.supabase.table("questions").insert(questions_payload).execute()

            return await self.get_job_by_id(user_id, job_id)
        except Exception as e:
            print(f"ERROR: JobService.update_job failed: {e}")
            raise e
