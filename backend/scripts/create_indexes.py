import asyncio
import os

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")


async def create_indexes():
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client.career_platform

    await db.resume_reports.create_index("userId")
    await db.resume_reports.create_index([("userId", 1), ("createdAt", -1)])

    await db.interviews.create_index("userId")
    await db.interviews.create_index([("userId", 1), ("createdAt", -1)])

    await db.roadmap_history.create_index("userId")
    await db.roadmap_history.create_index([("userId", 1), ("createdAt", -1)])

    await db.activity_log.create_index("userId")
    await db.activity_log.create_index([("userId", 1), ("createdAt", -1)])
    await db.activity_log.create_index([("userId", 1), ("type", 1)])

    print("Indexes created successfully")
    client.close()


asyncio.run(create_indexes())