from app.services.role_analyzer import generate_role_skills
from app.services.groq_service import client


def analyze_resume(skills, target_role):

    required_skills = generate_role_skills(
    target_role
)

    matched_skills = []

    missing_skills = []

    for skill in required_skills:

        if skill in skills:
            matched_skills.append(skill)

        else:
            missing_skills.append(skill)

    ats_score = int(
        (len(matched_skills) / len(required_skills)) * 100
    ) if required_skills else 0

    return {
        "target_role": target_role,
        "ats_score": ats_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills
    }


def generate_resume_feedback(
    resume_text,
    skills,
    target_role,
    ats_score,
    matched_skills,
    missing_skills
):

    prompt = f"""
    You are an expert ATS resume reviewer.

    Analyze this resume for the role:
    {target_role}

    Resume Skills:
    {skills}

    ATS Score:
    {ats_score}

    Matched Skills:
    {matched_skills}

    Missing Skills:
    {missing_skills}

    Resume Content:
    {resume_text[:4000]}

    Give response in this format:

    1. Resume Strengths
    2. Weak Areas
    3. Missing Important Skills
    4. ATS Optimization Tips
    5. Project Improvement Suggestions
    6. Final Hiring Impression

    Keep response professional and concise.
    """

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response.choices[0].message.content