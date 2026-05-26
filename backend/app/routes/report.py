from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def report_health() -> dict[str, str]:
    return {"status": "report route ready"}
