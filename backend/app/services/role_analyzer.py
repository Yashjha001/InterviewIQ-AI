from app.services.groq_service import client


def generate_role_skills(target_role):

    prompt = f"""
    You are a tech recruiter.

    Generate a list of important technical skills
    required for a:

    {target_role}

    Return ONLY comma-separated skills.
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

    content = response.choices[0].message.content

    skills = [
        skill.strip()
        for skill in content.split(",")
    ]

    return skills