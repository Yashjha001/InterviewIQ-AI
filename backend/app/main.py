from fastapi import FastAPI

from app.routes import auth, feedback, interview, report, resume

app = FastAPI(title="InterviewIQ AI API")

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(resume.router, prefix="/resume", tags=["resume"])
app.include_router(interview.router, prefix="/interview", tags=["interview"])
app.include_router(feedback.router, prefix="/feedback", tags=["feedback"])
app.include_router(report.router, prefix="/report", tags=["report"])


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "InterviewIQ AI API is running"}
