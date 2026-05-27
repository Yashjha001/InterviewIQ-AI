"use client";

import Link from "next/link";

import {
  useSession,
  signOut
} from "next-auth/react";

export default function Navbar() {

  const { data: session } = useSession();

  return (

    <nav className="border-b border-white/10 bg-black/80 text-white backdrop-blur-xl">

      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

        {/* LOGO */}

        <Link
          href="/"
          className="text-3xl font-bold tracking-tight"
        >
          InterviewIQ AI
        </Link>

        {/* NAVIGATION */}

        <div className="flex items-center gap-8 text-sm font-medium">

          <Link href="/">
            Home
          </Link>

          <Link href="/resume-analysis">
            Resume Analysis
          </Link>

          <Link href="/career_roadmap">
            Career Roadmap
          </Link>

          <Link href="/mock_interview">
            Mock Interview
          </Link>

          {session ? (

            <>
              <Link
                href="/dashboard"
                className="rounded-xl bg-blue-600 px-5 py-2 transition hover:bg-blue-500"
              >
                Dashboard
              </Link>

              <button
                onClick={() => signOut()}
                className="rounded-xl bg-red-600 px-5 py-2 transition hover:bg-red-500"
              >
                Logout
              </button>
            </>

          ) : (

            <>
              <Link
                href="/login"
                className="rounded-xl border border-white/20 px-5 py-2 hover:bg-white/10"
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="rounded-xl bg-blue-600 px-5 py-2 transition hover:bg-blue-500"
              >
                Sign Up
              </Link>
            </>

          )}

        </div>

      </div>

    </nav>
  );
}