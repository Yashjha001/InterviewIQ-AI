import Link from "next/link";

export default function HomePage() {

  const features = [

    {
      title: "AI Resume Analysis",
      description:
        "Analyze your resume with AI-powered ATS scoring, skill matching, and improvement feedback.",

      href: "/resume-analysis",

      color: "from-blue-500 to-cyan-500",
    },

    {
      title: "AI Career Roadmap",
      description:
        "Generate a personalized roadmap based on your current skills, career goals, and learning timeline.",

      href: "/career-roadmap",

      color: "from-purple-500 to-pink-500",
    },

    {
      title: "AI Mock Interview",
      description:
        "Practice adaptive AI-powered mock interviews customized to your resume, company, and target role.",

      href: "/mock_interview",

      color: "from-green-500 to-emerald-500",
    },
  ];

  return (

    <main className="min-h-screen bg-black text-white">

      {/* HERO SECTION */}

      <section className="max-w-7xl mx-auto px-6 py-24">

        <div className="text-center">

          <h1 className="text-7xl font-extrabold leading-tight">

            InterviewIQ AI

          </h1>

          <p className="text-zinc-400 text-2xl mt-6 max-w-3xl mx-auto leading-10">

            AI-powered career preparation platform for
            resume analysis, adaptive mock interviews,
            and personalized career roadmaps.

          </p>

          <div className="mt-10 flex justify-center gap-5">

            <Link
              href="/mock_interview"
              className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-2xl text-lg font-semibold transition-all"
            >
              Start Interview
            </Link>

            <Link
              href="/resume-analysis"
              className="border border-zinc-700 hover:border-zinc-500 px-8 py-4 rounded-2xl text-lg font-semibold transition-all"
            >
              Analyze Resume
            </Link>

          </div>

        </div>

      </section>

      {/* FEATURES */}

      <section className="max-w-7xl mx-auto px-6 pb-24">

        <h2 className="text-5xl font-bold mb-14 text-center">

          Platform Features

        </h2>

        <div className="grid md:grid-cols-3 gap-8">

          {features.map((feature, index) => (

            <Link
              key={index}
              href={feature.href}
              className="group"
            >

              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 h-full hover:border-zinc-600 transition-all">

                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} mb-6`}
                />

                <h3 className="text-3xl font-bold mb-4">

                  {feature.title}

                </h3>

                <p className="text-zinc-400 leading-8 text-lg">

                  {feature.description}

                </p>

                <div className="mt-8 text-blue-400 group-hover:translate-x-2 transition-all">

                  Explore →

                </div>

              </div>

            </Link>
          ))}

        </div>

      </section>

      {/* FOOTER */}

      <footer className="border-t border-zinc-900 py-10 text-center text-zinc-500">

        Built with Next.js, FastAPI, Groq AI, TailwindCSS, and MongoDB.

      </footer>

    </main>
  );
}