"use client";

import { useState } from "react";

type InterviewQuestion = {
    question?: string;
    [key: string]: unknown;
};

type InterviewHistoryEntry = {
    question: string;
    answer: string;
    feedback: string;
};

export default function MockInterviewPage() {

    const [file, setFile] = useState<File | null>(null);

    const [targetRole, setTargetRole] = useState("");

    const [company, setCompany] = useState("");

    const [difficulty, setDifficulty] = useState("");

    const [interviewType, setInterviewType] = useState("");

    const [questions, setQuestions] = useState<InterviewQuestion[]>([]);

    const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);

    const [interviewHistory, setInterviewHistory] = useState<InterviewHistoryEntry[]>([]);

    const [answer, setAnswer] = useState("");

    const [feedback, setFeedback] = useState("");

    const [loading, setLoading] = useState(false);

    const [interviewStarted, setInterviewStarted] =
        useState(false);

    const getQuestionText = (question: InterviewQuestion | string | null) => {
        if (!question) {
            return "";
        }

        if (typeof question === "string") {
            return question;
        }

        return question.question || "";
    };

    // GENERATE INTERVIEW

    const handleGenerateInterview = async () => {

        if (
            !file ||
            !targetRole ||
            !company ||
            !difficulty ||
            !interviewType
        ) {
            alert("Please fill all fields");
            return;
        }

        setLoading(true);

        const formData = new FormData();

        formData.append("file", file);

        formData.append("target_role", targetRole);

        formData.append("company", company);

        formData.append("interview_type", interviewType);

        formData.append("difficulty", difficulty);

        try {

            const response = await fetch(
                "http://127.0.0.1:8000/generate-interview",
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await response.json();

            console.log("API RESPONSE:", data);

            const generatedQuestions =
                data.questions ||
                data.interview_questions ||
                [];

            if (generatedQuestions.length > 0) {

                setQuestions(generatedQuestions);

                setCurrentQuestion(generatedQuestions[0]);

                setInterviewHistory([]);

                setAnswer("");

                setFeedback("");

                setInterviewStarted(true);

            } else {

                console.log("No valid questions:", data);

                alert("No questions generated");
            }

        } catch (error) {

            alert("Failed to generate interview");

        } finally {

            setLoading(false);
        }
    };

    // EVALUATE ANSWER

    const handleSubmitAnswer = async () => {

        if (!answer) {
            alert("Please enter answer");
            return;
        }

        const questionText = getQuestionText(currentQuestion);

        if (!questionText) {
            alert("No active question available");
            return;
        }

        setLoading(true);

        try {

            const evaluationResponse = await fetch(
                "http://127.0.0.1:8000/evaluate-answer",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        question: questionText,
                        answer: answer,
                    }),
                }
            );

            const evaluationData = await evaluationResponse.json();

            const nextQuestionResponse = await fetch(
                "http://127.0.0.1:8000/next-question",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        resume_text: "",
                        target_role: targetRole,
                        company: company,
                        interview_type: interviewType,
                        difficulty: difficulty,
                        previous_question: questionText,
                        candidate_answer: answer,
                        previous_feedback: evaluationData.feedback || "",
                        interview_history: [
                            ...interviewHistory,
                            {
                                question: questionText,
                                answer: answer,
                                feedback: evaluationData.feedback || "",
                            },
                        ],
                    }),
                }
            );

            const nextQuestionData = await nextQuestionResponse.json();

            const newQuestion =
                typeof nextQuestionData === "string"
                    ? { question: nextQuestionData }
                    : nextQuestionData;

            setFeedback(evaluationData.feedback);

            setInterviewHistory((currentHistory) => [
                ...currentHistory,
                {
                    question: questionText,
                    answer: answer,
                    feedback: evaluationData.feedback || "",
                },
            ]);

            setCurrentQuestion(newQuestion);

            setAnswer("");

        } catch (error) {

            alert("Failed to evaluate answer");

        } finally {

            setLoading(false);
        }
    };

    return (

        <main className="min-h-screen bg-black text-white px-6 py-10">

            <div className="max-w-6xl mx-auto">

                <h1 className="text-5xl font-bold mb-3">
                    AI Mock Interview
                </h1>

                <p className="text-zinc-400 text-lg mb-10">
                    Practice AI-powered placement interviews
                    customized to your resume and target company.
                </p>

                {/* INTERVIEW SETUP */}

                {!interviewStarted && (

                    <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl">

                        <div className="grid md:grid-cols-2 gap-6">

                            {/* Resume */}

                            <div>

                                <label className="block mb-3 text-lg">
                                    Upload Resume
                                </label>

                                <input
                                    type="file"
                                    accept=".pdf"
                                    className="w-full bg-zinc-800 p-3 rounded-xl"
                                    onChange={(e) => {
                                        if (e.target.files) {
                                            setFile(e.target.files[0]);
                                        }
                                    }}
                                />

                            </div>

                            {/* Target Role */}

                            <div>

                                <label className="block mb-3 text-lg">
                                    Target Role
                                </label>

                                <input
                                    type="text"
                                    placeholder="Frontend Developer"
                                    value={targetRole}
                                    onChange={(e) =>
                                        setTargetRole(e.target.value)
                                    }
                                    className="w-full bg-zinc-800 p-3 rounded-xl"
                                />

                            </div>

                            {/* Company */}

                            <div>

                                <label className="block mb-3 text-lg">
                                    Company
                                </label>

                                <input
                                    type="text"
                                    placeholder="Google"
                                    value={company}
                                    onChange={(e) =>
                                        setCompany(e.target.value)
                                    }
                                    className="w-full bg-zinc-800 p-3 rounded-xl"
                                />

                            </div>

                            {/* Interview Type */}

                            <div>

                                <label className="block mb-3 text-lg">
                                    Interview Type
                                </label>

                                <select
                                    value={interviewType}
                                    onChange={(e) =>
                                        setInterviewType(e.target.value)
                                    }
                                    className="w-full bg-zinc-800 p-3 rounded-xl"
                                >
                                    <option value="">
                                        Select Type
                                    </option>

                                    <option value="Technical">
                                        Technical
                                    </option>

                                    <option value="HR">
                                        HR
                                    </option>

                                    <option value="Behavioral">
                                        Behavioral
                                    </option>

                                </select>

                            </div>

                            {/* Difficulty */}

                            <div>

                                <label className="block mb-3 text-lg">
                                    Difficulty
                                </label>

                                <select
                                    value={difficulty}
                                    onChange={(e) =>
                                        setDifficulty(e.target.value)
                                    }
                                    className="w-full bg-zinc-800 p-3 rounded-xl"
                                >
                                    <option value="">
                                        Select Difficulty
                                    </option>

                                    <option value="Easy">
                                        Easy
                                    </option>

                                    <option value="Medium">
                                        Medium
                                    </option>

                                    <option value="Hard">
                                        Hard
                                    </option>

                                </select>

                            </div>

                        </div>

                        <button
                            onClick={handleGenerateInterview}
                            className="mt-8 bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-2xl font-semibold"
                        >
                            {loading
                                ? "Generating Interview..."
                                : "Start Mock Interview"}
                        </button>

                    </div>
                )}

                {/* INTERVIEW SECTION */}

                {interviewStarted && currentQuestion && (

                        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl">

                            <div className="mb-6">

                                <p className="text-zinc-400 mb-2">
                                    Adaptive AI Interview
                                </p>

                                <h2 className="text-3xl font-bold">
                                    {getQuestionText(currentQuestion)}
                                </h2>

                            </div>

                            {/* Answer */}

                            <textarea
                                placeholder="Write your answer here..."
                                value={answer}
                                onChange={(e) =>
                                    setAnswer(e.target.value)
                                }
                                className="w-full bg-zinc-800 p-5 rounded-2xl h-40 outline-none"
                            />

                            <button
                                onClick={handleSubmitAnswer}
                                disabled={loading}
                                className="mt-6 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl font-semibold"
                            >
                                {loading ? "Processing..." : "Submit Answer"}
                            </button>
                            <button
                                onClick={() => {
                                    setInterviewStarted(false);
                                    alert("Interview Ended");
                                }}
                                className="mt-4 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl font-semibold"
                            >
                                End Interview
                            </button>

                            {/* Feedback */}

                            {feedback && (

                                <div className="mt-8 bg-zinc-950 p-6 rounded-2xl">

                                    <h3 className="text-2xl font-bold mb-4">
                                        AI Feedback
                                    </h3>

                                    <pre className="whitespace-pre-wrap text-zinc-300 leading-8">
                                        {feedback}
                                    </pre>

                                </div>
                            )}

                        </div>
                    )}

            </div>

        </main>
    );
}