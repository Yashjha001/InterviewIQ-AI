"use client";

import { useSession, signOut } from "next-auth/react";

import Link from "next/link";

export default function DashboardPage() {

  const { data: session, status } = useSession();

  console.log(session);

  console.log(status);

  if (status === "loading") {

    return (

      <main className="min-h-screen bg-black text-white flex items-center justify-center">

        <h1 className="text-3xl font-bold">
          Loading Dashboard...
        </h1>

      </main>
    );
  }

  return (

    <main className="min-h-screen bg-black text-white px-6 py-10">

      <div className="max-w-7xl mx-auto">

        <div className="flex items-center justify-between mb-12">

          <div>

            <h1 className="text-5xl font-bold">

              Dashboard

            </h1>

            <p className="text-zinc-400 text-lg mt-3">

              Welcome back,
              {" "}
              {session?.user?.name || "User"}

            </p>

          </div>

          <button
            onClick={() => signOut()}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-2xl font-semibold"
          >
            Logout
          </button>

        </div>

        <div className="grid md:grid-cols-3 gap-8">

          <Link href="/resume-analysis">

            <div className="bg-zinc-900 border border-zinc-800 hover:border-blue-500 transition-all rounded-3xl p-8">

              <h2 className="text-3xl font-bold mb-4">
                Resume Analysis
              </h2>

              <p className="text-zinc-400 leading-8">

                Analyze resumes with ATS scoring,
                skill matching,
                and AI feedback.

              </p>

            </div>

          </Link>

          <Link href="/career-roadmap">

            <div className="bg-zinc-900 border border-zinc-800 hover:border-purple-500 transition-all rounded-3xl p-8">

              <h2 className="text-3xl font-bold mb-4">
                Career Roadmap
              </h2>

              <p className="text-zinc-400 leading-8">

                Generate personalized learning
                roadmaps based on your goals.

              </p>

            </div>

          </Link>

          <Link href="/mock_interview">

            <div className="bg-zinc-900 border border-zinc-800 hover:border-green-500 transition-all rounded-3xl p-8">

              <h2 className="text-3xl font-bold mb-4">
                Mock Interview
              </h2>

              <p className="text-zinc-400 leading-8">

                Practice adaptive AI-powered
                interviews customized to your role.

              </p>

            </div>

          </Link>

        </div>

      </div>

    </main>
  );
}