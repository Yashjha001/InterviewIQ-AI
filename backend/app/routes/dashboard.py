import asyncio
from collections import Counter

from fastapi import APIRouter, Depends, Query

from app.db.mongodb import (
    activity_log,
    get_db,
    interviews,
    roadmap_history,
    resume_reports,
)

router = APIRouter()


def _clamp_score(value: float) -> int:
    return max(0, min(100, int(round(value))))


def _safe_average(values: list[float]) -> int:
    if not values:
        return 0
    return _clamp_score(sum(values) / len(values))


def _company_readiness(ats_avg: int, interview_avg: int, roadmap_avg: int, weights: tuple[float, float, float]) -> int:
    ats_weight, interview_weight, roadmap_weight = weights
    return _clamp_score((ats_avg * ats_weight) + (interview_avg * interview_weight) + (roadmap_avg * roadmap_weight))


@router.get("/dashboard-data")
async def dashboard_data(
    userId: str = Query(""),
    db_instance=Depends(get_db),
):
    if not userId:
        return {
            "stats": {
                "ats_avg": 0,
                "interviews_taken": 0,
                "roadmap_progress": 0,
                "skills_improved": 0,
            },
            "ats_trend": [],
            "interview_scores": [],
            "recent_activity": [],
            "interview_history": [],
            "ai_insights": [
                "Your ATS score improved by 0% over last 3 analyses",
                "Communication skills appear in 0% of feedback",
                "Top missing skill across reports: N/A",
            ],
            "company_readiness": {
                "Google": 0,
                "Amazon": 0,
                "Startup": 0,
            },
        }

    try:
        resume_docs, interview_docs, roadmap_docs, activity_docs = await asyncio.gather(
            resume_reports.find({"userId": userId}).sort("createdAt", -1).to_list(length=100),
            interviews.find({"userId": userId}).sort("createdAt", -1).to_list(length=100),
            roadmap_history.find({"userId": userId}).sort("createdAt", -1).to_list(length=100),
            activity_log.find({"userId": userId}).sort("createdAt", -1).limit(10).to_list(length=10),
        )
    except Exception:
        resume_docs, interview_docs, roadmap_docs, activity_docs = [], [], [], []

    ats_scores = [doc.get("ats_score", 0) for doc in resume_docs if isinstance(doc.get("ats_score", 0), (int, float))]
    roadmap_progress_values = [doc.get("progress_percent", 0) for doc in roadmap_docs if isinstance(doc.get("progress_percent", 0), (int, float))]
    interview_avg_scores = [doc.get("avg_score", 0) for doc in interview_docs if isinstance(doc.get("avg_score", 0), (int, float))]

    ats_avg = _safe_average(ats_scores)
    roadmap_avg = _safe_average(roadmap_progress_values)
    interview_avg = _safe_average(interview_avg_scores)

    ats_trend = [
        {
            "score": int(doc.get("ats_score", 0)),
            "createdAt": doc.get("createdAt"),
        }
        for doc in list(reversed(resume_docs[:7]))
    ]

    interview_scores = [
        {
            "score": int(doc.get("avg_score", 0)),
            "createdAt": doc.get("createdAt"),
        }
        for doc in list(reversed(interview_docs[:7]))
    ]

    recent_activity = [
        {
            "action": doc.get("action", ""),
            "detail": doc.get("detail", ""),
            "createdAt": doc.get("createdAt"),
        }
        for doc in activity_docs
    ]

    interview_history = [
        {
            "role": doc.get("target_role", ""),
            "company": doc.get("company", ""),
            "avg_score": int(doc.get("avg_score", 0)),
            "createdAt": doc.get("createdAt"),
        }
        for doc in interview_docs[:5]
    ]

    latest_three = list(reversed(resume_docs[:3]))
    ats_improvement = 0
    if len(latest_three) >= 2:
        ats_improvement = int(latest_three[-1].get("ats_score", 0)) - int(latest_three[0].get("ats_score", 0))

    feedback_entries = []
    for interview_doc in interview_docs[:5]:
        feedback_entries.extend(interview_doc.get("feedback", []) or [])

    communication_mentions = 0
    for feedback_item in feedback_entries:
        if isinstance(feedback_item, str) and "communication" in feedback_item.lower():
            communication_mentions += 1
    communication_percent = round((communication_mentions / len(feedback_entries)) * 100) if feedback_entries else 0

    missing_skill_counter = Counter()
    for doc in resume_docs:
        for skill in doc.get("missing_skills", []) or []:
            missing_skill_counter[str(skill)] += 1
    top_missing_skill = missing_skill_counter.most_common(1)[0][0] if missing_skill_counter else "N/A"

    matched_skill_set = set()
    for doc in resume_docs[:5]:
        for skill in doc.get("matched_skills", []) or []:
            matched_skill_set.add(str(skill))

    return {
        "stats": {
            "ats_avg": ats_avg,
            "interviews_taken": len(interview_docs),
            "roadmap_progress": roadmap_avg,
            "skills_improved": len(matched_skill_set),
        },
        "ats_trend": ats_trend,
        "interview_scores": interview_scores,
        "recent_activity": recent_activity,
        "interview_history": interview_history,
        "ai_insights": [
            f"Your ATS score improved by {ats_improvement}% over last 3 analyses",
            f"Communication skills appear in {communication_percent}% of feedback",
            f"Top missing skill across reports: {top_missing_skill}",
        ],
        "company_readiness": {
            "Google": _company_readiness(ats_avg, interview_avg, roadmap_avg, (0.45, 0.40, 0.15)),
            "Amazon": _company_readiness(ats_avg, interview_avg, roadmap_avg, (0.40, 0.45, 0.15)),
            "Startup": _company_readiness(ats_avg, interview_avg, roadmap_avg, (0.35, 0.35, 0.30)),
        },
    }
