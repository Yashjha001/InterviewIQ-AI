from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def feedback_health() -> dict[str, str]:
    return {"status": "feedback route ready"}
