from typing import Dict, Any, Optional
from supabase import Client
from fastapi import HTTPException, status


class InterviewService:
    """
    Handles candidate registration and interview session management.
    Uses the Service Role client since candidates are anonymous (no Supabase Auth).
    """

    def __init__(self, supabase: Client):
        self.supabase = supabase

    async def check_candidate_exists(self, job_id: str, email: str) -> bool:
        """Check if a candidate with this email already applied for this job."""
        response = (
            self.supabase.table("candidates")
            .select("id")
            .eq("job_id", job_id)
            .eq("email", email)
            .execute()
        )
        return len(response.data) > 0

    async def get_job_for_interview(self, job_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetch job details needed for interview session creation.
        Returns job + question count. Only returns ACTIVE jobs.
        """
        response = (
            self.supabase.table("jobs")
            .select("id, title, description, status, questions(id)")
            .eq("id", job_id)
            .execute()
        )

        if not response.data:
            return None

        job = response.data[0]

        # Only allow active jobs
        if job.get("status") != "active":
            return None

        return job

    async def start_session(
        self,
        job_id: str,
        first_name: str,
        last_name: str,
        email: str,
        phone: str,
    ) -> Dict[str, Any]:
        """
        Register a candidate and create an interview session.

        Flow:
        1. Verify job exists and is ACTIVE
        2. Check email uniqueness for this job
        3. Create candidate record
        4. Create interview session
        5. Return session data
        """

        # 1. Verify Job
        job = await self.get_job_for_interview(job_id)
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found or no longer accepting applications.",
            )

        # 2. Check uniqueness
        already_applied = await self.check_candidate_exists(job_id, email)
        if already_applied:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You have already applied for this position with this email address.",
            )

        # 3. Create Candidate
        candidate_payload = {
            "job_id": job_id,
            "first_name": first_name.strip(),
            "last_name": last_name.strip(),
            "email": email.lower().strip(),
            "phone": phone.strip(),
        }

        candidate_response = (
            self.supabase.table("candidates").insert(candidate_payload).execute()
        )

        if not candidate_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to register candidate.",
            )

        candidate = candidate_response.data[0]

        # 4. Create Interview Session
        interview_payload = {
            "candidate_id": candidate["id"],
            "job_id": job_id,
            "status": "in_progress",
        }

        interview_response = (
            self.supabase.table("interviews").insert(interview_payload).execute()
        )

        if not interview_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create interview session.",
            )

        interview = interview_response.data[0]

        # 5. Return session data
        questions = job.get("questions", [])
        return {
            "interview_id": interview["id"],
            "candidate_id": candidate["id"],
            "job_id": job_id,
            "job_title": job["title"],
            "total_questions": len(questions),
            "start_time": interview["start_time"],
        }
