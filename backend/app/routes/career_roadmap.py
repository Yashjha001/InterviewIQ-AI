from fastapi import APIRouter
from pydantic import BaseModel

from app.services.career_roadmap import (
    generate_career_roadmap
)

router = APIRouter()


class CareerRoadmapRequest(BaseModel):

    current_year: str

    current_skills: str

    career_goal: str

    timeline: str


@router.post("/generate-roadmap")
async def generate_roadmap(
    data: CareerRoadmapRequest
):

    roadmap = generate_career_roadmap(
        data.current_year,
        data.current_skills,
        data.career_goal,
        data.timeline
    )

    return {
        "roadmap": roadmap
    }