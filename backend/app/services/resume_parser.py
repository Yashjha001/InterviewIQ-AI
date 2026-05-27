KNOWN_SKILLS = [
    "Python",
    "Java",
    "JavaScript",
    "React",
    "Next.js",
    "MongoDB",
    "FastAPI",
    "Node.js",
    "SQL",
    "Machine Learning",
    "AI",
    "OpenCV",
    "Tailwind CSS",
    "TypeScript",
    "C++",
    "Git",
    "Docker",
    "Cloud Computing",
    "AWS",
    "Azure",
    "Linux",
    "Networking",
    "DevOps",
    "Cyber Security",
    "Data Science",
    "HTML",
    "CSS",
    "Firebase",
    "REST API",
    "Kubernetes"
]

def extract_skills(resume_text):

    found_skills = []

    for skill in KNOWN_SKILLS:
        if skill.lower() in resume_text.lower():
            found_skills.append(skill)

    return found_skills