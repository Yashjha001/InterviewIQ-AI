from app.services.groq_service import client


def evaluate_answer(
    question,
    answer
):

    prompt = f"""
    You are a senior FAANG technical interviewer.

    Evaluate the candidate answer professionally.

    INTERVIEW QUESTION:
    {question}

    CANDIDATE ANSWER:
    {answer}

    Return evaluation in this exact format:

    Score: X/10

    Communication:
    - Evaluate clarity and confidence

    Technical Accuracy:
    - Evaluate correctness and depth

    Strengths:
    - Mention what was good

    Weaknesses:
    - Mention missing points

    Expected Strong Answer:
    - Explain what an ideal candidate should mention

    Improvement Tips:
    - Give actionable improvement advice

    Hiring Decision:
    - Reject / Borderline / Hire

    Be highly detailed, realistic, and constructive.
    Return plain text only.
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