from fastapi import FastAPI
from app.routes.resume import router as resume_router
from fastapi.middleware.cors import CORSMiddleware
from app.routes.resume_analysis import router as analysis_router
from app.routes.career_roadmap import router as career_router
from app.routes.mock_interview import router as mock_router

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(resume_router)
app.include_router(analysis_router)
app.include_router(career_router)
app.include_router(mock_router)

@app.get("/")
def home():
    return {
        "message": "InterviewIQ Backend Running"
    }