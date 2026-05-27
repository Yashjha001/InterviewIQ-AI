from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form
)

import pdfplumber
import os

from app.services.resume_parser import extract_skills

from app.services.resume_analysis import (
    analyze_resume,
    generate_resume_feedback
)

router = APIRouter()

UPLOAD_FOLDER = "uploads"


@router.post("/analyze-resume")
async def analyze_resume_route(
    file: UploadFile = File(...),
    target_role: str = Form(...)
):

    file_path = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )

    with open(file_path, "wb") as f:
        f.write(await file.read())

    extracted_text = ""

    with pdfplumber.open(file_path) as pdf:

        for page in pdf.pages:
            extracted_text += (
                page.extract_text() or ""
            )

    skills = extract_skills(extracted_text)

    analysis = analyze_resume(
        skills,
        target_role
    )

    feedback = generate_resume_feedback(
        extracted_text,
        skills,
        target_role,
        analysis["ats_score"],
        analysis["matched_skills"],
        analysis["missing_skills"]
    )

    return {
        "filename": file.filename,
        "skills": skills,
        "analysis": analysis,
        "feedback": feedback
    }