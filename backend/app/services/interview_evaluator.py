from app.services.groq_service import client


def evaluate_answer(
    question,
    answer
):

    prompt = f"""
    You are an expert technical interviewer.

    Interview Question:
    {question}

    Candidate Answer:
    {answer}

    Evaluate the answer.

    Give:

    1. Score out of 10
    2. Strengths
    3. Weaknesses
    4. Improvement tips

    Keep response concise.
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