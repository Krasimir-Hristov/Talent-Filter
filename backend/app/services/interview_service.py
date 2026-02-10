from typing import Dict, Any, Optional, List
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

    async def _get_sorted_questions(self, job_id: str) -> List[Dict[str, Any]]:
        """
        Helper to fetch and sort questions for a job.
        Sorting logic:
        1. Timed questions come first (time_limit > 0)
        2. Untimed questions come last (time_limit == 0)
        3. Secondary sort by order_index
        """
        response = (
            self.supabase.table("questions")
            .select("id, text, time_limit, order_index")
            .eq("job_id", job_id)
            .order("order_index")
            .execute()
        )

        questions = response.data or []

        # Sort: untimed (0) goes to the end (key=1), timed goes first (key=0)
        return sorted(
            questions,
            key=lambda q: (
                1 if q.get("time_limit", 0) == 0 else 0,
                q.get("order_index", 0),
            ),
        )

    # ========================================================================
    # SESSION: Fetch questions for an active interview
    # ========================================================================

    async def get_session_questions(self, interview_id: str) -> Dict[str, Any]:
        """
        Fetch the questions for an active interview session.

        SECURITY:
        - Only returns questions if the interview status is 'in_progress'.
        - Excludes `ideal_answer` and `weight` — candidates must never see
          evaluation criteria, not even in the browser's Network tab.

        Flow:
        1. Verify the interview exists and is in_progress
        2. Get the job_id from the interview
        3. Fetch questions for that job (safe fields only)
        4. Return ordered question list
        """

        # 1. Verify interview exists and is active
        interview_resp = (
            self.supabase.table("interviews")
            .select("id, job_id, status")
            .eq("id", interview_id)
            .execute()
        )

        if not interview_resp.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview session not found.",
            )

        interview = interview_resp.data[0]

        if interview["status"] != "in_progress":
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail="This interview session has already been completed or abandoned.",
            )

        job_id = interview["job_id"]

        # 2. Fetch job title
        job_resp = (
            self.supabase.table("jobs").select("title").eq("id", job_id).execute()
        )

        job_title = job_resp.data[0]["title"] if job_resp.data else "Unknown Position"

        job_title = job_resp.data[0]["title"] if job_resp.data else "Unknown Position"

        # 3. Fetch questions using the consistent sorting logic
        questions = await self._get_sorted_questions(job_id)

        return {
            "interview_id": interview_id,
            "job_title": job_title,
            "questions": questions,
            "total_questions": len(questions),
        }

    # ========================================================================
    # SESSION: Submit an answer to a question
    # ========================================================================

    async def submit_answer(
        self,
        interview_id: str,
        question_id: str,
        answer_text: str,
        time_spent_seconds: int = 0,
        paste_count: int = 0,
        tab_switches: int = 0,
    ) -> Dict[str, Any]:
        """
        Record a candidate's answer for a specific question.

        SECURITY:
        - Validates that the interview is still 'in_progress'.
        - Uses upsert so network retries don't create duplicates.
        - Anti-cheat metadata (paste_count, tab_switches) is silently stored.

        Flow:
        1. Verify interview is still in_progress
        2. Upsert the answer into interview_answers
        3. Check if there are more questions remaining
        4. If last question → mark interview as 'completed'
        5. Return confirmation + next question index (or None)
        """

        # 1. Verify interview is active
        interview_resp = (
            self.supabase.table("interviews")
            .select("id, job_id, status")
            .eq("id", interview_id)
            .execute()
        )

        if not interview_resp.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview session not found.",
            )

        interview = interview_resp.data[0]

        if interview["status"] != "in_progress":
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail="This interview session is no longer active.",
            )

        # 2. Upsert the answer (on conflict: interview_id + question_id)
        answer_payload = {
            "interview_id": interview_id,
            "question_id": question_id,
            "answer_text": answer_text.strip(),
            "time_spent_seconds": time_spent_seconds,
            "paste_count": paste_count,
            "tab_switches": tab_switches,
        }

        answer_resp = (
            self.supabase.table("interview_answers")
            .upsert(answer_payload, on_conflict="interview_id,question_id")
            .execute()
        )

        if not answer_resp.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save answer.",
            )

        answer = answer_resp.data[0]

        # 3. Determine if there are more questions
        job_id = interview["job_id"]

        # Use consistent sorting logic
        all_questions = await self._get_sorted_questions(job_id)

        # Find current question's position
        answered_resp = (
            self.supabase.table("interview_answers")
            .select("question_id")
            .eq("interview_id", interview_id)
            .execute()
        )

        answered_ids = {a["question_id"] for a in (answered_resp.data or [])}

        # Find next unanswered question
        next_question_index = None
        for i, q in enumerate(all_questions):
            if q["id"] not in answered_ids:
                next_question_index = i
                break

        # 4. If all questions answered → complete the interview
        if next_question_index is None:
            self.supabase.table("interviews").update(
                {"status": "completed", "end_time": "now()"}
            ).eq("id", interview_id).execute()

        return {
            "success": True,
            "answer_id": answer["id"],
            "next_question_index": next_question_index,
        }

    async def get_completed_candidates(self, job_id: str) -> List[Dict[str, Any]]:
        """
        Fetch all completed interviews for a job, including aggregated scores
        and anti-cheat metrics.
        """
        # Fetch interviews + candidate details + answers (for aggregation)
        # Note: We filter by job_id and 'completed' status
        response = (
            self.supabase.table("interviews")
            .select(
                "*, candidates!inner(*), interview_answers(time_spent_seconds, paste_count, tab_switches)"
            )
            .eq("job_id", job_id)
            .eq("status", "completed")
            .order("end_time", desc=True)
            .execute()
        )

        results = []
        for interview in response.data or []:
            candidate = interview.get("candidates", {})
            answers = interview.get("interview_answers", [])

            # Aggregate metrics in Python (simple sum)
            total_time = sum((a.get("time_spent_seconds") or 0) for a in answers)
            total_paste = sum((a.get("paste_count") or 0) for a in answers)
            total_switches = sum((a.get("tab_switches") or 0) for a in answers)

            results.append(
                {
                    "candidate_id": candidate.get("id"),
                    "interview_id": interview.get("id"),
                    "first_name": candidate.get("first_name"),
                    "last_name": candidate.get("last_name"),
                    "email": candidate.get("email"),
                    "phone": candidate.get("phone"),
                    "status": interview.get("status"),
                    "end_time": interview.get("end_time"),
                    "total_time_spent": total_time,
                    "paste_count": total_paste,
                    "tab_switches": total_switches,
                    "ai_score": None,  # Placeholder
                }
            )

        return results
