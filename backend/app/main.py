from fastapi import FastAPI
from app.routes.resume import router as resume_router
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(resume_router)

@app.get("/")
def home():
    return {
        "message": "InterviewIQ Backend Running"
    }