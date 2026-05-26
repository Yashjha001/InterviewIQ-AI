from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def resume_health() -> dict[str, str]:
    return {"status": "resume route ready"}
