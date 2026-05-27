from fastapi import FastAPI
from app.routes.resume import router as resume_router
from fastapi.middleware.cors import CORSMiddleware
from app.routes.dashboard import router as dashboard_router
from app.routes.roadmap import router as roadmap_router
from app.routes.mock_interview import router as mock_router
from app.routes.interview import router as interview_router

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(resume_router)
app.include_router(dashboard_router)
app.include_router(roadmap_router)
app.include_router(mock_router)
app.include_router(interview_router)

@app.get("/")
def home():
    return {
        "message": "InterviewIQ Backend Running"
    }