import json
import re
import logging
from typing import Dict, List, Tuple, Optional
from difflib import SequenceMatcher
from functools import lru_cache

from app.services.role_analyzer import generate_role_skills
from app.services.groq_service import client

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Skill normalization & synonyms
# ---------------------------------------------------------------------------

SKILL_SYNONYMS: Dict[str, List[str]] = {
    "javascript": ["js", "ecmascript", "java script"],
    "typescript": ["ts"],
    "node.js": ["nodejs", "node"],
    "react.js": ["react", "reactjs"],
    "next.js": ["nextjs", "next"],
    "vue.js": ["vue", "vuejs"],
    "express.js": ["express", "expressjs"],
    "python": ["py", "python3"],
    "machine learning": ["ml"],
    "deep learning": ["dl"],
    "artificial intelligence": ["ai"],
    "natural language processing": ["nlp"],
    "computer vision": ["cv"],
    "amazon web services": ["aws"],
    "google cloud platform": ["gcp", "google cloud"],
    "microsoft azure": ["azure"],
    "postgresql": ["postgres", "psql"],
    "mongodb": ["mongo"],
    "kubernetes": ["k8s"],
    "continuous integration": ["ci", "ci/cd", "cicd"],
    "rest api": ["rest", "restful", "restful api", "restful apis"],
    "graphql": ["graph ql"],
    "html5": ["html"],
    "css3": ["css"],
    "structured query language": ["sql"],
}

# Build reverse lookup: any variant -> canonical form
_REVERSE_SYNONYM_MAP: Dict[str, str] = {}
for canonical, variants in SKILL_SYNONYMS.items():
    _REVERSE_SYNONYM_MAP[canonical.lower()] = canonical.lower()
    for variant in variants:
        _REVERSE_SYNONYM_MAP[variant.lower()] = canonical.lower()


def normalize_skill(skill: str) -> str:
    """Lowercase, strip punctuation/whitespace, and map to canonical form."""
    if not skill:
        return ""
    # Remove version numbers like "Python 3.10" -> "python"
    cleaned = re.sub(r"\s*\d+(\.\d+)*\s*$", "", skill.strip().lower())
    # Collapse whitespace and remove trailing punctuation
    cleaned = re.sub(r"[^\w\s\.\+\#/-]", "", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return _REVERSE_SYNONYM_MAP.get(cleaned, cleaned)


def fuzzy_match(a: str, b: str, threshold: float = 0.85) -> bool:
    """Catch typos and minor variations (e.g., 'kubernets' vs 'kubernetes')."""
    return SequenceMatcher(None, a, b).ratio() >= threshold


def find_skill_match(
    required: str, candidate_skills: List[str]
) -> Tuple[bool, Optional[str], str]:
    """
    Returns (matched, matched_skill, match_type).
    match_type ∈ {'exact', 'synonym', 'fuzzy', 'substring', 'none'}
    """
    req_norm = normalize_skill(required)
    if not req_norm:
        return False, None, "none"

    normalized_candidates = [(s, normalize_skill(s)) for s in candidate_skills]

    # 1. Exact / synonym match (both already normalized through synonym map)
    for original, norm in normalized_candidates:
        if norm == req_norm:
            return True, original, "exact"

    # 2. Substring match (e.g., "react" found in "react native")
    for original, norm in normalized_candidates:
        if req_norm in norm or norm in req_norm:
            # Guard against trivial matches like "c" in "css"
            if min(len(req_norm), len(norm)) >= 3:
                return True, original, "substring"

    # 3. Fuzzy match for typos
    for original, norm in normalized_candidates:
        if fuzzy_match(req_norm, norm):
            return True, original, "fuzzy"

    return False, None, "none"


# ---------------------------------------------------------------------------
# Core analysis
# ---------------------------------------------------------------------------

def analyze_resume(skills: List[str], target_role: str) -> Dict:
    """
    Analyze resume skills against role requirements with weighted ATS scoring.
    """
    if not target_role or not target_role.strip():
        raise ValueError("target_role cannot be empty")

    skills = skills or []
    required_skills = generate_role_skills(target_role) or []

    if not required_skills:
        logger.warning("No required skills generated for role: %s", target_role)
        return {
            "target_role": target_role,
            "ats_score": 0,
            "matched_skills": [],
            "missing_skills": [],
            "extra_skills": skills,
            "match_details": [],
        }

    matched_skills: List[str] = []
    missing_skills: List[str] = []
    match_details: List[Dict] = []

    # Weighted scoring: exact=1.0, synonym=1.0, substring=0.8, fuzzy=0.7
    weight_map = {"exact": 1.0, "synonym": 1.0, "substring": 0.8, "fuzzy": 0.7}
    total_weight = 0.0

    for req_skill in required_skills:
        matched, matched_with, match_type = find_skill_match(req_skill, skills)
        if matched:
            matched_skills.append(req_skill)
            total_weight += weight_map.get(match_type, 1.0)
            match_details.append({
                "required": req_skill,
                "matched_with": matched_with,
                "match_type": match_type,
            })
        else:
            missing_skills.append(req_skill)

    # Identify "extra" skills the candidate has that aren't required
    required_normalized = {normalize_skill(s) for s in required_skills}
    extra_skills = [
        s for s in skills if normalize_skill(s) not in required_normalized
    ]

    ats_score = round((total_weight / len(required_skills)) * 100)
    ats_score = max(0, min(100, ats_score))  # clamp to [0, 100]

    return {
        "target_role": target_role,
        "ats_score": ats_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "extra_skills": extra_skills,
        "match_details": match_details,
        "total_required": len(required_skills),
        "total_matched": len(matched_skills),
    }


# ---------------------------------------------------------------------------
# LLM feedback generation
# ---------------------------------------------------------------------------

def _truncate_at_boundary(text: str, max_chars: int = 6000) -> str:
    """Truncate at the last sentence/paragraph break before the limit."""
    if len(text) <= max_chars:
        return text
    chunk = text[:max_chars]
    # Prefer paragraph break, then sentence, then word
    for sep in ["\n\n", ". ", " "]:
        idx = chunk.rfind(sep)
        if idx > max_chars * 0.7:  # don't truncate too aggressively
            return chunk[:idx].strip() + "..."
    return chunk + "..."


def _build_prompt(
    resume_text: str,
    skills: List[str],
    target_role: str,
    ats_score: int,
    matched_skills: List[str],
    missing_skills: List[str],
) -> str:
    return f"""You are a senior technical recruiter and ATS specialist with 10+ years of experience hiring for {target_role} roles. Analyze the resume below with the rigor of a real hiring manager.

=== CONTEXT ===
Target Role: {target_role}
ATS Match Score: {ats_score}/100
Candidate's Skills: {', '.join(skills) if skills else 'None extracted'}
Matched Skills ({len(matched_skills)}): {', '.join(matched_skills) if matched_skills else 'None'}
Missing Critical Skills ({len(missing_skills)}): {', '.join(missing_skills) if missing_skills else 'None'}

=== RESUME CONTENT ===
{_truncate_at_boundary(resume_text)}

=== INSTRUCTIONS ===
Return ONLY a valid JSON object — no markdown, no code fences, no preamble. Use this exact schema:

{{
  "strengths": ["specific strength 1", "specific strength 2", "..."],
  "weaknesses": ["specific weakness 1", "..."],
  "missing_critical_skills": ["skill with brief reason why it matters", "..."],
  "ats_optimization_tips": ["actionable tip 1", "..."],
  "project_suggestions": ["specific project idea 1", "..."],
  "keyword_recommendations": ["keyword to add 1", "..."],
  "hiring_impression": {{
     "verdict": "Strong Fit | Moderate Fit | Weak Fit | Not a Fit",
     "summary": "2-3 sentence overall hiring impression",
     "interview_probability": "High | Medium | Low"
  }}
}}

Rules:
- Be specific and actionable. Avoid generic advice like "improve resume."
- Reference actual content from the resume where possible.
- Each list should have 3-5 items.
- Output must be valid JSON parseable by json.loads().
"""


def generate_resume_feedback(
    resume_text: str,
    skills: List[str],
    target_role: str,
    ats_score: int,
    matched_skills: List[str],
    missing_skills: List[str],
    model: str = "llama-3.3-70b-versatile",
    fallback_model: str = "llama-3.1-8b-instant",
) -> Dict:
    """
    Generate structured ATS feedback. Returns a dict (parsed JSON) with a
    'raw' fallback if parsing fails.
    """
    if not resume_text or not resume_text.strip():
        return {"error": "Empty resume text provided."}

    prompt = _build_prompt(
        resume_text, skills, target_role, ats_score, matched_skills, missing_skills
    )

    def _call(model_name: str) -> str:
        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a precise ATS resume reviewer. "
                        "You always respond with valid JSON only — no commentary, "
                        "no markdown fences, no explanation outside the JSON."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,         # lower = more consistent ATS judgments
            max_tokens=1500,
            response_format={"type": "json_object"},  # if supported by model
        )
        return response.choices[0].message.content

    raw = ""
    try:
        raw = _call(model)
    except Exception as primary_err:
        logger.warning("Primary model failed (%s): %s", model, primary_err)
        try:
            raw = _call(fallback_model)
        except Exception as fallback_err:
            logger.error("Fallback model failed: %s", fallback_err)
            return {
                "error": "Feedback generation failed.",
                "details": str(fallback_err),
            }

    return _parse_json_response(raw)


def _parse_json_response(raw: str) -> Dict:
    """Robustly extract JSON even if the model wraps it in markdown."""
    if not raw:
        return {"error": "Empty response from model."}

    # Strip markdown code fences if present
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw.strip(), flags=re.MULTILINE)

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        # Try to extract the first {...} block
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError as e:
                logger.error("JSON parse failed: %s", e)
        return {"error": "Could not parse model response.", "raw": raw}