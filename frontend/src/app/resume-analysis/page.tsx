"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HiringImpression {
  verdict: string;
  summary: string;
  interview_probability: string;
}

interface FeedbackData {
  strengths: string[];
  weaknesses: string[];
  missing_critical_skills: string[];
  ats_optimization_tips: string[];
  project_suggestions: string[];
  keyword_recommendations: string[];
  hiring_impression: HiringImpression;
  error?: string;
  raw?: string;
}

interface AnalysisData {
  target_role: string;
  ats_score: number;
  matched_skills: string[];
  missing_skills: string[];
  extra_skills?: string[];
  total_required?: number;
  total_matched?: number;
}

interface ResultData {
  analysis: AnalysisData;
  feedback: FeedbackData | string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseFeedback(raw: FeedbackData | string): FeedbackData | null {
  if (!raw) return null;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return raw;
}

function getScoreColor(score: number): string {
  if (score >= 75) return "#22c55e";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

function getScoreLabel(score: number): string {
  if (score >= 75) return "Strong Match";
  if (score >= 50) return "Moderate Match";
  if (score >= 25) return "Weak Match";
  return "Not a Fit";
}

function getVerdictStyle(verdict: string): string {
  if (verdict?.includes("Strong")) return "text-green-400 bg-green-400/10 border-green-500/40";
  if (verdict?.includes("Moderate")) return "text-amber-400 bg-amber-400/10 border-amber-500/40";
  return "text-red-400 bg-red-400/10 border-red-500/40";
}

function getProbabilityDot(prob: string): string {
  if (prob === "High") return "bg-green-400";
  if (prob === "Medium") return "bg-amber-400";
  return "bg-red-400";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({
  title,
  color,
  icon,
  children,
}: {
  title: string;
  color: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "20px",
        padding: "28px",
      }}
    >
      <h3
        style={{
          fontSize: "1.1rem",
          fontWeight: 700,
          color,
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontFamily: "'DM Mono', monospace",
          letterSpacing: "0.02em",
        }}
      >
        <span>{icon}</span> {title}
      </h3>
      {children}
    </div>
  );
}

function BulletList({ items, accent }: { items: string[]; accent: string }) {
  if (!items?.length) return <p style={{ color: "#52525b", fontSize: "0.9rem" }}>None identified.</p>;
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
      {items.map((item, i) => (
        <li
          key={i}
          style={{
            display: "flex",
            gap: "10px",
            color: "#a1a1aa",
            fontSize: "0.92rem",
            lineHeight: 1.6,
          }}
        >
          <span style={{ color: accent, marginTop: "2px", flexShrink: 0 }}>▸</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ResumeAnalysisPage() {
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleAnalyze = async () => {
    if (!file || !targetRole.trim()) {
      alert("Please upload a resume and enter a target role.");
      return;
    }
    setLoading(true);
    setResult(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("target_role", targetRole);
    try {
      const response = await fetch("http://127.0.0.1:8000/analyze-resume", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setResult(data);
    } catch {
      alert("Something went wrong. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const feedback = result ? parseFeedback(result.feedback) : null;
  const analysis = result?.analysis;
  const scoreColor = analysis ? getScoreColor(analysis.ats_score) : "#22c55e";

  // Scorecard ring math
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const offset = analysis ? circ - (analysis.ats_score / 100) * circ : circ;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#09090b",
        color: "#fafafa",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        padding: "48px 24px 80px",
      }}
    >
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        input[type="file"]::file-selector-button {
          background: #3f3f46;
          color: #fafafa;
          border: none;
          padding: 6px 14px;
          border-radius: 8px;
          cursor: pointer;
          font-family: inherit;
          font-size: 0.85rem;
          margin-right: 10px;
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 3px; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .fade-up { animation: fadeUp 0.45s ease both; }
        .fade-up-1 { animation: fadeUp 0.45s 0.05s ease both; }
        .fade-up-2 { animation: fadeUp 0.45s 0.12s ease both; }
        .fade-up-3 { animation: fadeUp 0.45s 0.20s ease both; }
        .fade-up-4 { animation: fadeUp 0.45s 0.28s ease both; }
        .analyze-btn:hover { background: #2563eb !important; transform: translateY(-1px); }
        .analyze-btn:active { transform: translateY(0); }
        .analyze-btn { transition: background 0.2s, transform 0.15s; }
      `}</style>

      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* ── Header ── */}
        <div className="fade-up" style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
            <div
              style={{
                width: "36px", height: "36px", borderRadius: "10px",
                background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "18px",
              }}
            >
              📄
            </div>
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "0.75rem",
                color: "#6366f1",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              ATS Intelligence
            </span>
          </div>
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: 700,
              margin: 0,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            Resume Analyzer
          </h1>
          <p style={{ color: "#71717a", marginTop: "10px", fontSize: "1rem", maxWidth: "520px" }}>
            Upload your resume and target role to get AI-powered ATS scoring,
            skill gap analysis, and actionable hiring feedback.
          </p>
        </div>

        {/* ── Upload Card ── */}
        <div
          className="fade-up-1"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "24px",
            padding: "36px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "24px",
              marginBottom: "28px",
            }}
          >
            {/* File drop zone */}
            <div>
              <label style={{ display: "block", marginBottom: "10px", fontWeight: 600, fontSize: "0.9rem", color: "#d4d4d8" }}>
                Resume (PDF)
              </label>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const dropped = e.dataTransfer.files[0];
                  if (dropped?.type === "application/pdf") setFile(dropped);
                }}
                style={{
                  border: `2px dashed ${dragOver ? "#6366f1" : file ? "#22c55e" : "rgba(255,255,255,0.12)"}`,
                  borderRadius: "14px",
                  padding: "24px 16px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "border-color 0.2s, background 0.2s",
                  background: dragOver ? "rgba(99,102,241,0.06)" : file ? "rgba(34,197,94,0.05)" : "rgba(255,255,255,0.02)",
                }}
              >
                {file ? (
                  <div>
                    <div style={{ fontSize: "1.8rem", marginBottom: "6px" }}>✅</div>
                    <div style={{ color: "#22c55e", fontSize: "0.85rem", fontWeight: 600 }}>{file.name}</div>
                    <div style={{ color: "#52525b", fontSize: "0.78rem", marginTop: "4px" }}>
                      {(file.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: "1.8rem", marginBottom: "6px" }}>📎</div>
                    <div style={{ color: "#71717a", fontSize: "0.85rem" }}>Drag & drop or</div>
                  </div>
                )}
                <input
                  type="file"
                  accept=".pdf"
                  style={{ marginTop: "10px", width: "100%", color: "#a1a1aa", fontSize: "0.85rem" }}
                  onChange={(e) => { if (e.target.files) setFile(e.target.files[0]); }}
                />
              </div>
            </div>

            {/* Target role */}
            <div>
              <label style={{ display: "block", marginBottom: "10px", fontWeight: 600, fontSize: "0.9rem", color: "#d4d4d8" }}>
                Target Role
              </label>
              <input
                type="text"
                placeholder="e.g. Senior DevOps Engineer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  padding: "13px 16px",
                  color: "#fafafa",
                  fontSize: "0.95rem",
                  outline: "none",
                  transition: "border-color 0.2s",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
              <p style={{ color: "#52525b", fontSize: "0.78rem", marginTop: "8px" }}>
                Be specific — "Frontend Engineer (React)" outperforms "Developer"
              </p>
            </div>
          </div>

          <button
            className="analyze-btn"
            onClick={handleAnalyze}
            disabled={loading}
            style={{
              background: loading ? "#27272a" : "#3b82f6",
              color: loading ? "#71717a" : "#fff",
              border: "none",
              borderRadius: "14px",
              padding: "14px 32px",
              fontSize: "0.95rem",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontFamily: "inherit",
            }}
          >
            {loading ? (
              <>
                <span
                  style={{
                    width: "16px", height: "16px",
                    border: "2px solid #52525b",
                    borderTopColor: "#a1a1aa",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                Analyzing Resume…
              </>
            ) : (
              <> ⚡ Analyze Resume </>
            )}
          </button>
        </div>

        {/* ── Results ── */}
        {result && analysis && (
          <div>

            {/* ── ATS Score Banner ── */}
            <div
              className="fade-up"
              style={{
                background: `linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))`,
                border: `1px solid ${scoreColor}33`,
                borderRadius: "24px",
                padding: "36px",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                gap: "36px",
                flexWrap: "wrap",
              }}
            >
              {/* Ring */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <svg width="130" height="130" viewBox="0 0 130 130">
                  <circle cx="65" cy="65" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                  <circle
                    cx="65" cy="65" r={radius}
                    fill="none"
                    stroke={scoreColor}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    transform="rotate(-90 65 65)"
                    style={{ transition: "stroke-dashoffset 1s ease" }}
                  />
                </svg>
                <div
                  style={{
                    position: "absolute", inset: 0,
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: "1.8rem", fontWeight: 800, color: scoreColor, lineHeight: 1 }}>
                    {analysis.ats_score}
                  </span>
                  <span style={{ fontSize: "0.7rem", color: "#71717a", marginTop: "2px" }}>/ 100</span>
                </div>
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: "200px" }}>
                <div
                  style={{
                    display: "inline-block",
                    background: `${scoreColor}18`,
                    color: scoreColor,
                    border: `1px solid ${scoreColor}44`,
                    borderRadius: "20px",
                    padding: "4px 14px",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    fontFamily: "'DM Mono', monospace",
                    marginBottom: "10px",
                  }}
                >
                  {getScoreLabel(analysis.ats_score)}
                </div>
                <h2 style={{ fontSize: "1.6rem", fontWeight: 700, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
                  ATS Score
                </h2>
                <p style={{ color: "#71717a", margin: 0, fontSize: "0.92rem" }}>
                  Analyzed for{" "}
                  <span style={{ color: "#fafafa", fontWeight: 600 }}>{analysis.target_role}</span>
                  {analysis.total_required && (
                    <> — {analysis.total_matched ?? analysis.matched_skills.length} of {analysis.total_required} required skills matched</>
                  )}
                </p>
              </div>
            </div>

            {/* ── Skills Grid ── */}
            <div
              className="fade-up-1"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "20px",
                marginBottom: "24px",
              }}
            >
              {/* Matched */}
              <div
                style={{
                  background: "rgba(34,197,94,0.04)",
                  border: "1px solid rgba(34,197,94,0.18)",
                  borderRadius: "20px",
                  padding: "24px",
                }}
              >
                <h3 style={{ margin: "0 0 16px", fontSize: "1rem", fontWeight: 700, color: "#22c55e", display: "flex", alignItems: "center", gap: "8px" }}>
                  ✅ Matched Skills
                  <span style={{ background: "rgba(34,197,94,0.15)", borderRadius: "20px", padding: "2px 10px", fontSize: "0.78rem", color: "#22c55e" }}>
                    {analysis.matched_skills.length}
                  </span>
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {analysis.matched_skills.length ? analysis.matched_skills.map((skill, i) => (
                    <span
                      key={i}
                      style={{
                        background: "rgba(34,197,94,0.1)",
                        color: "#4ade80",
                        border: "1px solid rgba(34,197,94,0.3)",
                        borderRadius: "20px",
                        padding: "4px 12px",
                        fontSize: "0.82rem",
                        fontWeight: 500,
                      }}
                    >
                      {skill}
                    </span>
                  )) : <span style={{ color: "#52525b", fontSize: "0.85rem" }}>None matched</span>}
                </div>
              </div>

              {/* Missing */}
              <div
                style={{
                  background: "rgba(239,68,68,0.04)",
                  border: "1px solid rgba(239,68,68,0.18)",
                  borderRadius: "20px",
                  padding: "24px",
                }}
              >
                <h3 style={{ margin: "0 0 16px", fontSize: "1rem", fontWeight: 700, color: "#f87171", display: "flex", alignItems: "center", gap: "8px" }}>
                  ❌ Missing Skills
                  <span style={{ background: "rgba(239,68,68,0.15)", borderRadius: "20px", padding: "2px 10px", fontSize: "0.78rem", color: "#f87171" }}>
                    {analysis.missing_skills.length}
                  </span>
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {analysis.missing_skills.length ? analysis.missing_skills.map((skill, i) => (
                    <span
                      key={i}
                      style={{
                        background: "rgba(239,68,68,0.1)",
                        color: "#f87171",
                        border: "1px solid rgba(239,68,68,0.3)",
                        borderRadius: "20px",
                        padding: "4px 12px",
                        fontSize: "0.82rem",
                        fontWeight: 500,
                      }}
                    >
                      {skill}
                    </span>
                  )) : <span style={{ color: "#52525b", fontSize: "0.85rem" }}>None missing 🎉</span>}
                </div>
              </div>

              {/* Extra skills (bonus) */}
              {analysis.extra_skills && analysis.extra_skills.length > 0 && (
                <div
                  style={{
                    background: "rgba(99,102,241,0.04)",
                    border: "1px solid rgba(99,102,241,0.18)",
                    borderRadius: "20px",
                    padding: "24px",
                    gridColumn: "1 / -1",
                  }}
                >
                  <h3 style={{ margin: "0 0 16px", fontSize: "1rem", fontWeight: 700, color: "#818cf8", display: "flex", alignItems: "center", gap: "8px" }}>
                    ⭐ Bonus Skills
                    <span style={{ background: "rgba(99,102,241,0.15)", borderRadius: "20px", padding: "2px 10px", fontSize: "0.78rem", color: "#818cf8" }}>
                      {analysis.extra_skills.length}
                    </span>
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {analysis.extra_skills.map((skill, i) => (
                      <span
                        key={i}
                        style={{
                          background: "rgba(99,102,241,0.1)",
                          color: "#a5b4fc",
                          border: "1px solid rgba(99,102,241,0.3)",
                          borderRadius: "20px",
                          padding: "4px 12px",
                          fontSize: "0.82rem",
                          fontWeight: 500,
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── AI Feedback ── */}
            {feedback && !feedback.error && (
              <div className="fade-up-2" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                {/* Hiring Impression — top of feedback */}
                {feedback.hiring_impression && (
                  <div
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "20px",
                      padding: "28px",
                    }}
                  >
                    <h3 style={{ margin: "0 0 20px", fontSize: "1.1rem", fontWeight: 700, fontFamily: "'DM Mono', monospace", color: "#fafafa" }}>
                      👔 Hiring Impression
                    </h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
                      <span
                        style={{
                          padding: "6px 18px",
                          borderRadius: "20px",
                          fontSize: "0.9rem",
                          fontWeight: 700,
                          border: "1px solid",
                        }}
                        className={getVerdictStyle(feedback.hiring_impression.verdict)}
                      >
                        {feedback.hiring_impression.verdict}
                      </span>

                      <span style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "0.85rem", color: "#a1a1aa" }}>
                        <span
                          style={{
                            width: "8px", height: "8px", borderRadius: "50%",
                            display: "inline-block",
                          }}
                          className={getProbabilityDot(feedback.hiring_impression.interview_probability)}
                        />
                        Interview Probability:{" "}
                        <strong style={{ color: "#fafafa" }}>{feedback.hiring_impression.interview_probability}</strong>
                      </span>
                    </div>
                    <p style={{ color: "#a1a1aa", margin: 0, fontSize: "0.92rem", lineHeight: 1.7 }}>
                      {feedback.hiring_impression.summary}
                    </p>
                  </div>
                )}

                {/* 2-column feedback grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px" }}>

                  <SectionCard title="Strengths" color="#22c55e" icon="✅">
                    <BulletList items={feedback.strengths} accent="#22c55e" />
                  </SectionCard>

                  <SectionCard title="Weak Areas" color="#f87171" icon="⚠️">
                    <BulletList items={feedback.weaknesses} accent="#f87171" />
                  </SectionCard>

                  <SectionCard title="Missing Critical Skills" color="#fb923c" icon="🔍">
                    <BulletList items={feedback.missing_critical_skills} accent="#fb923c" />
                  </SectionCard>

                  <SectionCard title="ATS Optimization Tips" color="#38bdf8" icon="🎯">
                    <BulletList items={feedback.ats_optimization_tips} accent="#38bdf8" />
                  </SectionCard>

                  <SectionCard title="Project Suggestions" color="#c084fc" icon="🛠️">
                    <BulletList items={feedback.project_suggestions} accent="#c084fc" />
                  </SectionCard>

                  {/* Keyword chips */}
                  <SectionCard title="Recommended Keywords" color="#f472b6" icon="🔑">
                    {feedback.keyword_recommendations?.length ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {feedback.keyword_recommendations.map((kw, i) => (
                          <span
                            key={i}
                            style={{
                              background: "rgba(244,114,182,0.1)",
                              color: "#f9a8d4",
                              border: "1px solid rgba(244,114,182,0.3)",
                              borderRadius: "20px",
                              padding: "5px 13px",
                              fontSize: "0.82rem",
                              fontWeight: 500,
                            }}
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: "#52525b", fontSize: "0.9rem" }}>None suggested.</p>
                    )}
                  </SectionCard>

                </div>
              </div>
            )}

            {/* Fallback: if feedback failed to parse */}
            {feedback?.error && (
              <div
                className="fade-up-3"
                style={{
                  background: "rgba(239,68,68,0.06)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: "16px",
                  padding: "20px 24px",
                  color: "#f87171",
                  fontSize: "0.9rem",
                }}
              >
                ⚠️ Could not load AI feedback: {feedback.error}
                {feedback.raw && (
                  <pre style={{ marginTop: "12px", color: "#71717a", fontSize: "0.78rem", whiteSpace: "pre-wrap" }}>
                    {feedback.raw}
                  </pre>
                )}
              </div>
            )}

          </div>
        )}
      </div>
    </main>
  );
}