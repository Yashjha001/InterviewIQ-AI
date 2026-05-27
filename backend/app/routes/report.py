from fastapi import APIRouter
from app.services.resume_parser import extract_skills
router = APIRouter()


@router.get("/health")
def report_health() -> dict[str, str]:
    skills = extract_skills(extracted_text)

    return {
        "filename": file.filename,
        "skills": skills,
        "resume_text": extracted_text[:3000]
    }