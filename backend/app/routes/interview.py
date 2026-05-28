import logging
from datetime import datetime, timezone

from fastapi import APIRouter
from pydantic import BaseModel

from app.db.mongodb import activity_log, interviews

router = APIRouter()
logger = logging.getLogger(__name__)


class CompleteInterviewRequest(BaseModel):
    user_id: str = "anonymous"
    userId: str | None = None
    target_role: str
    company: str
    interview_type: str
    difficulty: str
    questions: list
    answers: list
    scores: list[int]
    feedback: list


@router.post("/complete-interview")
async def complete_interview(data: CompleteInterviewRequest):
    user_id = data.user_id or data.userId or "anonymous"
    avg_score = round(sum(data.scores) / len(data.scores)) if data.scores else 0

    try:
        await interviews.insert_one(
            {
                "userId": user_id,
                "target_role": data.target_role,
                "company": data.company,
                "interview_type": data.interview_type,
                "difficulty": data.difficulty,
                "questions": data.questions,
                "answers": data.answers,
                "scores": data.scores,
                "avg_score": avg_score,
                "feedback": data.feedback,
                "createdAt": datetime.now(timezone.utc),
            }
        )
        logger.info("Saved to MongoDB for userId: %s", user_id)
        await activity_log.insert_one(
            {
                "userId": user_id,
                "action": "Mock Interview Completed",
                "detail": f"{data.interview_type} interview for {data.target_role} at {data.company}",
                "createdAt": datetime.now(timezone.utc),
            }
        )
        await activity_log.insert_one(
            {
                "userId": user_id,
                "type": "insight",
                "text": f"{data.interview_type} interview completed at {data.company} with avg score {avg_score}/100",
                "createdAt": datetime.now(timezone.utc),
            }
        )
    except Exception:
        logger.exception("Failed to persist interview session for user %s", user_id)

    return {
        "saved": True,
        "avg_score": avg_score,
    }
