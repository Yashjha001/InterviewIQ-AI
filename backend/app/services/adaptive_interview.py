from app.services.groq_service import client


def generate_next_question(

    resume_text,

    target_role,

    company,

    interview_type,

    difficulty,

    previous_question,

    candidate_answer,

    previous_feedback,

    interview_history

):

    prompt = f"""
    You are an expert AI interviewer.

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

    Previous Question:
    {previous_question}

    Candidate Answer:
    {candidate_answer}

    Previous Feedback:
    {previous_feedback}

    Interview History:
    {interview_history}

    Rules:
    - Ask ONE next interview question
    - Adapt based on candidate performance
    - Ask follow-up if answer was weak
    - Increase difficulty if answer was strong
    - Focus on company-specific interview style
    - Keep interview realistic

    Return ONLY JSON:

    {{
      "question": "next question here"
    }}
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

    content = content.replace("```json", "")
    content = content.replace("```", "")
    content = content.strip()

    import json

    return json.loads(content)