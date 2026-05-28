import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import (
    resume_analysis,
    mock_interview,
    career_roadmap,
    dashboard,
    interview,
)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        os.getenv("FRONTEND_URL", "*"),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(resume_analysis.router)
app.include_router(mock_interview.router)
app.include_router(career_roadmap.router)
app.include_router(dashboard.router)
app.include_router(interview.router)

@app.get("/")
def home():
    return {
        "message": "InterviewIQ Backend Running"
    }


@app.get("/health")
async def health_check():
    return {"status": "ok"}