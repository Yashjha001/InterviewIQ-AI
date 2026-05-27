import os

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")

client = AsyncIOMotorClient(MONGODB_URI)
db = client["career_platform"]

users = db["users"]
resume_reports = db["resume_reports"]
interviews = db["interviews"]
roadmap_history = db["roadmap_history"]
activity_log = db["activity_log"]
analytics = db["analytics"]


async def get_db():
    return db
