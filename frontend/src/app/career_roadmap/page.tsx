"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import ReactMarkdown from "react-markdown";

export default function CareerRoadmapPage() {

  const { data: session, status } = useSession();
  const router = useRouter();

  const [currentYear, setCurrentYear] = useState("");
  const [currentSkills, setCurrentSkills] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  const [timeline, setTimeline] = useState("");
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState("");

  const userId = session?.user?.email ?? "guest";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div style={{ color: "white", padding: "40px", textAlign: "center" }}>
        Loading...
      </div>
    );
  }

  const handleGenerateRoadmap = async () => {

    if (
      !currentYear ||
      !currentSkills ||
      !careerGoal ||
      !timeline
    ) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    try {

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/generate-roadmap`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            current_year: currentYear,
            current_skills: currentSkills,
            career_goal: careerGoal,
            timeline: timeline,
          }),
        }
      );

      const data = await response.json();

      setRoadmap(data.roadmap);

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
          AI Career Roadmap
        </h1>

        <p className="text-zinc-400 text-lg mb-10">
          Generate a personalized AI-powered career roadmap
          based on your current skills and career goal.
        </p>

        {/* Input Section */}

        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl mb-10">

          <div className="grid md:grid-cols-2 gap-6">

            {/* Current Year */}

            <div>

              <label className="block mb-3 text-lg font-medium">
                Current Year
              </label>

              <input
                type="text"
                placeholder="Example: 2nd Year"
                value={currentYear}
                onChange={(e) => setCurrentYear(e.target.value)}
                className="w-full bg-zinc-800 p-3 rounded-xl outline-none"
              />

            </div>

            {/* Timeline */}

            <div>

              <label className="block mb-3 text-lg font-medium">
                Timeline
              </label>

              <input
                type="text"
                placeholder="Example: 6 Months"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="w-full bg-zinc-800 p-3 rounded-xl outline-none"
              />

            </div>

          </div>

          {/* Current Skills */}

          <div className="mt-6">

            <label className="block mb-3 text-lg font-medium">
              Current Skills
            </label>

            <textarea
              placeholder="Example: Python, HTML, CSS"
              value={currentSkills}
              onChange={(e) => setCurrentSkills(e.target.value)}
              className="w-full bg-zinc-800 p-4 rounded-xl outline-none h-32"
            />

          </div>

          {/* Career Goal */}

          <div className="mt-6">

            <label className="block mb-3 text-lg font-medium">
              Career Goal
            </label>

            <input
              type="text"
              placeholder="Example: AI Engineer"
              value={careerGoal}
              onChange={(e) => setCareerGoal(e.target.value)}
              className="w-full bg-zinc-800 p-3 rounded-xl outline-none"
            />

          </div>

          <button
            onClick={handleGenerateRoadmap}
            className="mt-8 bg-blue-600 hover:bg-blue-700 transition-all px-8 py-4 rounded-2xl text-lg font-semibold"
          >
            {loading
              ? "Generating Roadmap..."
              : "Generate Career Roadmap"}
          </button>

        </div>

        {/* Roadmap Output */}

        {roadmap && (

          <div className="mt-12">

            <div className="glass-card p-8">

              <div className="flex items-center justify-between mb-8">

                <div>

                  <h2 className="text-4xl font-bold gradient-text">
                    Your AI Career Roadmap
                  </h2>

                  <p className="text-zinc-400 mt-2">
                    Personalized roadmap generated using AI
                  </p>

                </div>

                <div className="pulse-orb"></div>

              </div>

              <div className="roadmap-content">

                <ReactMarkdown>

                  {roadmap}

                </ReactMarkdown>

              </div>

            </div>

          </div>
        )}

      </div>

    </main>
  );
}