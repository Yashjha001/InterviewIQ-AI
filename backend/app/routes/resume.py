from fastapi import APIRouter, UploadFile, File
import pdfplumber
import os

from app.services.resume_parser import extract_skills
from app.services.groq_service import generate_questions

router = APIRouter()

UPLOAD_FOLDER = "uploads"

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