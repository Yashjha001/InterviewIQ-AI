from app.services.groq_service import client


def generate_career_roadmap(
    current_year,
    current_skills,
    career_goal,
    timeline
):

    prompt = f"""
    You are an expert career mentor for Indian engineering students.

    Create a detailed roadmap for:

    Current Year:
    {current_year}

    Current Skills:
    {current_skills}

    Career Goal:
    {career_goal}

    Timeline:
    {timeline}

    Generate:

    1. Month-by-month roadmap
    2. Skills to learn
    3. Project suggestions
    4. Recommended certifications
    5. Placement preparation strategy
    6. Free learning resources

    Keep roadmap practical and beginner-friendly.
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
