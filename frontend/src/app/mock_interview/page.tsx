"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type InterviewQuestion = {
  question?: string;
  [key: string]: unknown;
};

type InterviewHistoryEntry = {
  question: string;
  answer: string;
  feedback: string;
};

type FeedbackData = {
  score?: number;
  rating?: string;
  strengths?: string[];
  improvements?: string[];
  ideal_answer?: string;
  tip?: string;
  raw?: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getQuestionText(q: InterviewQuestion | string | null): string {
  if (!q) return "";
  if (typeof q === "string") return q;
  return q.question || "";
}

function parseFeedback(raw: string | FeedbackData | null): FeedbackData | null {
  if (!raw) return null;
  if (typeof raw === "object") return raw as FeedbackData;
  try {
    const cleaned = (raw as string).replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    const scoreMatch = (raw as string).match(/Score:\s*(\d+(?:\.\d+)?)\s*\/\s*10/i);
    const ratingMatch = (raw as string).match(/Hiring Decision:\s*(.+)/i);

    return {
      raw: raw as string,
      score: scoreMatch ? Math.round(Number(scoreMatch[1]) * 10) : undefined,
      rating: ratingMatch ? ratingMatch[1].trim() : undefined,
    };
  }
}

function getDifficultyColor(d: string) {
  if (d === "Easy") return { color: "#22c55e", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.3)" };
  if (d === "Medium") return { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)" };
  return { color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)" };
}

function getTypeIcon(t: string) {
  if (t === "Technical") return "⚙️";
  if (t === "HR") return "🤝";
  if (t === "Behavioral") return "🧠";
  return "💬";
}

function getScoreColor(score: number) {
  if (score >= 80) return "#22c55e";
  if (score >= 55) return "#f59e0b";
  return "#ef4444";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Badge({ label, color, bg, border }: { label: string; color: string; bg: string; border: string }) {
  return (
    <span style={{
      background: bg, color, border: `1px solid ${border}`,
      borderRadius: "20px", padding: "3px 12px", fontSize: "0.78rem", fontWeight: 700,
      fontFamily: "'DM Mono', monospace",
    }}>
      {label}
    </span>
  );
}

function FeedbackPanel({ feedback }: { feedback: FeedbackData }) {
  if (feedback.raw) {
    return (
      <div className="glass-card" style={{ padding: "20px" }}>
        <div style={{ whiteSpace: "pre-wrap", color: "#a1a1aa", fontSize: "0.9rem", lineHeight: 1.8, margin: 0 }}>
          {feedback.raw}
        </div>
      </div>
    );
  }

  const scoreColor = feedback.score ? getScoreColor(feedback.score) : "#6366f1";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* Score + Rating */}
      {(feedback.score !== undefined || feedback.rating) && (
        <div style={{
          display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap",
          background: "rgba(255,255,255,0.03)", borderRadius: "16px", padding: "18px 22px",
        }}>
          {feedback.score !== undefined && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <svg width="52" height="52" viewBox="0 0 52 52">
                <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
                <circle cx="26" cy="26" r="22" fill="none" stroke={scoreColor} strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 22}
                  strokeDashoffset={2 * Math.PI * 22 * (1 - feedback.score / 100)}
                  transform="rotate(-90 26 26)"
                />
              </svg>
              <div>
                <div style={{ fontSize: "1.4rem", fontWeight: 800, color: scoreColor, lineHeight: 1 }}>
                  {feedback.score}<span style={{ fontSize: "0.8rem", color: "#71717a" }}>/100</span>
                </div>
                <div style={{ fontSize: "0.72rem", color: "#71717a", marginTop: "2px" }}>Answer Score</div>
              </div>
            </div>
          )}
          {feedback.rating && (
            <span style={{
              background: `${scoreColor}18`, color: scoreColor, border: `1px solid ${scoreColor}44`,
              borderRadius: "20px", padding: "5px 16px", fontSize: "0.88rem", fontWeight: 700,
            }}>
              {feedback.rating}
            </span>
          )}
        </div>
      )}

      {/* Strengths */}
      {feedback.strengths?.length ? (
        <div style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: "14px", padding: "18px 20px" }}>
          <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#22c55e", marginBottom: "10px", fontFamily: "'DM Mono', monospace" }}>
            ✅ STRENGTHS
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "7px" }}>
            {feedback.strengths.map((s, i) => (
              <li key={i} style={{ display: "flex", gap: "8px", color: "#a1a1aa", fontSize: "0.88rem", lineHeight: 1.6 }}>
                <span style={{ color: "#22c55e", flexShrink: 0 }}>▸</span>{s}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Improvements */}
      {feedback.improvements?.length ? (
        <div style={{ background: "rgba(251,146,60,0.05)", border: "1px solid rgba(251,146,60,0.15)", borderRadius: "14px", padding: "18px 20px" }}>
          <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fb923c", marginBottom: "10px", fontFamily: "'DM Mono', monospace" }}>
            ⚠️ AREAS TO IMPROVE
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "7px" }}>
            {feedback.improvements.map((s, i) => (
              <li key={i} style={{ display: "flex", gap: "8px", color: "#a1a1aa", fontSize: "0.88rem", lineHeight: 1.6 }}>
                <span style={{ color: "#fb923c", flexShrink: 0 }}>▸</span>{s}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Ideal Answer */}
      {feedback.ideal_answer && (
        <div style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.18)", borderRadius: "14px", padding: "18px 20px" }}>
          <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#818cf8", marginBottom: "10px", fontFamily: "'DM Mono', monospace" }}>
            💡 IDEAL ANSWER APPROACH
          </div>
          <p style={{ color: "#a1a1aa", fontSize: "0.88rem", lineHeight: 1.7, margin: 0 }}>
            {feedback.ideal_answer}
          </p>
        </div>
      )}

      {/* Tip */}
      {feedback.tip && (
        <div style={{ background: "rgba(56,189,248,0.05)", border: "1px solid rgba(56,189,248,0.15)", borderRadius: "14px", padding: "14px 20px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
          <span style={{ fontSize: "1rem", flexShrink: 0 }}>🎯</span>
          <p style={{ color: "#7dd3fc", fontSize: "0.87rem", lineHeight: 1.6, margin: 0 }}>
            <strong style={{ color: "#38bdf8" }}>Pro Tip: </strong>{feedback.tip}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MockInterviewPage() {
  const [file, setFile] = useState<File | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [targetRole, setTargetRole] = useState("");
  const [company, setCompany] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [interviewType, setInterviewType] = useState("");
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [interviewHistory, setInterviewHistory] = useState<InterviewHistoryEntry[]>([]);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const userId = session?.user?.email ?? "guest";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <h1 className="text-3xl font-bold">Loading...</h1>
      </main>
    );
  }

  const questionNumber = interviewHistory.length + 1;
  const diffStyle = difficulty ? getDifficultyColor(difficulty) : { color: "#71717a", bg: "transparent", border: "transparent" };

  // ── Generate ──────────────────────────────────────────────────────────────

  const handleGenerateInterview = async () => {
    if (!file || !targetRole || !company || !difficulty || !interviewType) {
      alert("Please fill all fields before starting.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("target_role", targetRole);
    formData.append("company", company);
    formData.append("interview_type", interviewType);
    formData.append("difficulty", difficulty);
    formData.append("user_id", userId);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate-interview`, { method: "POST", body: formData });
      const data = await res.json();
      const generated = data.questions || data.interview_questions || [];
      if (generated.length > 0) {
        setQuestions(generated);
        setCurrentQuestion(getQuestionText(generated[0]));
        setInterviewHistory([]);
        setAnswer("");
        setFeedback(null);
        setIsThinking(false);
        setInterviewStarted(true);
        setInterviewEnded(false);
      } else {
        alert("No questions were generated. Please try again.");
      }
    } catch {
      alert("Failed to connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  // ── Submit Answer ─────────────────────────────────────────────────────────

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) { alert("Please write your answer first."); return; }
    const questionText = currentQuestion;
    if (!questionText) { alert("No active question."); return; }
    setLoading(true);
    setFeedback(null);
    try {
      const evalRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/evaluate-answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: questionText, answer, user_id: userId }),
      });

      const evalData = await evalRes.json();
      const parsedFeedback = parseFeedback(evalData.feedback);
      const newEntry: InterviewHistoryEntry = {
        question: questionText,
        answer,
        feedback: typeof evalData.feedback === "string" ? evalData.feedback : JSON.stringify(evalData.feedback),
      };

      setFeedback(parsedFeedback);
      setInterviewHistory((h) => [...h, newEntry]);
      setAnswer("");

      setIsThinking(true);

      const nextRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/next-question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_text: "",
          target_role: targetRole,
          company,
          interview_type: interviewType,
          difficulty,
          previous_question: questionText,
          candidate_answer: answer,
          previous_feedback: evalData.feedback || "",
          interview_history: [...interviewHistory, { question: questionText, answer, feedback: evalData.feedback || "" }],
          user_id: userId,
        }),
      });

      const nextData = await nextRes.json();
      setCurrentQuestion(typeof nextData === "string" ? nextData : nextData.question || "");
      setIsThinking(false);
    } catch {
      alert("Failed to evaluate answer.");
      setIsThinking(false);
    } finally {
      setLoading(false);
    }
  };

  // ── End Interview ─────────────────────────────────────────────────────────

  const handleEndInterview = async () => {
    try {
      const averageScore = Math.round(
        interviewHistory.reduce((sum, h) => {
          try {
            const parsed = typeof h.feedback === "string" ? parseFeedback(h.feedback) : (h.feedback as unknown as FeedbackData);
            return sum + (parsed?.score ?? 0);
          } catch {
            return sum;
          }
        }, 0) / (interviewHistory.length || 1)
      );

      const completionPayload = {
        user_id: userId,
        target_role: targetRole,
        company,
        interview_type: interviewType,
        difficulty,
        questions: interviewHistory.map((entry) => entry.question),
        answers: interviewHistory.map((entry) => entry.answer),
        feedback: interviewHistory.map((entry) => entry.feedback),
        avg_score: averageScore,
        createdAt: new Date().toISOString(),
      };

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/save-interview-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(completionPayload),
      });
    } catch {
      alert("Failed to save interview session.");
    } finally {
      setInterviewEnded(true);
      setInterviewStarted(false);
      setIsThinking(false);
    }
  };

  const handleRestart = () => {
    setInterviewStarted(false);
    setInterviewEnded(false);
    setInterviewHistory([]);
    setQuestions([]);
    setCurrentQuestion("");
    setFeedback(null);
    setAnswer("");
    setIsThinking(false);
  };

  // ── Avg score from history ────────────────────────────────────────────────
  const avgScore = (() => {
    const scores = interviewHistory
      .map((h) => { try { const f = parseFeedback(h.feedback); return f?.score; } catch { return null; } })
      .filter((s): s is number => typeof s === "number");
    return scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  })();

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <main style={{ minHeight: "100vh", background: "#09090b", color: "#fafafa", fontFamily: "var(--font-dm-sans), 'Segoe UI', sans-serif", padding: "48px 24px 80px" }}>

      <div style={{ maxWidth: "860px", margin: "0 auto" }}>

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="fade-up" style={{ marginBottom: "36px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <div style={{
              width: "34px", height: "34px", borderRadius: "10px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px",
            }}>🎤</div>
            <span className="code-font" style={{ fontSize: "0.72rem", color: "#8b5cf6", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              AI Interview Coach
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(1.8rem,5vw,2.8rem)", fontWeight: 700, margin: 0, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
            Mock Interview
          </h1>
          <p style={{ color: "#71717a", marginTop: "8px", fontSize: "0.95rem" }}>
            AI-powered adaptive interviews tailored to your resume, role, and company.
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* SETUP FORM                                                        */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {!interviewStarted && !interviewEnded && (
          <div className="fade-up" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "36px" }}>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "28px" }}>

              {/* Resume Upload */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", marginBottom: "10px", fontWeight: 600, fontSize: "0.88rem", color: "#d4d4d8" }}>
                  Resume (PDF)
                </label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f?.type === "application/pdf") setFile(f); }}
                  style={{
                    border: `2px dashed ${dragOver ? "#8b5cf6" : file ? "#22c55e" : "rgba(255,255,255,0.1)"}`,
                    borderRadius: "14px", padding: "20px 16px", textAlign: "center",
                    background: dragOver ? "rgba(139,92,246,0.05)" : file ? "rgba(34,197,94,0.04)" : "transparent",
                    transition: "all 0.2s",
                  }}
                >
                  {file ? (
                    <div>
                      <div style={{ fontSize: "1.4rem", marginBottom: "4px" }}>✅</div>
                      <div style={{ color: "#22c55e", fontSize: "0.85rem", fontWeight: 600 }}>{file.name}</div>
                      <div style={{ color: "#52525b", fontSize: "0.75rem", marginTop: "3px" }}>{(file.size / 1024).toFixed(1)} KB</div>
                    </div>
                  ) : (
                    <div style={{ color: "#52525b", fontSize: "0.85rem" }}>📎 Drag & drop PDF or browse</div>
                  )}
                  <input type="file" accept=".pdf" style={{ marginTop: "8px", color: "#a1a1aa", fontSize: "0.83rem" }}
                    onChange={(e) => { if (e.target.files) setFile(e.target.files[0]); }} />
                </div>
              </div>

              {/* Target Role */}
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "0.88rem", color: "#d4d4d8" }}>Target Role</label>
                <input type="text" placeholder="Frontend Developer" value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="field-input"
                  style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "12px 14px", color: "#fafafa", fontSize: "0.92rem", fontFamily: "inherit" }} />
              </div>

              {/* Company */}
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "0.88rem", color: "#d4d4d8" }}>Company</label>
                <input type="text" placeholder="Google, Amazon, Startup…" value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="field-input"
                  style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "12px 14px", color: "#fafafa", fontSize: "0.92rem", fontFamily: "inherit" }} />
              </div>

              {/* Interview Type */}
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "0.88rem", color: "#d4d4d8" }}>Interview Type</label>
                <select value={interviewType} onChange={(e) => setInterviewType(e.target.value)}
                  className="field-input"
                  style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "12px 14px", color: interviewType ? "#fafafa" : "#71717a", fontSize: "0.92rem", fontFamily: "inherit" }}>
                  <option value="">Select Type</option>
                  <option value="Technical">⚙️ Technical</option>
                  <option value="HR">🤝 HR</option>
                  <option value="Behavioral">🧠 Behavioral</option>
                </select>
              </div>

              {/* Difficulty */}
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "0.88rem", color: "#d4d4d8" }}>Difficulty</label>
                <div style={{ display: "flex", gap: "10px" }}>
                  {["Easy", "Medium", "Hard"].map((d) => {
                    const s = getDifficultyColor(d);
                    const active = difficulty === d;
                    return (
                      <button key={d} onClick={() => setDifficulty(d)}
                        style={{
                          flex: 1, padding: "11px 0", borderRadius: "10px", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                          background: active ? s.bg : "rgba(255,255,255,0.03)",
                          color: active ? s.color : "#71717a",
                          border: `1px solid ${active ? s.border : "rgba(255,255,255,0.08)"}`,
                          transition: "all 0.18s",
                        }}>
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            <button className="btn-primary" onClick={handleGenerateInterview} disabled={loading}
              style={{
                background: loading ? "#27272a" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: loading ? "#71717a" : "#fff",
                border: "none", borderRadius: "14px", padding: "14px 32px",
                fontSize: "0.95rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: "10px", fontFamily: "inherit",
              }}>
              {loading ? (
                <><span style={{ width: "15px", height: "15px", border: "2px solid #52525b", borderTopColor: "#a1a1aa", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />Generating Interview…</>
              ) : "🎤 Start Mock Interview"}
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ACTIVE INTERVIEW                                                  */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {interviewStarted && currentQuestion && (
          <div className="fade-up">

            {/* Meta bar */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <Badge label={`${getTypeIcon(interviewType)} ${interviewType}`} color="#a5b4fc" bg="rgba(99,102,241,0.1)" border="rgba(99,102,241,0.3)" />
              {difficulty && <Badge label={difficulty} {...getDifficultyColor(difficulty)} />}
              <Badge label={company} color="#e4e4e7" bg="rgba(255,255,255,0.05)" border="rgba(255,255,255,0.1)" />
              <div className="code-font" style={{ marginLeft: "auto", fontSize: "0.75rem", color: "#52525b" }}>
                Q{questionNumber} &nbsp;·&nbsp; {interviewHistory.length} answered
              </div>
            </div>

            {/* Question card */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "28px 30px", marginBottom: "20px" }}>
              <div className="code-font" style={{ fontSize: "0.72rem", color: "#6366f1", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>
                Question {questionNumber}
              </div>
              <div className="text-2xl font-semibold text-white leading-relaxed">
                {isThinking ? "AI Interviewer is thinking..." : currentQuestion || "Loading next question..."}
              </div>
            </div>

            {/* Answer box */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "0.85rem", fontWeight: 600, color: "#a1a1aa" }}>
                Your Answer
              </label>
              <textarea
                placeholder="Write your answer here. Be specific, use examples (STAR method for behavioral), and stay concise…"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={6}
                className="field-input"
                style={{
                  width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "16px", padding: "16px 18px", color: "#fafafa", fontSize: "0.92rem",
                  lineHeight: 1.7, fontFamily: "inherit",
                }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "6px" }}>
                <span className="code-font" style={{ fontSize: "0.75rem", color: answer.length > 50 ? "#52525b" : "#ef4444" }}>
                  {answer.length} chars
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "28px" }}>
              <button className="btn-primary" onClick={handleSubmitAnswer} disabled={loading}
                style={{
                  background: loading ? "#27272a" : "#22c55e", color: loading ? "#71717a" : "#fff",
                  border: "none", borderRadius: "12px", padding: "13px 26px", fontSize: "0.9rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "8px",
                }}>
                {loading ? (
                  <><span style={{ width: "14px", height: "14px", border: "2px solid #52525b", borderTopColor: "#a1a1aa", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />Evaluating…</>
                ) : "✓ Submit Answer"}
              </button>

              <button className="btn-primary" onClick={() => setShowHistory(!showHistory)}
                style={{ background: "rgba(255,255,255,0.06)", color: "#a1a1aa", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "13px 22px", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                📋 History ({interviewHistory.length})
              </button>

              <button className="btn-primary" onClick={handleEndInterview}
                style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "12px", padding: "13px 22px", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginLeft: "auto" }}>
                ✕ End Interview
              </button>
            </div>

            {/* Feedback */}
            {feedback && (
              <div className="fade-up" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "24px 26px", marginBottom: "28px" }}>
                <h3 className="code-font" style={{ margin: "0 0 18px", fontSize: "1rem", fontWeight: 700, color: "#fafafa", display: "flex", alignItems: "center", gap: "8px" }}>
                  🤖 AI Feedback
                </h3>
                <FeedbackPanel feedback={feedback} />
              </div>
            )}

            {/* History accordion */}
            {showHistory && interviewHistory.length > 0 && (
              <div className="fade-up" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "20px 24px" }}>
                <h3 className="code-font" style={{ margin: "0 0 16px", fontSize: "0.9rem", fontWeight: 700, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Interview History
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {interviewHistory.map((entry, i) => (
                    <div key={i} className="history-item" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "14px 16px", transition: "background 0.15s" }}>
                      <div className="code-font" style={{ fontSize: "0.72rem", color: "#6366f1", marginBottom: "6px" }}>Q{i + 1}</div>
                      <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "#e4e4e7", marginBottom: "8px", lineHeight: 1.5 }}>{entry.question}</div>
                      <div style={{ fontSize: "0.83rem", color: "#71717a", lineHeight: 1.6, borderLeft: "2px solid rgba(255,255,255,0.08)", paddingLeft: "12px" }}>{entry.answer}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* INTERVIEW SUMMARY                                                 */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {interviewEnded && (
          <div className="fade-up">

            {/* Summary header */}
            <div style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "24px", padding: "36px", marginBottom: "24px", textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🎉</div>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.02em" }}>Interview Complete</h2>
              <p style={{ color: "#71717a", margin: "0 0 24px", fontSize: "0.95rem" }}>
                {interviewHistory.length} question{interviewHistory.length !== 1 ? "s" : ""} answered for <strong style={{ color: "#fafafa" }}>{targetRole}</strong> at <strong style={{ color: "#fafafa" }}>{company}</strong>
              </p>

              {avgScore !== null && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,0.04)", borderRadius: "16px", padding: "14px 24px" }}>
                  <span style={{ fontSize: "2rem", fontWeight: 800, color: getScoreColor(avgScore) }}>{avgScore}</span>
                  <div style={{ textAlign: "left" }}>
                    <div className="code-font" style={{ fontSize: "0.72rem", color: "#71717a" }}>AVG SCORE</div>
                    <div style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>{avgScore >= 80 ? "Excellent performance!" : avgScore >= 60 ? "Good — keep practicing" : "Needs more preparation"}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Q&A Review */}
            {interviewHistory.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
                <h3 className="code-font" style={{ margin: 0, fontSize: "0.85rem", color: "#52525b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Session Review
                </h3>
                {interviewHistory.map((entry, i) => {
                  const fb = parseFeedback(entry.feedback);
                  return (
                    <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "18px", padding: "22px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                        <span className="code-font" style={{ fontSize: "0.72rem", color: "#6366f1" }}>Q{i + 1}</span>
                        {fb?.score !== undefined && (
                          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: getScoreColor(fb.score), background: `${getScoreColor(fb.score)}18`, padding: "2px 10px", borderRadius: "20px" }}>
                            {fb.score}/100
                          </span>
                        )}
                      </div>
                      <p style={{ fontWeight: 600, color: "#e4e4e7", fontSize: "0.92rem", lineHeight: 1.5, margin: "0 0 10px" }}>{entry.question}</p>
                      <p style={{ color: "#71717a", fontSize: "0.85rem", lineHeight: 1.6, margin: "0 0 12px", borderLeft: "2px solid rgba(255,255,255,0.07)", paddingLeft: "12px" }}>{entry.answer}</p>
                      {fb && <FeedbackPanel feedback={fb} />}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Restart */}
            <button className="btn-primary" onClick={handleRestart}
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", border: "none", borderRadius: "14px", padding: "14px 32px", fontSize: "0.95rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              🔄 Start New Interview
            </button>
          </div>
        )}

      </div>
    </main>
  );
}