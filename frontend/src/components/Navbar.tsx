"use client";

import Link from "next/link";

export default function Navbar() {

  return (

    <nav className="border-b border-zinc-900 bg-black text-white">

      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

        {/* LOGO */}

        <Link
          href="/"
          className="text-3xl font-bold"
        >
          InterviewIQ AI
        </Link>

        {/* LINKS */}

        <div className="flex items-center gap-8 text-lg">

          <Link
            href="/"
            className="hover:text-blue-400 transition-all"
          >
            Home
          </Link>

          <Link
            href="/resume-analysis"
            className="hover:text-blue-400 transition-all"
          >
            Resume Analysis
          </Link>

          <Link
            href="/career_roadmap"
            className="hover:text-blue-400 transition-all"
          >
            Career Roadmap
          </Link>

          <Link
            href="/mock_interview"
            className="hover:text-blue-400 transition-all"
          >
            Mock Interview
          </Link>

          <Link
            href="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-xl transition-all"
          >
            Dashboard
          </Link>

        </div>

      </div>

    </nav>
  );
}