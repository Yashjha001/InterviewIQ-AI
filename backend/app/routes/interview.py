from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def interview_health() -> dict[str, str]:
    return {"status": "interview route ready"}
