from app.services.groq_service import client
import json


def generate_interview_questions(
    resume_text,
    target_role,
    company,
    interview_type,
    difficulty
):

    prompt = f"""
    You are an expert technical interviewer.

    Generate exactly 5 interview questions.

    Candidate Resume:
    {resume_text}

    Target Role:
    {target_role}

    Company:
    {company}

    Interview Type:
    {interview_type}

    Difficulty:
    {difficulty}

    IMPORTANT:
    Return ONLY valid JSON.

    Example format:

    {{
      "questions": [
        {{
          "id": 1,
          "question": "Explain React Hooks"
        }},
        {{
          "id": 2,
          "question": "Difference between SSR and CSR?"
        }}
      ]
    }}

    DO NOT write explanation.
    DO NOT use markdown.
    DO NOT use ```json
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

    print("\nRAW AI RESPONSE:\n")
    print(content)

    # Cleanup

    content = content.replace("```json", "")
    content = content.replace("```", "")
    content = content.strip()

    try:

        return json.loads(content)

    except Exception as e:

        print("\nJSON ERROR:\n", e)

        return {
            "questions": [
                {
                    "id": 1,
                    "question": "Failed to generate structured questions"
                }
            ]
        }