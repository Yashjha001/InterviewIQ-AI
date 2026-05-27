"use client";

import { useState } from "react";

export default function ResumeAnalysisPage() {

  const [file, setFile] = useState<File | null>(null);

  const [targetRole, setTargetRole] = useState("");

  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {

    if (!file || !targetRole) {
      alert("Please upload resume and enter target role");
      return;
    }

    setLoading(true);

    const formData = new FormData();

    formData.append("file", file);
    formData.append("target_role", targetRole);

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/analyze-resume",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      setResult(data);

    } catch (error) {

      alert("Something went wrong");

    } finally {

      setLoading(false);
    }
  };

  return (

    <main className="min-h-screen bg-black text-white px-6 py-10">

      <div className="max-w-6xl mx-auto">

        <h1 className="text-5xl font-bold mb-3">
          AI Resume Analyzer
        </h1>

        <p className="text-zinc-400 mb-10 text-lg">
          Upload your resume and get AI-powered ATS analysis,
          missing skills detection, and hiring feedback.
        </p>

        {/* Upload Section */}

        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl mb-10">

          <div className="grid md:grid-cols-2 gap-6">

            {/* Upload Resume */}

            <div>

              <label className="block mb-3 text-lg font-medium">
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

              <label className="block mb-3 text-lg font-medium">
                Enter Target Role
              </label>

              <input
                type="text"
                placeholder="Example: DevOps Engineer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-zinc-800 p-3 rounded-xl outline-none"
              />

            </div>

          </div>

          <button
            onClick={handleAnalyze}
            className="mt-8 bg-blue-600 hover:bg-blue-700 transition-all px-8 py-4 rounded-2xl text-lg font-semibold"
          >
            {loading ? "Analyzing Resume..." : "Analyze Resume"}
          </button>

        </div>

        {/* Results */}

        {result && (

          <div>

            {/* ATS Score */}

            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl mb-8">

              <h2 className="text-3xl font-bold mb-4">
                ATS Score
              </h2>

              <div className="flex items-center gap-6">

                <div className="text-7xl font-bold text-green-400">
                  {result.analysis.ats_score}%
                </div>

                <div className="text-zinc-400 text-lg">
                  Resume match score for{" "}
                  <span className="text-white font-semibold">
                    {result.analysis.target_role}
                  </span>
                </div>

              </div>

            </div>

            {/* Skills Section */}

            <div className="grid md:grid-cols-2 gap-8 mb-8">

              {/* Matched Skills */}

              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">

                <h2 className="text-2xl font-bold mb-5">
                  Matched Skills
                </h2>

                <div className="flex flex-wrap gap-3">

                  {result.analysis.matched_skills.map(
                    (skill: string, index: number) => (

                      <span
                        key={index}
                        className="bg-green-600/20 text-green-400 border border-green-500 px-4 py-2 rounded-full"
                      >
                        {skill}
                      </span>
                    )
                  )}

                </div>

              </div>

              {/* Missing Skills */}

              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">

                <h2 className="text-2xl font-bold mb-5">
                  Missing Skills
                </h2>

                <div className="flex flex-wrap gap-3">

                  {result.analysis.missing_skills.map(
                    (skill: string, index: number) => (

                      <span
                        key={index}
                        className="bg-red-600/20 text-red-400 border border-red-500 px-4 py-2 rounded-full"
                      >
                        {skill}
                      </span>
                    )
                  )}

                </div>

              </div>

            </div>

            {/* AI Feedback */}

            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl">

              <h2 className="text-3xl font-bold mb-6">
                AI Resume Feedback
              </h2>

              <div className="bg-zinc-950 p-6 rounded-2xl overflow-auto">

                <pre className="whitespace-pre-wrap text-zinc-300 leading-8 text-base">
                  {result.feedback}
                </pre>

              </div>

            </div>

          </div>
        )}

      </div>

    </main>
  );
}