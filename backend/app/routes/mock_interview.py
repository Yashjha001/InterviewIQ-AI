from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form
)

from pydantic import BaseModel

import pdfplumber

from app.services.interview_generator import (
    generate_interview_questions
)

from app.services.interview_evaluator import (
    evaluate_answer
)

from app.services.adaptive_interview import (
    generate_next_question
)

# ROUTER

router = APIRouter()

# ==============================
# REQUEST MODELS
# ==============================

class InterviewRequest(BaseModel):

    question: str

    answer: str


class NextQuestionRequest(BaseModel):

    resume_text: str

    target_role: str

    company: str

    interview_type: str

    difficulty: str

    previous_question: str

    candidate_answer: str

    previous_feedback: str

    interview_history: list


# ==============================
# GENERATE INITIAL INTERVIEW
# ==============================

@router.post("/generate-interview")
async def generate_interview(

    file: UploadFile = File(...),

    target_role: str = Form(...),

    company: str = Form(...),

    interview_type: str = Form(...),

    difficulty: str = Form(...)

):

    pdf_text = ""

    with pdfplumber.open(file.file) as pdf:

        for page in pdf.pages:

            pdf_text += page.extract_text() or ""

    questions = generate_interview_questions(
        pdf_text,
        target_role,
        company,
        interview_type,
        difficulty
    )

    return questions


# ==============================
# EVALUATE ANSWER
# ==============================

@router.post("/evaluate-answer")
async def evaluate(
    data: InterviewRequest
):

    feedback = evaluate_answer(
        data.question,
        data.answer
    )

    return {
        "feedback": feedback
    }


# ==============================
# GENERATE NEXT ADAPTIVE QUESTION
# ==============================

@router.post("/next-question")
async def next_question(
    data: NextQuestionRequest
):

    question = generate_next_question(

        data.resume_text,

        data.target_role,

        data.company,

        data.interview_type,

        data.difficulty,

        data.previous_question,

        data.candidate_answer,

        data.previous_feedback,

        data.interview_history
    )

    return question