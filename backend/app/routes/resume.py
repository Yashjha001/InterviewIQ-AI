import logging
import os
from datetime import datetime, timezone

import pdfplumber
from fastapi import APIRouter, File, Form, UploadFile

from app.db.mongodb import activity_log, resume_reports
from app.services.groq_service import generate_questions
from app.services.resume_analysis import analyze_resume, generate_resume_feedback
from app.services.resume_parser import extract_skills

router = APIRouter()

UPLOAD_FOLDER = "uploads"

logger = logging.getLogger(__name__)


@router.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as f:
        f.write(await file.read())

    extracted_text = ""

    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            extracted_text += page.extract_text() or ""

    skills = extract_skills(extracted_text)
    questions = generate_questions(skills)

    return {
        "filename": file.filename,
        "skills": skills,
        "questions": questions,
        "resume_text": extracted_text[:3000]
    }


@router.post("/analyze-resume")
async def analyze_resume_route(
    file: UploadFile = File(...),
    target_role: str = Form(...),
    user_id: str = Form("anonymous"),
):

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as f:
        f.write(await file.read())

    extracted_text = ""

    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            extracted_text += page.extract_text() or ""

    skills = extract_skills(extracted_text)
    analysis = analyze_resume(skills, target_role)
    feedback = generate_resume_feedback(
        extracted_text,
        skills,
        target_role,
        analysis["ats_score"],
        analysis["matched_skills"],
        analysis["missing_skills"],
    )

    try:
        await resume_reports.insert_one(
            {
                "userId": user_id,
                "target_role": target_role,
                "ats_score": int(analysis.get("ats_score", 0)),
                "matched_skills": analysis.get("matched_skills", []),
                "missing_skills": analysis.get("missing_skills", []),
                "feedback": feedback,
                "createdAt": datetime.now(timezone.utc),
            }
        )
        logger.info("Saved to MongoDB for userId: %s", user_id)
        await activity_log.insert_one(
            {
                "userId": user_id,
                "action": "Resume Analyzed",
                "detail": f"ATS Score: {analysis.get('ats_score', 0)}% for {target_role}",
                "createdAt": datetime.now(timezone.utc),
            }
        )
        await activity_log.insert_one(
            {
                "userId": user_id,
                "type": "insight",
                "text": f"ATS score {analysis.get('ats_score', 0)}% achieved for {target_role}",
                "createdAt": datetime.now(timezone.utc),
            }
        )
    except Exception:
        logger.exception("Failed to persist resume analysis for user %s", user_id)

    return {
        "filename": file.filename,
        "skills": skills,
        "analysis": analysis,
        "feedback": feedback,
    }