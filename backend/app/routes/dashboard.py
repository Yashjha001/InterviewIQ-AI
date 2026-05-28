import asyncio
from collections import Counter
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query

from app.db.mongodb import (
    activity_log,
    get_db,
    interviews,
    roadmap_history,
    resume_reports,
)

router = APIRouter()

CACHE_KEY_PREFIX = "dashboard"
_dashboard_cache: dict = {}
CACHE_TTL = 60


def _user_filter(user_id: str) -> dict:
    return {"$or": [{"userId": user_id}, {"user_id": user_id}]}


def _clamp_score(value: float) -> int:
    return max(0, min(100, int(round(value))))


def _safe_average(values: list[float]) -> int:
    if not values:
        return 0
    return _clamp_score(sum(values) / len(values))


def _company_readiness(ats_avg: int, interview_avg: int, roadmap_avg: int, weights: tuple[float, float, float]) -> int:
    ats_weight, interview_weight, roadmap_weight = weights
    return _clamp_score((ats_avg * ats_weight) + (interview_avg * interview_weight) + (roadmap_avg * roadmap_weight))


def _cache_key(section: str, user_id: str) -> str:
    return f"{CACHE_KEY_PREFIX}:{section}:{user_id}"


def _get_cached_response(cache_key: str):
    cached_entry = _dashboard_cache.get(cache_key)
    if not cached_entry:
        return None

    cached_at, cached_data = cached_entry
    age = (datetime.utcnow() - cached_at).total_seconds()
    if age < CACHE_TTL:
        return cached_data
    return None


def _set_cached_response(cache_key: str, payload: dict):
    _dashboard_cache[cache_key] = (datetime.utcnow(), payload)


def _empty_stats():
    return {
        "stats": {
            "ats_avg": 0,
            "interviews_taken": 0,
            "roadmap_progress": 0,
            "skills_improved": 0,
        }
    }


def _empty_details():
    return {
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


async def _build_dashboard_stats(user_id: str):
    cache_key = _cache_key("stats", user_id)
    cached_payload = _get_cached_response(cache_key)
    if cached_payload is not None:
        return cached_payload

    if not user_id:
        payload = _empty_stats()
        _set_cached_response(cache_key, payload)
        return payload

    try:
        user_filter = _user_filter(user_id)
        resume_docs, interview_count, roadmap_docs, skill_docs = await asyncio.gather(
            resume_reports.find(user_filter).sort("createdAt", -1).to_list(length=100),
            interviews.count_documents(user_filter),
            roadmap_history.find(user_filter).sort("createdAt", -1).to_list(length=100),
            resume_reports.find(user_filter, {"matched_skills": 1}).sort("createdAt", -1).to_list(length=100),
        )
    except Exception:
        resume_docs, interview_count, roadmap_docs, skill_docs = [], 0, [], []

    ats_scores = [doc.get("ats_score", 0) for doc in resume_docs if isinstance(doc.get("ats_score", 0), (int, float))]
    roadmap_progress_values = [doc.get("progress_percent", 0) for doc in roadmap_docs if isinstance(doc.get("progress_percent", 0), (int, float))]

    matched_skill_set = set()
    for doc in skill_docs:
      for skill in doc.get("matched_skills", []) or []:
        matched_skill_set.add(str(skill))

    payload = {
        "stats": {
            "ats_avg": _safe_average(ats_scores),
            "interviews_taken": int(interview_count),
            "roadmap_progress": _safe_average(roadmap_progress_values),
            "skills_improved": len(matched_skill_set),
        }
    }

    _set_cached_response(cache_key, payload)
    return payload


async def _build_dashboard_details(user_id: str):
    cache_key = _cache_key("details", user_id)
    cached_payload = _get_cached_response(cache_key)
    if cached_payload is not None:
        return cached_payload

    if not user_id:
        payload = _empty_details()
        _set_cached_response(cache_key, payload)
        return payload

    try:
        user_filter = _user_filter(user_id)
        resume_docs, interview_docs, roadmap_docs, activity_docs, insight_docs = await asyncio.gather(
            resume_reports.find(user_filter).sort("createdAt", -1).to_list(length=7),
            interviews.find(user_filter).sort("createdAt", -1).to_list(length=7),
            roadmap_history.find(user_filter).sort("createdAt", -1).to_list(length=7),
            activity_log.find({"userId": user_id}).sort("createdAt", -1).limit(10).to_list(length=10),
            activity_log.find({"userId": user_id, "type": "insight"}).sort("createdAt", -1).limit(5).to_list(length=5),
        )
    except Exception:
        resume_docs, interview_docs, roadmap_docs, activity_docs, insight_docs = [], [], [], [], []

    ats_scores = [doc.get("ats_score", 0) for doc in resume_docs if isinstance(doc.get("ats_score", 0), (int, float))]
    roadmap_progress_values = [doc.get("progress_percent", 0) for doc in roadmap_docs if isinstance(doc.get("progress_percent", 0), (int, float))]
    interview_avg_scores = [doc.get("avg_score", 0) for doc in interview_docs if isinstance(doc.get("avg_score", 0), (int, float))]

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

    raw_insights = [doc.get("text", "") for doc in insight_docs if doc.get("text")]

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

    ats_avg = _safe_average(ats_scores)
    interview_avg = _safe_average(interview_avg_scores)

    payload = {
        "ats_trend": ats_trend,
        "interview_scores": interview_scores,
        "recent_activity": recent_activity,
        "interview_history": interview_history,
        "ai_insights": [
            *raw_insights,
            f"Your ATS score improved by {ats_improvement}% over last 3 analyses",
            f"Communication skills appear in {communication_percent}% of feedback",
            f"Top missing skill across reports: {top_missing_skill}",
        ],
        "company_readiness": {
            "Google": _company_readiness(ats_avg, interview_avg, _safe_average(roadmap_progress_values), (0.45, 0.40, 0.15)),
            "Amazon": _company_readiness(ats_avg, interview_avg, _safe_average(roadmap_progress_values), (0.40, 0.45, 0.15)),
            "Startup": _company_readiness(ats_avg, interview_avg, _safe_average(roadmap_progress_values), (0.35, 0.35, 0.30)),
        },
    }

    _set_cached_response(cache_key, payload)
    return payload


@router.get("/dashboard-data")
async def dashboard_data(
    userId: str = Query("guest"),
    db_instance=Depends(get_db),
):
    stats_payload, details_payload = await asyncio.gather(
        _build_dashboard_stats(userId),
        _build_dashboard_details(userId),
    )
    return {**stats_payload, **details_payload}


@router.get("/dashboard-data/stats")
async def dashboard_stats(
    userId: str = Query("guest"),
    db_instance=Depends(get_db),
):
    return await _build_dashboard_stats(userId)


@router.get("/dashboard-data/details")
async def dashboard_details(
    userId: str = Query("guest"),
    db_instance=Depends(get_db),
):
    return await _build_dashboard_details(userId)
