import logging
from datetime import datetime, timezone

from fastapi import APIRouter
from pydantic import BaseModel

from app.db.mongodb import activity_log, roadmap_history
from app.services.career_roadmap import generate_career_roadmap

router = APIRouter()
logger = logging.getLogger(__name__)


class CareerRoadmapRequest(BaseModel):
    userId: str
    current_year: str
    current_skills: str
    career_goal: str
    timeline: str


@router.post("/generate-roadmap")
async def generate_roadmap(data: CareerRoadmapRequest):
    roadmap = generate_career_roadmap(
        data.current_year,
        data.current_skills,
        data.career_goal,
        data.timeline,
    )

    try:
        await roadmap_history.insert_one(
            {
                "userId": data.userId,
                "career_goal": data.career_goal,
                "current_year": data.current_year,
                "timeline": data.timeline,
                "roadmap": {"content": roadmap},
                "completed_milestones": [],
                "progress_percent": 0,
                "createdAt": datetime.now(timezone.utc),
            }
        )
        await activity_log.insert_one(
            {
                "userId": data.userId,
                "action": "Roadmap Generated",
                "detail": f"Goal: {data.career_goal} | Timeline: {data.timeline}",
                "createdAt": datetime.now(timezone.utc),
            }
        )
    except Exception:
        logger.exception("Failed to persist roadmap for user %s", data.userId)

    return {"roadmap": roadmap}
